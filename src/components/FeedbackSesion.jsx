import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { t } from "../theme"; 

const fontStackIOS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const fontDarkAcademia = "'Cormorant Garamond', serif"; 

const formatSegundos = (seg) => {
  const num = Number(seg) || 0;
  const m = Math.floor(num / 60);
  const s = Math.floor(num % 60);
  return `${m}m ${s}s`;
};

const extraerHoraStr = (fechaIso) => {
  try {
    if (!fechaIso) return new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    return new Date(fechaIso).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  } catch (e) {
    return "--:--";
  }
};

// ─────────────────────────────────────────────────────────────
// COMPONENTE: Calendario Mensual + Racha de Dopamina 🔥
// ─────────────────────────────────────────────────────────────
function CalendarioMensual({ historialPrevio, reporteActual }) {
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = hoy.getMonth(); 

  const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const diasEnMes = new Date(año, mes + 1, 0).getDate();
  const diaSemanaPrimerDia = new Date(año, mes, 1).getDay(); 
  const offset = (diaSemanaPrimerDia + 6) % 7; 

  const todasLasSesiones = [...historialPrevio, reporteActual].filter(Boolean);

  // 1. Extraemos los días para pintar el calendario de ESTE mes
  const mapaEstudioMes = {};
  let totalDiasEstudiados = 0;
  
  // 2. Extraemos TODAS las fechas únicas para calcular la racha global
  const fechasUnicasGlobales = new Set();

  todasLasSesiones.forEach(s => {
    try {
      const d = new Date(s.fecha || s.horaInicio);
      const strFecha = d.toDateString(); // Ej: "Thu Apr 09 2026"
      fechasUnicasGlobales.add(strFecha);

      if (d.getMonth() === mes && d.getFullYear() === año) {
        if (!mapaEstudioMes[d.getDate()]) {
          mapaEstudioMes[d.getDate()] = true;
          totalDiasEstudiados++;
        }
      }
    } catch(e){}
  });

  // ─────────────────────────────────────────────────────────────
  // ALGORITMO DE RACHA (Streak Calculator)
  // ─────────────────────────────────────────────────────────────
  let rachaActual = 0;
  let fechaAComprobar = new Date(hoy);
  
  // Si hoy no hemos estudiado (pero ayer sí), no perdemos la racha aún
  const hoyStr = fechaAComprobar.toDateString();
  if (!fechasUnicasGlobales.has(hoyStr)) {
    fechaAComprobar.setDate(fechaAComprobar.getDate() - 1); // Empezamos a contar desde ayer
  }

  // Contamos hacia atrás hasta encontrar un agujero
  while (fechasUnicasGlobales.has(fechaAComprobar.toDateString())) {
    rachaActual++;
    fechaAComprobar.setDate(fechaAComprobar.getDate() - 1); // Restamos un día
  }

  // ─────────────────────────────────────────────────────────────
  // CONSTRUCCIÓN VISUAL DEL CALENDARIO
  // ─────────────────────────────────────────────────────────────
  const celdas = [];
  const diasSemana = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  diasSemana.forEach((d, i) => {
    celdas.push(
      <div key={`head-${i}`} style={{ textAlign: "center", fontSize: 10, fontWeight: 800, color: t.textMuted, marginBottom: 8 }}>
        {d}
      </div>
    );
  });

  for (let i = 0; i < offset; i++) {
    celdas.push(<div key={`empty-${i}`} />);
  }

  for (let dia = 1; dia <= diasEnMes; dia++) {
    const esHoy = dia === hoy.getDate();
    const estudio = mapaEstudioMes[dia];

    celdas.push(
      <div key={`dia-${dia}`} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          display: "flex", justifyContent: "center", alignItems: "center",
          fontSize: 12, fontWeight: estudio ? 800 : (esHoy ? 700 : 500),
          background: estudio ? t.blue : (esHoy ? t.bgMuted : "transparent"),
          color: estudio ? "#fff" : (esHoy ? t.blue : t.textLight),
          boxShadow: estudio ? "0 2px 8px rgba(0, 122, 255, 0.3)" : "none",
          border: esHoy && !estudio ? `1px solid ${t.borderMid}` : "none",
          transition: "all 0.2s"
        }}>
          {dia}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: t.bgCard, borderRadius: 24, padding: "28px", boxShadow: t.shadowMd, border: `1px solid ${t.border}`, marginTop: 24 }}>
      
      {/* CABECERA CON EL CONTADOR DE RACHA */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          <p style={{ color: t.text, fontSize: 13, fontWeight: 700, letterSpacing: "1px", margin: "0 0 4px 0" }}>MAPA DE CONSTANCIA</p>
          <p style={{ color: t.textMuted, fontSize: 13, fontWeight: 600, margin: 0 }}>{nombresMeses[mes]}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          {/* EL TROFEO DOPAMINÉRGICO */}
          <span style={{ color: t.blue, fontSize: 13, fontWeight: 800, background: "rgba(0, 122, 255, 0.1)", padding: "6px 14px", borderRadius: 12, border: `1px solid rgba(0, 122, 255, 0.2)` }}>
            🔥 Racha: {rachaActual} {rachaActual === 1 ? "día" : "días"}
          </span>
          <span style={{ color: t.textMuted, fontSize: 11, fontWeight: 700 }}>
            {totalDiasEstudiados} sesiones este mes
          </span>
        </div>
      </div>
      
      {/* EL GRID DEL CALENDARIO */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px 4px" }}>
        {celdas}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────
export default function FeedbackSesion({ reporte, onContinuar }) {
  const navigate = useNavigate();
  const [notas, setNotas] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [historialPrevio, setHistorialPrevio] = useState([]);

  useEffect(() => {
    const guardado = JSON.parse(localStorage.getItem("blue_historial") || "[]");
    setHistorialPrevio(guardado);

    if (reporte?.sesionId) {
      const guardadasNotas = localStorage.getItem(`blue_notas_${reporte.sesionId}`);
      if (guardadasNotas) {
        setNotas(JSON.parse(guardadasNotas).filter(n => n.texto && n.texto.trim() !== ""));
      }

      const guardadasTareas = localStorage.getItem(`blue_tareas_${reporte.sesionId}`);
      if (guardadasTareas) {
        setTareas(JSON.parse(guardadasTareas).filter(t => t.texto && t.texto.trim() !== ""));
      }
    }
  }, [reporte]);

  const totalTareas = tareas.length;
  const tareasCompletadas = tareas.filter(t => t.completada === true).length; 

  const handleGuardarYContinuar = () => {
    try {
      if (reporte) {
        const hPrevio = JSON.parse(localStorage.getItem("blue_historial") || "[]");
        const nuevaSesion = {
          ...reporte,
          fecha: reporte.horaInicio || new Date().toISOString(), 
          pomodorosCompletados: reporte.historialPomodoros?.length || 0,
          microObjetivosCompletados: tareasCompletadas,
          totalMicroObjetivos: totalTareas
        };
        
        hPrevio.push(nuevaSesion);
        localStorage.setItem("blue_historial", JSON.stringify(hPrevio));
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      onContinuar();
    }
  };

  if (!reporte) return <div style={{ padding: 40, textAlign: "center", color: t.text }}>Analizando datos...</div>;

  const tConcentrado = Number(reporte.tiempoConcentrado) || 0;
  const tDistraido = Number(reporte.tiempoDistraido) || 0;
  const tAusente = Number(reporte.tiempoAusente) || 0;
  
  const tiempoTotal = tConcentrado + tDistraido + tAusente;
  const pctDistraccion = tiempoTotal > 0 ? Math.round((tDistraido / tiempoTotal) * 100) : 0;
  const pctAusencia = tiempoTotal > 0 ? Math.round((tAusente / tiempoTotal) * 100) : 0;
  const ipvGlobalLimpio = Number(reporte.ipvGlobal) || 0;
  
  let diagnosticoIA = "";
  const tasaCompletitud = totalTareas > 0 ? tareasCompletadas / totalTareas : null;

  if (ipvGlobalLimpio >= 80) {
    if (tasaCompletitud !== null && tasaCompletitud <= 0.3) {
      diagnosticoIA = "⏳ Hiperfoco detectado (Alto IPV), pero baja ejecución de la checklist. Probable 'Ceguera del Tiempo' o atascamiento en un detalle. Sugiero fragmentar más la tarea.";
    } else {
      diagnosticoIA = "✨ Excelente estado de flujo y ejecución. Tu atención se mantuvo estable, indicando que la tarea tenía el nivel de desafío adecuado (ni muy aburrida, ni muy frustrante).";
    }
  } else if (pctAusencia > 20) {
    diagnosticoIA = "🏃‍♀️ Múltiples ausencias físicas detectadas. Es posible que el entorno genere inquietud motora o que la tarea requiera pausas activas más frecuentes.";
  } else if (pctDistraccion > 25) {
    diagnosticoIA = "👀 Alta dispersión. Tu cerebro está buscando estímulos externos. Para la próxima sesión, intenta subir el Ruido Marrón o utilizar el arquetipo 'Corredor'.";
  } else {
    diagnosticoIA = "⚖️ Rendimiento fluctuante. Considera acortar el tiempo del Pomodoro a 15 minutos para recargar dopamina más rápido.";
  }

  const horaInicioStr = extraerHoraStr(reporte.horaInicio);
  const horaFinStr = extraerHoraStr(reporte.horaFin);

  const pomodoros = reporte.historialPomodoros || [];
  const len = pomodoros.length;
  const W = 400, H = 140, padX = 25, padT = 30, padB = 25; 
  const innerW = W - padX * 2;
  const innerH = H - padT - padB;

  const puntos = pomodoros.map((p, i) => ({
    x: padX + (len > 1 ? (i / (len - 1)) * innerW : innerW / 2),
    y: padT + innerH - ((Number(p.ipv) || 0) / 100) * innerH,
    ipv: Number(p.ipv) || 0,
    numero: p.numero
  }));

  let pathCurvo = "";
  if (puntos.length > 0) {
    pathCurvo = `M ${puntos[0].x},${puntos[0].y}`; 
    for (let i = 1; i < puntos.length; i++) {
      const pPrev = puntos[i - 1];
      const pAct = puntos[i];
      const cpX = (pPrev.x + pAct.x) / 2; 
      pathCurvo += ` C ${cpX},${pPrev.y} ${cpX},${pAct.y} ${pAct.x},${pAct.y}`;
    }
  }

  return (
    <div style={{ 
      width: "100%", maxWidth: 1000, margin: "0 auto", 
      fontFamily: fontStackIOS, padding: "32px 20px",
      background: t.bg, minHeight: "100vh" 
    }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40, borderBottom: `1px solid ${t.border}`, paddingBottom: 20 }}>
        <div>
          <p style={{ color: t.textMuted, fontSize: 13, fontWeight: 700, letterSpacing: 1, margin: "0 0 4px" }}>REPORTE DE RENDIMIENTO COGNITIVO</p>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: t.text, margin: 0 }}>{reporte.materia || "General"}</h2>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ color: t.text, fontSize: 16, fontWeight: 600, margin: "0 0 4px" }}>{horaInicioStr} - {horaFinStr}</p>
          <p style={{ color: t.textMuted, fontSize: 13, margin: 0 }}>{reporte.duracionMin || 0} minutos totales</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 32, alignItems: "start" }}>
        
        {/* COLUMNA IZQUIERDA */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <StatCard label="IPV GLOBAL" value={`${ipvGlobalLimpio}%`} color={ipvGlobalLimpio >= 80 ? t.green : t.amber} />
            <StatCard label="MICRO-OBJETIVOS" value={totalTareas > 0 ? `${tareasCompletadas}/${totalTareas}` : "0/0"} color={t.blue} />
            <StatCard label="BLOQUES" value={len} color={t.purple} />
          </div>

          <div style={{ background: t.bgCard, borderRadius: 24, padding: "28px", boxShadow: t.shadowMd, border: `1px solid ${t.border}` }}>
            <p style={{ color: t.text, fontSize: 13, fontWeight: 700, letterSpacing: "1px", marginBottom: "20px" }}>DISTRIBUCIÓN ATENCIONAL</p>
            <div style={{ height: 12, width: "100%", borderRadius: 6, display: "flex", overflow: "hidden", marginBottom: 20, background: t.bgMuted }}>
              <div style={{ width: `${ipvGlobalLimpio}%`, background: t.blue, transition: "width 0.5s ease" }} />
              <div style={{ width: `${pctDistraccion}%`, background: t.amber, transition: "width 0.5s ease" }} />
              <div style={{ width: `${pctAusencia}%`, background: t.red, transition: "width 0.5s ease" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <TimeMetric dotColor={t.blue} label="En Foco" time={formatSegundos(tConcentrado)} />
              <TimeMetric dotColor={t.amber} label="Dispersión" time={formatSegundos(tDistraido)} />
              <TimeMetric dotColor={t.red} label="Ausencia" time={formatSegundos(tAusente)} />
            </div>
          </div>

          <div style={{ background: t.bgCard, borderRadius: 24, padding: "28px", boxShadow: t.shadowMd, border: `1px solid ${t.border}` }}>
            <p style={{ color: t.text, fontSize: 13, fontWeight: 700, letterSpacing: "1px", marginBottom: "24px" }}>EVOLUCIÓN DEL IPV</p>
            <div style={{ width: "100%", height: 140 }}>
              {len > 0 ? (
                <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ overflow: "visible" }}>
                  <line x1={padX} y1={padT} x2={W - padX} y2={padT} stroke={t.border} strokeWidth="1" strokeDasharray="4,4" />
                  <line x1={padX} y1={padT + innerH} x2={W - padX} y2={padT + innerH} stroke={t.border} strokeWidth="1" strokeDasharray="4,4" />
                  {len > 1 && (
                    <path d={pathCurvo} fill="none" stroke={t.blue} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0px 4px 6px rgba(0, 122, 255, 0.2))" }} />
                  )}
                  {puntos.map((p, i) => (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r="5" fill={t.bgCard} stroke={t.blue} strokeWidth="3" />
                      <text x={p.x} y={p.y - 14} textAnchor="middle" fill={t.text} fontSize="11" fontWeight="800">{p.ipv}%</text>
                      <text x={p.x} y={H - 5} textAnchor="middle" fill={t.textMuted} fontSize="10" fontWeight="700">P{p.numero}</text>
                    </g>
                  ))}
                </svg>
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: t.textMuted, fontSize: 12 }}>
                  Aún no hay suficientes bloques para trazar la curva.
                </div>
              )}
            </div>
          </div>

          {/* 🌟 EL CALENDARIO MENSUAL CON RACHA ESTÁ AQUÍ */}
          <CalendarioMensual historialPrevio={historialPrevio} reporteActual={reporte} />

        </div>

        {/* COLUMNA DERECHA */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 20, padding: "24px", boxShadow: t.shadow }}>
             <p style={{ color: t.purple, fontSize: 12, fontWeight: 800, letterSpacing: 1, marginBottom: 12 }}>ANÁLISIS DE BLUE AI</p>
             <p style={{ fontSize: 15, color: t.text, margin: 0, lineHeight: 1.6, fontWeight: 500 }}>{diagnosticoIA}</p>
          </div>

          <div style={{ background: "#FDFDFB", border: `1px solid ${t.border}`, borderRadius: 20, padding: "24px", boxShadow: t.shadow }}>
            <p style={{ color: t.text, fontSize: "12px", fontWeight: 700, letterSpacing: "1px", marginBottom: "16px" }}>OBJETIVO INICIAL</p>
            <p style={{ color: t.text, fontSize: "20px", lineHeight: 1.4, margin: 0, fontFamily: fontDarkAcademia, fontStyle: "italic", fontWeight: 600 }}>
              "{reporte.objetivo}"
            </p>
          </div>

          {tareas.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ color: t.text, fontSize: "12px", fontWeight: 700, letterSpacing: "1px", marginLeft: 4 }}>CHECKLIST ({tareasCompletadas}/{totalTareas})</p>
              {tareas.map((tItem, i) => (
                <div key={i} style={{ 
                  background: t.bgMuted, padding: "14px 18px", borderRadius: 12, 
                  borderLeft: `4px solid ${tItem.completada ? t.green : t.amber}`,
                  opacity: tItem.completada ? 0.6 : 1, textDecoration: tItem.completada ? "line-through" : "none"
                }}>
                  <p style={{ color: t.text, fontSize: 14, margin: 0, lineHeight: 1.5, display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span>{tItem.completada ? "✅" : "⏳"}</span>
                    <span style={{ flex: 1 }}>{tItem.texto}</span>
                  </p>
                </div>
              ))}
            </div>
          )}

          {notas.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
              <p style={{ color: t.text, fontSize: "12px", fontWeight: 700, letterSpacing: "1px", marginLeft: 4 }}>DUDAS Y PENSAMIENTOS</p>
              {notas.map((n, i) => (
                <div key={i} style={{ background: n.color, padding: "14px 18px", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <p style={{ color: "#424242", fontSize: 14, margin: 0, lineHeight: 1.5 }}>{n.texto}</p>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      <button onClick={handleGuardarYContinuar} style={{ 
        marginTop: 48, width: "100%", padding: "20px", borderRadius: 16, 
        background: t.text, color: t.bg, fontWeight: 700, fontSize: 16, letterSpacing: 1,
        border: "none", cursor: "pointer", boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
        transition: "transform 0.2s"
      }}>
        ALMACENAR DATOS Y FINALIZAR
      </button>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, padding: "20px", borderRadius: 20, textAlign: "center", boxShadow: t.shadow }}>
      <p style={{ fontSize: 11, color: t.textMuted, fontWeight: 700, margin: "0 0 8px", letterSpacing: 1 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 800, color: color, margin: 0, letterSpacing: "-1px" }}>{value}</p>
    </div>
  );
}

function TimeMetric({ dotColor, label, time }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: dotColor }} />
      <div>
        <p style={{ margin: 0, fontSize: 11, color: t.textMuted, fontWeight: 600 }}>{label}</p>
        <p style={{ margin: 0, fontSize: 14, color: t.text, fontWeight: 700 }}>{time}</p>
      </div>
    </div>
  );
}