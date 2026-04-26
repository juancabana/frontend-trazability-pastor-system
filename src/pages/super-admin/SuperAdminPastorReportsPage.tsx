import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { useReportsByPastorMonth } from '@/features/daily-report/presentation/hooks/use-daily-report-queries';
import { formatMonthYear } from '@/lib/format-date';
import { startOfCurrentMonthBogota } from '@/lib/bogota-time';
import { DAYS_ES } from '@/constants/shared';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Activity,
  Clock,
  FileText,
} from 'lucide-react';
import { motion } from 'motion/react';
import { StatsGridSkeleton, CalendarSkeleton, ListSkeleton } from '@/components/atoms/Skeleton';

export default function SuperAdminPastorReportsPage() {
  const { pastorId } = useParams<{ pastorId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(() => startOfCurrentMonthBogota());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const { data: reports = [], isLoading: loadingReports } = useReportsByPastorMonth(
    token ?? '',
    pastorId ?? '',
    month + 1,
    year,
  );

  const today = new Date();

  const calendarDays: (number | null)[] = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [firstDay, daysInMonth]);

  const totalActivities = reports.reduce(
    (s, r) => s + (r.activities?.length || 0),
    0,
  );
  const totalHours = reports.reduce(
    (s, r) =>
      s + (r.activities || []).reduce((h, a) => h + (a.hours || 0), 0),
    0,
  );

  const formatDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const stats = [
    { icon: Calendar, label: 'Días', value: reports.length, sub: `de ${daysInMonth}`, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { icon: Activity, label: 'Actividades', value: totalActivities, sub: 'registradas', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/30' },
    { icon: Clock, label: 'Horas', value: `${totalHours.toFixed(0)}h`, sub: 'dedicadas', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/30' },
  ];

  return (
    <div className="max-w-[1000px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400 dark:text-slate-500" />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Informes del Pastor
          </h2>
          <p className="text-xs text-gray-400 dark:text-slate-500">Vista de solo lectura</p>
        </div>
      </div>

      {/* Month nav */}
      <div className="flex items-center gap-3 mb-5">
        <button
          aria-label="Mes anterior"
            onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-slate-400" />
        </button>
        <span className="text-sm font-medium text-gray-900 dark:text-white px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900">
          {formatMonthYear(currentMonth)}
        </span>
        <button
          aria-label="Mes siguiente"
            onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-500 dark:text-slate-400" />
        </button>
      </div>

      {/* Stats */}
      {loadingReports && reports.length === 0 ? (
        <StatsGridSkeleton count={3} />
      ) : (
      <div className="grid grid-cols-3 gap-3 mb-5">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-7 h-7 ${s.bg} rounded-lg flex items-center justify-center`}>
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
      {loadingReports && reports.length === 0 ? (
        <div className="mb-5"><CalendarSkeleton /></div>
      ) : (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden mb-5">
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
        <div className="grid grid-cols-7 gap-px bg-gray-100 dark:bg-slate-800 border-t border-gray-100 dark:border-slate-800">
          {calendarDays.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="min-h-[56px] sm:min-h-[80px] bg-gray-50 dark:bg-slate-950" />;
            }

            const dateStr = formatDateStr(day);
            const report = reports.find((r) => r.date === dateStr);
            const date = new Date(year, month, day);
            const isFuture = date > today;
            const isToday =
              date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear();
            const actCount = report?.activities?.length || 0;

            return (
              <div
                key={day}
                onClick={() =>
                  report && navigate(`/super-admin/pastor/${pastorId}/report/${dateStr}`)
                }
                className={`min-h-[56px] sm:min-h-[80px] bg-white dark:bg-slate-900 p-1.5 sm:p-2 transition-all relative
                  ${isToday ? 'bg-purple-50/60 dark:bg-purple-900/20' : ''}
                  ${isFuture ? 'opacity-30' : ''}
                  ${report ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800' : 'cursor-default'}
                `}
              >
                <span
                  className={`text-xs sm:text-sm font-medium inline-flex items-center justify-center ${
                    isToday
                      ? 'w-6 h-6 sm:w-7 sm:h-7 bg-purple-600 text-white rounded-full text-[11px] sm:text-xs'
                      : report
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-400 dark:text-slate-600'
                  }`}
                >
                  {day}
                </span>
                {report && (
                  <>
                    <div className="hidden sm:block mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md inline-flex items-center gap-1 font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        {actCount} act.
                      </span>
                    </div>
                    <div className="sm:hidden flex justify-center mt-1">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* Reports list */}
      {loadingReports && reports.length === 0 ? (
        <ListSkeleton rows={4} withMetrics={false} />
      ) : (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Informes del mes ({reports.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-slate-800">
          {reports.map((r) => (
            <button
              key={r.id}
              onClick={() => navigate(`/super-admin/pastor/${pastorId}/report/${r.date}`)}
              className="w-full px-5 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left group"
            >
              <div className="w-9 h-9 bg-gray-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-gray-400 dark:text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{r.date}</p>
                <p className="text-[11px] text-gray-400 dark:text-slate-500">
                  {r.activities?.length || 0} actividades
                  {r.observations ? ' · con observaciones' : ''}
                </p>
              </div>
            </button>
          ))}
          {reports.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-gray-400 dark:text-slate-500">
              Sin informes para este mes
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
