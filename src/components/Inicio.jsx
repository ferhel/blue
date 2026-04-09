import { useNavigate } from "react-router-dom";
import { font } from "../theme"; // Mantenemos tu fuente, pero sobreescribimos colores

export default function Inicio() {
  const navigate = useNavigate();

  // Paleta estilo iOS
  const iosTheme = {
    bg: "#F2F2F7",
    bgCard: "#FFFFFF",
    text: "#1C1C1E",
    textMuted: "#8E8E93",
    border: "#E5E5EA",
    blue: "#007AFF",
    blueSoft: "#E5F0FF",
    green: "#34C759",
    greenSoft: "#E8F8F0",
  };

  const tarjetas = [
    {
      emoji: "🧠",
      titulo: "Test Cognitivo",
      descripcion: "Descubre tu perfil de aprendizaje en 5 dimensiones y recibe una recomendación personalizada para mejorar tu rendimiento.",
      boton: "Comenzar test",
      ruta: "/test",
      color: iosTheme.blue,
      colorSoft: iosTheme.blueSoft,
      detalle: ["~15 minutos", "36 preguntas", "Resultado inmediato"],
    },
    {
      emoji: "📷",
      titulo: "Sala de Estudio",
      descripcion: "Activa el monitoreo de presencia mientras estudias. La cámara mide tu Índice de Presencia Visual en tiempo real.",
      boton: "Entrar a la sala",
      ruta: "/calibracion",
      color: iosTheme.green,
      colorSoft: iosTheme.greenSoft,
      detalle: ["Cámara local", "Sin grabación", "IPV en tiempo real"],
    },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: iosTheme.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", padding: "64px 20px",
      fontFamily: font || "system-ui, -apple-system, sans-serif",
    }}>

      {/* Hero & Logo */}
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <img 
          src="/assets/blue_logo.png" 
          alt="Blue Logo Burbuja" 
          style={{ 
            width: 86, height: 86, 
            margin: "0 auto 24px", 
            display: "block",
            objectFit: "contain",
            filter: "drop-shadow(0px 12px 24px rgba(0, 122, 255, 0.25))"
          }} 
        />
        <h1 style={{
          fontSize: 48, fontWeight: 800, margin: "0 0 12px",
          color: iosTheme.text, letterSpacing: "-1.5px",
        }}>Blue</h1>
        <p style={{ color: iosTheme.textMuted, fontSize: 17, margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
          Plataforma de apoyo académico cognitivo
        </p>
      </div>

      {/* Tarjetas Simétricas */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 24, width: "100%", maxWidth: 760, marginBottom: 60,
      }}>
        {tarjetas.map((card) => (
          <div key={card.ruta} style={{
            background: iosTheme.bgCard, border: `1px solid ${iosTheme.border}`,
            borderRadius: 24, padding: "32px 28px",
            display: "flex", flexDirection: "column", gap: 18,
            boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
            transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
            cursor: "default",
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.08)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.04)";
            }}
          >
            {/* Header Tarjeta */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: card.colorSoft,
                display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 28,
              }}>{card.emoji}</div>
              <h2 style={{ color: iosTheme.text, fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: "-0.5px" }}>
                {card.titulo}
              </h2>
            </div>

            <p style={{ color: iosTheme.textMuted, fontSize: 15, lineHeight: 1.6, margin: 0, flexGrow: 1 }}>
              {card.descripcion}
            </p>

            {/* Pills */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              {card.detalle.map(d => (
                <span key={d} style={{
                  fontSize: 12, fontWeight: 600,
                  padding: "6px 12px", borderRadius: 20,
                  background: card.colorSoft,
                  color: card.color, letterSpacing: 0.2,
                }}>{d}</span>
              ))}
            </div>

            {/* Botón Dopaminérgico */}
            <button onClick={() => navigate(card.ruta)} style={{
              width: "100%", padding: "14px 20px", borderRadius: 16,
              background: card.color, color: "#fff",
              fontWeight: 700, fontSize: 16, border: "none",
              cursor: "pointer", transition: "all 0.2s ease",
              boxShadow: `0 4px 14px ${card.color}40`,
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              onMouseDown={e => e.currentTarget.style.transform = "scale(0.96)"}
              onMouseUp={e => e.currentTarget.style.transform = "scale(1.02)"}
            >
              {card.boton}
            </button>
          </div>
        ))}
      </div>

      <p style={{
        color: iosTheme.textMuted, fontSize: 13,
        textAlign: "center", lineHeight: 1.6, maxWidth: 480, opacity: 0.8
      }}>
        Blue procesa los datos de cámara localmente. Las imágenes nunca se guardan ni se envían a servidores externos.
      </p>
    </div>
  );
}