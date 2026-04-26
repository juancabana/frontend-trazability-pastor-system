import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { useReportsByPastorMonth } from '@/features/daily-report/presentation/hooks/use-daily-report-queries';
import { formatMonthYear, isDateInCurrentPeriod, isDateEditable } from '@/lib/format-date';
import { startOfCurrentMonthBogota } from '@/lib/bogota-time';
import { DAYS_ES, TRANSPORT_CATEGORY_ID, DEFAULT_REPORT_DEADLINE_DAY } from '@/constants/shared';
import { useComplianceThresholds } from '@/features/config/hooks/use-business-config';
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Calendar,
  TrendingUp,
  Activity,
  DollarSign,
  Lock,
  PenLine,
  Plus,
  CalendarX2,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Skeleton } from '@/components/atoms/Skeleton';

export default function PastorCalendarPage() {
  const { token, currentUser } = useAuth();
  const { thresholdPct } = useComplianceThresholds();
  const canEditAllReports = currentUser?.canEditAllReports ?? false;
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(() => startOfCurrentMonthBogota());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const deadlineDay = currentUser?.reportDeadlineDay ?? DEFAULT_REPORT_DEADLINE_DAY;

  const { data: monthReports = [], isLoading: loadingMonth } = useReportsByPastorMonth(
    token ?? '',
    currentUser?.id ?? '',
    month + 1,
    year,
  );

  const today = new Date();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays: (number | null)[] = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [firstDay, daysInMonth]);

  const totalActivities = monthReports.reduce(
    (sum, r) => sum + (r.activities?.length || 0),
    0,
  );
  const totalTransporte = monthReports.reduce(
    (sum, r) =>
      sum +
      (r.activities || [])
        .filter((a) => a.categoryId === TRANSPORT_CATEGORY_ID)
        .reduce((s, a) => s + (a.amount || 0), 0),
    0,
  );
  const cumplimiento = daysInMonth > 0
    ? Math.round((monthReports.length / daysInMonth) * 100)
    : 0;

  const formatDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getDayStatus = (day: number) => {
    const date = new Date(year, month, day);
    const dateStr = formatDateStr(day);
    const report = monthReports.find((r) => r.date === dateStr);
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
    const inPeriod = isDateInCurrentPeriod(date, deadlineDay);
    const isFuture = date > today;
    const editable = !isFuture && (isDateEditable(date, deadlineDay) || canEditAllReports);
    return { report, isToday, inPeriod, editable, isFuture };
  };

  const handleDayClick = (day: number) => {
    const dateStr = formatDateStr(day);
    const { report, editable, isFuture } = getDayStatus(day);
    if (isFuture) return;
    if (report && !editable) navigate(`/pastor/report/${dateStr}`);
    else if (editable) navigate(`/pastor/report/${dateStr}/edit`);
    else if (report) navigate(`/pastor/report/${dateStr}`);
  };

  const periodStart = deadlineDay + 1;
  const periodEnd = deadlineDay;

  const stats = [
    {
      icon: Calendar,
      label: 'Dias',
      value: monthReports.length,
      sub: `de ${daysInMonth}`,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/30',
    },
    {
      icon: TrendingUp,
      label: 'Cumplimiento',
      value: `${cumplimiento}%`,
      sub: 'del mes',
      color: cumplimiento >= thresholdPct ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400',
      bg: cumplimiento >= thresholdPct ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-amber-50 dark:bg-amber-900/30',
    },
    {
      icon: Activity,
      label: 'Actividades',
      value: totalActivities,
      sub: 'registradas',
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-900/30',
    },
    {
      icon: DollarSign,
      label: 'Transporte',
      value: `$${totalTransporte.toLocaleString('es-CO')}`,
      sub: 'gastados',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    },
  ];

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* Period banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-4 mb-5 flex items-start gap-3 border ${
          canEditAllReports
            ? 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-100 dark:border-amber-800'
            : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-100 dark:border-blue-800'
        }`}
      >
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
          canEditAllReports
            ? 'bg-amber-100 dark:bg-amber-900/30'
            : 'bg-blue-100 dark:bg-blue-900/30'
        }`}>
          {canEditAllReports
            ? <ShieldCheck className="w-4 h-4 text-amber-500" />
            : <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          }
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {canEditAllReports
              ? 'Excepción de edición activa'
              : `Periodo actual: ${periodStart} del mes anterior — ${periodEnd} del mes actual`
            }
          </p>
          <p className={`text-xs mt-0.5 hidden sm:block ${
            canEditAllReports
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-gray-500 dark:text-slate-400'
          }`}>
            {canEditAllReports
              ? 'Puede editar informes de cualquier periodo vencido.'
              : 'Solo puede editar informes dentro del periodo activo. Los anteriores son de solo lectura.'
            }
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      {loadingMonth && monthReports.length === 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="w-7 h-7 rounded-lg" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-6 w-20 mb-1.5" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      ) : (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-7 h-7 ${s.bg} rounded-lg flex items-center justify-center`}
              >
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
              </div>
              <span className="text-[11px] font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide">
                {s.label}
              </span>
            </div>
            <p className={`text-xl font-semibold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-gray-400 dark:text-slate-500">{s.sub}</p>
          </motion.div>
        ))}
      </div>
      )}

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden"
      >
        {/* Month nav */}
        <div className="flex items-center justify-center gap-3 py-4 px-4 border-b border-gray-100 dark:border-slate-800">
          <button
            aria-label="Mes anterior"
            onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-400 dark:text-slate-500" />
          </button>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white min-w-[150px] text-center">
            {formatMonthYear(currentMonth)}
          </h3>
          <button
            aria-label="Mes siguiente"
            onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-slate-500" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7">
          {DAYS_ES.map((d) => (
            <div
              key={d}
              className="text-center py-2.5 text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-100 dark:bg-slate-800 border-t border-gray-100 dark:border-slate-800">
          {loadingMonth && monthReports.length === 0
            ? Array.from({ length: 42 }).map((_, i) => (
                <div key={i} className="aspect-square bg-white dark:bg-slate-900 p-1.5 sm:p-2">
                  <Skeleton className="w-6 h-6 sm:w-7 sm:h-7 rounded-full" />
                </div>
              ))
            : calendarDays.map((day, i) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${i}`}
                  className="min-h-[56px] sm:min-h-[90px] bg-gray-50 dark:bg-slate-950"
                />
              );
            }

            const { report, isToday, inPeriod, editable, isFuture } = getDayStatus(day);
            const actCount = report?.activities?.length || 0;

            // Tooltip nativo (title) — explica el estado al usuario
            const tooltipText = isFuture
              ? 'Fecha futura'
              : !editable && !report
                ? 'Sin informe · Periodo cerrado'
                : !editable && report
                  ? 'Ver informe (solo lectura)'
                  : editable && !report
                    ? 'Crear informe'
                    : 'Editar informe';

            // Cursor e interactividad según estado
            const interactiveClass =
              isFuture || (!editable && !report)
                ? 'cursor-default'
                : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800';

            // Opacidad: días cerrados sin informe se difuminan más para
            // indicar que no son accionables
            const opacityClass = isFuture
              ? 'opacity-30'
              : !editable && !report
                ? 'opacity-40'
                : '';

            // Icono de estado (solo desktop) en la esquina superior derecha
            const StatusIcon =
              isFuture || (!editable && !report)
                ? null
                : !editable && report
                  ? Lock
                  : editable && report
                    ? PenLine
                    : Plus;

            const statusIconColor =
              !editable && report
                ? 'text-gray-400 dark:text-slate-500'
                : 'text-teal-500 dark:text-teal-400';

            return (
              <div
                key={day}
                onClick={() => handleDayClick(day)}
                title={tooltipText}
                className={`min-h-[56px] sm:min-h-[90px] bg-white dark:bg-slate-900 p-1.5 sm:p-2 transition-all duration-150 relative group
                  ${isToday ? 'bg-teal-50/60 dark:bg-teal-900/20' : ''}
                  ${!inPeriod && !isFuture ? 'bg-gray-50/80 dark:bg-slate-950/80' : ''}
                  ${interactiveClass}
                  ${opacityClass}
                `}
              >
                <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                  <span
                    className={`text-xs sm:text-sm font-medium inline-flex items-center justify-center ${
                      isToday
                        ? 'w-6 h-6 sm:w-7 sm:h-7 bg-teal-600 text-white rounded-full text-[11px] sm:text-xs shadow-sm shadow-teal-600/30'
                        : report
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-400 dark:text-slate-500'
                    }`}
                  >
                    {day}
                  </span>
                  {/* Icono de estado — solo desktop, solo si no es futuro */}
                  {StatusIcon && !isFuture && (
                    <span className={`hidden sm:flex ${statusIconColor}`}>
                      <StatusIcon className="w-3 h-3" />
                    </span>
                  )}
                </div>
                {report && (
                  <>
                    <div className="hidden sm:block space-y-0.5">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md inline-flex items-center gap-1 font-medium ${
                          !inPeriod
                            ? 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'
                            : 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            !inPeriod ? 'bg-gray-400' : 'bg-teal-500'
                          }`}
                        />
                        {actCount} act.
                      </span>
                    </div>
                    <div className="sm:hidden flex justify-center mt-1">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          !inPeriod ? 'bg-gray-300' : 'bg-teal-500'
                        }`}
                      />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>


        {/* Empty month banner */}
        {monthReports.length === 0 && (
          <div className="px-4 py-8 text-center border-t border-gray-100 dark:border-slate-800">
            <CalendarX2 className="w-8 h-8 mx-auto text-gray-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">
              Sin informes este mes
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
              Toca un día dentro del periodo activo para registrar tus actividades.
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 border-t border-gray-100 dark:border-slate-800 text-[11px] text-gray-400 dark:text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-500" /> Informe completado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-300" /> Informe cerrado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 bg-teal-600 text-white rounded-full flex items-center justify-center text-[9px] font-medium">
              {today.getDate()}
            </span>{' '}
            Hoy
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <PenLine className="w-3 h-3 text-teal-500" /> Editable
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <Plus className="w-3 h-3 text-teal-500" /> Crear informe
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-gray-400" /> Solo lectura
          </span>
        </div>
      </motion.div>
    </div>
  );
}
