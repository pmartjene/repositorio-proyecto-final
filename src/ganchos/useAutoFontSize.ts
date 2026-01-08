import { useEffect, useRef, useState } from "react";

export const useAutoFontSize = (
  texto: string,
  tamanoFuenteBase: string,
  habilitado: boolean = true
) => {
  const ref = useRef<HTMLDivElement>(null);
  const [tamanoFuente, setTamanoFuente] = useState(tamanoFuenteBase);

  useEffect(() => {
    if (!habilitado || !ref.current || !texto) {
      setTamanoFuente(tamanoFuenteBase);
      return;
    }

    const elemento = ref.current;
    const tamanoBaseNum = parseFloat(tamanoFuenteBase);
    
    // Restablecer al tamaño base primero
    elemento.style.fontSize = tamanoFuenteBase;
    
    // Esperar al siguiente frame para asegurar que el ancho está calculado
    requestAnimationFrame(() => {
      if (!ref.current) return;
      
      const anchoCliente = elemento.clientWidth;
      
      // Solo comprobar desbordamiento si el elemento tiene un ancho significativo (más de 10px)
      if (anchoCliente < 10) {
        setTamanoFuente(tamanoFuenteBase);
        return;
      }
      
      // Comprobar si el texto desborda
      const estaDesbordando = elemento.scrollWidth > anchoCliente + 1; // +1 para tolerancia de redondeo
      
      if (estaDesbordando) {
        // Calcular el factor de escala necesario
        const escala = anchoCliente / elemento.scrollWidth;
        const nuevoTamano = Math.max(tamanoBaseNum * escala * 0.95, tamanoBaseNum * 0.5); // Mínimo 50% del original
        setTamanoFuente(`${nuevoTamano}px`);
      } else {
        setTamanoFuente(tamanoFuenteBase);
      }
    });
  }, [texto, tamanoFuenteBase, habilitado]);

  return { ref, fontSize: tamanoFuente };
};
