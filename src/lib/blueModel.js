// ─────────────────────────────────────────────
// blueModel.js
// Capa de abstracción sobre ml-kmeans y ml-knn.
//
// Responsabilidades:
// 1. seedDesdeEtiquetado()  → construye modelo inicial
//    desde los vectores de calibración
// 2. clasificar()           → KNN sobre modelo existente
// 3. reentrenar()           → agrega puntos nuevos al KNN
// 4. detectarPatronNuevo()  → KMeans sobre vectores
//    de la sesión para encontrar clusters no vistos
// ─────────────────────────────────────────────

import KNN from "ml-knn";
import { kmeans } from "ml-kmeans";
import { cargarModelo, guardarModelo, agregarPuntos } from "./modelStore";

const K_VECINOS = 5; // vecinos para KNN

// ─────────────────────────────────────────────
// 1. SEED — construir modelo desde calibración
// ─────────────────────────────────────────────

// vectoresPorEtiqueta: { concentrado: [[...], ...], distraido: [...], ausente: [...] }
export function seedDesdeEtiquetado(vectoresPorEtiqueta) {
  const puntos = [];

  for (const [etiqueta, vecs] of Object.entries(vectoresPorEtiqueta)) {
    for (const vector of vecs) {
      if (vector && vector.length === 6) {
        puntos.push({ vector, etiqueta });
      }
    }
  }

  const modelo = {
    puntos,
    version: 1,
    fechaActualizacion: new Date().toISOString(),
    sesionesEntrenadas: 0,
  };

  guardarModelo(modelo);
  return modelo;
}

// ─────────────────────────────────────────────
// 2. CLASIFICAR — KNN sobre modelo guardado
// ─────────────────────────────────────────────

// Retorna { etiqueta, confianza, vecinos }
// confianza = fracción de vecinos que votan por la etiqueta ganadora
export function clasificar(vector) {
  const modelo = cargarModelo();
  if (!modelo || modelo.puntos.length < K_VECINOS) {
    return { etiqueta: null, confianza: 0, vecinos: [] };
  }

  try {
    const X = modelo.puntos.map((p) => p.vector);
    const y = modelo.puntos.map((p) => p.etiqueta);

    const knn = new KNN(X, y, { k: Math.min(K_VECINOS, modelo.puntos.length) });
    const etiqueta = knn.predict([vector])[0];

    // Calcular confianza: % de vecinos que coinciden
    const distancias = X.map((x, i) => ({
      dist: distanciaEuclidiana(vector, x),
      etiqueta: y[i],
    })).sort((a, b) => a.dist - b.dist).slice(0, K_VECINOS);

    const votos = distancias.filter((d) => d.etiqueta === etiqueta).length;
    const confianza = votos / K_VECINOS;

    return { etiqueta, confianza, vecinos: distancias };
  } catch (e) {
    console.error("Error KNN:", e);
    return { etiqueta: null, confianza: 0, vecinos: [] };
  }
}

// ─────────────────────────────────────────────
// 3. REENTRENAR — agregar puntos confirmados
// ─────────────────────────────────────────────

// puntosConfirmados: [{ vector, etiqueta }, ...]
export function reentrenar(puntosConfirmados) {
  return agregarPuntos(puntosConfirmados);
}

// ─────────────────────────────────────────────
// 4. DETECTAR PATRÓN NUEVO — KMeans post-sesión
// ─────────────────────────────────────────────

// Recibe vectores no etiquetados de la sesión.
// Corre KMeans con K=3 y compara centroides
// con los del modelo existente.
// Retorna clusters que son "nuevos" (distantes del modelo).

export function detectarPatronesNuevos(vectoresSesion) {
  const modelo = cargarModelo();
  if (!modelo || vectoresSesion.length < 10) return [];

  try {
    // KMeans sobre los vectores de la sesión
    const resultado = kmeans(vectoresSesion, 3, {
      initialization: "kmeans++",
      maxIterations: 100,
    });

    const centroidesSesion = resultado.centroids;

    // Centroides del modelo existente por clase
    const centroidesModelo = calcularCentroidesModelo(modelo.puntos);

    // Un cluster es "nuevo" si su centroide está lejos de todos los del modelo
    const UMBRAL_NOVEDAD = 0.25; // distancia euclidiana en espacio [0,1]^6

    const nuevos = centroidesSesion
      .map((centroide, i) => {
        const indicesCluster = resultado.clusters
          .map((c, idx) => c === i ? idx : -1)
          .filter((idx) => idx >= 0);

        const distanciaMinima = Math.min(
          ...Object.entries(centroidesModelo).map(([etiqueta, c]) => ({
            etiqueta,
            dist: distanciaEuclidiana(centroide, c),
          })).map((x) => x.dist)
        );

        const etiquetaMasCercana = Object.entries(centroidesModelo)
          .map(([etiqueta, c]) => ({ etiqueta, dist: distanciaEuclidiana(centroide, c) }))
          .sort((a, b) => a.dist - b.dist)[0];

        return {
          centroide,
          indicesCluster,
          tamano: indicesCluster.length,
          distanciaMinima,
          esNuevo: distanciaMinima > UMBRAL_NOVEDAD,
          etiquetaSugerida: etiquetaMasCercana?.etiqueta || null,
        };
      })
      .filter((c) => c.esNuevo && c.tamano > 3); // ignorar clusters de 1-2 puntos

    return nuevos;
  } catch (e) {
    console.error("Error KMeans:", e);
    return [];
  }
}

// ─────────────────────────────────────────────
// UTILIDADES INTERNAS
// ─────────────────────────────────────────────

function distanciaEuclidiana(a, b) {
  return Math.sqrt(a.reduce((s, v, i) => s + Math.pow(v - b[i], 2), 0));
}

function calcularCentroidesModelo(puntos) {
  const porClase = {};
  for (const p of puntos) {
    if (!porClase[p.etiqueta]) porClase[p.etiqueta] = [];
    porClase[p.etiqueta].push(p.vector);
  }
  const centroides = {};
  for (const [etiqueta, vecs] of Object.entries(porClase)) {
    const dim = vecs[0].length;
    centroides[etiqueta] = Array.from({ length: dim }, (_, i) =>
      vecs.reduce((s, v) => s + v[i], 0) / vecs.length
    );
  }
  return centroides;
}

// ─────────────────────────────────────────────
// INFO DEL MODELO
// ─────────────────────────────────────────────

export function infoModelo() {
  const modelo = cargarModelo();
  if (!modelo) return null;

  const porClase = {};
  for (const p of modelo.puntos) {
    porClase[p.etiqueta] = (porClase[p.etiqueta] || 0) + 1;
  }

  return {
    totalPuntos: modelo.puntos.length,
    porClase,
    sesionesEntrenadas: modelo.sesionesEntrenadas || 0,
    fechaActualizacion: modelo.fechaActualizacion,
  };
}
