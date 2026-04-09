import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { t, font } from "../theme";

// ─────────────────────────────────────────────────────────────
// Utilidades de Diseño y Formateo
// ─────────────────────────────────────────────────────────────
function getIpvColor(ipv) {
  return ipv >= 80 ? t.green : ipv >= 50 ? t.amber : t.red;
}

function getIpvBg(ipv) {
  return ipv >= 80 ? "rgba(52, 199, 89, 0.15)" : ipv >= 50 ? "rgba(255, 149, 0, 0.15)" : "rgba(255, 59, 48, 0.15)";
}

function formatFecha(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

// Normalizador para agrupar materias ignorando mayúsculas y acentos
const normalizarMateria = (str) => {
  if (!str) return "GENERAL";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase();
};

function formatMinutosAHoras(minutosTotales) {
  if (minutosTotales < 60) return `${minutosTotales}m`;
  const h = Math.floor(minutosTotales / 60);
  const m = minutosTotales % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ─────────────────────────────────────────────────────────────
// Componente: Gráfica de Tendencia (Líneas SVG)
// ─────────────────────────────────────────────────────────────
function GraficaIPV({ sesiones }) {
  if (sesiones.length < 2) return null;
  const datos = [...sesiones].reverse().slice(-10); // Últimas 10 sesiones
  
  const W = 480, H = 140, padX = 20, padT = 25, padB = 25;
  const innerW = W - padX * 2;
  const innerH = H - padT - padB;
  const len = datos.length;

  const polylinePoints = datos.map((p, i) => {
    const x = padX + (len > 1 ? (i / (len - 1)) * innerW : innerW / 2);
    const y = padT + innerH - ((p.ipvGlobal || 0) / 100) * innerH;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div style={{
      background: t.bgCard, border: `1px solid ${t.border}`,
      borderRadius: 16, padding: "18px 20px", marginBottom: 32,
      boxShadow: t.shadow,
    }}>
      <p style={{ color: t.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: 1, margin: "0 0 14px" }}>
        TENDENCIA GLOBAL DE PRESENCIA (IPV)
      </p>
      <div style={{ width: "100%", height: H }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ overflow: "visible" }}>
          
          {/* Líneas Guía */}
          {[0, 50, 80, 100].map(v => {
            const y = padT + innerH - (v / 100) * innerH;
            return (
              <g key={v}>
                <line x1={padX} y1={y} x2={W - padX} y2={y} stroke={t.border} strokeWidth="1" strokeDasharray="4,4" />
              </g>
            );
          })}

          <polyline points={polylinePoints} fill="none" stroke={t.blue} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {datos.map((p, i) => {
            const x = padX + (len > 1 ? (i / (len - 1)) * innerW : innerW / 2);
            const y = padT + innerH - ((p.ipvGlobal || 0) / 100) * innerH;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="4" fill={t.bgCard} stroke={t.blue} strokeWidth="2.5" />
                <text x={x} y={y - 10} textAnchor="middle" fill={t.text} fontSize="10" fontWeight="700">{p.ipvGlobal}%</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Componente: Tarjeta de Área de Estudio (Nuevo Motor de IA)
// ─────────────────────────────────────────────────────────────
function TarjetaMateria({ materia }) {
  const promedioIpv = Math.round(materia.sumaIpv / materia.totalSesiones);
  const color = getIpvColor(promedioIpv);
  
  // Motor Analítico de Comportamiento Sensorial
  let insight = "";
  const pctDistraccion = (materia.tiempoDistraido / (materia.tiempoConcentrado + materia.tiempoDistraido + materia.tiempoAusente + 1)) * 100;
  
  if (promedioIpv >= 85) {
    insight = "🔥 Hiperfoco detectado. Excelente afinidad con esta materia. Recuerda hidratarte, es fácil perder la noción del tiempo aquí.";
  } else if (pctDistraccion > 25) {
    insight = "👀 Alta dispersión. Esta área exige mucho costo ejecutivo. Blue sugiere usar Ruido Marrón y acortar los Pomodoros a 15-20 min.";
  } else if (promedioIpv < 60) {
    insight = "⚠️ Fricción alta. Tu energía cae en esta materia. Intenta el arquetipo 'Corredor' y ponte recompensas inmediatas al terminar.";
  } else {
    insight = "⚖️ Rendimiento estable. Mantienes un buen ritmo, sigue aplicando tu estrategia actual.";
  }

  return (
    <div style={{
      background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: "20px", marginBottom: 16, boxShadow: t.shadow
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <p style={{ margin: "0 0 4px 0", color: t.text, fontWeight: 800, fontSize: 16 }}>{materia.nombreOriginal}</p>
          <p style={{ margin: 0, color: t.textMuted, fontSize: 12, fontWeight: 600 }}>
            {materia.totalSesiones} sesiones · {formatMinutosAHoras(materia.totalMinutos)} acumulados
          </p>
        </div>
        <div style={{
          background: getIpvBg(promedioIpv), border: `1.5px solid ${color}`,
          borderRadius: "12px", padding: "6px 12px", color: color, fontWeight: 800, fontSize: 14
        }}>
          {promedioIpv}% IPV
        </div>
      </div>
      
      <div style={{ background: t.bgMuted, padding: "12px 16px", borderRadius: 12, borderLeft: `3px solid ${color}` }}>
        <p style={{ margin: 0, fontSize: 13, color: t.text, lineHeight: 1.5 }}>
          <span style={{ fontWeight: 700, color: color }}>Análisis Blue: </span> 
          {insight}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Componente: Tarjeta Sesión Individual
// ─────────────────────────────────────────────────────────────
function TarjetaSesion({ sesion, onEliminar }) {
  const [expandida, setExpandida] = useState(false);
  const color = getIpvColor(sesion.ipvGlobal || 0);
  const bg    = getIpvBg(sesion.ipvGlobal || 0);

  return (
    <div style={{
      background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: "16px 18px", marginBottom: 10, boxShadow: t.shadow, transition: "box-shadow 0.15s",
    }}>
      <div onClick={() => setExpandida(p => !p)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, flexShrink: 0,
          background: bg, border: `1.5px solid ${color}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: 13, color,
        }}>{sesion.ipvGlobal || 0}%</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: t.text, fontWeight: 600, fontSize: 14, margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {sesion.materia}
          </p>
          <p style={{ color: t.textMuted, fontSize: 12, margin: 0 }}>
            {formatFecha(sesion.fecha)} · {sesion.duracionMin} min · {sesion.pomodorosCompletados} 🍅
          </p>
        </div>
        <span style={{ color: t.textLight, fontSize: 14 }}>{expandida ? "▲" : "▼"}</span>
      </div>

      {expandida && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${t.border}` }}>
          <p style={{ color: t.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: 1, margin: "0 0 5px" }}>OBJETIVO</p>
          <p style={{ color: t.text, fontSize: 13, lineHeight: 1.6, margin: "0 0 14px", fontStyle: "italic" }}>"{sesion.objetivo}"</p>

          <button onClick={e => { e.stopPropagation(); onEliminar(); }} style={{
            marginTop: 12, padding: "6px 14px", borderRadius: 8, background: t.redSoft || "#ffebee", border: `1px solid #FECACA`,
            color: t.red, fontSize: 12, cursor: "pointer", fontWeight: 600,
          }}>
            Eliminar sesión
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL: HISTORIAL Y DASHBOARD
// ─────────────────────────────────────────────────────────────
export default function Historial() {
  const navigate = useNavigate();
  const [sesiones, setSesiones] = useState([]);
  const [materiasAgrupadas, setMateriasAgrupadas] = useState([]);
  const [vista, setVista] = useState("materias"); // "materias" o "lista"

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("blue_historial") || "[]");
      setSesiones(data);
      
      // ALGORITMO DE AGRUPACIÓN (El corazón del análisis de datos)
      const agrupacion = data.reduce((acc, sesion) => {
        const idNormalizado = normalizarMateria(sesion.materia);
        
        if (!acc[idNormalizado]) {
          acc[idNormalizado] = {
            nombreOriginal: sesion.materia.trim() || "General",
            totalSesiones: 0,
            totalMinutos: 0,
            sumaIpv: 0,
            tiempoConcentrado: 0,
            tiempoDistraido: 0,
            tiempoAusente: 0
          };
        }
        
        acc[idNormalizado].totalSesiones += 1;
        acc[idNormalizado].totalMinutos += (sesion.duracionMin || 0);
        acc[idNormalizado].sumaIpv += (sesion.ipvGlobal || 0);
        acc[idNormalizado].tiempoConcentrado += (sesion.tiempoConcentrado || 0);
        acc[idNormalizado].tiempoDistraido += (sesion.tiempoDistraido || 0);
        acc[idNormalizado].tiempoAusente += (sesion.tiempoAusente || 0);
        
        return acc;
      }, {});

      // Convertimos el objeto en array y ordenamos por mayor tiempo de estudio
      const arrayMaterias = Object.values(agrupacion).sort((a, b) => b.totalMinutos - a.totalMinutos);
      setMateriasAgrupadas(arrayMaterias);

    } catch { setSesiones([]); setMateriasAgrupadas([]); }
  }, []);

  function eliminar(idx) {
    if(window.confirm("¿Segura que deseas eliminar esta sesión? Afectará tus estadísticas.")) {
      const nuevas = sesiones.filter((_, i) => i !== idx);
      setSesiones(nuevas);
      localStorage.setItem("blue_historial", JSON.stringify(nuevas));
      window.location.reload(); // Recargamos para recalcular las agrupaciones fácilmente
    }
  }

  function limpiarTodo() {
    if (window.confirm("⚠️ ¿Peligro: Eliminar todo el historial y reiniciar métricas?")) {
      setSesiones([]);
      setMateriasAgrupadas([]);
      localStorage.removeItem("blue_historial");
    }
  }

  const totalSesiones  = sesiones.length;
  const ipvPromedio    = totalSesiones > 0 ? Math.round(sesiones.reduce((acc, s) => acc + (s.ipvGlobal||0), 0) / totalSesiones) : 0;
  const totalMinutos   = sesiones.reduce((acc, s) => acc + (s.duracionMin || 0), 0);

  return (
    <div style={{
      minHeight: "100vh", background: t.bg, display: "flex", flexDirection: "column",
      alignItems: "center", padding: "32px 16px", fontFamily: font,
    }}>
      
      {/* ─── HEADER DE NAVEGACIÓN ─── */}
      <div style={{ width: "100%", maxWidth: 600, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/assets/blue_logo.png" alt="Blue" style={{ width: 32, height: 32, objectFit: "contain" }} />
          <span style={{ color: t.text, fontWeight: 800, fontSize: 20 }}>Blue</span>
          <span style={{ color: t.textMuted, fontSize: 14, fontWeight: 600 }}>/ Intelligence</span>
        </div>
        <button onClick={() => navigate("/")} style={{
          background: t.text, color: t.bg, border: "none", borderRadius: 12, padding: "8px 16px",
          fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: t.shadow,
        }}>← Inicio</button>
      </div>

      <div style={{ width: "100%", maxWidth: 600 }}>

        {/* ─── STATS GLOBALES SUPERIORES ─── */}
        {totalSesiones > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
            <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: "16px", textAlign: "center", boxShadow: t.shadow }}>
              <div style={{ color: t.text, fontWeight: 800, fontSize: 24, marginBottom: 4 }}>{totalSesiones}</div>
              <div style={{ color: t.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>SESIONES</div>
            </div>
            <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: "16px", textAlign: "center", boxShadow: t.shadow }}>
              <div style={{ color: getIpvColor(ipvPromedio), fontWeight: 800, fontSize: 24, marginBottom: 4 }}>{ipvPromedio}%</div>
              <div style={{ color: t.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>IPV PROMEDIO</div>
            </div>
            <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: "16px", textAlign: "center", boxShadow: t.shadow }}>
              <div style={{ color: t.blue, fontWeight: 800, fontSize: 24, marginBottom: 4 }}>{formatMinutosAHoras(totalMinutos)}</div>
              <div style={{ color: t.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>TIEMPO TOTAL</div>
            </div>
          </div>
        )}

        <GraficaIPV sesiones={sesiones} />

        {/* ─── TABS DE NAVEGACIÓN INTERNA ─── */}
        {totalSesiones > 0 && (
          <div style={{ display: "flex", gap: 12, marginBottom: 24, borderBottom: `2px solid ${t.borderMid}` }}>
            <button 
              onClick={() => setVista("materias")}
              style={{ 
                background: "none", border: "none", padding: "12px 0", cursor: "pointer", fontSize: 14, fontWeight: 700,
                color: vista === "materias" ? t.blue : t.textMuted,
                borderBottom: vista === "materias" ? `3px solid ${t.blue}` : "3px solid transparent",
                transform: "translateY(2px)"
              }}>
              Áreas de Estudio
            </button>
            <button 
              onClick={() => setVista("lista")}
              style={{ 
                background: "none", border: "none", padding: "12px 0", cursor: "pointer", fontSize: 14, fontWeight: 700,
                color: vista === "lista" ? t.blue : t.textMuted,
                borderBottom: vista === "lista" ? `3px solid ${t.blue}` : "3px solid transparent",
                transform: "translateY(2px)"
              }}>
              Sesiones Recientes
            </button>
          </div>
        )}

        {/* ─── ESTADO VACÍO ─── */}
        {sesiones.length === 0 && (
          <div style={{ textAlign: "center", padding: "56px 20px", background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 24, boxShadow: t.shadow }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <p style={{ color: t.text, fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>Historial Vacío</p>
            <p style={{ color: t.textMuted, fontSize: 14, margin: "0 0 24px", lineHeight: 1.5 }}>
              Blue necesita datos. Haz tu primera sesión de estudio para comenzar a generar métricas predictivas.
            </p>
            <button onClick={() => navigate("/calibracion")} style={{
              padding: "14px 28px", borderRadius: 16, background: t.blue, color: "#fff",
              fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(0, 122, 255, 0.3)"
            }}>
              Iniciar Sesión de Foco
            </button>
          </div>
        )}

        {/* ─── VISTA: ÁREAS DE ESTUDIO ─── */}
        {sesiones.length > 0 && vista === "materias" && (
          <div>
            <p style={{ color: t.textLight, fontSize: 13, marginBottom: 16 }}>
              Blue agrupa automáticamente tus sesiones por materia y analiza tu comportamiento para darte recomendaciones específicas.
            </p>
            {materiasAgrupadas.map((mat, i) => (
              <TarjetaMateria key={i} materia={mat} />
            ))}
          </div>
        )}

        {/* ─── VISTA: LISTA DE SESIONES ─── */}
        {sesiones.length > 0 && vista === "lista" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ color: t.textMuted, fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>ÚLTIMOS REGISTROS</span>
              <button onClick={limpiarTodo} style={{ background: "none", border: "none", color: t.red, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                Borrar Todo
              </button>
            </div>
            {[...sesiones].reverse().map((s, i) => (
              <TarjetaSesion key={i} sesion={s} onEliminar={() => eliminar(sesiones.length - 1 - i)} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}