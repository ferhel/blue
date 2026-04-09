import { useState, useRef, useCallback } from "react";
import { t, font } from "../theme";

// ─────────────────────────────────────────────────────────────
// AudioConcentracion — Generador de ambiente sensorial Blue
// Optimizado: Enlaces directos a Spotify + Ruido Marrón Nativo
// ─────────────────────────────────────────────────────────────

const MODOS = [
  {
    id: "spotify_lofi",
    label: "Lofi Focus",
    descripcion: "Beats relajantes",
    emoji: "☕",
    color: t.purple,
    colorSoft: t.purpleSoft,
    tipo: "link",
    url: "https://open.spotify.com/album/34pF0wOGswprAZCsI8A1Fs?si=kzFoGAijSha38tZaSc04pQ",
  },
  {
    id: "spotify_agua",
    label: "Sonidos de Agua",
    descripcion: "Flujo natural",
    emoji: "💧",
    color: t.blue,
    colorSoft: t.blueSoft,
    tipo: "link",
    url: "https://open.spotify.com/playlist/1hgc3qXOdFOgVMzqfwODfP?si=E2N4x9M0TdaNFzL9eNkiTw",
  },
  {
    id: "spotify_binaural",
    label: "Ondas Binaurales",
    descripcion: "Foco profundo",
    emoji: "🎧",
    color: "#8B5CF6",
    colorSoft: t.purpleSoft,
    tipo: "link",
    url: "https://open.spotify.com/playlist/37i9dQZF1DX2Ca9Q0E4D7d?si=_LWWdFe_SIeZEjuu22rI8A",
  },
  {
    id: "marron",
    label: "Ruido marrón",
    descripcion: "Aislamiento total",
    emoji: "🌿",
    color: "#92400E",
    colorSoft: "#FEF3C7",
    tipo: "generativo",
    noise: "brown",
  },
];

// Generador de Ruido Marrón (Matemático puro)
function crearRuido(ctx) {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < bufferSize; i++) {
    const w = Math.random() * 2 - 1;
    data[i] = (last + 0.02 * w) / 1.02;
    last = data[i]; 
    data[i] *= 3.5; 
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer; 
  src.loop = true;
  return src;
}

export default function AudioConcentracion() {
  const [modoActivo,  setModoActivo]  = useState(null);
  const [volumen,     setVolumen]     = useState(0.1); 
  const [expandido,   setExpandido]   = useState(true);
  
  const ctxRef    = useRef(null);
  const nodesRef  = useRef([]);
  const gainRef   = useRef(null);

  // Detiene cualquier audio nativo que esté sonando
  const detener = useCallback(() => {
    nodesRef.current.forEach(n => { try { n.stop(); } catch {} });
    nodesRef.current = [];
    if (ctxRef.current) { ctxRef.current.close(); ctxRef.current = null; }
    gainRef.current = null;
    setModoActivo(null);
  }, []);

  // Maneja el clic en las tarjetas
  const iniciar = useCallback((modo) => {
    detener(); // Siempre silenciamos primero
    setModoActivo(modo.id); // Marcamos la tarjeta como seleccionada visualmente

    // Si es Ruido Marrón, encendemos el motor matemático
    if (modo.tipo === "generativo") {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = ctx;
      const masterGain = ctx.createGain();
      masterGain.gain.value = volumen;
      masterGain.connect(ctx.destination);
      gainRef.current = masterGain;

      const src = crearRuido(ctx);
      src.connect(masterGain); 
      src.start();
      nodesRef.current = [src];
    }
    // Si es "link" (Spotify), no hacemos nada con el audio, solo actualizamos la UI
  }, [volumen, detener]);

  const cambiarVolumen = useCallback((v) => {
    setVolumen(v);
    if (gainRef.current) gainRef.current.gain.value = v;
  }, []);

  const modoInfo = MODOS.find(m => m.id === modoActivo);

  return (
    <div style={{
      background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 20, 
      padding: "24px", boxShadow: t.shadow, fontFamily: font, marginBottom: 16, width: "100%", boxSizing: "border-box"
    }}>
      
      {/* HEADER COLAPSABLE */}
      <div onClick={() => setExpandido(e => !e)} style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
        <div style={{
          width: 46, height: 46, borderRadius: 12,
          background: modoActivo ? (modoInfo?.colorSoft || t.blueSoft) : t.bgMuted,
          border: `1px solid ${modoActivo ? (modoInfo?.color || t.blue) : t.border}`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, transition: "all 0.3s ease"
        }}>
          {modoActivo ? modoInfo?.emoji : "🎧"}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ color: t.text, fontWeight: 700, fontSize: 16, margin: 0 }}>Audio de concentración</p>
          <p style={{ color: t.textMuted, fontSize: 13, margin: 0 }}>
            
          </p>
        </div>
        <span style={{ color: t.textLight, fontSize: 14 }}>{expandido ? "▲" : "▼"}</span>
      </div>

      {expandido && (
        <div style={{ marginTop: 24 }}>
          
          {/* GRID DE OPCIONES */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            {MODOS.map(modo => (
              <button 
                key={modo.id} 
                onClick={() => modoActivo === modo.id ? detener() : iniciar(modo)}
                style={{
                  padding: "16px 14px", borderRadius: 14, textAlign: "left",
                  background: modoActivo === modo.id ? modo.colorSoft : t.bgMuted,
                  border: `2px solid ${modoActivo === modo.id ? modo.color : t.border}`,
                  cursor: "pointer", transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)", display: "flex", alignItems: "center", gap: 12, width: "100%"
                }}
              >
                <span style={{ fontSize: 24 }}>{modo.emoji}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ color: modoActivo === modo.id ? modo.color : t.text, fontWeight: 700, fontSize: 13, margin: 0 }}>
                    {modo.label}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* ZONA DE ACCIÓN: Botón Spotify */}
          {modoActivo && modoInfo?.tipo === "link" && (
            <div style={{ 
              marginTop: 16, padding: "16px", background: t.bgMuted, borderRadius: "16px", 
              display: "flex", justifyContent: "space-between", alignItems: "center", animation: "slideIn 0.3s ease" 
            }}>
              <div>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: t.text }}>Escuchar en Spotify</p>
              </div>
              <button
                onClick={() => window.open(modoInfo.url, "_blank")}
                style={{
                  background: "#1DB954", // Verde clásico de Spotify
                  color: "#ffffff",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "20px",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 12px rgba(29, 185, 84, 0.3)",
                  transition: "transform 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                Abrir Playlist
              </button>
            </div>
          )}

          {/* ZONA DE ACCIÓN: Control de Volumen (Solo Ruido Marrón) */}
          {modoActivo && modoInfo?.tipo === "generativo" && (
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", animation: "slideIn 0.3s ease" }}>
              <span style={{ color: t.textMuted, fontSize: 12, minWidth: 65, fontWeight: 600 }}>VOLUMEN</span>
              <input 
                type="range" min="0" max="1" step="0.05" value={volumen} 
                onChange={e => cambiarVolumen(parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: t.blue, cursor: "pointer", height: 6 }} 
              />
              <span style={{ color: t.textMuted, fontSize: 13, minWidth: 35, textAlign: "right", fontWeight: 700 }}>
                {Math.round(volumen * 100)}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}