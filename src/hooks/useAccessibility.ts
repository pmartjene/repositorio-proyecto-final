import { useState, useEffect, useCallback } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type ContrastMode = "normal" | "high" | "system";
export type ColorBlindMode = "none" | "deuteranopia" | "protanopia" | "tritanopia";

interface AccessibilitySettings {
  theme: ThemeMode;
  contrast: ContrastMode;
  reducedMotion: boolean;
  colorBlindMode: ColorBlindMode;
}

const CLAVE_ALMACENAMIENTO = "accessibility-settings";

const obtenerAjustesPorDefecto = (): AccessibilitySettings => ({
  theme: "system",
  contrast: "system",
  reducedMotion: false,
  colorBlindMode: "none",
});

export const useAccessibility = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    if (typeof window === "undefined") return obtenerAjustesPorDefecto();
    const guardado = localStorage.getItem(CLAVE_ALMACENAMIENTO);
    return guardado ? JSON.parse(guardado) : obtenerAjustesPorDefecto();
  });

  const [sistemaPrefiereOscuro, setSistemaPrefiereOscuro] = useState(false);
  const [sistemaPrefiereAltoContraste, setSistemaPrefiereAltoContraste] = useState(false);
  const [sistemaPrefiereMovimientoReducido, setSistemaPrefiereMovimientoReducido] = useState(false);

  // Detectar preferencias del sistema
  useEffect(() => {
    const consultaOscuro = window.matchMedia("(prefers-color-scheme: dark)");
    const consultaContraste = window.matchMedia("(prefers-contrast: more)");
    const consultaMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)");

    setSistemaPrefiereOscuro(consultaOscuro.matches);
    setSistemaPrefiereAltoContraste(consultaContraste.matches);
    setSistemaPrefiereMovimientoReducido(consultaMovimiento.matches);

    const manejarCambioOscuro = (e: MediaQueryListEvent) => setSistemaPrefiereOscuro(e.matches);
    const manejarCambioContraste = (e: MediaQueryListEvent) => setSistemaPrefiereAltoContraste(e.matches);
    const manejarCambioMovimiento = (e: MediaQueryListEvent) => setSistemaPrefiereMovimientoReducido(e.matches);

    consultaOscuro.addEventListener("change", manejarCambioOscuro);
    consultaContraste.addEventListener("change", manejarCambioContraste);
    consultaMovimiento.addEventListener("change", manejarCambioMovimiento);

    return () => {
      consultaOscuro.removeEventListener("change", manejarCambioOscuro);
      consultaContraste.removeEventListener("change", manejarCambioContraste);
      consultaMovimiento.removeEventListener("change", manejarCambioMovimiento);
    };
  }, []);

  // Aplicar clases al documento
  useEffect(() => {
    const raiz = document.documentElement;

    // Determinar tema oscuro
    const esOscuro =
      settings.theme === "dark" ||
      (settings.theme === "system" && sistemaPrefiereOscuro);

    // Determinar alto contraste
    const esAltoContraste =
      settings.contrast === "high" ||
      (settings.contrast === "system" && sistemaPrefiereAltoContraste);

    // Aplicar clases de tema y contraste
    raiz.classList.toggle("dark", esOscuro);
    raiz.classList.toggle("high-contrast", esAltoContraste);

    // Limpiar clases de daltonismo
    raiz.classList.remove("deuteranopia", "protanopia", "tritanopia");
    if (settings.colorBlindMode !== "none") {
      raiz.classList.add(settings.colorBlindMode);
    }

    // Guardar en localStorage
    localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(settings));
  }, [settings, sistemaPrefiereOscuro, sistemaPrefiereAltoContraste]);

  const actualizarAjustes = useCallback((nuevosAjustes: Partial<AccessibilitySettings>) => {
    setSettings((anterior) => ({ ...anterior, ...nuevosAjustes }));
  }, []);

  const restaurarAjustes = useCallback(() => {
    setSettings(obtenerAjustesPorDefecto());
  }, []);

  return {
    settings,
    updateSettings: actualizarAjustes,
    resetSettings: restaurarAjustes,
    systemPrefersDark: sistemaPrefiereOscuro,
    systemPrefersHighContrast: sistemaPrefiereAltoContraste,
    systemPrefersReducedMotion: sistemaPrefiereMovimientoReducido,
    // Valores calculados
    isDark:
      settings.theme === "dark" ||
      (settings.theme === "system" && sistemaPrefiereOscuro),
    isHighContrast:
      settings.contrast === "high" ||
      (settings.contrast === "system" && sistemaPrefiereAltoContraste),
  };
};
