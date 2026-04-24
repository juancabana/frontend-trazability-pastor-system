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
  dias: 'Dias',
  noches: 'Noches',
};

export const UNIT_LABELS_FULL: Record<string, string> = {
  cantidad: 'Cantidad',
  horas: 'Horas',
  veces: 'Veces',
  dias: 'Dias',
  noches: 'Noches',
};
