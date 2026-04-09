// ─────────────────────────────────────────────
// modelStore.js
// Carga y guarda el modelo KNN de Blue en
// localStorage. El modelo es simplemente un
// array de puntos etiquetados — no hay pesos
// opacos, todo es interpretable.
// ─────────────────────────────────────────────

const KEY = "blue_modelo_knn";
const KEY_HISTORIAL = "blue_historial_vectores";
const MAX_PUNTOS = 500; // cap para no saturar localStorage

// ── Estructura del modelo guardado ──
// {
//   puntos: [ { vector: [f1..f6], etiqueta: "concentrado" }, ... ],
//   version: 1,
//   fechaActualizacion: ISO string,
//   sesionesEntrenadas: number,
// }

export function cargarModelo() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function guardarModelo(modelo) {
  try {
    // Mantener solo los últimos MAX_PUNTOS para no saturar storage
    if (modelo.puntos.length > MAX_PUNTOS) {
      // Estrategia: mantener proporciones por clase
      const porClase = {};
      for (const p of modelo.puntos) {
        if (!porClase[p.etiqueta]) porClase[p.etiqueta] = [];
        porClase[p.etiqueta].push(p);
      }
      const clases = Object.keys(porClase);
      const porCada = Math.floor(MAX_PUNTOS / clases.length);
      modelo.puntos = clases.flatMap((c) =>
        porClase[c].slice(-porCada) // los más recientes de cada clase
      );
    }
    localStorage.setItem(KEY, JSON.stringify(modelo));
    return true;
  } catch {
    return false;
  }
}

export function modeloExiste() {
  return localStorage.getItem(KEY) !== null;
}

export function resetearModelo() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(KEY_HISTORIAL);
}

// ── Agregar puntos nuevos al modelo existente ──
export function agregarPuntos(puntosNuevos) {
  const modelo = cargarModelo() || {
    puntos: [],
    version: 1,
    fechaActualizacion: new Date().toISOString(),
    sesionesEntrenadas: 0,
  };
  modelo.puntos = [...modelo.puntos, ...puntosNuevos];
  modelo.fechaActualizacion = new Date().toISOString();
  modelo.sesionesEntrenadas = (modelo.sesionesEntrenadas || 0) + 1;
  return guardarModelo(modelo);
}

// ── Guardar vectores sin etiquetar de una sesión ──
// Se usan en el feedback post-sesión
export function guardarVectoresSesion(vectores) {
  try {
    localStorage.setItem(KEY_HISTORIAL, JSON.stringify({
      vectores,
      fecha: new Date().toISOString(),
    }));
  } catch {}
}

export function cargarVectoresSesion() {
  try {
    const raw = localStorage.getItem(KEY_HISTORIAL);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
