import { useState } from "react"; // <-- Importamos useState
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Inicio      from "./components/Inicio";
import BlueTest    from "./components/BlueTest";
import SalaEstudio from "./components/SalaEstudio";
import Historial   from "./components/Historial";
import Calibracion from "./components/Calibracion";

import { font, t } from "./theme"; 

export default function App() {
  // 🌉 EL PUENTE: Aquí guardamos lo que el usuario escriba en Calibración
  const [configSesion, setConfigSesion] = useState({
    objetivo: "Estudio Libre", 
    materia: "General", 
    pomodoros: 4
  });

  return (
    <BrowserRouter>
      <div style={{ 
        fontFamily: font, background: t.bg, minHeight: "100vh", color: t.text, transition: "background 0.3s ease" 
      }}>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/test" element={<BlueTest />} />
          
          {/* PASO A: Le pasamos la función a Calibración para que guarde los datos */}
          <Route path="/calibracion" element={
            <Calibracion 
              onIniciarSesion={(datosDelFormulario) => {
                setConfigSesion(datosDelFormulario);
              }} 
            />
          } />
          
          {/* PASO B: Le pasamos los datos guardados a la Sala de Estudio */}
          <Route path="/sala" element={
            <SalaEstudio 
              config={configSesion} // <-- ¡Ahora es dinámico!
              onFinalizar={(datosDeSesion) => {
                console.log("¡Sesión terminada!", datosDeSesion);
                window.location.href = '/historial'; 
              }} 
            />
          } />
          
          <Route path="/historial" element={<Historial />} />

          {/* RUTA DE RESPALDO (Error 404) */}
          <Route path="*" element={
            <div style={{ textAlign: "center", padding: "100vh 20px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", boxSizing: "border-box" }}>
              <h1 style={{ fontSize: 80, color: t.text, margin: 0, fontWeight: 800 }}>404</h1>
              <p style={{ color: t.textMuted, marginBottom: 30, fontSize: 18 }}>Parece que te desconcentraste y te saliste de la ruta.</p>
              <button onClick={() => window.location.href = '/'} style={{ padding: "16px 32px", background: t.blue || "#007AFF", color: "#fff", border: "none", borderRadius: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,122,255,0.3)" }}>
                Volver al Inicio
              </button>
            </div>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}