import { useState, useEffect } from "react";
import { t, font } from "../theme";

const COLORES = ["#FEF3C7", "#E0F2FE", "#F0FDF4", "#FFEDD5", "#FCE7F3"];

export default function NotasRapidas({ sesionId }) {
  // --- ESTADO DE NOTAS (Post-its) ---
  const [notas, setNotas] = useState(() => {
    const guardadas = localStorage.getItem(`blue_notas_${sesionId}`);
    return guardadas ? JSON.parse(guardadas) : [{ id: Date.now(), texto: "", color: COLORES[0] }];
  });

  // --- ESTADO DE TAREAS (Micro-objetivos) ---
  const [tareas, setTareas] = useState(() => {
    const guardadas = localStorage.getItem(`blue_tareas_${sesionId}`);
    return guardadas ? JSON.parse(guardadas) : [];
  });

  const [nuevaTarea, setNuevaTarea] = useState("");

  useEffect(() => {
    localStorage.setItem(`blue_notas_${sesionId}`, JSON.stringify(notas));
    localStorage.setItem(`blue_tareas_${sesionId}`, JSON.stringify(tareas));
  }, [notas, tareas, sesionId]);

  // Lógica de Notas
  const agregarNota = () => setNotas([...notas, { id: Date.now(), texto: "", color: COLORES[notas.length % COLORES.length] }]);
  const editarNota = (id, texto) => setNotas(notas.map(n => n.id === id ? { ...n, texto } : n));
  const eliminarNota = (id) => setNotas(notas.filter(n => n.id !== id));

  // Lógica de Tareas
  const agregarTarea = (e) => {
    if (e.key === "Enter" && nuevaTarea.trim()) {
      setTareas([...tareas, { id: Date.now(), texto: nuevaTarea, completada: false }]);
      setNuevaTarea("");
    }
  };

  const toggleTarea = (id) => setTareas(tareas.map(t => t.id === id ? { ...t, completada: !t.completada } : t));
  const eliminarTarea = (id) => setTareas(tareas.filter(t => t.id !== id));

  const completadas = tareas.filter(t => t.completada).length;
  const porcentaje = tareas.length > 0 ? Math.round((completadas / tareas.length) * 100) : 0;

  return (
    <div style={{ fontFamily: font, display: "flex", flexDirection: "column", gap: 24 }}>
      
      {/* ─── SECCIÓN 1: MICRO-OBJETIVOS (Checklist) ─── */}
      <div style={{ background: t.bgCard, borderRadius: 20, padding: 20, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ color: t.text, fontSize: 13, fontWeight: 700, margin: 0, letterSpacing: 1 }}>LISTA DE TAREAS</h3>
          <span style={{ color: t.blue, fontSize: 12, fontWeight: 800 }}>{porcentaje}%</span>
        </div>

        {/* Barra de Progreso de Tareas */}
        <div style={{ height: 6, background: t.bgMuted, borderRadius: 3, marginBottom: 20, overflow: "hidden" }}>
          <div style={{ width: `${porcentaje}%`, height: "100%", background: t.blue, transition: "width 0.4s ease" }} />
        </div>

        <input 
          value={nuevaTarea}
          onChange={(e) => setNuevaTarea(e.target.value)}
          onKeyDown={agregarTarea}
          placeholder="+ Añadir micro-objetivo..."
          style={{
            width: "100%", padding: "12px", borderRadius: 12, background: t.bgMuted,
            border: `1px solid ${t.border}`, color: t.text, fontSize: 13, outline: "none", marginBottom: 16, boxSizing: "border-box"
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tareas.map(tarea => (
            <div key={tarea.id} style={{ 
              display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", 
              background: tarea.completada ? "transparent" : t.bgCard2, 
              borderRadius: 10, border: `1px solid ${tarea.completada ? "transparent" : t.border}`,
              transition: "all 0.2s"
            }}>
              <input type="checkbox" checked={tarea.completada} onChange={() => toggleTarea(tarea.id)} 
                style={{ cursor: "pointer", accentColor: t.blue, width: 16, height: 16 }} />
              <span style={{ 
                flex: 1, fontSize: 13, color: tarea.completada ? t.textLight : t.text,
                textDecoration: tarea.completada ? "line-through" : "none",
                transition: "all 0.2s"
              }}>{tarea.texto}</span>
              <button onClick={() => eliminarTarea(tarea.id)} style={{ background: "none", border: "none", color: t.textLight, cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* ─── SECCIÓN 2: NOTAS RÁPIDAS (Post-its) ─── */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ color: t.text, fontSize: 13, fontWeight: 700, margin: 0, letterSpacing: 1 }}>NOTAS Y DUDAS</h3>
          <button onClick={agregarNota} style={{ background: t.blue, color: "#fff", border: "none", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", fontWeight: 700 }}>+</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
          {notas.map(nota => (
            <div key={nota.id} style={{ background: nota.color, borderRadius: 16, padding: 16, position: "relative", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.05)" }}>
              <button onClick={() => eliminarNota(nota.id)} style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", color: "rgba(0,0,0,0.2)", cursor: "pointer" }}>✕</button>
              <textarea value={nota.texto} onChange={(e) => editarNota(nota.id, e.target.value)} placeholder="Escribe algo..."
                style={{ width: "100%", minHeight: 60, background: "transparent", border: "none", outline: "none", color: "#424242", fontSize: 14, fontFamily: font, resize: "none" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}