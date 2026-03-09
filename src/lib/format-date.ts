import { MONTHS_ES } from '@/constants/shared';

export function formatDate(date: Date): string {
  const days = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miercoles',
    'Jueves',
    'Viernes',
    'Sabado',
  ];
  return `${days[date.getDay()]}, ${date.getDate()} de ${MONTHS_ES[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatMonthYear(date: Date): string {
  return `${MONTHS_ES[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()} ${MONTHS_ES[d.getMonth()].substring(0, 3)}`;
}

export function getCurrentPeriod(
  deadlineDay: number,
  referenceDate?: Date,
): { start: Date; end: Date } {
  const today = referenceDate || new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();

  if (day <= deadlineDay) {
    return {
      start: new Date(year, month - 1, deadlineDay + 1),
      end: new Date(year, month, deadlineDay),
    };
  } else {
    return {
      start: new Date(year, month, deadlineDay + 1),
      end: new Date(year, month + 1, deadlineDay),
    };
  }
}

export function isDateInCurrentPeriod(date: Date, deadlineDay: number): boolean {
  const period = getCurrentPeriod(deadlineDay);
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return d >= period.start && d <= period.end;
}

export function isDateEditable(date: Date, deadlineDay: number): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
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
