import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { arquetiposData } from "../lib/arquetiposData"; 
import { t as theme } from "../theme"; 

// ─────────────────────────────────────────────────────────────
// CONFIGURACIÓN PSICOMÉTRICA (36 ÍTEMS)
// ─────────────────────────────────────────────────────────────
const DIMENSIONES = { E: "Estructural", R: "Reactiva", A: "Aplicada", St: "Estratégica", M: "Metacognitiva" };

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
  { id: "V1", dim: "V", texto: "Nunca me he distraído ni un solo segundo durante una sesión de estudio." },
  { id: "V2", dim: "V", texto: "Siempre cumplo mis tareas a tiempo, sin ninguna excepción en toda mi vida." },
  { id: "V3", dim: "V", texto: "Para validar tu atención, por favor selecciona «En desacuerdo» en esta pregunta." },
];

const PREGUNTAS_BIPOLAR = [
  { id: "D1", textoA: "Prefiero dominar elementos individuales antes de integrarlos.", textoB: "Prefiero entender el esquema completo antes que los componentes." },
  { id: "D2", textoA: "Construyo mi comprensión acumulando detalles progresivamente.", textoB: "Comprendo mejor cuando veo el panorama general primero." },
  { id: "D3", textoA: "Voy de ejemplos específicos hacia conclusiones generales.", textoB: "Voy del concepto general hacia sus casos particulares." },
];

// ─────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────
export default function BlueTest() {
  const navigate = useNavigate();
  const [estado, setEstado] = useState("inicio"); 
  const [orden, setOrden] = useState([]);
  const [idx, setIdx] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [bipolarIdx, setBipolarIdx] = useState(0);
  const [bipolarResp, setBipolarResp] = useState({});
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    const mezcladas = [...PREGUNTAS_RAW].sort(() => Math.random() - 0.5);
    const final = [...mezcladas];
    [8, 18, 28].forEach((pos, i) => final.splice(pos, 0, VALIDEZ[i]));
    setOrden(final);
  }, []);

  const responder = (val) => setRespuestas({ ...respuestas, [orden[idx].id]: val });

  const finalizarAnalisis = (bipData) => {
    const scores = { E: [], R: [], A: [], St: [], M: [] };
    orden.forEach(p => {
      const val = respuestas[p.id];
      if (!val || p.dim === "V") return;
      const score = p.invertido ? 6 - val : val;
      scores[p.dim].push(score);
    });

    const fallosV = (respuestas["V1"] > 3 ? 1 : 0) + (respuestas["V2"] > 3 ? 1 : 0);

    const perfilRadar = Object.keys(scores).map(dim => {
      const arr = scores[dim];
      const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
      return { id: dim, nombre: { E:"Estructural", R:"Reactiva", A:"Aplicada", St:"Estratégica", M:"Metacognitiva" }[dim], porcentaje: Math.round(avg * 20) };
    }).sort((a, b) => b.porcentaje - a.porcentaje);

    const sumaBip = Object.values(bipData).reduce((a, b) => a + b, 0) / 3;
    const tendencia = sumaBip < 3.5 ? "Bottom-up" : "Top-down";

    setResultado({
      radar: perfilRadar,
      principal: perfilRadar[0],
      secundario: perfilRadar[1],
      esHibrido: (perfilRadar[0].porcentaje - perfilRadar[1].porcentaje) < 15,
      tendencia,
      fallosV
    });
    setEstado("resultados");
  };

  if (estado === "inicio") return <PantallaInicio onStart={() => setEstado("test")} />;
  
  if (estado === "test") return (
    <Cuestionario 
      q={orden[idx]} 
      idx={idx} 
      total={orden.length} 
      valor={respuestas[orden[idx]?.id]}
      onRes={responder} 
      onNext={() => idx + 1 >= orden.length ? setEstado("bipolar") : setIdx(idx + 1)}
      onPrev={() => setIdx(idx - 1)}
    />
  );

  if (estado === "bipolar") return (
    <CuestionarioBipolar 
      q={PREGUNTAS_BIPOLAR[bipolarIdx]} 
      idx={bipolarIdx}
      valor={bipolarResp[PREGUNTAS_BIPOLAR[bipolarIdx].id]}
      onRes={(v) => setBipolarResp({...bipolarResp, [PREGUNTAS_BIPOLAR[bipolarIdx].id]: v})}
      onNext={() => bipolarIdx + 1 >= PREGUNTAS_BIPOLAR.length ? finalizarAnalisis(bipolarResp) : setBipolarIdx(bipolarIdx + 1)}
    />
  );

  return <PantallaResultados data={resultado} />;
}

