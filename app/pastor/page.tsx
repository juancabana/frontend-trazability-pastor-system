'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useReportsByPastorMonth } from '@/features/daily-report/presentation/hooks/use-daily-report-queries';
import { formatMonthYear, isDateInCurrentPeriod, isDateEditable } from '@/lib/format-date';
import { DAYS_ES } from '@/constants/shared';
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Calendar,
  TrendingUp,
  Activity,
  DollarSign,
} from 'lucide-react';
import { motion } from 'motion/react';

export default function PastorCalendarPage() {
  const { token, currentUser } = useAuth();
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const deadlineDay = 19;

  const { data: monthReports = [] } = useReportsByPastorMonth(
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
        .filter((a) => a.categoryId === 'transporte')
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
    const editable = isDateEditable(date, deadlineDay);
    const isFuture = date > today;
    return { report, isToday, inPeriod, editable, isFuture };
  };

  const handleDayClick = (day: number) => {
    const dateStr = formatDateStr(day);
    const { report, editable, isFuture } = getDayStatus(day);
    if (isFuture) return;
    if (report && !editable) router.push(`/pastor/report/${dateStr}`);
    else if (editable) router.push(`/pastor/report/${dateStr}/edit`);
    else if (report) router.push(`/pastor/report/${dateStr}`);
  };

  const periodStart = deadlineDay + 1;
  const periodEnd = deadlineDay;

  const stats = [
    {
      icon: Calendar,
      label: 'Dias',
      value: monthReports.length,
      sub: `de ${daysInMonth}`,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: TrendingUp,
      label: 'Cumplimiento',
      value: `${cumplimiento}%`,
      sub: 'del mes',
      color: cumplimiento >= 70 ? 'text-emerald-600' : 'text-amber-600',
      bg: cumplimiento >= 70 ? 'bg-emerald-50' : 'bg-amber-50',
    },
    {
      icon: Activity,
      label: 'Actividades',
      value: totalActivities,
      sub: 'registradas',
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      icon: DollarSign,
      label: 'Transporte',
      value: `$${totalTransporte.toLocaleString('es-CO')}`,
      sub: 'gastados',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* Period banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 mb-5 flex items-start gap-3"
      >
        <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
          <Info className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            Periodo actual: {periodStart} del mes anterior — {periodEnd} del mes actual
          </p>
          <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
            Solo puede editar informes dentro del periodo activo. Los anteriores son de
            solo lectura.
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-7 h-7 ${s.bg} rounded-lg flex items-center justify-center`}
              >
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
              </div>
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                {s.label}
              </span>
            </div>
            <p className={`text-xl font-semibold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-gray-400">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      >
        {/* Month nav */}
        <div className="flex items-center justify-center gap-3 py-4 px-4 border-b border-gray-100">
          <button
            onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </button>
          <h3 className="text-sm font-semibold text-gray-900 min-w-[150px] text-center">
            {formatMonthYear(currentMonth)}
          </h3>
          <button
            onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7">
          {DAYS_ES.map((d) => (
            <div
              key={d}
              className="text-center py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-100 border-t border-gray-100">
          {calendarDays.map((day, i) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${i}`}
                  className="min-h-[56px] sm:min-h-[90px] bg-gray-50"
                />
              );
            }

            const { report, isToday, inPeriod, isFuture } = getDayStatus(day);
            const actCount = report?.activities?.length || 0;

            return (
              <div
                key={day}
                onClick={() => handleDayClick(day)}
                className={`min-h-[56px] sm:min-h-[90px] bg-white p-1.5 sm:p-2 transition-all duration-150 relative group
                  ${isToday ? 'bg-teal-50/60' : ''}
                  ${isFuture ? 'opacity-30 cursor-default' : 'cursor-pointer hover:bg-gray-50'}
                  ${!inPeriod && !isFuture ? 'bg-gray-50/80' : ''}
                `}
              >
                <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                  <span
                    className={`text-xs sm:text-sm font-medium inline-flex items-center justify-center ${
                      isToday
                        ? 'w-6 h-6 sm:w-7 sm:h-7 bg-teal-600 text-white rounded-full text-[11px] sm:text-xs shadow-sm shadow-teal-600/30'
                        : report
                          ? 'text-gray-900'
                          : 'text-gray-400'
                    }`}
                  >
                    {day}
                  </span>
                </div>
                {report && (
                  <>
                    <div className="hidden sm:block space-y-0.5">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md inline-flex items-center gap-1 font-medium ${
                          !inPeriod
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-teal-50 text-teal-700'
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

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 px-4 py-3 border-t border-gray-100 text-[11px] text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-500" /> Completado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-300" /> Cerrado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 bg-teal-600 text-white rounded-full flex items-center justify-center text-[9px] font-medium">
              {today.getDate()}
            </span>{' '}
            Hoy
          </span>
        </div>
      </motion.div>
    </div>
  );
}
