import { FieldPosition } from "@/pages/Index";

// Coordenadas basadas en la nueva plantilla PiRetolsBase.jpg
export const DEFAULT_POSITIONS: { [key: string]: FieldPosition } = {
  // Encabezado - nombre del formulario (no visible en esta plantilla, pero mantenemos para compatibilidad)
  formName: {
    top: "5%",
    left: "52%",
    fontSize: "28px",
    color: "#000000",
    fontFamily: "sans-serif",
    fontWeight: "600",
    width: "45%",
  },

  // Fecha - "Cornellà a ___del ___del 20___" (dentro del recuadro superior derecho)
  dia: {
    top: "9.9%",
    left: "60.2%",
    fontSize: "14px",
    color: "#000000",
    fontFamily: "sans-serif",
    fontWeight: "400",
    width: "4%",
  },
  mes: {
    top: "9.9%",
    left: "66.5%",
    fontSize: "14px",
    color: "#000000",
    fontFamily: "sans-serif",
    fontWeight: "400",
    width: "8%",
  },
  ano: {
    top: "9.6%",
    left: "75.2%",
    fontSize: "16px",
    color: "#000000",
    fontFamily: "sans-serif",
    fontWeight: "400",
    width: "6%",
  },

  // Fila de Nº PRESUPUESTO, Nº FACTURA, F/V
  presupuesto: {
    top: "21.2%",
    left: "26%",
    fontSize: "14px",
    color: "#000000",
    fontFamily: "sans-serif",
    fontWeight: "400",
    width: "12%",
  },
  factura: {
    top: "21.2%",
    left: "55%",
    fontSize: "14px",
    color: "#000000",
    fontFamily: "sans-serif",
    fontWeight: "400",
    width: "12%",
  },
  fv: {
    top: "21.2%",
    left: "76%",
    fontSize: "14px",
    color: "#000000",
    fontFamily: "sans-serif",
    fontWeight: "400",
    width: "12%",
  },

  // Columna izquierda - NOMBRE, DNI, C. POSTAL, TELÉFONO, E-MAIL
  nombre: {
    top: "25%",
    left: "19%",
    fontSize: "14px",
    color: "#000000",
    fontFamily: "sans-serif",
    fontWeight: "400",
    width: "23%",
  },
  dni: {
    top: "28%",
    left: "19%",
    fontSize: "14px",
    color: "#000000",
    fontFamily: "sans-serif",
    fontWeight: "400",
    width: "22%",
  },
  cpostal: {
    top: "31%",
    left: "19%",
    fontSize: "14px",
    color: "#000000",
    fontFamily: "sans-serif",
    fontWeight: "400",
    width: "22%",
  },
  telefono: {
    top: "34%",
    left: "19%",
    fontSize: "14px",
    color: "#000000",
    fontFamily: "sans-serif",
    fontWeight: "400",
    width: "22%",
  },
  email: {
    top: "36.8%",
    left: "58%",
    fontSize: "14px",
    color: "#000000",
    fontFamily: "sans-serif",
    fontWeight: "400",
    width: "34%",
  },

  // Columna derecha - CONTACTO, DIRECCIÓN, POBLACIÓN, MÓVIL, A CUENTA
  contacto: {
    top: "25%",
    left: "58%",
    fontSize: "14px",
    color: "#000000",
    fontFamily: "sans-serif",
    fontWeight: "400",
    width: "33%",
  },
  direccion: {
    top: "28%",
    left: "58%",
    fontSize: "14px",
    color: "#000000",
    fontFamily: "sans-serif",
    fontWeight: "400",
    width: "33%",
  },
  poblacion: {
    top: "31%",
    left: "58%",
    fontSize: "14px",
    color: "#000000",
    fontFamily: "sans-serif",
    fontWeight: "400",
    width: "22%",
  },
  movil: {
    top: "34%",
    left: "58%",
    fontSize: "14px",
    color: "#000000",
    fontFamily: "sans-serif",
    fontWeight: "400",
    width: "22%",
  },
  acuenta: {
    top: "36.8%",
    left: "19%",
    fontSize: "14px",
    color: "#000000",
    fontFamily: "sans-serif",
    fontWeight: "400",
    width: "22%",
  },

  // Observaciones - debajo de la etiqueta OBSERVACIONES: con recuadro grande
  observaciones: {
    top: "47%",
    left: "7.5%",
    fontSize: "13px",
    width: "82%",
    color: "#000000",
    fontFamily: "sans-serif",
    fontWeight: "400",
  },
};

const CLAVE_ALMACENAMIENTO = "piretols-field-positions";
const CLAVE_HASH_DEFECTOS = "piretols-defaults-hash";

// Genera un hash simple de los valores por defecto para detectar cambios en el código
const generarHashDefectos = (): string => {
  return JSON.stringify(DEFAULT_POSITIONS);
};

export const loadGlobalPositions = (): { [key: string]: FieldPosition } => {
  try {
    const guardado = localStorage.getItem(CLAVE_ALMACENAMIENTO);
    const hashGuardado = localStorage.getItem(CLAVE_HASH_DEFECTOS);
    const hashActual = generarHashDefectos();

    if (guardado && hashGuardado) {
      const parseado = JSON.parse(guardado);
      const defectosGuardados = JSON.parse(hashGuardado);

      // Comparar campo por campo: si el valor por defecto cambió en el código, usar el nuevo
      const resultado: { [key: string]: FieldPosition } = {};

      for (const clave of Object.keys(DEFAULT_POSITIONS)) {
        const defectoActual = JSON.stringify(DEFAULT_POSITIONS[clave]);
        const defectoAnterior = defectosGuardados[clave] ? JSON.stringify(defectosGuardados[clave]) : null;

        if (defectoActual !== defectoAnterior) {
          // El código cambió para este campo, usar el nuevo valor del código
          resultado[clave] = DEFAULT_POSITIONS[clave];
        } else if (parseado[clave]) {
          // El código no cambió, usar el valor guardado por el usuario
          resultado[clave] = parseado[clave];
        } else {
          resultado[clave] = DEFAULT_POSITIONS[clave];
        }
      }

      return resultado;
    }
  } catch (e) {
    console.error("Error al cargar posiciones:", e);
  }
  return { ...DEFAULT_POSITIONS };
};

export const saveGlobalPositions = (posiciones: { [key: string]: FieldPosition }): void => {
  try {
    localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(posiciones));
    // Guardar también los valores por defecto actuales para poder comparar después
    localStorage.setItem(CLAVE_HASH_DEFECTOS, JSON.stringify(DEFAULT_POSITIONS));
  } catch (e) {
    console.error("Error al guardar posiciones:", e);
  }
};

export const resetToDefaultPositions = (): void => {
  try {
    localStorage.removeItem(CLAVE_ALMACENAMIENTO);
  } catch (e) {
    console.error("Error al restaurar posiciones:", e);
  }
};
