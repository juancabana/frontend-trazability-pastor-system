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
  TOKEN: 'pastor_tracking_token',
  USER: 'pastor_tracking_user',
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
