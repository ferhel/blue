import { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";
import { extraerVector } from "../lib/featureExtractor";
import { clasificar } from "../lib/blueModel";
import { t } from "../theme";

const INTERVALO_MS = 2000;
const MUESTRAS_PARA_CAMBIO = 3;

// Guard global: evita doble carga de modelos entre re-renders
let modelosCargados = false;
let cargandoModelos = false;

async function cargarModelos() {
  if (modelosCargados) return true;
  if (cargandoModelos) {
    // Espera a que la carga en curso termine
    while (cargandoModelos) await new Promise(r => setTimeout(r, 100));
    return modelosCargados;
  }
  cargandoModelos = true;
  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
    await faceapi.nets.faceLandmark68TinyNet.loadFromUri("/models");
    modelosCargados = true;
    return true;
  } catch (e) {
    console.error("Error cargando modelos face-api:", e);
    return false;
  } finally {
    cargandoModelos = false;
  }
}

export default function CamaraConcentracion({ activa = true, onEstadoChange }) {
  const videoRef        = useRef(null);
  const streamRef       = useRef(null);
  const mountedRef      = useRef(true);
  const bufferEstados   = useRef([]);
  const estadoRef       = useRef("cargando");

  const [estadoActual,  setEstadoActual]  = useState("cargando");
  const [errorMsg,      setErrorMsg]      = useState(null);

  const emitirEstado = useCallback((nuevo) => {
    if (!mountedRef.current) return;
    estadoRef.current = nuevo;
    setEstadoActual(nuevo);
    onEstadoChange?.(nuevo);
  }, [onEstadoChange]);

  // ── Cámara + modelos ──────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;

    async function iniciar() {
      // 1. Cargar modelos (con guard global)
      const modelosOk = await cargarModelos();
      if (!mountedRef.current) return;
      if (!modelosOk) {
        setErrorMsg("No se pudieron cargar los modelos de detección.");
        emitirEstado("ausente");
        return;
      }

      // 2. Pedir cámara
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: "user" },
        });
      } catch (err) {
        if (!mountedRef.current) return;
        // err.name: "NotAllowedError" | "NotFoundError" | "NotReadableError" | "OverconstrainedError"
        const msgs = {
          NotAllowedError:    "Permiso de cámara denegado. Actívalo en la barra del navegador.",
          NotFoundError:      "No se encontró ninguna cámara en este dispositivo.",
          NotReadableError:   "La cámara está siendo usada por otra aplicación.",
          OverconstrainedError: "La cámara no soporta la resolución solicitada.",
        };
        setErrorMsg(msgs[err.name] || `Error de cámara: ${err.message}`);
        emitirEstado("ausente");
        return;
      }

      if (!mountedRef.current) {
        stream.getTracks().forEach(tk => tk.stop());
        return;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try { await videoRef.current.play(); } catch {}
      }
    }

    iniciar();

    return () => {
      mountedRef.current = false;
      streamRef.current?.getTracks().forEach(tk => tk.stop());
      streamRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Loop de detección ────────────────────────────────────────
  useEffect(() => {
    if (!activa) return;

    const interval = setInterval(async () => {
      const vid = videoRef.current;
      if (!vid || vid.readyState < 2 || !mountedRef.current) return;

      let res;
      try {
        res = await faceapi
          .detectSingleFace(vid, new faceapi.TinyFaceDetectorOptions({
            inputSize: 224, scoreThreshold: 0.3,
          }))
          .withFaceLandmarks(true);
      } catch (e) {
        // faceapi puede lanzar en dispositivos con WebGL limitado — lo ignoramos silenciosamente
        return;
      }

      if (!mountedRef.current) return;

      const vec = extraerVector(res || null, res?.landmarks || null, vid, false);
      if (!vec) return;

      const { etiqueta } = clasificar(vec);
      const nuevo = String(etiqueta || "concentrado").toLowerCase();

      bufferEstados.current.push(nuevo);
      if (bufferEstados.current.length > MUESTRAS_PARA_CAMBIO)
        bufferEstados.current.shift();

      const estable =
        estadoRef.current === "cargando" ||
        (bufferEstados.current.length === MUESTRAS_PARA_CAMBIO &&
          bufferEstados.current.every(e => e === nuevo));

      if (estable) emitirEstado(nuevo);
    }, INTERVALO_MS);

    return () => clearInterval(interval);
  }, [activa, emitirEstado]);

  // ── Render ───────────────────────────────────────────────────
  if (errorMsg) {
    return (
      <div style={{
        background: t.bgCard,
        border: `1px solid ${t.border}`,
        borderRadius: 20,
        padding: 16,
        textAlign: "center",
      }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>📷</div>
        <p style={{
          fontSize: 12,
          color: t.textMuted,
          lineHeight: 1.6,
          margin: 0,
        }}>
          {errorMsg}
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: t.bgCard,
      borderRadius: 20,
      padding: 10,
      border: `1px solid ${t.border}`,
    }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ width: "100%", borderRadius: 12, background: "#000" }}
      />
    </div>
  );
}