import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { useUsers } from '@/features/auth/presentation/hooks/use-auth-queries';
import { useReportsByPastorMonth } from '@/features/daily-report/presentation/hooks/use-daily-report-queries';
import { usePastorConsolidated } from '@/features/consolidated/presentation/hooks/use-consolidated-queries';
import { formatMonthYear } from '@/lib/format-date';
import { startOfCurrentMonthBogota } from '@/lib/bogota-time';
import { exportPastorPDF, exportPastorExcel } from '@/lib/export-utils';
import { DAYS_ES, UNIT_LABELS } from '@/constants/shared';
import { useComplianceThresholds } from '@/features/config/hooks/use-business-config';
import { EmptyState } from '@/components/atoms/EmptyState';
import { Tooltip } from '@/components/atoms/Tooltip';
import { StatsGridSkeleton, CalendarSkeleton, ListSkeleton, BarChartSkeleton } from '@/components/atoms/Skeleton';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Calendar,
  Activity,
  Clock,
  FileText,
  BarChart3,
  TrendingUp,
  DollarSign,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

type Tab = 'reports' | 'consolidated';

export default function AdminPastorReportsPage() {
  const { pastorId } = useParams<{ pastorId: string }>();
  const navigate = useNavigate();
  const { token, currentUser } = useAuth();
  const { thresholdPct } = useComplianceThresholds();
  const [currentMonth, setCurrentMonth] = useState(() => startOfCurrentMonthBogota());
  const [periodOffset, setPeriodOffset] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>('reports');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const { data: users = [] } = useUsers(token ?? '', currentUser?.associationId ?? undefined);
  const { data: reports = [], isLoading: loadingReports } = useReportsByPastorMonth(
    token ?? '',
    pastorId ?? '',
    month + 1,
    year,
  );
  const { data: consolidated, isLoading: loadingConsolidated } = usePastorConsolidated(
    token ?? '',
    pastorId ?? '',
    periodOffset,
  );

  const pastor = users.find((u) => u.id === pastorId);
  const today = new Date();
  const monthLabel = formatMonthYear(currentMonth);
  const periodLabel = consolidated?.period?.label ?? 'Cargando periodo...';
  const daysInPeriod = consolidated?.daysInPeriod ?? daysInMonth;

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
  const cumplimientoReports = Math.round((reports.length / daysInMonth) * 100);

  // Consolidated stats
  const compliance = consolidated?.compliance
    ? Math.round(consolidated.compliance * 100)
    : 0;
  const totalTransporte = consolidated?.totalTransportAmount || 0;

  const formatDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getInitials = (name: string) =>
    name
      .split(' ')
      .filter((w) => w.length > 2)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();

  const handleExportPDF = async () => {
    if (!consolidated || !pastor) return;
    try {
      await exportPastorPDF(consolidated, periodLabel, pastor.name, pastor.position ?? undefined);
      toast.success('PDF generado correctamente');
    } catch {
      toast.error('Error al generar PDF');
    }
  };

  const handleExportExcel = async () => {
    if (!consolidated || !pastor) return;
    try {
      await exportPastorExcel(consolidated, periodLabel, pastor.name, pastor.position ?? undefined);
      toast.success('Excel generado correctamente');
    } catch {
      toast.error('Error al generar Excel');
    }
  };

  const reportStats = [
    { icon: Calendar, label: 'Dias', value: reports.length, sub: `de ${daysInMonth}`, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { icon: Activity, label: 'Actividades', value: totalActivities, sub: 'registradas', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/30' },
    { icon: Clock, label: 'Horas', value: `${totalHours.toFixed(0)}h`, sub: 'dedicadas', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/30' },
  ];

  const consolidatedStats = [
    {
      icon: Calendar,
      label: 'Dias',
      value: consolidated ? consolidated.daysWithReports : 0,
      sub: `de ${daysInPeriod}`,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/30',
    },
    {
      icon: TrendingUp,
      label: 'Cumplimiento',
      value: `${compliance}%`,
      sub: 'del periodo',
      color: compliance >= thresholdPct ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400',
      bg: compliance >= thresholdPct ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-amber-50 dark:bg-amber-900/30',
    },
    {
      icon: Activity,
      label: 'Actividades',
      value: consolidated?.totals?.totalActivities ?? 0,
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
    <div className="max-w-[1000px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate('/admin/pastores')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400 dark:text-slate-500" />
        </button>
        {pastor && (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">
              {getInitials(pastor.name)}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {pastor.name}
              </h2>
              <p className="text-xs text-gray-400 dark:text-slate-500">{pastor.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'reports'
              ? 'bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Informes
          </span>
        </button>
        <button
          onClick={() => setActiveTab('consolidated')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'consolidated'
              ? 'bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" /> Consolidado
          </span>
        </button>
      </div>

      {/* Period / Month nav (depends on tab) */}
      {activeTab === 'reports' ? (
        <div className="flex items-center gap-3 mb-5">
          <button
            aria-label="Mes anterior"
            onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-slate-400" />
          </button>
          <span className="text-sm font-medium text-gray-900 dark:text-white px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900">
            {monthLabel}
          </span>
          <button
            aria-label="Mes siguiente"
            onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-500 dark:text-slate-400" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 mb-5">
          <button
            aria-label="Periodo anterior"
            onClick={() => setPeriodOffset((o) => o - 1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-slate-400" />
          </button>
          <span className="text-sm font-medium text-gray-900 dark:text-white px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 min-w-[200px] text-center">
            {periodLabel}
          </span>
          <button
            aria-label="Periodo siguiente"
            onClick={() => setPeriodOffset((o) => Math.min(0, o + 1))}
            disabled={periodOffset >= 0}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4 text-gray-500 dark:text-slate-400" />
          </button>
        </div>
      )}

      {/* ── TAB: INFORMES ── */}
      {activeTab === 'reports' && (
        <>
          {/* Stats */}
          {loadingReports && reports.length === 0 ? (
            <div className="grid grid-cols-3 gap-3 mb-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4 animate-pulse">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-slate-700" />
                    <div className="h-3 w-16 rounded bg-gray-200 dark:bg-slate-700" />
                  </div>
                  <div className="h-6 w-20 rounded bg-gray-200 dark:bg-slate-700 mb-1.5" />
                  <div className="h-3 w-12 rounded bg-gray-200 dark:bg-slate-700" />
                </div>
              ))}
            </div>
          ) : (
          <div className="grid grid-cols-3 gap-3 mb-5">
            {reportStats.map((s, i) => (
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
                  return (
                    <div key={`empty-${i}`} className="min-h-[56px] sm:min-h-[80px] bg-gray-50 dark:bg-slate-950" />
                  );
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
                      report &&
                      navigate(`/admin/pastor/${pastorId}/report/${dateStr}`)
                    }
                    className={`min-h-[56px] sm:min-h-[80px] bg-white dark:bg-slate-900 p-1.5 sm:p-2 transition-all relative
                      ${isToday ? 'bg-indigo-50/60 dark:bg-indigo-900/20' : ''}
                      ${isFuture ? 'opacity-30' : ''}
                      ${report ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800' : 'cursor-default'}
                    `}
                  >
                    <span
                      className={`text-xs sm:text-sm font-medium inline-flex items-center justify-center ${
                        isToday
                          ? 'w-6 h-6 sm:w-7 sm:h-7 bg-indigo-600 text-white rounded-full text-[11px] sm:text-xs'
                          : report
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-400 dark:text-slate-500'
                      }`}
                    >
                      {day}
                    </span>
                    {report && (
                      <>
                        <div className="hidden sm:block mt-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md inline-flex items-center gap-1 font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            {actCount} act.
                          </span>
                        </div>
                        <div className="sm:hidden flex justify-center mt-1">
                          <span className="w-2 h-2 rounded-full bg-indigo-500" />
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
                  onClick={() =>
                    navigate(`/admin/pastor/${pastorId}/report/${r.date}`)
                  }
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
        </>
      )}

      {/* ── TAB: CONSOLIDADO ── */}
      {activeTab === 'consolidated' && (
        <>
          {/* Header con botones de descarga */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs text-gray-400 dark:text-slate-500">
              Resumen de actividades del pastor para {monthLabel}
            </p>
            <div className="flex items-center gap-2">
              <Tooltip
                content={!consolidated ? 'Sin datos para exportar' : 'Exportar como PDF'}
                side="bottom"
              >
                <button
                  onClick={handleExportPDF}
                  disabled={!consolidated}
                  className="px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
              </Tooltip>
              <Tooltip
                content={!consolidated ? 'Sin datos para exportar' : 'Exportar como Excel'}
                side="bottom"
              >
                <button
                  onClick={handleExportExcel}
                  disabled={!consolidated}
                  className="px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Stats consolidado */}
          {loadingConsolidated && !consolidated ? (
            <StatsGridSkeleton count={4} />
          ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {consolidatedStats.map((s, i) => (
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

          {loadingConsolidated && !consolidated && <BarChartSkeleton rows={4} />}

          {/* Empty state */}
          {consolidated && (!consolidated.categories?.length ||
            consolidated.categories.every(
              (cat) => (cat.subcategories ?? []).reduce((s, sub) => s + sub.totalQuantity, 0) === 0,
            )) && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
              <EmptyState
                compact
                icon={BarChart3}
                title="Sin actividades este mes"
                description="Este pastor no ha registrado actividades para este periodo."
              />
            </div>
          )}

          {/* Categories breakdown */}
          {consolidated?.categories?.map((cat) => {
            const isExpanded = expandedCategories[cat.categoryId] !== false;
            const subs = Array.isArray(cat.subcategories) ? cat.subcategories : [];
            const totalQty = subs.reduce((s, sub) => s + sub.totalQuantity, 0);
            const totalHrs = subs.reduce((s, sub) => s + sub.totalHours, 0);
            const activeSubs = subs.filter((s) => s.totalQuantity > 0).length;

            if (totalQty === 0) return null;

            return (
              <div
                key={cat.categoryId}
                className="mb-3 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedCategories((p) => ({
                      ...p,
                      [cat.categoryId]: p[cat.categoryId] === false,
                    }))
                  }
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <div className="text-left">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {cat.categoryName}
                      </h3>
                      <p className="text-[11px] text-gray-400 dark:text-slate-500">
                        {totalQty} total · {activeSubs} activas
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gray-100 dark:border-slate-800">
                        <div
                          className="hidden sm:grid px-5 py-2 bg-gray-50 dark:bg-slate-950 text-[11px] font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider"
                          style={{ gridTemplateColumns: '2fr 1fr 1fr' }}
                        >
                          <span>Subcategoria</span>
                          <span className="text-right">Cantidad</span>
                          <span className="text-right">Horas</span>
                        </div>

                        {subs.map((sub) => {
                          if (sub.totalQuantity === 0) return null;
                          return (
                            <div
                              key={sub.subcategoryId}
                              className="px-5 py-3 border-t border-gray-50 dark:border-slate-800"
                            >
                              <div
                                className="hidden sm:grid items-center"
                                style={{ gridTemplateColumns: '2fr 1fr 1fr' }}
                              >
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {sub.subcategoryName}
                                  </p>
                                  <p className="text-[10px] text-gray-400 dark:text-slate-500 italic">
                                    {sub.unit}
                                  </p>
                                </div>
                                <p className="text-sm text-right text-gray-900 dark:text-white font-medium">
                                  {sub.totalQuantity}{' '}
                                  <span className="text-[10px] text-gray-400 dark:text-slate-500 font-normal">
                                    {UNIT_LABELS[sub.unit] || sub.unit}
                                  </span>
                                </p>
                                <p className="text-sm text-right text-gray-400 dark:text-slate-500">
                                  {sub.totalHours > 0 ? `${sub.totalHours.toFixed(1)}h` : '\u2014'}
                                </p>
                              </div>
                              <div className="sm:hidden">
                                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                  {sub.subcategoryName}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <span className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white font-medium px-2 py-0.5 rounded-md">
                                    {sub.totalQuantity} {UNIT_LABELS[sub.unit] || sub.unit}
                                  </span>
                                  {sub.totalHours > 0 && (
                                    <span className="text-xs bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-md">
                                      {sub.totalHours.toFixed(1)}h
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        <div className="px-5 py-3 border-t-2 border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
                          <div
                            className="hidden sm:grid items-center"
                            style={{ gridTemplateColumns: '2fr 1fr 1fr' }}
                          >
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">Total</p>
                            <p className="text-sm text-right font-semibold text-gray-900 dark:text-white">
                              {totalQty}
                            </p>
                            <p className="text-sm text-right text-gray-500 dark:text-slate-400">
                              {totalHrs > 0 ? `${totalHrs.toFixed(1)}h` : '\u2014'}
                            </p>
                          </div>
                          <div className="sm:hidden flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">Total</p>
                            <span className="text-xs font-semibold text-gray-900 dark:text-white bg-gray-200 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                              {totalQty}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