// ─────────────────────────────────────────────────────────────
// COMPONENTES DE INTERFAZ (ESTÉTICA MINIMALISTA iOS)
// ─────────────────────────────────────────────────────────────

function PantallaInicio({ onStart }) {
  return (
    <div style={containerStyle}>
      <div style={{ ...cardStyle, maxWidth: 440, padding: "48px 40px" }}>
        <div style={blueIconStyle}>
          <img src="/assets/blue_logo.png" alt="Blue" style={{ width: 42 }} />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 12 }}>Hola, soy Blue.</h1>
        <p style={{ color: theme.textMuted, fontSize: 16, lineHeight: 1.5, marginBottom: 40 }}>
          Descubramos cómo procesas la información para optimizar tu próximo bloque de estudio.
        </p>
        <button onClick={onStart} style={btnPrincipal}>Empezar análisis</button>
      </div>
    </div>
  );
}

function Cuestionario({ q, idx, total, valor, onRes, onNext, onPrev }) {
  return (
    <div style={containerStyle}>
      <div style={{ ...cardStyle, maxWidth: 540 }}>
        <BarraProgreso actual={idx + 1} total={total} />
        
        <h2 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.4, minHeight: 90, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32, padding: "0 10px" }}>
          {q?.texto}
        </h2>

        <EscalaLikert valor={valor} onChange={onRes} />

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 44, alignItems: "center" }}>
          <button onClick={onPrev} disabled={idx === 0} style={btnGhost}>Atrás</button>
          <button onClick={onNext} disabled={!valor} style={{ ...btnPrincipal, width: "auto", padding: "12px 36px", borderRadius: 14, fontSize: 15 }}>
            {idx + 1 === total ? "Continuar" : "Siguiente"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CuestionarioBipolar({ q, idx, valor, onRes, onNext }) {
  return (
    <div style={containerStyle}>
      <div style={{ ...cardStyle, maxWidth: 640 }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: theme.blue, letterSpacing: 2, marginBottom: 24, textTransform: "uppercase" }}>Tendencia Cognitiva</p>
        <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 40, lineHeight: 1.4 }}>¿Con qué estilo te sientes más cómoda?</h2>
        
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, padding: "0 15px" }}>
          <span style={bipolarTextStyle}>{q.textoA}</span>
          <span style={{ ...bipolarTextStyle, textAlign: "right" }}>{q.textoB}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          {[1, 2, 3, 4, 5, 6, 7].map(n => (
            <button key={n} onClick={() => onRes(n)} style={{
              width: 44, height: 44, borderRadius: "50%", border: valor === n ? "none" : `1.5px solid ${theme.border}`,
              background: valor === n ? theme.blue : "transparent", color: valor === n ? "#fff" : theme.text,
              fontWeight: 700, fontSize: 15, cursor: "pointer", transition: "0.2s"
            }}>{n}</button>
          ))}
        </div>

        <button onClick={onNext} disabled={!valor} style={{ ...btnPrincipal, marginTop: 44 }}>Generar Perfil</button>
      </div>
    </div>
  );
}

function PantallaResultados({ data }) {
  const mapping = { E: "arquitecto", R: "corredor", A: "ingeniero", St: "estratega", M: "adaptativo" };
  const p = arquetiposData[mapping[data.principal.id]];
  const s = arquetiposData[mapping[data.secundario.id]];

  return (
    <div style={{ background: theme.bg, minHeight: "100vh", padding: "60px 20px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ color: theme.blue, fontWeight: 800, letterSpacing: 3, fontSize: 11, marginBottom: 8 }}>IDENTIDAD COGNITIVA BLUE</p>
          <h1 style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-1px", margin: 0 }}>
            {data.esHibrido ? `${p.titulo} + ${s.titulo}` : p.titulo}
          </h1>
          <p style={{ color: theme.textMuted, fontSize: 17, fontStyle: "italic", marginTop: 10 }}>Tendencia: <strong>{data.tendencia}</strong></p>
        </div>

        <div style={radarContainerStyle}>
          <RadarGrafico dimensiones={data.radar} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          <ResultCard title="⚡ Puntos Fuertes" list={p.ventajas} />
          <ResultCard title="🧪 Hoja de Ruta" list={(data.esHibrido ? s : p).consejos} highlight />
          <div style={resCardBase}>
            <h4 style={hStyle}>🧠 Bases Pedagógicas</h4>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: theme.text }}>{p.baseCientifica}</p>
            <div style={iaAnalisisBox}>
              <p style={{ fontSize: 11, fontWeight: 900, color: theme.blue, marginBottom: 6 }}>BLUE AI INSIGHT</p>
              <p style={{ fontSize: 13, margin: 0, fontStyle: "italic", lineHeight: 1.5 }}>{p.analisisIA}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// UI HELPERS (STYLING)
// ─────────────────────────────────────────────────────────────

function EscalaLikert({ valor, onChange }) {
  const etiquetas = ["", "En desacuerdo", "Algo en desacuerdo", "Neutral", "Algo de acuerdo", "De acuerdo"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} onClick={() => onChange(n)} style={{
          padding: "16px 4px", borderRadius: 14, border: valor === n ? `2px solid ${theme.blue}` : `1.5px solid ${theme.border}`,
          background: valor === n ? "rgba(0, 122, 255, 0.05)" : "transparent", transition: "0.2s"
        }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: valor === n ? theme.blue : theme.text }}>{n}</div>
          <div style={{ fontSize: 9, fontWeight: 600, color: theme.textMuted, marginTop: 6, lineHeight: 1.1 }}>{etiquetas[n]}</div>
        </button>
      ))}
    </div>
  );
}

