import { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";
import { extraerVector, ETIQUETAS } from "../lib/featureExtractor";
import { clasificar } from "../lib/blueModel";
import { guardarVectoresSesion } from "../lib/modelStore";
import { t } from "../theme"; 

const INTERVALO_MS = 2000;
const MUESTRAS_PARA_CAMBIO = 3;

const ESTADOS = {
  cargando:    { emoji: "⏳", label: "Iniciando...", color: "#7A8BB5", bg: "#0F1628" },
  ausente:     { emoji: "👤", label: "Ausente", color: "#EF4444", bg: "#2D1010" },
  concentrado: { emoji: "🎯", label: "En foco", color: "#34D399", bg: "#0D2A1A" },
  distraido:   { emoji: "💭", label: "Distraído", color: "#F59E0B", bg: "#2A1E00" }
};

export default function CamaraConcentracion({ activa = true, onEstadoChange }) {
  const videoRef = useRef(null);
  const [estadoActual, setEstadoActual] = useState("cargando");
  const estadoActualRef = useRef("cargando");
  const bufferEstados = useRef([]);
  const vectoresSesion = useRef([]);

  useEffect(() => {
    let stream = null;
    async function iniciar() {
      try {
        const URL = "/models";
        await faceapi.nets.tinyFaceDetector.loadFromUri(URL);
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri(URL);
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (e) { setEstadoActual("ausente"); }
    }
    iniciar();
    return () => stream?.getTracks().forEach(t => t.stop());
  }, []);

  useEffect(() => {
    if (!activa) return;
    const interval = setInterval(async () => {
      const vid = videoRef.current;
      if (!vid || vid.readyState < 2) return;
      const res = await faceapi.detectSingleFace(vid, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks(true);
      const vec = extraerVector(res, res?.landmarks, vid, false);
      if (!vec) return;
      
      vectoresSesion.current.push(vec);
      const { etiqueta } = clasificar(vec);
      const nuevo = String(etiqueta || "concentrado").toLowerCase();

      bufferEstados.current.push(nuevo);
      if (bufferEstados.current.length > MUESTRAS_PARA_CAMBIO) bufferEstados.current.shift();

      const listo = estadoActualRef.current === "cargando" || 
                    (bufferEstados.current.length === MUESTRAS_PARA_CAMBIO && bufferEstados.current.every(e => e === nuevo));

      if (listo) {
        estadoActualRef.current = nuevo;
        setEstadoActual(nuevo);
        if (onEstadoChange) onEstadoChange(nuevo);
      }
    }, INTERVALO_MS);
    return () => clearInterval(interval);
  }, [activa, onEstadoChange]);

  const info = ESTADOS[estadoActual] || ESTADOS.cargando;
  return (
    <div style={{ background: t.bgCard, borderRadius: 20, padding: 10, border: `1px solid ${t.border}` }}>
      {/* Solo renderizamos el video puro. Cero textos, cero emojis. */}
      <video 
        ref={videoRef} 
        autoPlay 
        muted 
        style={{ width: "100%", borderRadius: 12, background: "#000" }} 
      />
    </div>
  );
}