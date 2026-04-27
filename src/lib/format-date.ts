import { MONTHS_ES } from '@/constants/shared';
import { nowInBogota, parseBogotaDate } from '@/lib/bogota-time';

const DAY_NAMES_FULL_ES = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

export function formatDate(date: Date): string {
  return `${DAY_NAMES_FULL_ES[date.getDay()]}, ${date.getDate()} de ${MONTHS_ES[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatMonthYear(date: Date): string {
  return `${MONTHS_ES[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDateShort(dateStr: string): string {
  const d = parseBogotaDate(dateStr);
  return `${d.getDate()} ${MONTHS_ES[d.getMonth()].substring(0, 3)}`;
}

function safeDate(year: number, month: number, day: number): Date {
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, lastDayOfMonth));
}

export function getCurrentPeriod(
  deadlineDay: number,
  referenceDate?: Date,
): { start: Date; end: Date } {
  const today = referenceDate ?? nowInBogota();
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();

  if (day <= deadlineDay) {
    return {
      start: safeDate(year, month - 1, deadlineDay + 1),
      end: safeDate(year, month, deadlineDay),
    };
  } else {
    return {
      start: safeDate(year, month, deadlineDay + 1),
      end: safeDate(year, month + 1, deadlineDay),
    };
  }
}

export function isDateInCurrentPeriod(date: Date, deadlineDay: number): boolean {
  const period = getCurrentPeriod(deadlineDay);
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return d >= period.start && d <= period.end;
}

export function isDateEditable(date: Date, deadlineDay: number): boolean {
  const now = nowInBogota();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (d > today) return false;

  const period = getCurrentPeriod(deadlineDay);
  return d >= period.start && d <= period.end;
}

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}
