import { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Inicio      from "./components/Inicio";
import BlueTest    from "./components/BlueTest";
import SalaEstudio from "./components/SalaEstudio";
import Historial   from "./components/Historial";
import Calibracion from "./components/Calibracion";
// ¡IMPORTANTE! Importamos el componente que faltaba:
import FeedbackSesion from "./components/FeedbackSesion";

import { font, t } from "./theme"; 

// Creamos un sub-componente enrutador para poder usar 'useNavigate'
function AppRouter() {
  const navigate = useNavigate();

  // 🌉 EL PUENTE: Guardamos configuración de entrada
  const [configSesion, setConfigSesion] = useState({
    objetivo: "Estudio Libre", 
    materia: "General", 
    pomodoros: 4
  });

  // 💾 EL NUEVO PUENTE: Guardamos temporalmente el reporte de salida
  const [reporteFinal, setReporteFinal] = useState(null);

  return (
    <div style={{ 
      fontFamily: font, background: t.bg, minHeight: "100vh", color: t.text, transition: "background 0.3s ease" 
    }}>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/test" element={<BlueTest />} />
        
        <Route path="/calibracion" element={
          <Calibracion 
            onIniciarSesion={(datosDelFormulario) => {
              setConfigSesion(datosDelFormulario);
              // Limpiamos cualquier reporte viejo antes de entrar
              setReporteFinal(null);
            }} 
          />
        } />
        
        {/* LA RUTA DE LA SALA: Ahora decide si mostrar la cámara o el feedback */}
        <Route path="/sala" element={
          reporteFinal ? (
            <FeedbackSesion 
              reporte={reporteFinal} 
              onContinuar={() => {
                setReporteFinal(null); // Limpiamos estado
                navigate('/historial'); // Vamos al historial
              }}
            />
          ) : (
            <SalaEstudio 
              config={configSesion} 
              onFinalizar={(datosDeSesion) => {
                // En vez de saltar al historial, guardamos el reporte para mostrar el Feedback
                setReporteFinal(datosDeSesion);
              }} 
            />
          )
        } />
        
        <Route path="/historial" element={<Historial />} />

        {/* RUTA DE RESPALDO (Error 404) */}
        <Route path="*" element={
          <div style={{ textAlign: "center", padding: "100vh 20px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", boxSizing: "border-box" }}>
            <h1 style={{ fontSize: 80, color: t.text, margin: 0, fontWeight: 800 }}>404</h1>
            <p style={{ color: t.textMuted, marginBottom: 30, fontSize: 18 }}>Parece que te desconcentraste y te saliste de la ruta.</p>
            <button onClick={() => navigate('/')} style={{ padding: "16px 32px", background: t.blue || "#007AFF", color: "#fff", border: "none", borderRadius: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,122,255,0.3)" }}>
              Volver al Inicio
            </button>
          </div>
        } />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}