import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CamaraConcentracion from "./CamaraConcentracion";
import BlueBurbuja from "./BlueBurbuja";
import AudioConcentracion from "./AudioConcentracion";
import NotasRapidas from "./NotasRapidas";
import { t } from "../theme"; 

const fontStackApple = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif';
const fontElegante = "'Cormorant Garamond', serif"; 

export default function SalaEstudio({ config, onFinalizar }) {
  const navigate = useNavigate();
  const sesionId = useRef(`sesion_${Date.now()}`);
  const inicioSesion = useRef(Date.now());
  const historialPomodoros = useRef([]);
  const contadoresBloque = useRef({ concentrado: 0, distraido: 0, ausente: 0 });

  const [pomodoroActual, setPomodoroActual] = useState(1);
  const [fase, setFase] = useState("trabajo");
  const [tiempoRestante, setTiempoRestante] = useState(25 * 60);
  const [pausado, setPausado] = useState(false);
  const [estadoCamara, setEstadoCamara] = useState("cargando");

  const formatTiempo = (seg) => {
    const m = Math.floor(seg / 60).toString().padStart(2, "0");
    const s = (seg % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const finalizarYEnviar = useCallback(() => {
    const hist = [...historialPomodoros.current];
    if (fase === "trabajo") {
      const c = contadoresBloque.current;
      const total = c.concentrado + c.distraido + c.ausente;
      const ipv = total > 0 ? Math.round((c.concentrado / total) * 100) : 0;
      hist.push({ ipv, numero: pomodoroActual });
    }
    
    // ESCUDO PROTECTOR: Usamos ?. para que no crashee si no hay función, y le pasamos los datos
    onFinalizar?.({
      sesionId: sesionId.current, 
      materia: config?.materia || "Estudio", 
      objetivo: config?.objetivo || "Meta",
      ipvGlobal: hist.length > 0 ? Math.round(hist.reduce((s, p) => s + p.ipv, 0) / hist.length) : 0,
      historialPomodoros: hist, 
      duracionMin: Math.round((Date.now() - inicioSesion.current) / 60000)
    });

    // Si por algún motivo se entra a la sala directamente sin el App.jsx configurado
    if (!onFinalizar) {
      console.warn("Falta la prop onFinalizar. Redirigiendo al inicio.");
      navigate("/");
    }
  }, [config, onFinalizar, fase, pomodoroActual, navigate]);

  const handleEstadoChange = useCallback((nuevo) => {
    setEstadoCamara(nuevo);
    if (fase === "trabajo" && !pausado && nuevo !== "cargando") {
      contadoresBloque.current[nuevo]++;
    }
  }, [fase, pausado]);

  useEffect(() => {
    if (pausado) return;
    const timer = setInterval(() => {
      setTiempoRestante(prev => {
        if (prev <= 1) {
          if (fase === "trabajo") {
            const c = contadoresBloque.current;
            const total = c.concentrado + c.distraido + c.ausente;
            const ipv = total > 0 ? Math.round((c.concentrado / total) * 100) : 0;
            historialPomodoros.current.push({ ipv, numero: pomodoroActual });
            
            // LECTURA DINÁMICA DE POMODOROS: Toma el valor de calibración o 4 por defecto
            const limitePomodoros = config?.pomodoros || 4;
            
            if (pomodoroActual >= limitePomodoros) { 
              finalizarYEnviar(); 
              return 0; 
            }
            setFase("descanso"); 
            return 5 * 60;
          } else {
            setPomodoroActual(p => p + 1); 
            setFase("trabajo"); 
            return 25 * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [pausado, fase, pomodoroActual, config, finalizarYEnviar]);

  const progreso = (tiempoRestante / (fase === "trabajo" ? 25 * 60 : 5 * 60)) * 100;

  return (
    <div style={{ minHeight: "100vh", background: t.bg, padding: "32px 20px", fontFamily: fontStackApple }}>
      
      {/* HEADER: LOGO + ESTADO INTEGRADO */}
      <div style={{ maxWidth: 1200, margin: "0 auto 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src="/assets/blue_logo.png" alt="Blue" style={{ width: 42, height: 42, objectFit: "contain" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px" }}>Blue</span>
            <div style={{ width: "1px", height: "20px", background: t.borderMid, margin: "0 4px" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ 
                width: 8, height: 8, borderRadius: "50%", 
                background: estadoCamara === "concentrado" ? t.green : estadoCamara === "distraido" ? t.amber : estadoCamara === "ausente" ? t.red : t.borderMid,
                transition: "all 0.5s ease"
              }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: t.textLight, textTransform: "lowercase" }}>
                {estadoCamara === "concentrado" && "en foco"}
                {estadoCamara === "distraido" && "dispersa"}
                {estadoCamara === "ausente" && "ausente"}
                {estadoCamara === "cargando" && "iniciando"}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => navigate("/historial")} style={{ background: "transparent", border: "none", color: t.textLight, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Historial</button>
          <button onClick={() => navigate("/")} style={{ background: t.text, color: t.bg, border: "none", padding: "10px 20px", borderRadius: 12, fontWeight: 600, cursor: "pointer" }}>← Inicio</button>
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "24fr 46fr 30fr", gap: 32, alignItems: "start" }}>
        
        {/* COL 1: IA + ESTADOS REPARADOS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <CamaraConcentracion activa={!pausado} onEstadoChange={handleEstadoChange} />
          
          <div style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 16px",
            background: "rgba(255, 255, 255, 0.5)", backdropFilter: "blur(10px)",
            borderRadius: "20px", border: `1px solid ${t.border}`, width: "fit-content",
            marginTop: "12px", boxShadow: t.shadow
          }}>
            <div style={{ width: 26, height: 26, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{
                position: "absolute", inset: -4, borderRadius: "50%", zIndex: -1, transition: "all 0.6s ease",
                background: estadoCamara === "concentrado" ? t.green : estadoCamara === "distraido" ? t.amber : estadoCamara === "ausente" ? t.red : t.borderMid,
                opacity: 0.4, filter: "blur(8px)"
              }} />
              <img src="/assets/blue_logo.png" alt="status" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>

            <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>
              {estadoCamara === "concentrado" && "En foco"}
              {estadoCamara === "distraido" && "Dispersa"}
              {estadoCamara === "ausente" && "Ausente"}
              {estadoCamara === "cargando" && "Iniciando..."}
            </span>
          </div>
          <AudioConcentracion />
        </div>

        {/* COL 2: POMODORO */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 35 }}>
          <div style={{ background: t.bgCard, border: `2px solid ${t.border}`, borderRadius: 35, padding: "50px 1px", textAlign: "center", boxShadow: t.shadowMd, width: "100%" }}>
            
            {/* TEXTO INFORMATIVO DE BLOQUES */}
            <div style={{ marginBottom: 20, color: t.textMuted, fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>
              Bloque {pomodoroActual} de {config?.pomodoros || 4}
            </div>

            <div style={{ position: "relative", width: 300, height: 300, margin: "0 auto 40px" }}>
              <svg width="300" height="300" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="150" cy="150" r="130" fill="none" stroke={t.bgMuted} strokeWidth="16" opacity="0.3" />
                <circle cx="150" cy="150" r="130" fill="none" stroke={t.blue} strokeWidth="16" 
                  strokeDasharray={2 * Math.PI * 130} 
                  strokeDashoffset={((100 - progreso) / 100) * (2 * Math.PI * 130)} 
                  strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }} />
              </svg>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                
                {/* LA MAGIA DE LA TIPOGRAFÍA (Tabular Nums) */}
                <div style={{ 
                  fontSize: 70, color: t.text, fontWeight: 400, letterSpacing: "1px", 
                  fontFamily: fontStackApple, fontVariantNumeric: "tabular-nums" 
                }}>
                  {formatTiempo(tiempoRestante)}
                </div>
                
                <div style={{ color: t.textLight, fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>{fase.toUpperCase()}</div>
              </div>
            </div>
            <button onClick={() => setPausado(!pausado)} style={{ width: 72, height: 72, borderRadius: "50%", background: t.text, color: t.bg, border: "none", fontSize: 28, cursor: "pointer", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>{pausado ? "▶" : "⏸"}</button>
          </div>
          <button onClick={() => { if(window.confirm("¿Finalizar sesión?")) finalizarYEnviar(); }} style={{ background: "transparent", border: "none", color: t.red, fontWeight: 600, fontSize: 14, cursor: "pointer", opacity: 0.8 }}>Finalizar Sesión</button>
        </div>

        {/* COL 3: OBJETIVO */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 24, padding: "24px", boxShadow: t.shadow }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: t.textLight, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>
              OBJETIVO
            </p>
            {/* LECTURA DINÁMICA DEL OBJETIVO */}
            <p style={{ fontSize: "24px", fontFamily: fontElegante, fontStyle: "italic", fontWeight: 700, color: t.text, lineHeight: 1.3, margin: 0 }}>
              {config?.objetivo || "Sesión de Enfoque"}
            </p>
          </div>
          <NotasRapidas sesionId={sesionId.current} />
        </div>

      </div>
      
      {/* BURBUJA CONECTADA AL ESTADO DE LA IA */}
      <BlueBurbuja estado={estadoCamara} />
    </div>
  );
}