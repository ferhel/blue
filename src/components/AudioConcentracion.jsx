import { useState, useRef, useCallback } from "react";
import { t, font } from "../theme";

// ─────────────────────────────────────────────────────────────
// AudioConcentracion — Generador de ambiente sensorial Blue
// Optimizado: Sin ruidos agudos, volumen seguro y diseño fluido.
// ─────────────────────────────────────────────────────────────

const MODOS = [
  {
    id: "binaural_gamma",
    label: "Gamma 40Hz",
    descripcion: "Foco máximo",
    emoji: "⚡",
    color: t.purple,
    colorSoft: t.purpleSoft,
    freq: 200, diff: 40,
  },
  {
    id: "binaural_alpha",
    label: "Alpha 10Hz",
    descripcion: "Calma activa",
    emoji: "🌊",
    color: t.blue,
    colorSoft: t.blueSoft,
    freq: 200, diff: 10,
  },
  {
    id: "binaural_theta",
    label: "Theta 6Hz",
    descripcion: "Flow profundo",
    emoji: "🌙",
    color: "#8B5CF6",
    colorSoft: t.purpleSoft,
    freq: 200, diff: 6,
  },
  {
    id: "marron",
    label: "Ruido marrón",
    descripcion: "Concentración",
    emoji: "🌿",
    color: "#92400E",
    colorSoft: "#FEF3C7",
    noise: "brown",
  },
];

// Generador de Ruido Marrón (Frecuencias graves y satisfactorias)
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
  // CONFIGURACIÓN INICIAL: Volumen al 10% (0.1) para evitar sobresaltos
  const [modoActivo,  setModoActivo]  = useState(null);
  const [volumen,     setVolumen]     = useState(0.1); 
  const [expandido,   setExpandido]   = useState(true);
  
  const ctxRef    = useRef(null);
  const nodesRef  = useRef([]);
  const gainRef   = useRef(null);

  const detener = useCallback(() => {
    nodesRef.current.forEach(n => { try { n.stop(); } catch {} });
    nodesRef.current = [];
    if (ctxRef.current) { ctxRef.current.close(); ctxRef.current = null; }
    gainRef.current = null;
    setModoActivo(null);
  }, []);

  const iniciar = useCallback((modo) => {
    detener();
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const masterGain = ctx.createGain();
    masterGain.gain.value = volumen;
    masterGain.connect(ctx.destination);
    gainRef.current = masterGain;

    if (modo.noise) {
      const src = crearRuido(ctx);
      src.connect(masterGain); 
      src.start();
      nodesRef.current = [src];
    } else {
      const merger = ctx.createChannelMerger(2);
      merger.connect(masterGain);
      [0, 1].forEach(ch => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain(); 
        g.gain.value = 0.15;
        osc.type = "sine";
        osc.frequency.value = ch === 0 ? modo.freq : modo.freq + modo.diff;
        osc.connect(g); 
        g.connect(merger, 0, ch);
        osc.start();
        nodesRef.current.push(osc);
      });
    }
    setModoActivo(modo.id);
  }, [volumen, detener]);

  const cambiarVolumen = useCallback((v) => {
    setVolumen(v);
    if (gainRef.current) gainRef.current.gain.value = v;
  }, []);

  const modoInfo = MODOS.find(m => m.id === modoActivo);

  return (
    <div style={{
      background: t.bgCard, 
      border: `1px solid ${t.border}`,
      borderRadius: 20, 
      padding: "24px", 
      boxShadow: t.shadow, 
      fontFamily: font, 
      marginBottom: 16,
      width: "100%", 
      boxSizing: "border-box"
    }}>
      {/* Header Interactivo */}
      <div 
        onClick={() => setExpandido(e => !e)} 
        style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
      >
        <div style={{
          width: 46, height: 46, borderRadius: 12,
          background: modoActivo ? (modoInfo?.colorSoft || t.blueSoft) : t.bgMuted,
          border: `1px solid ${modoActivo ? (modoInfo?.color || t.blue) : t.border}`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
          transition: "all 0.3s ease"
        }}>
          {modoActivo ? modoInfo?.emoji : "🎧"}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ color: t.text, fontWeight: 700, fontSize: 16, margin: 0 }}>
            Audio de concentración
          </p>
          <p style={{ color: t.textMuted, fontSize: 13, margin: 0 }}>
            {modoActivo ? `${modoInfo?.label} — activo` : "Elige un ambiente"}
          </p>
        </div>
        <span style={{ color: t.textLight, fontSize: 14 }}>{expandido ? "▲" : "▼"}</span>
      </div>

      {expandido && (
        <div style={{ marginTop: 24 }}>
          {/* Aviso de Auriculares (Binaurales) */}
          <div style={{
            background: t.blueSoft, border: `1px solid ${t.blueMid}`,
            borderRadius: 12, padding: "14px", marginBottom: 20,
            display: "flex", gap: 12, alignItems: "flex-start",
          }}>
            <span style={{ fontSize: 18 }}>ℹ️</span>
            <p style={{ color: t.textMuted, fontSize: 13, margin: 0, lineHeight: 1.5 }}>
              Para las ondas binaurales usa <strong>auriculares</strong>.
            </p>
          </div>

          {/* Grid de Modos (Layout 2 columnas que respira) */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 1fr", 
            gap: 12, 
            marginBottom: 24 
          }}>
            {MODOS.map(modo => (
              <button 
                key={modo.id} 
                onClick={() => modoActivo === modo.id ? detener() : iniciar(modo)}
                style={{
                  padding: "16px 14px", 
                  borderRadius: 14, 
                  textAlign: "left",
                  background: modoActivo === modo.id ? modo.colorSoft : t.bgMuted,
                  border: `2px solid ${modoActivo === modo.id ? modo.color : t.border}`,
                  cursor: "pointer", 
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "flex", 
                  alignItems: "center", 
                  gap: 12, 
                  width: "100%"
                }}
              >
                <span style={{ fontSize: 24 }}>{modo.emoji}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    color: modoActivo === modo.id ? modo.color : t.text, 
                    fontWeight: 700, 
                    fontSize: 13, 
                    margin: 0 
                  }}>
                    {modo.label}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Control de Volumen (Azul Blue Satisfactorio) */}
          {modoActivo && (
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 14, 
              padding: "12px 0",
              animation: "slideIn 0.3s ease" 
            }}>
              <span style={{ color: t.textMuted, fontSize: 12, minWidth: 65, fontWeight: 600 }}>VOLUMEN</span>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                value={volumen} 
                onChange={e => cambiarVolumen(parseFloat(e.target.value))}
                style={{ 
                  flex: 1, 
                  accentColor: t.blue, 
                  cursor: "pointer",
                  height: 6 
                }} 
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