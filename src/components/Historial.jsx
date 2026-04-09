import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { t, font } from "../theme";

function getIpvColor(ipv) {
  return ipv >= 80 ? t.green : ipv >= 50 ? t.amber : t.red;
}
function getIpvBg(ipv) {
  return ipv >= 80 ? t.greenSoft : ipv >= 50 ? t.amberSoft : t.redSoft;
}

function formatFecha(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

function GraficaIPV({ sesiones }) {
  if (sesiones.length < 2) return null;
  const datos = [...sesiones].reverse().slice(-10);
  const W = 480, H = 110, padL = 36, padR = 16, padT = 12, padB = 28;
  const anchoUtil = W - padL - padR;
  const altoUtil  = H - padT - padB;
  const anchoBarra = Math.min(34, (anchoUtil / datos.length) - 6);

  return (
    <div style={{
      background: t.bgCard, border: `1px solid ${t.border}`,
      borderRadius: 16, padding: "18px 20px", marginBottom: 20,
      boxShadow: t.shadow,
    }}>
      <p style={{ color: t.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: 1, margin: "0 0 14px" }}>
        TENDENCIA DE PRESENCIA (IPV)
      </p>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
        {[0, 50, 80, 100].map(v => {
          const y = padT + altoUtil - (v / 100) * altoUtil;
          return (
            <g key={v}>
              <line x1={padL} y1={y} x2={W - padR} y2={y}
                stroke={t.border} strokeWidth="1" strokeDasharray="4,4" />
              <text x={padL - 6} y={y + 4} textAnchor="end"
                fill={t.textLight} fontSize="10">{v}%</text>
            </g>
          );
        })}
        {datos.map((s, i) => {
          const x = padL + (i / datos.length) * anchoUtil + (anchoUtil / datos.length - anchoBarra) / 2;
          const h = (s.ipvGlobal / 100) * altoUtil;
          const y = padT + altoUtil - h;
          const color = getIpvColor(s.ipvGlobal);
          return (
            <g key={i}>
              <rect x={x} y={y} width={anchoBarra} height={h}
                rx="4" fill={color} opacity="0.7" />
              <text x={x + anchoBarra / 2} y={H - padB + 14}
                textAnchor="middle" fill={t.textLight} fontSize="9">
                {formatFecha(s.fecha).split(" ")[0]}
              </text>
              <text x={x + anchoBarra / 2} y={y - 5}
                textAnchor="middle" fill={color} fontSize="10" fontWeight="700">
                {s.ipvGlobal}%
              </text>
            </g>
          );
        })}
        {datos.length > 1 && (() => {
          const pts = datos.map((s, i) => {
            const x = padL + (i / datos.length) * anchoUtil + (anchoUtil / datos.length) / 2;
            const y = padT + altoUtil - (s.ipvGlobal / 100) * altoUtil;
            return `${x},${y}`;
          });
          return <polyline points={pts.join(" ")} fill="none"
            stroke={t.blue} strokeWidth="1.5" strokeDasharray="4,3" opacity="0.5" />;
        })()}
      </svg>
    </div>
  );
}

function TarjetaSesion({ sesion, onEliminar }) {
  const [expandida, setExpandida] = useState(false);
  const color = getIpvColor(sesion.ipvGlobal);
  const bg    = getIpvBg(sesion.ipvGlobal);

  return (
    <div style={{
      background: t.bgCard, border: `1px solid ${t.border}`,
      borderRadius: 16, padding: "16px 18px", marginBottom: 10,
      boxShadow: t.shadow, transition: "box-shadow 0.15s",
    }}>
      <div onClick={() => setExpandida(p => !p)}
        style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, flexShrink: 0,
          background: bg, border: `1.5px solid ${color}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: 13, color,
        }}>{sesion.ipvGlobal}%</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            color: t.text, fontWeight: 600, fontSize: 14, margin: "0 0 3px",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{sesion.materia}</p>
          <p style={{ color: t.textMuted, fontSize: 12, margin: 0 }}>
            {formatFecha(sesion.fecha)} · {sesion.duracionMin} min · {sesion.pomodorosCompletados} 🍅
          </p>
        </div>
        <span style={{ color: t.textLight, fontSize: 14 }}>{expandida ? "▲" : "▼"}</span>
      </div>

      {expandida && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${t.border}` }}>
          <p style={{ color: t.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: 1, margin: "0 0 5px" }}>
            OBJETIVO
          </p>
          <p style={{ color: t.text, fontSize: 13, lineHeight: 1.6, margin: "0 0 14px" }}>
            {sesion.objetivo}
          </p>

          {sesion.historialPomodoros?.length > 0 && (
            <>
              <p style={{ color: t.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: 1, margin: "0 0 10px" }}>
                IPV POR POMODORO
              </p>
              {sesion.historialPomodoros.map((p, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: t.textMuted, fontSize: 12 }}>Pomodoro {p.numero}</span>
                    <span style={{ color: getIpvColor(p.ipv), fontWeight: 700, fontSize: 12 }}>{p.ipv}%</span>
                  </div>
                  <div style={{ height: 5, background: t.bgMuted, borderRadius: 5 }}>
                    <div style={{
                      height: "100%", width: `${p.ipv}%`,
                      background: getIpvColor(p.ipv), borderRadius: 5,
                    }} />
                  </div>
                </div>
              ))}
            </>
          )}

          <button onClick={e => { e.stopPropagation(); onEliminar(); }} style={{
            marginTop: 12, padding: "6px 14px", borderRadius: 8,
            background: t.redSoft, border: `1px solid #FECACA`,
            color: t.red, fontSize: 12, cursor: "pointer", fontWeight: 600,
          }}>
            Eliminar sesión
          </button>
        </div>
      )}
    </div>
  );
}

