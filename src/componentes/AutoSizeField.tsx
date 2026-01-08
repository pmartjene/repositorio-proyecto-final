import { useAutoFontSize } from "@/hooks/useAutoFontSize";
import { FieldPosition } from "@/pages/Index";

type PropsCampoTamanoAuto = {
  field: string;
  value: string;
  position: FieldPosition | undefined;
};

export const AutoSizeField = ({ field, value, position }: Omit<PropsCampoTamanoAuto, 'scale'>) => {
  const tamanoFuenteBase = position?.fontSize || "14px";
  
  const tamanoAuto = useAutoFontSize(
    value,
    tamanoFuenteBase,
    field !== "observaciones"
  );

  // Formatear día, mes y año con cero delante si es necesario
  const formatearValor = (nombreCampo: string, val: string): string => {
    if ((nombreCampo === "dia" || nombreCampo === "mes" || nombreCampo === "ano") && val) {
      const num = parseInt(val, 10);
      if (!isNaN(num) && num >= 1 && num <= 9) {
        return `0${num}`;
      }
    }
    return val;
  };

  const valorMostrado = formatearValor(field, value);

  return (
    <div
      ref={tamanoAuto.ref}
      className={`absolute ${field === "observaciones" ? "" : "whitespace-nowrap"}`}
      style={{
        top: position?.top || "0%",
        left: position?.left || "0%",
        fontSize: tamanoAuto.fontSize,
        width: position?.width,
        fontWeight: position?.fontWeight || "500",
        fontFamily: position?.fontFamily || "monospace",
        color: position?.color || "#000000",
        lineHeight: field === "observaciones" ? "1.3" : "normal",
        wordWrap: field === "observaciones" ? "break-word" : "normal",
        overflowWrap: field === "observaciones" ? "break-word" : "normal",
        whiteSpace: field === "observaciones" ? "pre-wrap" : "nowrap",
      }}
    >
      {valorMostrado}
    </div>
  );
};
