import React from 'react';
import { t } from "../theme"; 

const RadarSimple = ({ data }) => {
  // Dimensiones del SVG
  const size = 300;
  const center = size / 2;
  const radius = 100; // Radio máximo (valor 100%)

  // 5 Puntos fijos para un Pentágono (en radianes)
  const angles = [
    (Math.PI * 2 * 0) / 5 - Math.PI / 2, // Arriba
    (Math.PI * 2 * 1) / 5 - Math.PI / 2,
    (Math.PI * 2 * 2) / 5 - Math.PI / 2,
    (Math.PI * 2 * 3) / 5 - Math.PI / 2,
    (Math.PI * 2 * 4) / 5 - Math.PI / 2,
  ];

  // Función para convertir valor (0-100) a coordenadas (x,y)
  const getPoint = (val, angle) => {
    const r = (val / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Calculamos los puntos de la "red" de resultados
  const points = data.map((d, i) => getPoint(d.valor, angles[i]));
  const pathData = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        
        {/* 1. Guías de fondo (Círculos concéntricos) */}
        {[20, 40, 60, 80, 100].map(r => (
          <circle 
            key={r} cx={center} cy={center} r={(r / 100) * radius} 
            fill="none" stroke={t.borderMid} strokeDasharray="4 4" opacity="0.5" 
          />
        ))}

        {/* 2. Ejes (Líneas desde el centro) */}
        {angles.map((angle, i) => {
          const p = getPoint(100, angle);
          return (
            <line 
              key={i} x1={center} y1={center} x2={p.x} y2={p.y} 
              stroke={t.borderMid} opacity="0.3" 
            />
          );
        })}

        {/* 3. El Polígono de Resultados (La magia) */}
        <polygon 
          points={pathData} 
          fill={t.blue} 
          fillOpacity="0.3" 
          stroke={t.blue} 
          strokeWidth="3" 
          strokeLinejoin="round"
        />

        {/* 4. Etiquetas de texto */}
        {data.map((d, i) => {
          const p = getPoint(120, angles[i]); // Un poco más afuera
          return (
            <text 
              key={i} x={p.x} y={p.y} textAnchor="middle" 
              style={{ fontSize: 10, fontWeight: 700, fill: t.textLight, textTransform: 'uppercase' }}
            >
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default RadarSimple;