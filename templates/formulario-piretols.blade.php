<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Formulario PiRetols - {{ $n_presupuesto ?? '' }}</title>
    <style>
        /* ============================================
           CONFIGURACIÓN BASE DEL DOCUMENTO
           A4: 210mm x 297mm
           ============================================ */
        @page {
            size: A4 portrait;
            margin: 0;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html, body {
            width: 210mm;
            height: 297mm;
            font-family: 'Courier New', Courier, monospace;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        /* ============================================
           CONTENEDOR PRINCIPAL CON PLANTILLA DE FONDO
           ============================================ */
        .formulario-container {
            position: relative;
            width: 210mm;
            height: 297mm;
            background-image: url('{{ $template_url ?? "/images/piretols-template.jpg" }}');
            background-size: 100% 100%;
            background-repeat: no-repeat;
            overflow: hidden;
        }

        /* ============================================
           ESTILOS BASE PARA CAMPOS
           
           ***VARIABLES CRÍTICAS DE ALINEACIÓN***
           line-height: 1.15 - Ajustado para coincidir con altura de texto de plantilla
           padding-bottom: 0.3mm - Ajuste fino para que texto quede sobre línea base
           ============================================ */
        .campo-linea {
            position: absolute;
            display: flex;
            align-items: baseline;
        }

        .etiqueta-estatica {
            /* Las etiquetas ya están en la plantilla, esto es solo referencia */
            display: none;
        }

        .contenedor-valor {
            display: inline-block;
            vertical-align: baseline;
            /* CRÍTICO: line-height calculado de medidas reales del PDF */
            line-height: 1.15;
            /* Ajuste fino vertical para alineación con guiones bajos */
            padding-bottom: 0.3mm;
        }

        .valor-dinamico {
            font-family: 'Courier New', Courier, monospace;
            font-size: 3.5mm; /* ~10pt, tamaño estándar formulario */
            font-weight: 500;
            color: #000000;
            letter-spacing: 0.02em;
            /* El texto se apoya sobre el borde inferior del contenedor */
        }

        /* ============================================
           CAMPOS DE ENCABEZADO (Fila superior)
           Medidas tomadas del PDF original:
           - Línea base de "Nº PRESUPUESTO": ~50mm desde arriba
           - Espacio entre campos: ~40mm
           ============================================ */
        
        /* Nº Presupuesto - COLUMNA 1 ENCABEZADO */
        .campo-presupuesto {
            top: 49.5mm;  /* Ajustado a línea base de guiones */
            left: 69mm;   /* Después de etiqueta "Nº PRESUPUESTO:" */
        }
        .campo-presupuesto .contenedor-valor {
            min-width: 25mm;
            /* line-height específico si difiere del general */
            line-height: 1.12;
        }

        /* Nº Factura - COLUMNA 2 ENCABEZADO */
        /* X=160mm según solicitud */
        .campo-factura {
            top: 49.5mm;
            left: 160mm;
        }
        .campo-factura .contenedor-valor {
            min-width: 25mm;
            line-height: 1.12;
        }

        /* F/V (Forma de Venta) - COLUMNA 3 ENCABEZADO */
        /* X=160mm según solicitud */
        .campo-fv {
            top: 49.5mm;
            left: 160mm;
        }
        .campo-fv .contenedor-valor {
            min-width: 30mm;
            line-height: 1.12;
        }

        /* ============================================
           FECHA (Día/Mes/Año)
           Ubicación: Esquina superior derecha
           ============================================ */
        .campo-fecha-dia {
            top: 61mm;
            left: 151mm;
        }
        .campo-fecha-dia .contenedor-valor {
            min-width: 8mm;
            text-align: center;
        }

        .campo-fecha-mes {
            top: 61mm;
            left: 164mm;
        }
        .campo-fecha-mes .contenedor-valor {
            min-width: 8mm;
            text-align: center;
        }

        .campo-fecha-ano {
            top: 61mm;
            left: 177mm;
        }
        .campo-fecha-ano .contenedor-valor {
            min-width: 15mm;
            text-align: center;
        }

        /* ============================================
           COLUMNA IZQUIERDA - DATOS PRINCIPALES
           
           Medidas verticales (distancia entre líneas base):
           - Espaciado entre campos: ~13.5mm
           - Primera línea (NOMBRE): 70mm desde arriba
           
           ***AJUSTE CRÍTICO line-height***
           Los campos de la columna izquierda usan line-height: 1.15
           derivado de: altura_linea_plantilla / tamaño_fuente
           ============================================ */
        
        /* NOMBRE */
        .campo-nombre {
            top: 70mm;
            left: 46mm; /* Después de "NOMBRE:" */
        }
        .campo-nombre .contenedor-valor {
            min-width: 80mm;
            /* Ajuste para texto más largo */
            line-height: 1.15;
            padding-bottom: 0.2mm;
        }
        .campo-nombre .valor-dinamico {
            font-size: 3.5mm;
            font-weight: 600; /* Negrita para nombre */
        }

        /* DNI */
        .campo-dni {
            top: 83.5mm; /* 70mm + 13.5mm */
            left: 46mm;
        }
        .campo-dni .contenedor-valor {
            min-width: 80mm;
            line-height: 1.15;
        }

        /* C. POSTAL */
        /* X=130mm según solicitud */
        .campo-cpostal {
            top: 97mm; /* 83.5mm + 13.5mm */
            left: 130mm;
        }
        .campo-cpostal .contenedor-valor {
            min-width: 25mm;
            line-height: 1.15;
        }

        /* TELÉFONO */
        /* X=80mm según solicitud */
        .campo-telefono {
            top: 110.5mm;
            left: 80mm;
        }
        .campo-telefono .contenedor-valor {
            min-width: 35mm;
            line-height: 1.15;
        }

        /* E-MAIL */
        .campo-email {
            top: 124mm;
            left: 46mm;
        }
        .campo-email .contenedor-valor {
            min-width: 80mm;
            line-height: 1.15;
        }
        .campo-email .valor-dinamico {
            font-size: 3.2mm; /* Ligeramente más pequeño para emails largos */
        }

        /* OBSERVACIONES */
        .campo-observaciones {
            top: 137.5mm;
            left: 46mm;
        }
        .campo-observaciones .contenedor-valor {
            min-width: 145mm; /* Ancho completo */
            max-width: 145mm;
            line-height: 1.3; /* Mayor para texto multilínea */
            padding-bottom: 0.5mm;
        }
        .campo-observaciones .valor-dinamico {
            font-size: 3mm;
            white-space: pre-wrap;
            word-wrap: break-word;
        }

        /* FECHA DÍA (parte inferior izquierda) */
        .campo-fecha-dia-inferior {
            top: 165mm;
            left: 35mm;
        }
        .campo-fecha-dia-inferior .contenedor-valor {
            min-width: 20mm;
            line-height: 1.15;
        }

        /* ============================================
           COLUMNA DERECHA - DATOS SECUNDARIOS
           
           Alineación diferente: Los campos de la derecha
           pueden tener medidas ligeramente distintas
           ============================================ */
        
        /* CONTACTO */
        .campo-contacto {
            top: 70mm;
            left: 150mm;
        }
        .campo-contacto .contenedor-valor {
            min-width: 45mm;
            /* line-height ajustado para columna derecha */
            line-height: 1.18;
            padding-bottom: 0.25mm;
        }

        /* DIRECCIÓN */
        .campo-direccion {
            top: 83.5mm;
            left: 150mm;
        }
        .campo-direccion .contenedor-valor {
            min-width: 45mm;
            line-height: 1.18;
        }
        .campo-direccion .valor-dinamico {
            font-size: 3.2mm; /* Para direcciones largas */
        }

        /* POBLACIÓN */
        /* X=130mm según solicitud */
        .campo-poblacion {
            top: 97mm;
            left: 130mm;
        }
        .campo-poblacion .contenedor-valor {
            min-width: 45mm;
            line-height: 1.18;
        }

        /* MÓVIL */
        /* X=80mm según solicitud */
        .campo-movil {
            top: 110.5mm;
            left: 80mm;
        }
        .campo-movil .contenedor-valor {
            min-width: 35mm;
            line-height: 1.18;
        }

        /* A CUENTA */
        .campo-acuenta {
            top: 124mm;
            left: 150mm;
        }
        .campo-acuenta .contenedor-valor {
            min-width: 40mm;
            line-height: 1.18;
        }
        .campo-acuenta .valor-dinamico {
            font-weight: 600;
        }

        /* FECHA AÑO (parte inferior derecha) */
        .campo-fecha-ano-inferior {
            top: 165mm;
            left: 70mm;
        }
        .campo-fecha-ano-inferior .contenedor-valor {
            min-width: 20mm;
            line-height: 1.15;
        }

        /* ============================================
           TÍTULO DEL FORMULARIO
           ============================================ */
        .campo-titulo {
            top: 30mm;
            left: 46mm;
        }
        .campo-titulo .valor-dinamico {
            font-size: 5mm;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        /* ============================================
           AJUSTES PARA IMPRESIÓN
           ============================================ */
        @media print {
            .formulario-container {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .valor-dinamico {
                /* Asegurar que el texto sea negro sólido en impresión */
                color: #000000 !important;
                -webkit-print-color-adjust: exact;
            }
        }

        /* ============================================
           UTILIDADES DE DEBUG (comentar en producción)
           ============================================ */
        /*
        .campo-linea {
            outline: 1px dashed red;
        }
        .contenedor-valor {
            background: rgba(255, 255, 0, 0.3);
        }
        */
    </style>
</head>
<body>
    <div class="formulario-container">
        
        <!-- ============================================
             ENCABEZADO: Números de documento
             ============================================ -->
        <div class="campo-linea campo-presupuesto">
            <span class="contenedor-valor">
                <span class="valor-dinamico">{{ $n_presupuesto ?? '' }}</span>
            </span>
        </div>

        <div class="campo-linea campo-factura">
            <span class="contenedor-valor">
                <span class="valor-dinamico">{{ $n_factura ?? '' }}</span>
            </span>
        </div>

        <div class="campo-linea campo-fv">
            <span class="contenedor-valor">
                <span class="valor-dinamico">{{ $f_v ?? '' }}</span>
            </span>
        </div>

        <!-- ============================================
             FECHA SUPERIOR
             ============================================ -->
        <div class="campo-linea campo-fecha-dia">
            <span class="contenedor-valor">
                <span class="valor-dinamico">{{ $fecha_dia ?? '' }}</span>
            </span>
        </div>

        <div class="campo-linea campo-fecha-mes">
            <span class="contenedor-valor">
                <span class="valor-dinamico">{{ $fecha_mes ?? '' }}</span>
            </span>
        </div>

        <div class="campo-linea campo-fecha-ano">
            <span class="contenedor-valor">
                <span class="valor-dinamico">{{ $fecha_ano ?? '' }}</span>
            </span>
        </div>

        <!-- ============================================
             COLUMNA IZQUIERDA
             ============================================ -->
        <div class="campo-linea campo-nombre">
            <span class="contenedor-valor">
                <span class="valor-dinamico">{{ $nombre ?? '' }}</span>
            </span>
        </div>

        <div class="campo-linea campo-dni">
            <span class="contenedor-valor">
                <span class="valor-dinamico">{{ $dni ?? '' }}</span>
            </span>
        </div>

        <div class="campo-linea campo-cpostal">
            <span class="contenedor-valor">
                <span class="valor-dinamico">{{ $c_postal ?? '' }}</span>
            </span>
        </div>

        <div class="campo-linea campo-telefono">
            <span class="contenedor-valor">
                <span class="valor-dinamico">{{ $telefono ?? '' }}</span>
            </span>
        </div>

        <div class="campo-linea campo-email">
            <span class="contenedor-valor">
                <span class="valor-dinamico">{{ $email ?? '' }}</span>
            </span>
        </div>

        <div class="campo-linea campo-observaciones">
            <span class="contenedor-valor">
                <span class="valor-dinamico">{{ $observaciones ?? '' }}</span>
            </span>
        </div>

        <div class="campo-linea campo-fecha-dia-inferior">
            <span class="contenedor-valor">
                <span class="valor-dinamico">{{ $fecha_dia ?? '' }}</span>
            </span>
        </div>

        <!-- ============================================
             COLUMNA DERECHA
             ============================================ -->
        <div class="campo-linea campo-contacto">
            <span class="contenedor-valor">
                <span class="valor-dinamico">{{ $contacto ?? '' }}</span>
            </span>
        </div>

        <div class="campo-linea campo-direccion">
            <span class="contenedor-valor">
                <span class="valor-dinamico">{{ $direccion ?? '' }}</span>
            </span>
        </div>

        <div class="campo-linea campo-poblacion">
            <span class="contenedor-valor">
                <span class="valor-dinamico">{{ $poblacion ?? '' }}</span>
            </span>
        </div>

        <div class="campo-linea campo-movil">
            <span class="contenedor-valor">
                <span class="valor-dinamico">{{ $movil ?? '' }}</span>
            </span>
        </div>

        <div class="campo-linea campo-acuenta">
            <span class="contenedor-valor">
                <span class="valor-dinamico">{{ $a_cuenta ?? '' }}</span>
            </span>
        </div>

        <div class="campo-linea campo-fecha-ano-inferior">
            <span class="contenedor-valor">
                <span class="valor-dinamico">{{ $fecha_ano ?? '' }}</span>
            </span>
        </div>

    </div>
</body>
</html>

{{--
============================================
GUÍA DE AJUSTE DE COORDENADAS
============================================

Para ajustar las posiciones de los campos:

1. MEDICIÓN VERTICAL (top):
   - Abre el PDF original en un visor con regla (Adobe Acrobat, PDF-XChange)
   - Mide desde el borde superior hasta la LÍNEA BASE del texto
   - La línea base es donde se "apoyan" las letras (no minúsculas con cola como 'g', 'y')

2. MEDICIÓN HORIZONTAL (left):
   - Mide desde el borde izquierdo hasta donde COMIENZA el área subrayada
   - No incluyas la etiqueta (ej: "NOMBRE:"), solo el espacio para datos

3. AJUSTE DE line-height:
   - Si el texto queda muy arriba de los guiones: AUMENTAR line-height o padding-bottom
   - Si el texto queda muy abajo: REDUCIR line-height o padding-bottom
   - Valores típicos: line-height entre 1.10 y 1.25

4. VARIABLES POR COLUMNA:
   - Columna izquierda: line-height: 1.15, padding-bottom: 0.2mm
   - Columna derecha: line-height: 1.18, padding-bottom: 0.25mm
   (Estas pueden variar según la plantilla específica)

5. DEBUG:
   - Descomenta las reglas CSS de "UTILIDADES DE DEBUG" para ver los contenedores
   - Ajusta en incrementos de 0.5mm para precisión

============================================
LISTA DE VARIABLES BLADE
============================================
{{ $n_presupuesto }}  - Número de presupuesto
{{ $n_factura }}      - Número de factura
{{ $f_v }}            - Forma de venta
{{ $fecha_dia }}      - Día (DD)
{{ $fecha_mes }}      - Mes (MM)
{{ $fecha_ano }}      - Año (AAAA)
{{ $nombre }}         - Nombre completo
{{ $dni }}            - DNI/NIF
{{ $c_postal }}       - Código postal
{{ $telefono }}       - Teléfono fijo
{{ $email }}          - Correo electrónico
{{ $observaciones }}  - Observaciones (multilínea)
{{ $contacto }}       - Persona de contacto
{{ $direccion }}      - Dirección completa
{{ $poblacion }}      - Ciudad/Población
{{ $movil }}          - Teléfono móvil
{{ $a_cuenta }}       - Importe a cuenta
{{ $template_url }}   - URL de la imagen de plantilla
--}}