export default function Historial() {
  const navigate = useNavigate();
  const [sesiones, setSesiones] = useState([]);

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("blue_historial") || "[]");
      setSesiones(data);
    } catch { setSesiones([]); }
  }, []);

  function eliminar(idx) {
    const nuevas = sesiones.filter((_, i) => i !== idx);
    setSesiones(nuevas);
    localStorage.setItem("blue_historial", JSON.stringify(nuevas));
  }

  function limpiarTodo() {
    if (window.confirm("¿Eliminar todo el historial?")) {
      setSesiones([]);
      localStorage.removeItem("blue_historial");
    }
  }

  const totalSesiones  = sesiones.length;
  const ipvPromedio    = totalSesiones > 0
    ? Math.round(sesiones.reduce((acc, s) => acc + s.ipvGlobal, 0) / totalSesiones) : 0;
  const totalMinutos   = sesiones.reduce((acc, s) => acc + (s.duracionMin || 0), 0);
  const totalPomodoros = sesiones.reduce((acc, s) => acc + (s.pomodorosCompletados || 0), 0);

  return (
    <div style={{
      minHeight: "100vh", background: t.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", padding: "32px 16px",
      fontFamily: font,
    }}>
      {/* Header */}
      <div style={{
        width: "100%", maxWidth: 560,
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 32,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "linear-gradient(135deg, #3B82F6, #60A5FA)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, color: "#fff", fontSize: 15,
          }}>B</div>
          <span style={{ color: t.text, fontWeight: 700, fontSize: 17 }}>Blue</span>
          <span style={{ color: t.textMuted, fontSize: 12 }}>/ Historial</span>
        </div>
        <button onClick={() => navigate("/")} style={{
          background: t.bgCard, border: `1px solid ${t.border}`,
          color: t.textMuted, borderRadius: 8, padding: "6px 14px",
          fontSize: 12, cursor: "pointer", boxShadow: t.shadow,
        }}>← Inicio</button>
      </div>

      <div style={{ width: "100%", maxWidth: 560 }}>

        {/* Stats */}
        {totalSesiones > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Sesiones",  valor: totalSesiones,       color: t.blue  },
              { label: "IPV prom.", valor: `${ipvPromedio}%`,   color: getIpvColor(ipvPromedio) },
              { label: "Minutos",   valor: totalMinutos,         color: t.green },
              { label: "Pomodoros", valor: totalPomodoros,       color: t.amber },
            ].map(({ label, valor, color }) => (
              <div key={label} style={{
                background: t.bgCard, border: `1px solid ${t.border}`,
                borderRadius: 14, padding: "14px 8px", textAlign: "center",
                boxShadow: t.shadow,
              }}>
                <div style={{ color, fontWeight: 800, fontSize: 20, marginBottom: 3 }}>{valor}</div>
                <div style={{ color: t.textMuted, fontSize: 10, fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        <GraficaIPV sesiones={sesiones} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ color: t.text, fontSize: 15, fontWeight: 700, margin: 0 }}>
            Sesiones ({totalSesiones})
          </h3>
          {totalSesiones > 0 && (
            <button onClick={limpiarTodo} style={{
              background: "none", border: "none",
              color: t.red, fontSize: 12, cursor: "pointer", opacity: 0.75,
            }}>Limpiar todo</button>
          )}
        </div>

        {sesiones.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "56px 20px",
            background: t.bgCard, border: `1px solid ${t.border}`,
            borderRadius: 18, boxShadow: t.shadow,
          }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>📭</div>
            <p style={{ color: t.textMuted, fontSize: 15, margin: "0 0 20px" }}>
              Aún no hay sesiones registradas.
            </p>
            <button onClick={() => navigate("/calibracion")} style={{
              padding: "10px 24px", borderRadius: 10,
              background: t.green, color: "#fff",
              fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer",
            }}>
              Ir a la sala de estudio →
            </button>
          </div>
        ) : (
          sesiones.map((s, i) => (
            <TarjetaSesion key={i} sesion={s} onEliminar={() => eliminar(i)} />
          ))
        )}
      </div>
    </div>
  );
}
