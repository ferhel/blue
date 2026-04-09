import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as faceapi from "face-api.js";
import { extraerVector } from "../lib/featureExtractor";
import { seedDesdeEtiquetado } from "../lib/blueModel";
import { t, font } from "../theme";

const FRAMES_POR_POSE  = 10;
const INTERVALO_MS     = 300;
const CUENTA_REGRESIVA = 4;

function esperarVideoListo(video) {
  return new Promise(resolve => {
    if (video.readyState >= 1 && video.videoWidth > 0) return resolve();
    const ok = () => { cleanup(); resolve(); };
    const check = () => { if (video.videoWidth > 0) ok(); };
    video.addEventListener("loadedmetadata", ok);
    video.addEventListener("loadeddata", ok);
    video.addEventListener("canplay", ok);
    const poll = setInterval(check, 100);
    const timeout = setTimeout(ok, 8000);
    function cleanup() {
      video.removeEventListener("loadedmetadata", ok);
      video.removeEventListener("loadeddata", ok);
      video.removeEventListener("canplay", ok);
      clearInterval(poll); clearTimeout(timeout);
    }
  });
}

function ProgressRing({ progreso, color, size = 56 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progreso / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={t.border} strokeWidth="4" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.2s ease" }} />
    </svg>
  );
}

function Toggle({ pregunta, descripcion, valor, onChange, emoji }) {
  return (
    <div style={{
      background: t.bgCard,
      border: `1px solid ${valor ? t.blue : t.border}`,
      borderRadius: 16, padding: "18px 20px", marginBottom: 12,
      boxShadow: t.shadow, transition: "border-color 0.2s",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
            <span style={{ fontSize: 20 }}>{emoji}</span>
            <p style={{ color: t.text, fontWeight: 600, fontSize: 14, margin: 0 }}>{pregunta}</p>
          </div>
          <p style={{ color: t.textMuted, fontSize: 13, lineHeight: 1.6, margin: 0 }}>{descripcion}</p>
        </div>
        <button onClick={() => onChange(!valor)} style={{
          width: 48, height: 26, borderRadius: 13, border: "none",
          background: valor ? t.blue : t.border,
          cursor: "pointer", position: "relative", flexShrink: 0,
          transition: "background 0.2s",
        }}>
          <div style={{
            width: 18, height: 18, borderRadius: "50%", background: "#fff",
            position: "absolute", top: 4, left: valor ? 26 : 4,
            transition: "left 0.2s",
          }} />
        </button>
      </div>
    </div>
  );
}

function PasoCal({ titulo, instruccion, emoji, color, cuenta, capturando, progreso, completado, onIniciar, deshabilitado }) {
  const colorBg = color === t.green ? t.greenSoft : color === t.amber ? t.amberSoft : color === t.red ? t.redSoft : t.purpleSoft;
  return (
    <div style={{
      background: t.bgCard,
      border: `1px solid ${completado ? color : capturando ? color : t.border}`,
      borderRadius: 16, padding: "18px 20px", marginBottom: 12,
      boxShadow: t.shadow, opacity: deshabilitado ? 0.5 : 1,
      transition: "border-color 0.3s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ flexShrink: 0 }}>
          {completado ? (
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: colorBg, border: `2px solid ${color}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, color,
            }}>✓</div>
          ) : capturando ? (
            <div style={{ position: "relative" }}>
              <ProgressRing progreso={progreso} color={color} size={52} />
              <div style={{
                position: "absolute", inset: 0, display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color,
              }}>{Math.round(progreso)}%</div>
            </div>
          ) : cuenta > 0 ? (
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: t.amberSoft, border: `2px solid ${t.amber}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, fontWeight: 800, color: t.amber,
            }}>{cuenta}</div>
          ) : (
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: t.bgMuted, border: `1px solid ${t.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22,
            }}>{emoji}</div>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <p style={{ color: completado ? color : t.text, fontWeight: 600, fontSize: 14, margin: "0 0 3px" }}>
            {titulo}
          </p>
          <p style={{ color: t.textMuted, fontSize: 13, lineHeight: 1.5, margin: 0 }}>
            {capturando ? "Capturando datos..." : cuenta > 0 ? "Prepárate..." : completado ? "Calibrado ✓" : instruccion}
          </p>
        </div>

        {!completado && !capturando && cuenta === 0 && !deshabilitado && (
          <button onClick={onIniciar} style={{
            padding: "7px 16px", borderRadius: 10,
            background: colorBg, border: `1px solid ${color}`,
            color, fontWeight: 600, fontSize: 13, cursor: "pointer", flexShrink: 0,
          }}>Iniciar →</button>
        )}
      </div>
    </div>
  );
}

// NUEVO: Agregamos el prop onIniciarSesion aquí
export default function Calibracion({ onIniciarSesion }) {
  const navigate    = useNavigate();
  const videoRef    = useRef(null);
  const mountedRef  = useRef(true);
  const intervalRef = useRef(null);

  const [paso,          setPaso]          = useState("cuestionario");
  const [modelosListos, setModelosListos] = useState(false);
  const [camActiva,     setCamActiva]     = useState(false);

  const [habla,        setHabla]        = useState(false);
  const [videollamada, setVideollamada] = useState(false);
  const [usaMovil,     setUsaMovil]     = useState(false);

  // NUEVO: Estados para los datos de la sesión
  const [objetivoInput, setObjetivoInput] = useState("");
  const [pomodoros, setPomodoros] = useState(4);

  const [poses, setPoses] = useState({
    neutral:   { done: false, cuenta: 0, capturando: false, progreso: 0 },
    distraido: { done: false, cuenta: 0, capturando: false, progreso: 0 },
    ausente:   { done: false, cuenta: 0, capturando: false, progreso: 0 },
    manos:     { done: false, cuenta: 0, capturando: false, progreso: 0 },
  });

  const vectores = useRef({ concentrado: [], distraido: [], ausente: [] });

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    async function cargar() {
      try {
        const MODEL_URL = process.env.PUBLIC_URL + "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        ]);
        if (mountedRef.current) setModelosListos(true);
      } catch (e) { console.error("Error modelos:", e); }
    }
    cargar();
  }, []);

  useEffect(() => {
    if (paso !== "camara") return;
    let cancelled = false;
    let localStream = null;

    async function encender() {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: "user" },
        });
        if (cancelled) { localStream.getTracks().forEach(t => t.stop()); return; }
        const vid = videoRef.current;
        if (!vid) return;
        vid.srcObject = localStream;
        try { await vid.play(); } catch {}
        await esperarVideoListo(vid);
        if (!cancelled) setCamActiva(true);
      } catch (e) { console.error("Error cámara:", e); }
    }
    encender();
    return () => {
      cancelled = true;
      if (localStream) localStream.getTracks().forEach(t => t.stop());
    };
  }, [paso]);

  const capturarPose = useCallback(async (nombrePose, etiqueta) => {
    if (!videoRef.current || !modelosListos) return;
    for (let i = CUENTA_REGRESIVA; i > 0; i--) {
      if (!mountedRef.current) return;
      setPoses(p => ({ ...p, [nombrePose]: { ...p[nombrePose], cuenta: i } }));
      await new Promise(r => setTimeout(r, 1000));
    }
    setPoses(p => ({ ...p, [nombrePose]: { ...p[nombrePose], cuenta: 0, capturando: true, progreso: 0 } }));
    let frames = 0;
    await new Promise(resolve => {
      intervalRef.current = setInterval(async () => {
        if (!mountedRef.current || frames >= FRAMES_POR_POSE) {
          clearInterval(intervalRef.current); return resolve();
        }
        try {
          const res = await faceapi
            .detectSingleFace(videoRef.current,
              new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 }))
            .withFaceLandmarks(true);
          const vector = extraerVector(res || null, res?.landmarks || null, videoRef.current, false);
          if (vector && etiqueta) vectores.current[etiqueta].push(vector);
          frames++;
          setPoses(p => ({ ...p, [nombrePose]: { ...p[nombrePose], progreso: (frames / FRAMES_POR_POSE) * 100 } }));
        } catch (e) { frames++; }
      }, INTERVALO_MS);
    });
    if (mountedRef.current) {
      setPoses(p => ({ ...p, [nombrePose]: { ...p[nombrePose], capturando: false, done: true, progreso: 100 } }));
    }
  }, [modelosListos]);

  // NUEVO: Función auxiliar para mandar los datos a App.jsx
  const enviarConfiguracion = () => {
    if (onIniciarSesion) {
      onIniciarSesion({
        objetivo: objetivoInput.trim() !== "" ? objetivoInput : "Sesión de Enfoque",
        materia: "General",
        pomodoros: pomodoros
      });
    }
  };

  function finalizarCalibracion() {
    localStorage.setItem("blue_perfil_calibracion", JSON.stringify({
      habla, videollamada, usaMovil, fecha: new Date().toISOString(),
    }));

    localStorage.setItem("blue_vectores_calibrados", JSON.stringify(vectores.current));
    
    seedDesdeEtiquetado(vectores.current);
    
    // NUEVO: Enviamos los datos antes de navegar
    enviarConfiguracion();
    navigate("/sala");
  }

  // NUEVO: Función para cuando el usuario le da a "Saltar"
  function saltarCalibracion() {
    enviarConfiguracion();
    navigate("/sala");
  }
  
  const posesRequeridas = ["neutral", "distraido", "ausente", ...(usaMovil ? [] : ["manos"])];
  const todasListas = posesRequeridas.every(p => poses[p].done);

  return (
    <div style={{
      /* 1. CONTENEDOR MAESTRO (Abraza absolutamente todo) */
      minHeight: "100vh", background: t.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", padding: "32px 16px", fontFamily: font,
    }}>
      
      {/* 2. HEADER SUPERIOR (Logo a la izquierda, Botón a la derecha) */}
      <div style={{ 
        width: "100%", maxWidth: 560, 
        display: "flex", alignItems: "center", justifyContent: "space-between", 
        marginBottom: 40 
      }}>
        
        {/* Lado Izquierdo: Logo y Títulos */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src="/assets/blue_logo.png" alt="Blue Logo" style={{ width: 44, height: 44, objectFit: "contain", filter: "drop-shadow(0 4px 10px rgba(0,122,255,0.2))" }} />
          <div>
            <span style={{ color: t.text, fontWeight: 800, fontSize: 24, display: "block", lineHeight: 1 }}>Blue</span>
            <span style={{ color: t.textMuted, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Evaluación Cognitiva</span>
          </div>
        </div>

        {/* Lado Derecho: Botón Inicio */}
        <button onClick={() => navigate("/")} style={{
          background: t.bgCard, border: `1px solid ${t.border}`,
          color: t.textMuted, borderRadius: 8, padding: "6px 14px",
          fontSize: 12, cursor: "pointer", boxShadow: t.shadow,
        }}>
          ← Inicio
        </button>
      </div>

      {/* 3. CONTENEDOR DEL CONTENIDO */}
      <div style={{ width: "100%", maxWidth: 560 }}>

        {paso === "cuestionario" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>⚙️</div>
              <h2 style={{ color: t.text, fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>
                Calibración personal
              </h2>
              <p style={{ color: t.textMuted, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                Define tu sesión y cuéntanos cómo estudias para personalizar la detección a tu estilo real.
              </p>
            </div>

            {/* NUEVO: BLOQUE DE CONFIGURACIÓN DE SESIÓN */}
            <div style={{ 
              background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, 
              padding: "20px", marginBottom: 24, boxShadow: t.shadow 
            }}>
              
              {/* Input de Objetivo */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 700, color: t.text, fontSize: 13, textTransform: "uppercase", letterSpacing: "1px" }}>
                  ¿Cuál es tu objetivo de hoy?
                </label>
                <input
                  type="text"
                  value={objetivoInput}
                  onChange={(e) => setObjetivoInput(e.target.value)}
                  placeholder="Ej. Resolver la guía de inorgánica..."
                  style={{
                    width: "100%", padding: "14px 16px", borderRadius: "12px",
                    border: `2px solid ${t.border}`, background: t.bg, color: t.text,
                    fontSize: "15px", outline: "none", boxSizing: "border-box", transition: "all 0.2s ease"
                  }}
                  onFocus={(e) => e.target.style.border = `2px solid ${t.blue || "#007AFF"}`}
                  onBlur={(e) => e.target.style.border = `2px solid ${t.border}`}
                />
              </div>

              {/* Selector de Pomodoros */}
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 700, color: t.text, fontSize: 13, textTransform: "uppercase", letterSpacing: "1px" }}>
                  ¿Cuántos bloques harás? (25 min c/u)
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <button 
                    onClick={() => setPomodoros(Math.max(1, pomodoros - 1))}
                    style={{
                      width: 40, height: 40, borderRadius: "12px", border: `2px solid ${t.border}`,
                      background: t.bg, color: t.text, fontSize: 20, fontWeight: 600, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}
                  >-</button>
                  <span style={{ fontSize: 22, fontWeight: 800, color: t.text, width: 40, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>
                    {pomodoros}
                  </span>
                  <button 
                    onClick={() => setPomodoros(pomodoros + 1)}
                    style={{
                      width: 40, height: 40, borderRadius: "12px", border: `2px solid ${t.border}`,
                      background: t.bg, color: t.text, fontSize: 20, fontWeight: 600, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}
                  >+</button>
                </div>
              </div>
            </div>
            {/* FIN DEL NUEVO BLOQUE */}

            {/* PREGUNTAS ORIGINALES DE CALIBRACIÓN */}
            <Toggle emoji="🎵" pregunta="¿Hablas, cantas o murmuras mientras estudias?"
              descripcion="El movimiento de boca no se interpretará como distracción."
              valor={habla} onChange={setHabla} />
            <Toggle emoji="📹" pregunta="¿Estudias en videollamada?"
              descripcion="Ajusta la tolerancia para mirar a otra ventana o hablar con compañeros."
              valor={videollamada} onChange={setVideollamada} />
            <Toggle emoji="📱" pregunta="¿Usas el móvil como parte de tu método de estudio?"
              descripcion="Si no, detectaremos cuando el teléfono aparece en cámara como distracción."
              valor={usaMovil} onChange={setUsaMovil} />

            <button onClick={() => setPaso("camara")} style={{
              width: "100%", marginTop: 8, padding: "13px", borderRadius: 12,
              background: t.blue, color: "#fff", fontWeight: 700, fontSize: 15,
              border: "none", cursor: "pointer",
            }}>
              Continuar con calibración de cámara →
            </button>

            {/* NUEVO: Usamos la función saltarCalibracion para no perder los datos */}
            <button onClick={saltarCalibracion} style={{
              width: "100%", marginTop: 8, padding: "11px", borderRadius: 12,
              background: "transparent", color: t.textMuted, fontWeight: 600, fontSize: 14,
              border: `1px solid ${t.border}`, cursor: "pointer",
            }}>
              Saltar calibración y entrar directamente
            </button>
            <p style={{ color: t.textLight, fontSize: 11, textAlign: "center", margin: "6px 0 0" }}>
              Blue usará detección básica sin personalización
            </p>
          </>
        )}

        {paso === "camara" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <h2 style={{ color: t.text, fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>
                Calibración de cámara
              </h2>
              <p style={{ color: t.textMuted, fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                Realiza cada pose cuando quieras. Cada captura dura ~3 segundos.
              </p>
            </div>

            <div style={{
              background: t.bgCard, border: `1px solid ${t.border}`,
              borderRadius: 16, padding: 12, marginBottom: 20, boxShadow: t.shadow,
            }}>
              <video ref={videoRef} autoPlay muted playsInline style={{
                width: "100%", borderRadius: 10,
                objectFit: "cover", background: t.bgMuted,
                minHeight: 160, display: "block",
              }} />
              {(!camActiva || !modelosListos) && (
                <p style={{ color: t.textMuted, fontSize: 12, textAlign: "center", margin: "10px 0 0" }}>
                  {!modelosListos ? "⏳ Cargando modelos..." : "⏳ Activando cámara..."}
                </p>
              )}
            </div>

            <PasoCal titulo="Posición neutral — Concentrado"
              instruccion="Mira la pantalla como si estuvieras estudiando normalmente."
              emoji="🎯" color={t.green} {...poses.neutral}
              deshabilitado={!camActiva || !modelosListos}
              onIniciar={() => capturarPose("neutral", "concentrado")} />
            <PasoCal titulo="Posición distraído"
              instruccion="Gira la cabeza hacia donde normalmente te distraes."
              emoji="💭" color={t.amber} {...poses.distraido}
              deshabilitado={!poses.neutral.done}
              onIniciar={() => capturarPose("distraido", "distraido")} />
            <PasoCal titulo="Posición ausente"
              instruccion="Aléjate de la cámara o tápala brevemente."
              emoji="👤" color={t.red} {...poses.ausente}
              deshabilitado={!poses.distraido.done}
              onIniciar={() => capturarPose("ausente", "ausente")} />
            {!usaMovil && (
              <PasoCal titulo="Calibrar teléfono"
                instruccion="Simula que usas el móvil frente a la cámara."
                emoji="📱" color={t.purple} {...poses.manos}
                deshabilitado={!poses.ausente.done}
                onIniciar={() => capturarPose("manos", null)} />
            )}

            {todasListas && (
              <button onClick={finalizarCalibracion} style={{
                width: "100%", marginTop: 8, padding: "13px", borderRadius: 12,
                background: t.green, color: "#fff", fontWeight: 700, fontSize: 15,
                border: "none", cursor: "pointer",
              }}>
                Guardar calibración e ir a estudiar →
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}