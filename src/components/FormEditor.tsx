import { useState, useRef } from "react";
import { FormData, FieldPosition } from "@/pages/Index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Save, X, Download, Settings2, Maximize2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import templateImage from "@/assets/PiRetolsBase.jpg";
import { FormFieldPositioner } from "./FormFieldPositioner";
import { DEFAULT_POSITIONS, loadGlobalPositions } from "@/lib/fieldPositions";
import { AutoSizeField } from "./AutoSizeField";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type FormEditorProps = {
  form: FormData;
  onSave: (data: FormData) => void;
  onCancel: () => void;
};

export const FormEditor = ({ form, onSave, onCancel }: FormEditorProps) => {
  const [formData, setFormData] = useState(form);
  const [showPositioner, setShowPositioner] = useState(false);
  const [showFullscreenPreview, setShowFullscreenPreview] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [showEmptyFieldsDialog, setShowEmptyFieldsDialog] = useState(false);
  const [emptyFields, setEmptyFields] = useState<string[]>([]);
  const [pendingAction, setPendingAction] = useState<"save" | "export" | null>(null);
  const [savedPositions, setSavedPositions] = useState<{ [key: string]: FieldPosition }>(() => loadGlobalPositions());
  const containerRef = useRef<HTMLDivElement>(null);

  const MAX_OBSERVACIONES_LENGTH = 1364;

  const FORM_NAME_MAX_LENGTH = 22;

  const FIELD_MAX_LENGTHS: { [key: string]: number } = {
    presupuesto: 6,
    factura: 6,
    fv: 11,
    dni: 12,
    cpostal: 8,
    telefono: 15,
    movil: 15,
    contacto: 35,
    acuenta: 22,
    poblacion: 22,
    direccion: 35,
    nombre: 32,
    email: 42,
    observaciones: MAX_OBSERVACIONES_LENGTH,
  };

  const handleFieldChange = (field: string, value: string) => {
    const maxLength = FIELD_MAX_LENGTHS[field];
    if (maxLength && value.length >= maxLength) {
      toast.warning("Número máximo de caracteres alcanzado");
      if (value.length > maxLength) return;
    }
    setFormData({
      ...formData,
      fields: {
        ...formData.fields,
        [field]: value,
      },
    });
  };

  const handleNameChange = (value: string) => {
    const upperValue = value.toUpperCase();
    if (upperValue.length >= FORM_NAME_MAX_LENGTH) {
      toast.warning("Número máximo de caracteres alcanzado");
      if (upperValue.length > FORM_NAME_MAX_LENGTH) return;
    }
    setFormData({
      ...formData,
      name: upperValue,
    });
  };

  const FIELD_LABELS: { [key: string]: string } = {
    presupuesto: "Nº Presupuesto",
    factura: "Nº Factura",
    fv: "F/V",
    dia: "Día",
    mes: "Mes",
    ano: "Año",
    nombre: "Nombre",
    dni: "DNI",
    direccion: "Dirección",
    cpostal: "C. Postal",
    poblacion: "Población",
    telefono: "Teléfono",
    movil: "Móvil",
    email: "E-mail",
    contacto: "Contacto",
    acuenta: "A cuenta",
    observaciones: "Observaciones",
  };

  const getEmptyFields = (): string[] => {
    const fieldsToCheck = Object.keys(FIELD_LABELS);
    return fieldsToCheck.filter((field) => !formData.fields[field]?.trim());
  };

  const checkEmptyFieldsAndProceed = (action: "save" | "export") => {
    if (!formData.name.trim()) {
      toast.error("Por favor, introduce un nombre para el formulario");
      return;
    }

    const empty = getEmptyFields();
    if (empty.length > 0) {
      setEmptyFields(empty);
      setPendingAction(action);
      setShowEmptyFieldsDialog(true);
    } else {
      if (action === "save") {
        executeSave();
      } else {
        executeExport();
      }
    }
  };

  const executeSave = () => {
    onSave(formData);
    toast.success("Formulario guardado correctamente");
  };

  const executeExport = () => {
    handleExportPDF();
  };

  const handleConfirmWithEmptyFields = () => {
    setShowEmptyFieldsDialog(false);
    if (pendingAction === "save") {
      executeSave();
    } else if (pendingAction === "export") {
      executeExport();
    }
    setPendingAction(null);
    setEmptyFields([]);
  };

  const handleSave = () => {
    checkEmptyFieldsAndProceed("save");
  };

  const handleExport = () => {
    checkEmptyFieldsAndProceed("export");
  };

  const handleSavePositions = (positions: { [key: string]: FieldPosition }) => {
    setFormData({
      ...formData,
      positions,
    });
    setSavedPositions(positions);
    setShowPositioner(false);
    toast.success("Posiciones guardadas correctamente");
  };

  const generatePDF = async (download: boolean = true) => {
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // A4 dimensions in mm
      const pageWidth = 210;
      const pageHeight = 297;

      // Load and add template image
      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = templateImage;
      });

      // Calculate image dimensions maintaining aspect ratio
      const imgAspect = img.width / img.height;
      const pageAspect = pageWidth / pageHeight;

      let imgWidth = pageWidth;
      let imgHeight = pageWidth / imgAspect;

      if (imgHeight > pageHeight) {
        imgHeight = pageHeight;
        imgWidth = pageHeight * imgAspect;
      }

      pdf.addImage(img, "JPEG", 0, 0, imgWidth, imgHeight);

      // Helper to convert percentage to mm
      const percentToMm = (percent: string, total: number): number => {
        return (parseFloat(percent) / 100) * total;
      };

      // Helper to convert px font size to pt (approximate)
      const pxToPt = (px: string): number => {
        const pxNum = parseFloat(px);
        return pxNum * 0.75; // 1px ≈ 0.75pt
      };

      // Add text fields with precise positioning
      const addTextField = (
        text: string,
        position: FieldPosition | undefined,
        defaultTop: string,
        defaultLeft: string,
        defaultFontSize: string,
      ) => {
        if (!text) return;

        const top = position?.top || defaultTop;
        const left = position?.left || defaultLeft;
        const fontSize = position?.fontSize || defaultFontSize;
        const color = position?.color || "#000000";
        const fontWeight = position?.fontWeight || "500";

        const x = percentToMm(left, imgWidth);
        const y = percentToMm(top, imgHeight);
        const ptSize = pxToPt(fontSize);

        // Set font style
        pdf.setFontSize(ptSize);

        // Parse hex color to RGB
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        pdf.setTextColor(r, g, b);

        // Map fontFamily to jsPDF font names
        const fontFamily = position?.fontFamily || "sans-serif";
        let pdfFontName = "helvetica";
        if (fontFamily.includes("mono") || fontFamily === "monospace") {
          pdfFontName = "courier";
        } else if (fontFamily.includes("serif") && !fontFamily.includes("sans")) {
          pdfFontName = "times";
        }

        // Set font weight (bold or normal)
        if (fontWeight === "700" || fontWeight === "bold" || fontWeight === "600") {
          pdf.setFont(pdfFontName, "bold");
        } else {
          pdf.setFont(pdfFontName, "normal");
        }

        const textY = y + ptSize * 0.35;

        // Handle multiline text for observaciones
        if (position?.width) {
          const maxWidth = percentToMm(position.width, imgWidth);
          const lines = pdf.splitTextToSize(text, maxWidth);
          pdf.text(lines, x, textY);
        } else {
          pdf.text(text, x, textY);
        }
      };

      // Usar posiciones guardadas o DEFAULT_POSITIONS
      const pdfPositions = savedPositions;

      // Add form name - usar DEFAULT_POSITIONS como fallback
      const formNamePosition = pdfPositions.formName;
      const formNameText = formData.name;

      if (formNameText) {
        const top = formNamePosition?.top || DEFAULT_POSITIONS.formName.top;
        const left = formNamePosition?.left || DEFAULT_POSITIONS.formName.left;
        const fontSize = formNamePosition?.fontSize || DEFAULT_POSITIONS.formName.fontSize;
        const color = formNamePosition?.color || "#000000";
        const fontWeight = formNamePosition?.fontWeight || "500";

        const x = percentToMm(left, imgWidth);
        const y = percentToMm(top, imgHeight);
        const ptSize = pxToPt(fontSize);

        pdf.setFontSize(ptSize);

        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        pdf.setTextColor(r, g, b);

        const fontFamily = formNamePosition?.fontFamily || "sans-serif";
        let pdfFontName = "helvetica";
        if (fontFamily.includes("mono") || fontFamily === "monospace") {
          pdfFontName = "courier";
        } else if (fontFamily.includes("serif") && !fontFamily.includes("sans")) {
          pdfFontName = "times";
        }

        if (fontWeight === "700" || fontWeight === "bold" || fontWeight === "600") {
          pdf.setFont(pdfFontName, "bold");
        } else {
          pdf.setFont(pdfFontName, "normal");
        }

        const textY = y + ptSize * 0.35;
        pdf.text(formNameText, x, textY);
      }

      // Helper para formatear día, mes, año con cero delante
      const formatDateField = (fieldName: string, val: string): string => {
        if ((fieldName === "dia" || fieldName === "mes" || fieldName === "ano") && val) {
          const num = parseInt(val, 10);
          if (!isNaN(num) && num >= 1 && num <= 9) {
            return `0${num}`;
          }
        }
        return val;
      };

      // Usar DEFAULT_POSITIONS como fallback para todos los campos
      Object.entries(formData.fields).forEach(([field, value]) => {
        const defaults = DEFAULT_POSITIONS[field];
        if (defaults && value) {
          const formattedValue = formatDateField(field, value);
          addTextField(formattedValue, pdfPositions[field], defaults.top, defaults.left, defaults.fontSize);
        }
      });

      if (download) {
        pdf.save(`${formData.name || "formulario"}-${formData.number}.pdf`);
        toast.success("Formulario exportado correctamente en PDF");
      } else {
        // Generate blob URL for preview
        const pdfBlob = pdf.output("blob");
        const url = URL.createObjectURL(pdfBlob);
        return url;
      }
    } catch (error) {
      toast.error("Error al generar el PDF");
      console.error(error);
    }
    return null;
  };

  const handleExportPDF = async () => {
    await generatePDF(true);
  };

  const handleOpenFullscreenPreview = async () => {
    setShowFullscreenPreview(true);
    setIsLoadingPdf(true);

    // Clean up previous URL
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
    }

    const url = await generatePDF(false);
    if (url) {
      setPdfPreviewUrl(url);
    }
    setIsLoadingPdf(false);
  };

  if (showPositioner) {
    // Asegurar que todos los campos existan (sin formName, que se renderiza por separado)
    const formWithAllFields = {
      ...formData,
      fields: {
        presupuesto: formData.fields.presupuesto || "",
        factura: formData.fields.factura || "",
        fv: formData.fields.fv || "",
        dia: formData.fields.dia || "",
        mes: formData.fields.mes || "",
        ano: formData.fields.ano || "",
        nombre: formData.fields.nombre || "",
        dni: formData.fields.dni || "",
        direccion: formData.fields.direccion || "",
        cpostal: formData.fields.cpostal || "",
        poblacion: formData.fields.poblacion || "",
        telefono: formData.fields.telefono || "",
        movil: formData.fields.movil || "",
        email: formData.fields.email || "",
        contacto: formData.fields.contacto || "",
        acuenta: formData.fields.acuenta || "",
        observaciones: formData.fields.observaciones || "",
      },
    };

    return (
      <FormFieldPositioner
        form={formWithAllFields}
        onSave={handleSavePositions}
        onCancel={() => setShowPositioner(false)}
      />
    );
  }

  return (
    <>
      <AlertDialog open={showEmptyFieldsDialog} onOpenChange={setShowEmptyFieldsDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Campos vacíos detectados</AlertDialogTitle>
            <AlertDialogDescription>
              Los siguientes campos están vacíos:
              <ul className="list-disc list-inside mt-2 text-sm">
                {emptyFields.map((field) => (
                  <li key={field}>{FIELD_LABELS[field] || field}</li>
                ))}
              </ul>
              <p className="mt-2">¿Deseas continuar de todos modos?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setPendingAction(null);
                setEmptyFields([]);
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmWithEmptyFields}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 flex flex-col" role="form" aria-labelledby="editor-heading">
          <div className="flex items-center justify-between mb-6">
            <h2 id="editor-heading" className="text-xl font-bold text-foreground">
              Editor - Formulario #{formData.number}
            </h2>
            <div className="flex gap-2 flex-wrap" role="toolbar" aria-label="Acciones del formulario">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPositioner(true)}
                aria-label="Ajustar posición de campos"
              >
                <Settings2 className="w-4 h-4 mr-1" aria-hidden="true" />
                Ajustar
              </Button>
              <Button variant="outline" size="sm" onClick={onCancel} aria-label="Cancelar edición y volver">
                <X className="w-4 h-4 mr-1" aria-hidden="true" />
                Cancelar
              </Button>
              <Button variant="default" size="sm" onClick={handleSave} aria-label="Guardar formulario">
                <Save className="w-4 h-4 mr-1" aria-hidden="true" />
                Guardar
              </Button>
              <Button variant="secondary" size="sm" onClick={handleExport} aria-label="Exportar formulario a PDF">
                <Download className="w-4 h-4 mr-1" aria-hidden="true" />
                Exportar
              </Button>
            </div>
          </div>

          <div className="space-y-3 flex flex-col h-full" role="group" aria-label="Campos del formulario">
            <div>
              <Label htmlFor="form-name" className="text-xs">
                Nombre del formulario <span aria-hidden="true">*</span>
                <span className="sr-only">(obligatorio)</span>
              </Label>
              <Input
                id="form-name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ej: Cliente ABC"
                className="h-8"
                aria-required="true"
                aria-describedby="form-name-hint"
              />
              <span id="form-name-hint" className="sr-only">
                Introduce un nombre identificativo para el formulario
              </span>
            </div>

            <div className="grid grid-cols-6 gap-2">
              <div>
                <Label htmlFor="presupuesto" className="text-xs">
                  Nº Presup.
                </Label>
                <Input
                  id="presupuesto"
                  value={formData.fields.presupuesto}
                  onChange={(e) => handleFieldChange("presupuesto", e.target.value)}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="factura" className="text-xs">
                  Nº Factura
                </Label>
                <Input
                  id="factura"
                  value={formData.fields.factura}
                  onChange={(e) => handleFieldChange("factura", e.target.value)}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="fv" className="text-xs">
                  F/V
                </Label>
                <Input
                  id="fv"
                  value={formData.fields.fv || "  /  /20  "}
                  onKeyDown={(e) => {
                    const input = e.currentTarget;
                    const pos = input.selectionStart || 0;
                    const chars = (formData.fields.fv || "  /  /20  ").split("");
                    const editablePositions = [0, 1, 3, 4, 8, 9];
                    if (e.key === "Backspace") {
                      e.preventDefault();
                      let targetPos = -1;
                      for (let i = editablePositions.length - 1; i >= 0; i--) {
                        if (editablePositions[i] < pos && chars[editablePositions[i]] !== " ") {
                          targetPos = editablePositions[i];
                          break;
                        }
                      }
                      if (targetPos === -1) {
                        for (let i = editablePositions.length - 1; i >= 0; i--) {
                          if (chars[editablePositions[i]] !== " ") {
                            targetPos = editablePositions[i];
                            break;
                          }
                        }
                      }
                      if (targetPos >= 0) {
                        chars[targetPos] = " ";
                        handleFieldChange("fv", chars.join(""));
                      }
                    } else if (/^\d$/.test(e.key)) {
                      e.preventDefault();
                      let targetPos = -1;
                      for (const ep of editablePositions) {
                        if (ep >= pos && chars[ep] === " ") {
                          targetPos = ep;
                          break;
                        }
                      }
                      if (targetPos === -1) {
                        for (const ep of editablePositions) {
                          if (chars[ep] === " ") {
                            targetPos = ep;
                            break;
                          }
                        }
                      }
                      if (targetPos >= 0) {
                        chars[targetPos] = e.key;
                        handleFieldChange("fv", chars.join(""));
                        setTimeout(() => {
                          const nextPos = targetPos + 1;
                          input.setSelectionRange(nextPos, nextPos);
                        }, 0);
                      }
                    } else if (e.key !== "Tab" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
                      e.preventDefault();
                    }
                  }}
                  onChange={() => {}}
                  placeholder="  /  /20  "
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="dia" className="text-xs">
                  Día
                </Label>
                <Input
                  id="dia"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="DD"
                  value={formData.fields.dia}
                  onChange={(e) => handleFieldChange("dia", e.target.value)}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="mes" className="text-xs">
                  Mes
                </Label>
                <Input
                  id="mes"
                  type="number"
                  min="1"
                  max="12"
                  placeholder="MM"
                  value={formData.fields.mes}
                  onChange={(e) => handleFieldChange("mes", e.target.value)}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="ano" className="text-xs">
                  Año
                </Label>
                <Input
                  id="ano"
                  type="number"
                  min="1"
                  max="99"
                  placeholder="AA"
                  value={formData.fields.ano}
                  onChange={(e) => handleFieldChange("ano", e.target.value)}
                  className="h-8"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="nombre" className="text-xs">
                  Nombre
                </Label>
                <Input
                  id="nombre"
                  value={formData.fields.nombre}
                  onChange={(e) => handleFieldChange("nombre", e.target.value)}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="dni" className="text-xs">
                  DNI
                </Label>
                <Input
                  id="dni"
                  value={formData.fields.dni}
                  onChange={(e) => handleFieldChange("dni", e.target.value)}
                  className="h-8"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Label htmlFor="direccion" className="text-xs">
                  Dirección
                </Label>
                <Input
                  id="direccion"
                  value={formData.fields.direccion}
                  onChange={(e) => handleFieldChange("direccion", e.target.value)}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="cpostal" className="text-xs">
                  C. Postal
                </Label>
                <Input
                  id="cpostal"
                  value={formData.fields.cpostal}
                  onChange={(e) => handleFieldChange("cpostal", e.target.value)}
                  className="h-8"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="poblacion" className="text-xs">
                  Población
                </Label>
                <Input
                  id="poblacion"
                  value={formData.fields.poblacion}
                  onChange={(e) => handleFieldChange("poblacion", e.target.value)}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="telefono" className="text-xs">
                  Teléfono
                </Label>
                <Input
                  id="telefono"
                  value={formData.fields.telefono}
                  onChange={(e) => handleFieldChange("telefono", e.target.value)}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="movil" className="text-xs">
                  Móvil
                </Label>
                <Input
                  id="movil"
                  value={formData.fields.movil}
                  onChange={(e) => handleFieldChange("movil", e.target.value)}
                  className="h-8"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="email" className="text-xs">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.fields.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="contacto" className="text-xs">
                  Contacto
                </Label>
                <Input
                  id="contacto"
                  value={formData.fields.contacto}
                  onChange={(e) => handleFieldChange("contacto", e.target.value)}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="acuenta" className="text-xs">
                  A cuenta
                </Label>
                <Input
                  id="acuenta"
                  value={formData.fields.acuenta}
                  onChange={(e) => handleFieldChange("acuenta", e.target.value)}
                  className="h-8"
                />
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <Label htmlFor="observaciones" className="text-xs">
                Observaciones
              </Label>
              <Textarea
                id="observaciones"
                value={formData.fields.observaciones}
                onChange={(e) => handleFieldChange("observaciones", e.target.value)}
                rows={6}
                maxLength={MAX_OBSERVACIONES_LENGTH}
                className="resize-none flex-1"
                aria-describedby="observaciones-hint"
              />
              <span id="observaciones-hint" className="sr-only">
                Máximo {MAX_OBSERVACIONES_LENGTH} caracteres
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-muted/30" role="region" aria-labelledby="preview-heading">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h2 id="preview-heading" className="text-xl font-bold text-foreground">
                Vista Previa
              </h2>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded" aria-hidden="true">
                aproximada
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenFullscreenPreview}
              aria-label="Ampliar vista previa del PDF"
            >
              <Maximize2 className="w-4 h-4 mr-1" aria-hidden="true" />
              Ampliar
            </Button>
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400 mb-3" role="note">
            💡 Usa "Ampliar" para ver el PDF exacto que se exportará
          </p>
          <div className="bg-white p-4 rounded-lg shadow-inner overflow-auto" aria-label="Vista previa del formulario">
            <div
              id="form-preview"
              ref={containerRef}
              className="relative mx-auto"
              style={{ aspectRatio: "210 / 297", width: "595px", maxWidth: "100%" }}
              role="img"
              aria-label="Vista previa del formulario con los datos introducidos"
            >
              <img
                src={templateImage}
                alt="Plantilla de formulario PiRetols"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-0 left-0 w-full h-full font-mono">
                <div
                  className="absolute whitespace-nowrap"
                  style={{
                    top: savedPositions.formName?.top || DEFAULT_POSITIONS.formName.top,
                    left: savedPositions.formName?.left || DEFAULT_POSITIONS.formName.left,
                    fontSize: savedPositions.formName?.fontSize || DEFAULT_POSITIONS.formName.fontSize,
                    width: savedPositions.formName?.width || DEFAULT_POSITIONS.formName.width,
                    fontWeight: savedPositions.formName?.fontWeight || DEFAULT_POSITIONS.formName.fontWeight,
                    fontFamily: savedPositions.formName?.fontFamily || DEFAULT_POSITIONS.formName.fontFamily,
                    color: savedPositions.formName?.color || DEFAULT_POSITIONS.formName.color,
                  }}
                >
                  {formData.name}
                </div>
                {Object.entries(formData.fields).map(([field, value]) => (
                  <AutoSizeField
                    key={field}
                    field={field}
                    value={value}
                    position={savedPositions[field] || DEFAULT_POSITIONS[field]}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal de Vista Previa PDF Real */}
      <Dialog
        open={showFullscreenPreview}
        onOpenChange={(open) => {
          setShowFullscreenPreview(open);
          if (!open && pdfPreviewUrl) {
            URL.revokeObjectURL(pdfPreviewUrl);
            setPdfPreviewUrl(null);
          }
        }}
      >
        <DialogContent className="w-[95vw] max-w-[95vw] h-[95vh] max-h-[95vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle>Vista Previa PDF - {formData.name || `Formulario #${formData.number}`}</DialogTitle>
              <Button size="sm" onClick={handleExport} className="mr-8">
                <Download className="w-4 h-4 mr-1" />
                Descargar PDF
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            {isLoadingPdf ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Generando PDF...</span>
              </div>
            ) : pdfPreviewUrl ? (
              <iframe src={pdfPreviewUrl} className="w-full h-full rounded-lg border" title="Vista previa PDF" />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
