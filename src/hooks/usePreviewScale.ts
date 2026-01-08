import { useEffect, useRef, useState, useCallback } from "react";

// Ancho de referencia en píxeles que corresponde a la salida PDF
// Este es el ancho en el que los valores de fontSize son "correctos"
const ANCHO_REFERENCIA = 595; // Ancho A4 en puntos (aproximadamente)

export const usePreviewScale = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(1);

  const actualizarEscala = useCallback(() => {
    if (containerRef.current) {
      const anchoContenedor = containerRef.current.offsetWidth;
      const nuevaEscala = anchoContenedor / ANCHO_REFERENCIA;
      setEscala(nuevaEscala);
    }
  }, []);

  useEffect(() => {
    actualizarEscala();

    const observadorRedimensionado = new ResizeObserver(() => {
      actualizarEscala();
    });

    if (containerRef.current) {
      observadorRedimensionado.observe(containerRef.current);
    }

    return () => {
      observadorRedimensionado.disconnect();
    };
  }, [actualizarEscala]);

  return { containerRef, scale: escala };
};
