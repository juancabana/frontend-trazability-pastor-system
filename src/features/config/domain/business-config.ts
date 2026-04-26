// Tipos del endpoint publico /api/config/public.
// Refleja la respuesta que define el backend en `app.controller.ts`.

export interface BusinessConfig {
  timezone: string;
  compliance: {
    /** Umbral verde, decimal 0-1 (e.g. 0.7) */
    threshold: number;
    /** Umbral ambar, decimal 0-1 (e.g. 0.4) */
    amberThreshold: number;
  };
  reportDeadlineDay: {
    default: number;
    min: number;
    max: number;
  };
  yearRange: {
    min: number;
    max: number;
  };
}
