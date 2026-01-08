import { Settings, Sun, Moon, Monitor, Eye, RotateCcw, Glasses } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useAccessibility, ThemeMode, ContrastMode, ColorBlindMode } from "@/hooks/useAccessibility";

const colorBlindOptions: { value: ColorBlindMode; label: string; description: string }[] = [
  { value: "none", label: "Normal", description: "Sin filtro" },
  { value: "deuteranopia", label: "Deuteranopia", description: "Verde" },
  { value: "protanopia", label: "Protanopia", description: "Rojo" },
  { value: "tritanopia", label: "Tritanopia", description: "Azul" },
];

export const AccessibilitySettings = () => {
  const {
    settings,
    updateSettings,
    resetSettings,
    systemPrefersDark,
    systemPrefersHighContrast,
  } = useAccessibility();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label="Ajustes de accesibilidad"
          className="gap-2"
        >
          <Settings className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Accesibilidad</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80" 
        align="end"
        role="dialog"
        aria-label="Configuración de accesibilidad"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground" id="accessibility-title">
              Ajustes de Accesibilidad
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetSettings}
              aria-label="Restaurar configuración predeterminada"
              className="h-8 px-2"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>

          <Separator />

          {/* Tema de color */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Sun className="w-4 h-4" aria-hidden="true" />
              Tema de color
            </Label>
            <RadioGroup
              value={settings.theme}
              onValueChange={(value: ThemeMode) => updateSettings({ theme: value })}
              className="grid grid-cols-3 gap-2"
              aria-label="Seleccionar tema de color"
            >
              <div>
                <RadioGroupItem
                  value="light"
                  id="theme-light"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="theme-light"
                  className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                >
                  <Sun className="w-5 h-5 mb-1" aria-hidden="true" />
                  <span className="text-xs">Claro</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="dark"
                  id="theme-dark"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="theme-dark"
                  className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                >
                  <Moon className="w-5 h-5 mb-1" aria-hidden="true" />
                  <span className="text-xs">Oscuro</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="system"
                  id="theme-system"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="theme-system"
                  className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                >
                  <Monitor className="w-5 h-5 mb-1" aria-hidden="true" />
                  <span className="text-xs">Auto</span>
                </Label>
              </div>
            </RadioGroup>
            {settings.theme === "system" && (
              <p className="text-xs text-muted-foreground">
                Actualmente: {systemPrefersDark ? "Oscuro" : "Claro"} (según el sistema)
              </p>
            )}
          </div>

          <Separator />

          {/* Contraste */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Eye className="w-4 h-4" aria-hidden="true" />
              Contraste
            </Label>
            <RadioGroup
              value={settings.contrast}
              onValueChange={(value: ContrastMode) => updateSettings({ contrast: value })}
              className="grid grid-cols-3 gap-2"
              aria-label="Seleccionar nivel de contraste"
            >
              <div>
                <RadioGroupItem
                  value="normal"
                  id="contrast-normal"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="contrast-normal"
                  className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                >
                  <span className="text-lg font-normal mb-1" aria-hidden="true">Aa</span>
                  <span className="text-xs">Normal</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="high"
                  id="contrast-high"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="contrast-high"
                  className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                >
                  <span className="text-lg font-bold mb-1" aria-hidden="true">Aa</span>
                  <span className="text-xs">Alto</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="system"
                  id="contrast-system"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="contrast-system"
                  className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                >
                  <Monitor className="w-5 h-5 mb-1" aria-hidden="true" />
                  <span className="text-xs">Auto</span>
                </Label>
              </div>
            </RadioGroup>
            {settings.contrast === "system" && (
              <p className="text-xs text-muted-foreground">
                {systemPrefersHighContrast 
                  ? "Alto contraste activado (según el sistema)" 
                  : "Contraste normal (según el sistema)"}
              </p>
            )}
          </div>

          <Separator />

          {/* Daltonismo */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Glasses className="w-4 h-4" aria-hidden="true" />
              Daltonismo
            </Label>
            <RadioGroup
              value={settings.colorBlindMode}
              onValueChange={(value: ColorBlindMode) => updateSettings({ colorBlindMode: value })}
              className="grid grid-cols-2 gap-2"
              aria-label="Seleccionar filtro de daltonismo"
            >
              {colorBlindOptions.map((option) => (
                <div key={option.value}>
                  <RadioGroupItem
                    value={option.value}
                    id={`colorblind-${option.value}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`colorblind-${option.value}`}
                    className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                  >
                    <span className="text-xs font-medium">{option.label}</span>
                    <span className="text-[10px] text-muted-foreground">{option.description}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          <p className="text-xs text-muted-foreground text-center">
            Los ajustes se guardan automáticamente
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};
