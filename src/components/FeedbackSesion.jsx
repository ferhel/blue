import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { infoModelo } from "../lib/blueModel";
import { t } from "../theme"; 

// Tipografías
const fontStackIOS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const fontDarkAcademia = "'Cormorant Garamond', serif"; 

export default function FeedbackSesion({ reporte, onContinuar }) {
  const navigate = useNavigate();
  const [notas, setNotas] = useState([]);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    // 1. Cargar Notas
    if (reporte?.sesionId) {
      const guardadas = localStorage.getItem(`blue_notas_${reporte.sesionId}`);
      if (guardadas) setNotas(JSON.parse(guardadas).filter(n => n.texto.trim() !== ""));
    }
    // 2. Cargar Info del Modelo IA
    setInfo(infoModelo());
  }, [reporte]);

  return (
    <div style={{ 
      width: "100%", maxWidth: 1000, margin: "0 auto", 
      fontFamily: fontStackIOS, padding: "32px 20px",
      background: t.bg, minHeight: "100vh" 
    }}>
      
      {/* ─── CABECERA DE ÉXITO ─── */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ fontSize: 54, marginBottom: 16 }}>📜✨</div>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: t.text, margin: 0, letterSpacing: "-1px" }}>Misión Cumplida</h2>
        <p style={{ color: t.textMuted, fontSize: 18, fontWeight: 500, marginTop: 8 }}>{reporte.materia}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 32, alignItems: "start" }}>
        
        {/* COLUMNA IZQUIERDA: RENDIMIENTO */}
        <div>
          {/* Stats Rápidos */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
            <StatCard label="IPV" value={`${reporte.ipvGlobal}%`} color={t.blue} />
            <StatCard label="BLOQUES" value={reporte.historialPomodoros.length} color={t.green} />
            <StatCard label="TIEMPO" value={`${reporte.duracionMin}m`} color={t.purple} />
          </div>

          {/* Gráfico de Barras */}
          <div style={{ background: t.bgCard, borderRadius: 24, padding: "32px", boxShadow: t.shadowMd, border: `1px solid ${t.border}` }}>
            <p style={{ color: t.text, fontSize: 13, fontWeight: 700, letterSpacing: "1px", marginBottom: "24px", textTransform: "uppercase" }}>RENDIMIENTO POR BLOQUE</p>
            <div style={{ display: "flex", alignItems: "flex-end", height: 140, gap: 12 }}>
              {reporte.historialPomodoros.map((p, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  <div style={{ height: `${p.ipv}%`, width: "100%", background: t.blue, borderRadius: "6px 6px 2px 2px", opacity: 0.8 }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: t.textMuted }}>P{p.numero}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: OBJETIVO Y NOTAS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* TARJETA OBJETIVO (DARK ACADEMIA) */}
          <div style={{ 
            background: "#FDFDFB", 
            border: `1px solid ${t.border}`, 
            borderRadius: 20, 
            padding: "24px", 
            boxShadow: t.shadow 
          }}>
            <p style={{ color: t.text, fontSize: "13px", fontWeight: 700, letterSpacing: "1px", marginBottom: "16px", textTransform: "uppercase" }}>OBJETIVO</p>
            <p style={{ 
              color: t.text, fontSize: "22px", lineHeight: 1.4, margin: 0,
              fontFamily: fontDarkAcademia, fontStyle: "italic", fontWeight: 500 
            }}>
              {reporte.objetivo}
            </p>
          </div>

          {/* NOTAS (Post-its con color) */}
          {notas.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ color: t.text, fontSize: "13px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginLeft: 4 }}>NOTAS</p>
              {notas.map(n => (
                <div key={n.id} style={{ 
                  background: n.color, padding: "16px", borderRadius: 16, 
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.05)" 
                }}>
                  <p style={{ color: "#424242", fontSize: 14, margin: 0, lineHeight: 1.5 }}>{n.texto}</p>
                </div>
              ))}
            </div>
          )}

          {/* DIAGNÓSTICO IA */}
          <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 20, padding: "20px" }}>
             <p style={{ color: t.blue, fontSize: 11, fontWeight: 800, letterSpacing: 1, marginBottom: 12 }}>DIAGNÓSTICO BLUE AI</p>
             <p style={{ fontSize: 13, color: t.textMuted, margin: 0, lineHeight: 1.5 }}>
               Tu foco fue consistente. Blue ha reforzado el patrón de "Concentrado" con los datos de esta sesión.
             </p>
          </div>
        </div>

      </div>

      <button onClick={onContinuar} style={{ 
        marginTop: 48, width: "100%", padding: "20px", borderRadius: 18, 
        background: t.text, color: t.bg, fontWeight: 700, fontSize: 17, 
        border: "none", cursor: "pointer", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" 
      }}>
        GUARDAR Y FINALIZAR JORNADA
      </button>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, padding: "20px", borderRadius: 20, textAlign: "center", boxShadow: t.shadow }}>
      <p style={{ fontSize: 10, color: t.textMuted, fontWeight: 700, margin: "0 0 6px", letterSpacing: 1 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 800, color: color, margin: 0, letterSpacing: "-1px" }}>{value}</p>
    </div>
  );
}