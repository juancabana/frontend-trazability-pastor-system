// Slug de la categoría "Transporte" en la base de datos.
// Si el backend cambia este identificador, actualizar aquí también.
export const TRANSPORT_CATEGORY_ID = 'transporte';

// Umbral de cumplimiento mensual (porcentaje) usado para colorear indicadores:
// verde (>= umbral) o ámbar (< umbral). Si el negocio cambia el criterio,
// solo hay que modificar este valor.
export const COMPLIANCE_THRESHOLD = 70;

// Día límite de reporte por defecto. El backend envía el valor real en el
// perfil del usuario (reportDeadlineDay). Este fallback se usa si la respuesta
// del servidor no incluye ese campo.
export const DEFAULT_REPORT_DEADLINE_DAY = 19;

// Rango permitido para el día de cierre. El máximo es 27: el inicio del
// periodo es deadlineDay + 1, y el día 28 existe en todos los meses
// (incluido febrero). Con 28 el inicio sería el 29, que no existe en febrero
// de años no bisiestos. Debe coincidir con MAX_REPORT_DEADLINE_DAY del backend.
export const MIN_REPORT_DEADLINE_DAY = 1;
export const MAX_REPORT_DEADLINE_DAY = 27;

// Etiqueta de posición principal de pastor. Se usa para distinguir visualmente
// entre "Pastor" titular y otras posiciones (e.g. "Anciano").
export const PASTOR_POSITION_LABEL = 'Pastor';

export const CURRENCY_CONFIG = {
  LOCALE: 'es-CO',
  CURRENCY: 'COP',
  MINIMUM_FRACTION_DIGITS: 0,
} as const;

export const COMMON_LABELS = {
  BACK: 'Atras',
  NEXT: 'Siguiente',
  CANCEL: 'Cancelar',
  SAVE: 'Guardar',
  SAVING: 'Guardando...',
  SEARCH: 'Buscar',
  ALL: 'Todos',
  DELETE: 'Eliminar',
  EDIT: 'Editar',
  VIEW: 'Ver',
  EXPORT_PDF: 'Exportar PDF',
  EXPORT_EXCEL: 'Exportar Excel',
  LOADING: 'Cargando...',
  NO_DATA: 'Sin datos',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'pastor_tracking_token',
  AUTH_USER: 'pastor_tracking_user',
} as const;

export const MONTHS_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const;

export const DAYS_ES = [
  'Dom',
  'Lun',
  'Mar',
  'Mie',
  'Jue',
  'Vie',
  'Sab',
] as const;

export const UNIT_LABELS: Record<string, string> = {
  cantidad: 'Cant.',
  horas: 'Horas',
  veces: 'Veces',
  dias: 'Días',
  noches: 'Noches',
};

export const UNIT_LABELS_FULL: Record<string, string> = {
  cantidad: 'Cantidad',
  horas: 'Horas',
  veces: 'Veces',
  dias: 'Días',
  noches: 'Noches',
};

// Colores de marca para exportaciones PDF (jsPDF RGB) y Excel (ExcelJS hex).
export const EXPORT_BRAND = {
  name: 'Sistema de Trazabilidad Pastoral',
  pdf: {
    teal:      [13, 148, 136]   as [number, number, number],
    tealDark:  [15, 118, 110]   as [number, number, number],
    purple:    [124, 58, 237]   as [number, number, number],
    purpleDark:[109, 40, 217]   as [number, number, number],
    slate:     [71, 85, 105]    as [number, number, number],
    rowAlt:    [249, 250, 251]  as [number, number, number],
    border:    [226, 232, 240]  as [number, number, number],
    textDark:  [30, 41, 59]     as [number, number, number],
    textMid:   [100, 116, 139]  as [number, number, number],
    white:     [255, 255, 255]  as [number, number, number],
    green:     { bg: [220, 252, 231] as [number,number,number], text: [21, 128, 61]   as [number,number,number] },
    amber:     { bg: [254, 243, 199] as [number,number,number], text: [146, 64, 14]   as [number,number,number] },
    red:       { bg: [254, 226, 226] as [number,number,number], text: [185, 28, 28]   as [number,number,number] },
  },
  excel: {
    teal:       'FF0D9488',
    tealDark:   'FF0F766E',
    tealLight:  'FFE6FFFA',
    purple:     'FF7C3AED',
    purpleLight:'FFF5F3FF',
    slate:      'FF475569',
    slateLight: 'FFF8FAFC',
    border:     'FFE2E8F0',
    rowAlt:     'FFF9FAFB',
    white:      'FFFFFFFF',
    green:      { bg: 'FFDCFCE7', text: 'FF15803D' },
    amber:      { bg: 'FFFEF3C7', text: 'FF92400E' },
    red:        { bg: 'FFFEE2E2', text: 'FFB91C1C' },
  },
} as const;