function RadarGrafico({ dimensiones }) {
  const size = 300; const center = size / 2; const radius = 90;
  const getCoords = (idx, val) => {
    const angle = (Math.PI * 2 * idx) / dimensiones.length - Math.PI / 2;
    const r = (val / 100) * radius;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };
  const points = dimensiones.map((d, i) => getCoords(i, Math.max(d.porcentaje, 15)));
  const path = points.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <svg width={size} height={size}>
      {[20, 40, 60, 80, 100].map(r => (
        <circle key={r} cx={center} cy={center} r={(r/100)*radius} fill="none" stroke={theme.border} />
      ))}
      {dimensiones.map((d, i) => {
        const p = getCoords(i, 115);
        return <text key={i} x={p.x} y={p.y} textAnchor="middle" style={{ fontSize: 9, fontWeight: 800, fill: theme.textMuted }}>{d.nombre.toUpperCase()}</text>;
      })}
      <polygon points={path} fill="rgba(0, 122, 255, 0.12)" stroke={theme.blue} strokeWidth="2" />
    </svg>
  );
}

function BarraProgreso({ actual, total }) {
  const pct = (actual / total) * 100;
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 800, color: theme.textMuted, marginBottom: 6 }}>
        <span>SESIÓN DE ANÁLISIS</span><span>{Math.round(pct)}%</span>
      </div>
      <div style={{ height: 5, background: theme.border, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: theme.blue, transition: "0.5s" }} />
      </div>
    </div>
  );
}

function ResultCard({ title, list, highlight }) {
  return (
    <div style={{ ...resCardBase, border: highlight ? `1px solid ${theme.blue}` : `1px solid ${theme.border}`, background: highlight ? "rgba(0, 122, 255, 0.02)" : "#fff" }}>
      <h4 style={hStyle}>{title}</h4>
      <ul style={ulStyle}>{list.map((item, i) => <li key={i}>{item}</li>)}</ul>
    </div>
  );
}

const containerStyle = { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: theme.bg, padding: 20 };
const cardStyle = { width: "100%", background: "#fff", padding: "40px", borderRadius: 32, boxShadow: "0 15px 35px rgba(0,0,0,0.03)", border: `1px solid ${theme.border}`, textAlign: "center" };
const blueIconStyle = { width: 70, height: 70, background: "rgba(0, 122, 255, 0.04)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" };
const btnPrincipal = { width: "100%", padding: "16px", borderRadius: 14, border: "none", background: "#1c1c1e", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer" };
const btnGhost = { padding: 10, background: "none", border: "none", color: theme.textMuted, fontWeight: 700, cursor: "pointer", fontSize: 14 };
const bipolarTextStyle = { flex: 1, fontSize: 13, fontWeight: 600, color: theme.text, lineHeight: 1.3 };
const radarContainerStyle = { background: "#fff", padding: 32, borderRadius: 28, border: `1px solid ${theme.border}`, display: "flex", justifyContent: "center", marginBottom: 24 };
const resCardBase = { background: "#fff", padding: 28, borderRadius: 24, border: `1px solid ${theme.border}` };
const hStyle = { fontSize: 11, fontWeight: 900, letterSpacing: 2, marginBottom: 18, textTransform: "uppercase", color: theme.blue };
const ulStyle = { paddingLeft: 18, fontSize: 14, color: theme.text, lineHeight: 1.7, margin: 0 };
const iaAnalisisBox = { background: theme.bgMuted, padding: 18, borderRadius: 16, marginTop: 20 };