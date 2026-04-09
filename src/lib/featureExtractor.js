// ─────────────────────────────────────────────
// featureExtractor.js
// Convierte un frame detectado en un vector
// numérico normalizado para KMeans/KNN.
//
// Vector de 6 features:
// [yaw, pitch, brillo, ratio_cara, simetria, manos]
//
// Todos normalizados a [0, 1] para que ninguna
// dimensión domine la distancia euclidiana.
// ─────────────────────────────────────────────

// ── Rangos para normalización min-max ──
const RANGOS = {
  yaw:        { min: -45, max: 45  },
  pitch:      { min: -40, max: 40  },
  brillo:     { min: 0,   max: 255 },
  ratio_cara: { min: 0,   max: 1   },
  simetria:   { min: 0,   max: 1   },
  manos:      { min: 0,   max: 1   },
};

function normalizar(valor, min, max) {
  return Math.max(0, Math.min(1, (valor - min) / (max - min)));
}

// ── Calcular yaw (rotación horizontal) ──
function calcularYaw(landmarks) {
  try {
    const pts      = landmarks.positions;
    const nose     = pts[30];
    const leftEye  = pts[36];
    const rightEye = pts[45];
    const eyeWidth = rightEye.x - leftEye.x;
    if (eyeWidth < 1) return null;
    const eyeMidX = (leftEye.x + rightEye.x) / 2;
    return ((nose.x - eyeMidX) / (eyeWidth / 2)) * 30;
  } catch { return null; }
}

// ── Calcular pitch (inclinación vertical) ──
function calcularPitch(landmarks) {
  try {
    const pts      = landmarks.positions;
    const nose     = pts[30];
    const chin     = pts[8];
    const leftEye  = pts[36];
    const rightEye = pts[45];
    const eyeWidth = rightEye.x - leftEye.x;
    if (eyeWidth < 1) return null;
    return Math.atan2(chin.y - nose.y, chin.x - nose.x) * (180 / Math.PI) - 90;
  } catch { return null; }
}

// ── Calcular brillo promedio del frame ──
function calcularBrillo(video) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width  = 64;
    canvas.height = 48;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, 64, 48);
    const data = ctx.getImageData(0, 0, 64, 48).data;
    let suma = 0;
    for (let i = 0; i < data.length; i += 4) {
      suma += data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    }
    return suma / (data.length / 4);
  } catch { return null; }
}

// ── Ratio del área de la cara sobre el frame ──
// Cuanto más pequeño, más lejos está la persona
function calcularRatioCara(deteccion, videoWidth, videoHeight) {
  try {
    const box  = deteccion.detection.box;
    const area = (box.width * box.height) / (videoWidth * videoHeight);
    return Math.min(1, area * 4); // escalar para que ocupe bien [0,1]
  } catch { return 0; }
}

// ── Simetría facial (qué tan de frente está la cara) ──
// 1 = perfectamente de frente, 0 = muy girada
function calcularSimetria(landmarks) {
  try {
    const pts      = landmarks.positions;
    const leftEye  = pts[36];
    const rightEye = pts[45];
    const nose     = pts[30];
    const eyeMidX  = (leftEye.x + rightEye.x) / 2;
    const eyeWidth = rightEye.x - leftEye.x;
    if (eyeWidth < 1) return null;
    const offset = Math.abs(nose.x - eyeMidX) / (eyeWidth / 2);
    return Math.max(0, 1 - offset);
  } catch { return null; }
}

// ─────────────────────────────────────────────
// FUNCIÓN PRINCIPAL
// Retorna un vector de 6 números en [0,1]
// o null si el frame no es válido
// ─────────────────────────────────────────────

export function extraerVector(deteccion, landmarks, video, manosDetectadas = false) {
  // Si no hay cara, el vector es el estado "ausente"
  const sinCara = !deteccion || !landmarks;

  const yaw       = sinCara ? 0    : calcularYaw(landmarks);
  const pitch     = sinCara ? 0    : calcularPitch(landmarks);
  const brillo    = calcularBrillo(video);
  const ratioCara = sinCara ? 0    : calcularRatioCara(deteccion, video.videoWidth || 320, video.videoHeight || 240);
  const simetria  = sinCara ? 0    : calcularSimetria(landmarks);
  const manos     = manosDetectadas ? 1 : 0;

  // Rechazar frames con brillo insuficiente (cámara tapada, apagada, etc.)
  if (brillo !== null && brillo < 15) return null;

  return [
    normalizar(yaw      ?? 0, RANGOS.yaw.min,        RANGOS.yaw.max),
    normalizar(pitch    ?? 0, RANGOS.pitch.min,       RANGOS.pitch.max),
    normalizar(brillo   ?? 127, RANGOS.brillo.min,    RANGOS.brillo.max),
    normalizar(ratioCara,    RANGOS.ratio_cara.min,   RANGOS.ratio_cara.max),
    normalizar(simetria ?? 0, RANGOS.simetria.min,    RANGOS.simetria.max),
    manos,
  ];
}

// ─────────────────────────────────────────────
// ETIQUETAS
// Las únicas 3 clases que maneja Blue
// ─────────────────────────────────────────────

export const ETIQUETAS = {
  CONCENTRADO: "concentrado",
  DISTRAIDO:   "distraido",
  AUSENTE:     "ausente",
};

export const ETIQUETA_INDEX = {
  concentrado: 0,
  distraido:   1,
  ausente:     2,
};
