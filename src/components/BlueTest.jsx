import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────
// COMPONENTE: RADARSIMPLE (Integrado para no tener errores de importación)
// ─────────────────────────────────────────────
const RadarSimple = ({ perfil }) => {
  if (!perfil) return null;

  const size = 300;
  const center = size / 2;
  const radius = 90;
  
  const labels = ["Estructural", "Reactiva", "Aplicada", "Estratégica", "Metacogn."];
  // Convertimos la escala 1-5 a porcentaje (0-100)
  const values = [
    (perfil.E || 0) * 20, 
    (perfil.R || 0) * 20, 
    (perfil.A || 0) * 20, 
    (perfil.St || 0) * 20, 
    (perfil.M || 0) * 20
  ];

  const getPoint = (val, i) => {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const r = (val / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const points = values.map((v, i) => getPoint(v || 50, i));
  const pathData = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: "20px 0" }}>
      <svg width={size} height={size}>
        {[20, 40, 60, 80, 100].map(r => (
          <circle key={r} cx={center} cy={center} r={(r / 100) * radius} fill="none" stroke="#E5E5EA" />
        ))}
        {labels.map((_, i) => {
          const p = getPoint(100, i);
          return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#E5E5EA" />;
        })}
        <polygon points={pathData} fill="rgba(0, 122, 255, 0.2)" stroke="#007AFF" strokeWidth="2" strokeLinejoin="round" />
        {labels.map((label, i) => {
          const p = getPoint(115, i);
          return (
            <text key={i} x={p.x} y={p.y} textAnchor="middle" style={{ fontSize: 10, fontWeight: 700, fill: "#8E8E93" }}>
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

// ─────────────────────────────────────────────
// DATOS DEL TEST (Psicometría intacta)
// ─────────────────────────────────────────────
const DIMENSIONES = {
  E: "Estructural",
  R: "Reactiva",
  A: "Aplicada",
  St: "Estratégica",
  M: "Metacognitiva",
};

const PREGUNTAS_RAW = [
  { id: "E1", dim: "E", texto: "Antes de estudiar un tema nuevo, dedico tiempo a identificar su estructura general.", invertido: false },
  { id: "E2", dim: "E", texto: "Elaboro esquemas o mapas conceptuales como parte habitual de mi estudio.", invertido: false },
  { id: "E3", dim: "E", texto: "Me resulta más fácil aprender cuando identifico las relaciones entre conceptos antes de memorizarlos.", invertido: false },
  { id: "E4", dim: "E", texto: "Planifico con anticipación qué estudiaré, cuánto tiempo y en qué orden.", invertido: false },
  { id: "E5", dim: "E", texto: "Suelo comenzar a estudiar sin organizar previamente el material.", invertido: true },
  { id: "E6", dim: "E", texto: "Cuando el tema es difícil, me bloqueo intentando estructurarlo y termino estudiando sin orden.", invertido: true },
  
  { id: "R1", dim: "R", texto: "Cuando hay una fecha límite cercana, mi rendimiento aumenta notablemente.", invertido: false },
  { id: "R2", dim: "R", texto: "Me resulta más fácil mantener el foco cuando los objetivos son concretos e inmediatos.", invertido: false },
  { id: "R3", dim: "R", texto: "Sin presión externa, tiendo a postergar o estudiar con menos intensidad.", invertido: false },
  { id: "R4", dim: "R", texto: "Una entrega próxima me genera la motivación necesaria para concentrarme.", invertido: false },
  { id: "R5", dim: "R", texto: "Mantengo el mismo nivel de estudio independientemente de si hay una evaluación próxima.", invertido: true },
  { id: "R6", dim: "R", texto: "Puedo trabajar con plena concentración en un tema aunque no tenga ninguna urgencia externa.", invertido: true },
  
  { id: "A1", dim: "A", texto: "Aprendo mejor resolviendo ejercicios que leyendo explicaciones teóricas.", invertido: false },
  { id: "A2", dim: "A", texto: "Retengo la información con más facilidad cuando la aplico en situaciones reales o simuladas.", invertido: false },
  { id: "A3", dim: "A", texto: "Prefiero ver ejemplos concretos antes de estudiar la teoría formal de un concepto.", invertido: false },
  { id: "A4", dim: "A", texto: "Practicar activamente es imprescindible para que un tema me quede claro.", invertido: false },
  { id: "A5", dim: "A", texto: "Puedo comprender teoría compleja sin necesidad de aplicarla de inmediato.", invertido: true },
  { id: "A6", dim: "A", texto: "La teoría bien explicada me resulta suficiente para aprender, sin necesidad de ejemplos.", invertido: true },
  
  { id: "St1", dim: "St", texto: "Necesito entender para qué sirve un tema antes de poder concentrarme en estudiarlo.", invertido: false },
  { id: "St2", dim: "St", texto: "Mi motivación aumenta cuando percibo que lo que estudio tendrá impacto en mi futuro.", invertido: false },
  { id: "St3", dim: "St", texto: "Integro información de varias fuentes para construir una comprensión global antes de profundizar.", invertido: false },
  { id: "St4", dim: "St", texto: "Organizo mentalmente el aprendizaje pensando en cómo lo usaré más adelante.", invertido: false },
  { id: "St5", dim: "St", texto: "Puedo estudiar con igual eficacia un tema aunque no le vea utilidad práctica ni futura.", invertido: true },
  { id: "St6", dim: "St", texto: "Me es indiferente conocer el propósito de un contenido para poder aprenderlo.", invertido: true },
  
  { id: "M1", dim: "M", texto: "Mientras estudio, me doy cuenta cuando dejo de entender algo y cambio de estrategia.", invertido: false },
  { id: "M2", dim: "M", texto: "Evalúo regularmente si la forma en que estoy estudiando está siendo efectiva.", invertido: false },
  { id: "M3", dim: "M", texto: "Ajusto mi método de estudio según el tipo de materia o tarea que tengo.", invertido: false },
  { id: "M4", dim: "M", texto: "Después de una evaluación, analizo qué estrategias funcionaron y cuáles no.", invertido: false },
  { id: "M5", dim: "M", texto: "Suelo seguir estudiando de la misma forma aunque no esté obteniendo buenos resultados.", invertido: true },
  { id: "M6", dim: "M", texto: "Rara vez me detengo a reflexionar sobre si mi forma de estudiar es la más adecuada.", invertido: true },
];

const VALIDEZ = [
  { id: "V1", dim: "V", texto: "Nunca me he distraído durante una clase o sesión de estudio.", invertido: false, trampa: true },
  { id: "V2", dim: "V", texto: "Siempre cumplo con todas mis tareas antes de la fecha límite sin ninguna excepción.", invertido: false, trampa: true },
  { id: "V3", dim: "V", texto: "Para esta pregunta, por favor selecciona «En desacuerdo» independientemente de tu opinión.", invertido: false, trampa: true },
];

const PREGUNTAS_BIPOLAR = [
  { id: "D1", textoA: "Prefiero dominar los elementos individuales antes de integrarlos en un todo.", textoB: "Prefiero entender el esquema completo antes de estudiar los componentes." },
  { id: "D2", textoA: "Construyo mi comprensión acumulando detalles concretos progresivamente.", textoB: "Comprendo mejor cuando primero veo el panorama general completo." },
  { id: "D3", textoA: "Me resulta natural ir de ejemplos específicos hacia conclusiones generales.", textoB: "Me resulta natural ir del concepto general hacia sus casos particulares." },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildOrden() {
  const mezcladas = shuffle(PREGUNTAS_RAW);
  const posiciones = shuffle([5, 12, 20, 28]).slice(0, 3);
  posiciones.sort((a, b) => a - b);
  const resultado = [...mezcladas];
  posiciones.forEach((pos, i) => resultado.splice(pos, 0, VALIDEZ[i]));
  return resultado;
}

// ─────────────────────────────────────────────
// CÁLCULO DEL PERFIL Y RECOMENDACIONES
// ─────────────────────────────────────────────
function calcularPerfil(respuestas, preguntasOrden, bipolar) {
  const scores = { E: [], R: [], A: [], St: [], M: [] };

  preguntasOrden.forEach((p) => {
    if (p.dim === "V") return;
    const val = respuestas[p.id];
    if (val === undefined) return;
    const score = p.invertido ? 6 - val : val;
    scores[p.dim].push(score);
  });

  const perfil = {};
  Object.keys(scores).forEach((dim) => {
    const arr = scores[dim];
    perfil[dim] = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  });

  const dScores = PREGUNTAS_BIPOLAR.map((p) => bipolar[p.id] || 4);
  perfil.D = dScores.reduce((a, b) => a + b, 0) / dScores.length;
  perfil.D_label = perfil.D < 3.5 ? "Bottom-up" : perfil.D > 4.5 ? "Top-down" : "Flexible";

  return perfil;
}

function getRecomendacion(perfil) {
  const { E, R, A, St, M, D_label } = perfil;

  if (M < 2.5 && R > 3.5 && E < 2.5 && St < 2.5) {
    return {
      arquetipo: "Perfil en Desarrollo", color: "#F59E0B", emoji: "🌱",
      descripcion: "Tu aprendizaje depende mucho de la presión externa y aún estás construyendo hábitos de autorregulación.",
      tecnicas: ["Busca un compañero de estudio", "Usa una agenda con bloques fijos", "Empieza con Pomodoros de 25 min", "Diario de reflexión de 3 min"]
    };
  }
  if (E > 3.5 && St > 3.5) {
    return {
      arquetipo: "Arquitecto Cognitivo", color: "#007AFF", emoji: "🏛️",
      descripcion: "Piensas en sistemas. Necesitas ver la estructura completa antes de llenarla de contenido.",
      tecnicas: [D_label === "Top-down" ? "Lee primero el índice" : "Construye mapas desde conceptos", "Método Cornell", "Define un objetivo concreto", "Checks de 5 min"]
    };
  }
  if (R > 3.5 && A > 3.5) {
    return {
      arquetipo: "Corredor de Fondo", color: "#FF3B30", emoji: "⚡",
      descripcion: "Rindes mejor bajo presión y aprendiendo haciendo. Eres eficiente en sprints.",
      tecnicas: ["Técnica Pomodoro estricta", "Crea deadlines artificiales", "Resuelve ejercicios primero", "Usa flashcards (Anki)"]
    };
  }
  if (A > 3.5 && E > 3) {
    return {
      arquetipo: "Ingeniero del Conocimiento", color: "#34C759", emoji: "⚙️",
      descripcion: "Aprendes construyendo. Los ejemplos y la práctica son tu lenguaje nativo.",
      tecnicas: ["Empieza con un problema real", "Usa simulaciones", "¿En qué ejercicio usaría esto?", D_label === "Bottom-up" ? "Crea un glosario" : "Dibuja el diagrama general"]
    };
  }
  if (St > 3.5 && R < 3) {
    return {
      arquetipo: "Pensador Estratégico", color: "#5856D6", emoji: "🔭",
      descripcion: "Estudias mejor cuando ves el propósito claro. Te motiva el largo plazo.",
      tecnicas: ["Escribe para qué sirve el tema", "Conecta materia con proyecto real", "Lee casos reales primero", "Crea hitos intermedios"]
    };
  }
  if (M > 4) {
    return {
      arquetipo: "Aprendiz Adaptativo", color: "#32ADE6", emoji: "🧠",
      descripcion: "Tu metacognición es tu superpoder. Eres capaz de ajustar tu propio método.",
      tecnicas: ["Aplica modelo de Zimmerman", "Diario de aprendizaje", "Experimenta con espaciado", "Enseña lo que aprendes"]
    };
  }
  return {
    arquetipo: "Perfil Equilibrado", color: "#007AFF", emoji: "⚖️",
    descripcion: "Tienes un perfil balanceado. Eres flexible cognitivamente, lo cual es una ventaja real.",
    tecnicas: ["Experimenta con dos métodos distintos", "Pomodoro con revisión final", "Alterna lectura y problemas", "Registro de rendimiento"]
  };
}

// ─────────────────────────────────────────────
// COMPONENTES UI
// ─────────────────────────────────────────────
const styles = {
  bg: "#F2F2F7", bgCard: "#FFFFFF", accent: "#007AFF", accentSoft: "#E5F0FF",
  text: "#1C1C1E", textMuted: "#8E8E93", border: "#E5E5EA", shadow: "0 4px 12px rgba(0,0,0,0.05)"
};

function BarraProgreso({ actual, total }) {
  const pct = Math.round((actual / total) * 100);
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ color: styles.textMuted, fontSize: 14, fontWeight: 600 }}>Pregunta {actual} de {total}</span>
        <span style={{ color: styles.accent, fontSize: 14, fontWeight: 800 }}>{pct}%</span>
      </div>
      <div style={{ height: 8, background: styles.border, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: styles.accent, borderRadius: 10, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

function BotoneEscala({ valor, onChange, tipo = "likert" }) {
  if (tipo === "bipolar") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <button key={n} onClick={() => onChange(n)} style={{ width: 52, height: 52, borderRadius: "50%", border: valor === n ? "none" : `1px solid ${styles.border}`, background: valor === n ? styles.accent : styles.bgCard, color: valor === n ? "#fff" : styles.text, fontWeight: 700, fontSize: 18, cursor: "pointer", transition: "all 0.2s ease", boxShadow: valor === n ? "0 6px 16px rgba(0,122,255,0.3)" : "none" }}>{n}</button>
        ))}
      </div>
    );
  }

  const etiquetas = ["", "Totalmente en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Totalmente de acuerdo"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} onClick={() => onChange(n)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "20px 10px", borderRadius: 20, border: valor === n ? `2px solid ${styles.accent}` : `1px solid ${styles.border}`, background: valor === n ? styles.accentSoft : styles.bgCard, color: valor === n ? styles.accent : styles.textMuted, cursor: "pointer", transition: "all 0.2s ease" }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: valor === n ? styles.accent : styles.text }}>{n}</span>
          <span style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.2 }}>{etiquetas[n]}</span>
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// APP PRINCIPAL (BlueTest)
// ─────────────────────────────────────────────
export default function BlueTest() {
  const navigate = useNavigate();
  
  const [pantalla, setPantalla] = useState("bienvenida");
  const [preguntasOrden] = useState(() => buildOrden());
  const [idx, setIdx] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [bipolarIdx, setBipolarIdx] = useState(0);
  const [bipolarResp, setBipolarResp] = useState({});
  const [perfil, setPerfil] = useState(null);

  const responder = (val) => setRespuestas({...respuestas, [preguntasOrden[idx].id]: val});
  const siguiente = () => idx + 1 >= preguntasOrden.length ? setPantalla("bipolar") : setIdx(idx + 1);
  const anterior = () => idx > 0 && setIdx(idx - 1);

  const responderBipolar = (val) => setBipolarResp({...bipolarResp, [PREGUNTAS_BIPOLAR[bipolarIdx].id]: val});
  const siguienteBipolar = () => {
    if (bipolarIdx + 1 >= PREGUNTAS_BIPOLAR.length) {
      setPantalla("cargando");
      setTimeout(() => {
        setPerfil(calcularPerfil(respuestas, preguntasOrden, bipolarResp));
        setPantalla("resultados");
      }, 2500);
    } else {
      setBipolarIdx(bipolarIdx + 1);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: styles.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", padding: "32px 16px", 
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      
      {/* HEADER SUPERIOR */}
      <div style={{ 
        width: "100%", maxWidth: 560, 
        display: "flex", alignItems: "center", justifyContent: "space-between", 
        marginBottom: 40 
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src="/assets/blue_logo.png" alt="Blue Logo" style={{ width: 44, height: 44, objectFit: "contain", filter: "drop-shadow(0 4px 10px rgba(0,122,255,0.2))" }} />
          <div>
            <span style={{ color: styles.text, fontWeight: 800, fontSize: 24, display: "block", lineHeight: 1 }}>Blue</span>
            <span style={{ color: styles.textMuted, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Evaluación Cognitiva</span>
          </div>
        </div>

        <button onClick={() => navigate("/")} style={{
          background: styles.bgCard, border: `1px solid ${styles.border}`,
          color: styles.textMuted, borderRadius: 8, padding: "8px 16px",
          fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: styles.shadow,
        }}>
          ← Inicio
        </button>
      </div>

      {/* CONTENEDOR CENTRAL */}
      <div style={{ width: "100%", maxWidth: 560 }}>
        
        {pantalla === "bienvenida" && (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: styles.text, marginBottom: 16 }}>Hola, Hellen</h2>
            <p style={{ color: styles.textMuted, fontSize: 17, lineHeight: 1.6, marginBottom: 40 }}>Esta evaluación nos ayudará a ajustar tu sala de estudio para que sea lo más eficiente posible.</p>
            <button onClick={() => setPantalla("test")} style={{ padding: "18px 48px", borderRadius: 20, background: styles.accent, color: "#fff", fontWeight: 700, fontSize: 17, border: "none", cursor: "pointer", boxShadow: "0 10px 20px rgba(0,122,255,0.3)" }}>Comenzar Test</button>
          </div>
        )}

        {pantalla === "test" && (
          <div>
            <BarraProgreso actual={idx + 1} total={preguntasOrden.length} />
            <div style={{ background: styles.bgCard, borderRadius: 28, padding: "40px 32px", marginBottom: 32, boxShadow: "0 10px 30px rgba(0,0,0,0.04)", border: `1px solid ${styles.border}` }}>
              <span style={{ color: styles.accent, fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 12 }}>{DIMENSIONES[preguntasOrden[idx].dim] || "Validación"}</span>
              <p style={{ fontSize: 22, fontWeight: 600, color: styles.text, lineHeight: 1.4, margin: 0 }}>{preguntasOrden[idx].texto}</p>
            </div>
            <BotoneEscala valor={respuestas[preguntasOrden[idx].id]} onChange={responder} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40 }}>
              <button onClick={anterior} disabled={idx === 0} style={{ padding: "12px 24px", color: styles.textMuted, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>← Atrás</button>
              <button onClick={siguiente} disabled={!respuestas[preguntasOrden[idx].id]} style={{ padding: "16px 36px", borderRadius: 16, background: respuestas[preguntasOrden[idx].id] ? styles.accent : styles.border, color: "#fff", fontWeight: 700, border: "none", cursor: "pointer" }}>{idx + 1 >= preguntasOrden.length ? "Continuar" : "Siguiente"}</button>
            </div>
          </div>
        )}

        {pantalla === "bipolar" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
             <h3 style={{ color: styles.textMuted, textAlign: "center", marginBottom: 30 }}>Preguntas de contraste ({bipolarIdx + 1}/3)</h3>
             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, color: styles.text, fontWeight: 600, fontSize: 14 }}>
               <span style={{ flex: 1, textAlign: "left", paddingRight: 10 }}>{PREGUNTAS_BIPOLAR[bipolarIdx].textoA}</span>
               <span style={{ flex: 1, textAlign: "right", paddingLeft: 10 }}>{PREGUNTAS_BIPOLAR[bipolarIdx].textoB}</span>
             </div>
             <BotoneEscala valor={bipolarResp[PREGUNTAS_BIPOLAR[bipolarIdx].id]} onChange={responderBipolar} tipo="bipolar" />
             <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
               <button onClick={siguienteBipolar} disabled={!bipolarResp[PREGUNTAS_BIPOLAR[bipolarIdx].id]} style={{ padding: "16px 36px", borderRadius: 16, background: bipolarResp[PREGUNTAS_BIPOLAR[bipolarIdx].id] ? styles.accent : styles.border, color: "#fff", fontWeight: 700, border: "none", cursor: "pointer" }}>Continuar</button>
             </div>
          </div>
        )}

        {pantalla === "cargando" && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
             <h2 style={{ fontSize: 24, color: styles.text, marginBottom: 10 }}>Analizando patrones...</h2>
             <p style={{ color: styles.textMuted }}>Generando tu perfil metacognitivo</p>
             <div style={{ marginTop: 30, fontSize: 40 }}>⚙️</div>
          </div>
        )}

        {pantalla === "resultados" && perfil && (
          <div style={{ animation: "fadeIn 0.5s ease" }}>
             <div style={{ textAlign: "center", marginBottom: 30 }}>
               <span style={{ fontSize: 40, display: "block", marginBottom: 10 }}>{getRecomendacion(perfil).emoji}</span>
               <h2 style={{ fontSize: 28, fontWeight: 800, color: getRecomendacion(perfil).color }}>{getRecomendacion(perfil).arquetipo}</h2>
               <p style={{ color: styles.textMuted }}>{getRecomendacion(perfil).descripcion}</p>
             </div>

             <div style={{ background: "#fff", padding: 30, borderRadius: 28, border: `1px solid ${styles.border}`, marginBottom: 20 }}>
                <RadarSimple perfil={perfil} />
             </div>

             <div style={{ background: styles.bgCard, padding: 24, borderRadius: 24, border: `1px solid ${styles.border}` }}>
               <h3 style={{ color: styles.text, fontSize: 16, marginBottom: 12 }}>Estrategia Recomendada:</h3>
               <p style={{ color: styles.textMuted, fontSize: 14 }}>Tendencia: <strong>{perfil.D_label}</strong></p>
               {/* AQUÍ ESTÁ LA MAGIA DEL ?. PARA QUE NO EXPLOTE */}
               <ul style={{ color: styles.textMuted, fontSize: 14, paddingLeft: 20 }}>
                 {getRecomendacion(perfil).tecnicas?.map((t, i) => <li key={i} style={{ marginBottom: 8 }}>{t}</li>)}
               </ul>
             </div>

             <button onClick={() => window.location.reload()} style={{ width: "100%", marginTop: 30, padding: 20, borderRadius: 20, border: `1px solid ${styles.border}`, background: "#fff", fontWeight: 700, color: styles.textMuted, cursor: "pointer" }}>Repetir Test</button>
          </div>
        )}

      </div>
    </div>
  );
}