import { useState, useEffect } from "react";
import { FormData } from "@/pages/Index";

const CLAVE_ALMACENAMIENTO = "piretols-forms";
const CLAVE_SIGUIENTE_NUMERO = "piretols-next-number";

export const useFormsStorage = () => {
  const [formularios, setFormularios] = useState<FormData[]>([]);
  const [siguienteNumero, setSiguienteNumero] = useState(1);
  const [estaCargado, setEstaCargado] = useState(false);

  // Cargar formularios del localStorage al montar el componente
  useEffect(() => {
    try {
      const formulariosGuardados = localStorage.getItem(CLAVE_ALMACENAMIENTO);
      const numeroGuardado = localStorage.getItem(CLAVE_SIGUIENTE_NUMERO);

      if (formulariosGuardados) {
        const formulariosParseados = JSON.parse(formulariosGuardados);
        // Convertir cadenas de fecha a objetos Date
        const formulariosConFechas = formulariosParseados.map((formulario: FormData) => ({
          ...formulario,
          createdAt: new Date(formulario.createdAt),
        }));
        setFormularios(formulariosConFechas);
      }

      if (numeroGuardado) {
        setSiguienteNumero(parseInt(numeroGuardado, 10));
      }
    } catch (error) {
      console.error("Error al cargar formularios desde localStorage:", error);
    } finally {
      setEstaCargado(true);
    }
  }, []);

  // Guardar formularios en localStorage cuando cambien
  useEffect(() => {
    if (estaCargado) {
      try {
        localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(formularios));
      } catch (error) {
        console.error("Error al guardar formularios en localStorage:", error);
      }
    }
  }, [formularios, estaCargado]);

  // Guardar siguienteNumero en localStorage cuando cambie
  useEffect(() => {
    if (estaCargado) {
      try {
        localStorage.setItem(CLAVE_SIGUIENTE_NUMERO, siguienteNumero.toString());
      } catch (error) {
        console.error("Error al guardar siguiente número en localStorage:", error);
      }
    }
  }, [siguienteNumero, estaCargado]);

  const agregarOActualizarFormulario = (formulario: FormData) => {
    setFormularios((formulariosAnteriores) => {
      const indiceExistente = formulariosAnteriores.findIndex((f) => f.id === formulario.id);
      if (indiceExistente >= 0) {
        const actualizados = [...formulariosAnteriores];
        actualizados[indiceExistente] = formulario;
        return actualizados;
      }
      return [...formulariosAnteriores, formulario];
    });
  };

  const eliminarFormulario = (id: string) => {
    setFormularios((formulariosAnteriores) => formulariosAnteriores.filter((f) => f.id !== id));
  };

  const alternarFavorito = (id: string) => {
    setFormularios((formulariosAnteriores) =>
      formulariosAnteriores.map((f) =>
        f.id === id ? { ...f, isFavorite: !f.isFavorite } : f
      )
    );
  };

  const incrementarSiguienteNumero = () => {
    setSiguienteNumero((anterior) => anterior + 1);
  };

  return {
    forms: formularios,
    nextNumber: siguienteNumero,
    isLoaded: estaCargado,
    addOrUpdateForm: agregarOActualizarFormulario,
    deleteForm: eliminarFormulario,
    toggleFavorite: alternarFavorito,
    incrementNextNumber: incrementarSiguienteNumero,
  };
};
