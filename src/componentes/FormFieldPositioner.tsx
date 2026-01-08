import { useState, useRef, useEffect } from "react";
import { FormData, FieldPosition } from "@/pages/Index";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X, RotateCcw, Settings2 } from "lucide-react";
import templateImage from "@/assets/PiRetolsBase.jpg";
import { loadGlobalPositions, saveGlobalPositions, resetToDefaultPositions, DEFAULT_POSITIONS } from "@/lib/fieldPositions";
import { toast } from "sonner";

type FormFieldPositionerProps = {
  form: FormData;
  onSave: (positions: { [key: string]: FieldPosition }) => void;
  onCancel: () => void;
};

export const FormFieldPositioner = ({ form, onSave, onCancel }: FormFieldPositionerProps) => {
  // Cargar posiciones guardadas o usar DEFAULT_POSITIONS
  const [positions, setPositions] = useState<{ [key: string]: FieldPosition }>(
    () => loadGlobalPositions()
  );
  const [dragging, setDragging] = useState<string | null>(null);
  const [resizing, setResizing] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (field: string) => {
    setDragging(field);
    setSelectedField(field);
  };

  const handleColorChange = (field: string, color: string) => {
    setPositions(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        color: color,
      },
    }));
  };

  const handleFontSizeChange = (field: string, size: number) => {
    setPositions(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        fontSize: `${size}px`,
      },
    }));
  };

  const handleFontFamilyChange = (field: string, fontFamily: string) => {
    setPositions(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        fontFamily: fontFamily,
      },
    }));
  };

  const handleFontWeightChange = (field: string, fontWeight: string) => {
    setPositions(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        fontWeight: fontWeight,
      },
    }));
  };


  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPositions(prev => ({
      ...prev,
      [dragging]: {
        ...prev[dragging],
        top: `${Math.max(0, Math.min(100, y))}%`,
        left: `${Math.max(0, Math.min(100, x))}%`,
      },
    }));
  };

  const handleMouseUp = () => {
    setDragging(null);
    setResizing(null);
  };

  const handleResizeStart = (field: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setResizing(field);
  };

  const handleResize = (e: MouseEvent) => {
    if (!resizing || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const fieldLeft = parseFloat(positions[resizing]?.left || "0");
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const width = Math.max(10, Math.min(90, x - fieldLeft));

    setPositions(prev => ({
      ...prev,
      [resizing]: {
        ...prev[resizing],
        width: `${width}%`,
      },
    }));
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [dragging]);

  useEffect(() => {
    if (resizing) {
      window.addEventListener("mousemove", handleResize);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleResize);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [resizing]);

  const handleSave = () => {
    saveGlobalPositions(positions);
    onSave(positions);
    toast.success("Posiciones guardadas globalmente para todos los formularios");
  };

  const handleReset = () => {
    resetToDefaultPositions();
    setPositions(DEFAULT_POSITIONS);
    toast.info("Posiciones restauradas a valores por defecto");
  };

  return (
    <Card className="p-6 w-full h-screen overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Modo Ajuste - Posicionar Campos</h2>
          <p className="text-sm text-muted-foreground">Arrastra cada campo a su posición correcta. {showConfig && "Selecciona un campo para configurarlo."}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowConfig(!showConfig)}>
            <Settings2 className="w-4 h-4 mr-1" />
            {showConfig ? "Ocultar" : "Mostrar"} Config
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Restaurar
          </Button>
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="w-4 h-4 mr-1" />
            Cancelar
          </Button>
          <Button variant="default" size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" />
            Guardar cambios
          </Button>
        </div>
      </div>

      <div className={`grid gap-4 flex-1 overflow-hidden ${showConfig ? 'grid-cols-[1fr_320px]' : 'grid-cols-1'}`}>
        <div className="bg-white p-4 rounded-lg shadow-inner overflow-auto h-full">
          <div ref={containerRef} className="relative select-none min-h-full">
            <img
              src={templateImage}
              alt="Plantilla PiRetols"
              className="w-full pointer-events-none"
              draggable={false}
            />
          <div className="absolute top-0 left-0 w-full h-full font-mono">
            <div
              className={`absolute cursor-move transition-shadow hover:shadow-lg ${
                dragging === "formName" || selectedField === "formName" ? "shadow-xl ring-2 ring-primary" : ""
              }`}
              style={{
                top: positions.formName?.top || "10%",
                left: positions.formName?.left || "22%",
                fontSize: positions.formName?.fontSize || "20px",
                width: positions.formName?.width,
                fontWeight: positions.formName?.fontWeight || "600",
                fontFamily: positions.formName?.fontFamily || "monospace",
                color: positions.formName?.color || "#000000",
                backgroundColor: "rgba(59, 130, 246, 0.15)",
                padding: "1px 3px",
                borderRadius: "2px",
                border: "1.5px solid rgba(59, 130, 246, 0.6)",
                minHeight: "20px",
              }}
              onMouseDown={() => handleMouseDown("formName")}
            >
              {form.name || "[Nombre del formulario]"}
              <div
                className="absolute top-0 right-0 bottom-0 w-2 cursor-ew-resize bg-primary/50 hover:bg-primary"
                onMouseDown={(e) => handleResizeStart("formName", e)}
              />
            </div>
            {Object.entries(form.fields).map(([field, value]) => (
              <div
                key={field}
                className={`absolute cursor-move transition-shadow hover:shadow-lg ${
                  dragging === field || resizing === field || selectedField === field ? "shadow-xl ring-2 ring-primary" : ""
                }`}
                style={{
                  top: positions[field]?.top || "0%",
                  left: positions[field]?.left || "0%",
                  fontSize: positions[field]?.fontSize || "14px",
                  width: positions[field]?.width,
                  fontWeight: positions[field]?.fontWeight || "500",
                  fontFamily: positions[field]?.fontFamily || "monospace",
                  color: positions[field]?.color || "#000000",
                  backgroundColor: "rgba(59, 130, 246, 0.15)",
                  padding: "1px 3px",
                  borderRadius: "2px",
                  border: "1.5px solid rgba(59, 130, 246, 0.6)",
                  minHeight: "16px",
                  whiteSpace: field === "observaciones" ? "normal" : "nowrap",
                  lineHeight: field === "observaciones" ? "1.3" : "normal",
                }}
                onMouseDown={() => handleMouseDown(field)}
              >
                {value || `[${field}]`}
                {field === "observaciones" && (
                  <div
                    className="absolute top-0 right-0 bottom-0 w-2 cursor-ew-resize bg-primary/50 hover:bg-primary"
                    onMouseDown={(e) => handleResizeStart(field, e)}
                  />
                )}
              </div>
            ))}
          </div>
          </div>
        </div>

        {showConfig && (
        <div className="bg-muted/50 p-4 rounded-lg overflow-y-auto h-full">
          <h3 className="font-semibold text-foreground mb-3">Configuración de campos</h3>
          <div className="space-y-4">
            <div 
              className={`p-3 rounded-lg border transition-colors ${
                selectedField === "formName" ? "bg-primary/10 border-primary" : "bg-card border-border"
              }`}
              onClick={() => setSelectedField("formName")}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Nombre formulario</span>
                <input
                  type="color"
                  value={positions.formName?.color || "#000000"}
                  onChange={(e) => handleColorChange("formName", e.target.value)}
                  className="w-10 h-8 cursor-pointer rounded border border-border"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Tamaño fuente</span>
                    <span className="font-mono">{parseInt(positions.formName?.fontSize || "20")}px</span>
                  </div>
                  <Slider
                    value={[parseInt(positions.formName?.fontSize || "20")]}
                    onValueChange={(value) => handleFontSizeChange("formName", value[0])}
                    min={8}
                    max={100}
                    step={1}
                    className="cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              <div className="space-y-2">
                  <span className="text-xs text-muted-foreground">Tipo de fuente</span>
                  <Select
                    value={positions.formName?.fontFamily || "monospace"}
                    onValueChange={(value) => handleFontFamilyChange("formName", value)}
                  >
                    <SelectTrigger onClick={(e) => e.stopPropagation()}>
                      <SelectValue />
                    </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monospace">Monospace</SelectItem>
                        <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                        <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                        <SelectItem value="'Courier New', monospace">Courier New</SelectItem>
                        <SelectItem value="Georgia, serif">Georgia</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            {Object.entries(form.fields).map(([field]) => (
              <div 
                key={field} 
                className={`p-3 rounded-lg border transition-colors ${
                  selectedField === field ? "bg-primary/10 border-primary" : "bg-card border-border"
                }`}
                onClick={() => setSelectedField(field)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold capitalize">{field}</span>
                </div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Tamaño fuente</span>
                      <span className="font-mono">{parseInt(positions[field]?.fontSize || "14")}px</span>
                    </div>
                    <Slider
                      value={[parseInt(positions[field]?.fontSize || "14")]}
                      onValueChange={(value) => handleFontSizeChange(field, value[0])}
                      min={8}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground">Tipo de fuente</span>
                    <Select
                      value={positions[field]?.fontFamily || "monospace"}
                      onValueChange={(value) => handleFontFamilyChange(field, value)}
                    >
                      <SelectTrigger onClick={(e) => e.stopPropagation()}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monospace">Monospace</SelectItem>
                        <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                        <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                        <SelectItem value="'Courier New', monospace">Courier New</SelectItem>
                        <SelectItem value="Georgia, serif">Georgia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>

      <div className="mt-4 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Instrucciones:</strong> En caso de modificar el tamaño o tipo de letra de alguno de los campos, haz clic y arrastra para posicionarlo exactamente sobre su casilla en el formulario. Para los campos de observaciones y nombre del formulario, puedes ajustar sus anchos arrastrando la barra azul del borde derecho.
        </p>
      </div>
    </Card>
  );
};
