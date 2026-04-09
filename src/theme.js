// ─────────────────────────────────────────────
// theme.js — Sistema de Diseño Premium "Blue"
// ─────────────────────────────────────────────

export const t = {
  // --- Fondos Estilo iOS ---
  bg:         "#F2F2F7",   // Gris claro de sistema
  bgCard:     "#FFFFFF",   // Blanco puro para tarjetas
  bgMuted:    "#E5E5EA",   // Rellenos secundarios

  // --- Texto de alta legibilidad ---
  text:       "#1C1C1E",   // Label principal
  textMuted:  "#3A3A3C",   // Secondary label
  textLight:  "#8E8E93",   // Placeholders

  // --- Acentos Cromáticos Apple ---
  blue:       "#007AFF",   // Azul San Francisco (Vibrante)
  blueSoft:   "#E5F1FF",   
  blueMid:    "#A2C8FF",

  green:      "#34C759",   // Éxito / Concentrado
  greenSoft:  "#E9F9EE",
  greenMid:   "#AFF2C5",

  amber:      "#FF9500",   // Advertencia / Distraído
  amberSoft:  "#FFF4E5",

  red:        "#FF3B30",   // Error / Ausente
  redSoft:    "#FFEBEA",

  purple:     "#AF52DE",   // Acento de "flow" científico
  purpleSoft: "#F5EFFF",

  // --- Bordes sutiles y modernos ---
  border:     "rgba(0, 0, 0, 0.05)", 
  borderMid:  "rgba(0, 0, 0, 0.12)", 

  // --- Sombras de profundidad orgánica ---
  shadow:     "0 2px 8px rgba(0,0,0,0.04)",
  shadowMd:   "0 10px 30px rgba(0,0,0,0.06)", 
  shadowHover: "0 20px 40px rgba(0,0,0,0.12)",

  // ─────────────────────────────────────────────
  // ADN de Burbuja Blue (Glassmorphism Sensorial)
  // ─────────────────────────────────────────────
  bubble: {
    bg: "rgba(255, 255, 255, 0.25)",          // Cristal traslúcido
    border: "rgba(255, 255, 255, 0.5)",       // Reflejo de tensión superficial
    blur: "blur(14px)",                       // Efecto esmerilado profundo
    
    gradient: "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.5), transparent 60%), linear-gradient(135deg, rgba(0, 122, 255, 0.3) 0%, rgba(90, 200, 250, 0.05) 100%)",
    
    shadow: "0 8px 32px 0 rgba(0, 122, 255, 0.12)",
    innerShadow: "inset 0 0 12px rgba(255, 255, 255, 0.4)"
  }
};

// Fuente nativa de Apple (Corregida)
export const font = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif';