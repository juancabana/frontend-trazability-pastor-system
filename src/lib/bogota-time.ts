/**
 * Utilidades de tiempo en zona horaria America/Bogota (UTC-5, sin DST).
 *
 * Toda la logica que dependa de "hoy" o "mes actual" debe usar estas
 * funciones para que el comportamiento sea consistente sin importar la zona
 * horaria del navegador del usuario.
 *
 * Espejo de `backend/src/common/utils/bogota-time.util.ts`.
 */

export const BOGOTA_TIMEZONE = 'America/Bogota';

export interface BogotaDateParts {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour: number; // 0-23
  minute: number; // 0-59
  second: number; // 0-59
}

/**
 * Devuelve los componentes (year/month/day/...) de una fecha proyectada a
 * la zona horaria de Bogota.
 */
export function getBogotaDateParts(date: Date = new Date()): BogotaDateParts {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: BOGOTA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: string): number => {
    const part = parts.find((p) => p.type === type);
    return part ? parseInt(part.value, 10) : 0;
  };

  const hour = get('hour');
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: hour === 24 ? 0 : hour,
    minute: get('minute'),
    second: get('second'),
  };
}

/**
 * Devuelve un Date cuyos componentes locales (getFullYear, getMonth,
 * getDate, ...) coinciden con la hora actual de Bogota. NO es el instante
 * absoluto actual; solo se debe usar para leer componentes locales.
 */
export function nowInBogota(): Date {
  const p = getBogotaDateParts();
  return new Date(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
}

/**
 * Devuelve un Date cuyos componentes locales corresponden al primer dia
 * del mes en curso en Bogota (00:00).
 */
export function startOfCurrentMonthBogota(): Date {
  const p = getBogotaDateParts();
  return new Date(p.year, p.month - 1, 1);
}

/**
 * Parsea un string YYYY-MM-DD interpretandolo como medianoche en Bogota.
 * El Date resultante tiene componentes locales (year/month/day) iguales.
 */
export function parseBogotaDate(yyyymmdd: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(yyyymmdd);
  if (!match) {
    throw new Error(
      `Fecha invalida, se esperaba formato YYYY-MM-DD: ${yyyymmdd}`,
    );
  }
  const [, y, m, d] = match;
  return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
}

/**
 * Formatea como YYYY-MM-DD usando los componentes de Bogota.
 */
export function formatBogotaDate(date: Date = new Date()): string {
  const p = getBogotaDateParts(date);
  const mm = String(p.month).padStart(2, '0');
  const dd = String(p.day).padStart(2, '0');
  return `${p.year}-${mm}-${dd}`;
}

/**
 * Construye un string YYYY-MM-DD a partir de componentes locales (sin
 * conversion de timezone). Util para fechas que ya estan en componentes
 * locales (e.g. resultantes de un calendario navegable).
 */
export function formatLocalDate(year: number, month: number, day: number): string {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}
