import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePastorConsolidated } from '@/features/consolidated/presentation/hooks/use-consolidated-queries';
import { useActivityCategories } from '@/features/activity-category/presentation/hooks/use-activity-category-queries';
import { exportPastorPDF, exportPastorExcel } from '@/lib/export-utils';
import { UNIT_LABELS } from '@/constants/shared';
import { useComplianceThresholds } from '@/features/config/hooks/use-business-config';
import { EmptyState } from '@/components/atoms/EmptyState';
import { Tooltip } from '@/components/atoms/Tooltip';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Calendar,
  TrendingUp,
  Activity,
  DollarSign,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function PastorConsolidatedPage() {
  const { token, currentUser } = useAuth();
  const { thresholdPct } = useComplianceThresholds();
  const [periodOffset, setPeriodOffset] = useState(0);

  const { data: consolidated } = usePastorConsolidated(
    token ?? '',
    currentUser?.id ?? '',
    periodOffset,
  );
  const { data: allCategories = [] } = useActivityCategories();

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(allCategories.map((c) => [c.id, true])),
  );

  const categoriesMap = useMemo(
    () => new Map(allCategories.map((c) => [c.id, c])),
    [allCategories],
  );

  const compliance = consolidated?.compliance
    ? Math.round(consolidated.compliance * 100)
    : 0;
  const totalActivities = consolidated?.totals?.totalActivities || 0;
  const totalTransporte = consolidated?.totalTransportAmount || 0;
  const periodLabel = consolidated?.period?.label ?? 'Cargando periodo...';
  const daysInPeriod = consolidated?.daysInPeriod ?? 0;
  const daysWithReports = consolidated?.daysWithReports ?? 0;

  const handleExportPDF = async () => {
    if (!consolidated) return;
    try {
      await exportPastorPDF(consolidated, periodLabel, currentUser?.displayName ?? 'Pastor');
      toast.success('PDF generado correctamente');
    } catch {
      toast.error('Error al generar PDF');
    }
  };

  const handleExportExcel = async () => {
    if (!consolidated) return;
    try {
      await exportPastorExcel(consolidated, periodLabel, currentUser?.displayName ?? 'Pastor');
      toast.success('Excel generado correctamente');
    } catch {
      toast.error('Error al generar Excel');
    }
  };

  const stats = [
    {
      icon: Calendar,
      label: 'Dias',
      value: daysWithReports,
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
    <div className="max-w-[900px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-600" /> Mi Consolidado por Periodo
          </h2>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
            Resumen personal de actividades por rubro y subcategoria
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip content={!consolidated ? 'Sin datos para exportar' : 'Exportar como PDF'} side="bottom">
            <button
              onClick={handleExportPDF}
              disabled={!consolidated}
              className="px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" /> PDF
            </button>
          </Tooltip>
          <Tooltip content={!consolidated ? 'Sin datos para exportar' : 'Exportar como Excel'} side="bottom">
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

      {/* Period nav */}
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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
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

      {/* Empty state cuando no hay actividades en ninguna categoría */}
      {consolidated && (!consolidated.categories?.length ||
        consolidated.categories.every(
          (cat) => (cat.subcategories ?? []).reduce((s, sub) => s + sub.totalQuantity, 0) === 0,
        )) && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
          <EmptyState
            compact
            icon={BarChart3}
            title="Sin actividades este mes"
            description="Cuando registres actividades en tu informe diario, aquí verás el resumen por rubro."
          />
        </div>
      )}

      {/* Categories breakdown */}
      {consolidated?.categories?.map((cat) => {
        const fullCat = categoriesMap.get(cat.categoryId);
        const isExpanded = expandedCategories[cat.categoryId] !== false;
        const subs = Array.isArray(cat.subcategories) ? cat.subcategories : [];
        const activeSubs = subs.filter(
          (s) => s.totalQuantity > 0,
        ).length;
        const totalQty = subs.reduce(
          (s, sub) => s + sub.totalQuantity,
          0,
        );
        const totalHrs = subs.reduce(
          (s, sub) => s + sub.totalHours,
          0,
        );

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
                  [cat.categoryId]: !p[cat.categoryId],
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
                    {/* Desktop header */}
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
                          {/* Desktop */}
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
                              {sub.totalHours > 0
                                ? `${sub.totalHours.toFixed(1)}h`
                                : '\u2014'}
                            </p>
                          </div>
                          {/* Mobile */}
                          <div className="sm:hidden">
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                              {sub.subcategoryName}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <span className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white font-medium px-2 py-0.5 rounded-md">
                                {sub.totalQuantity}{' '}
                                {UNIT_LABELS[sub.unit] || sub.unit}
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

                    {/* Total */}
                    <div className="px-5 py-3 border-t-2 border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
                      <div
                        className="hidden sm:grid items-center"
                        style={{ gridTemplateColumns: '2fr 1fr 1fr' }}
                      >
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          Total
                        </p>
                        <p className="text-sm text-right font-semibold text-gray-900 dark:text-white">
                          {totalQty}
                        </p>
                        <p className="text-sm text-right text-gray-500 dark:text-slate-400">
                          {totalHrs > 0 ? `${totalHrs.toFixed(1)}h` : '\u2014'}
                        </p>
                      </div>
                      <div className="sm:hidden flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          Total
                        </p>
                        <div className="flex gap-2">
                          <span className="text-xs font-semibold text-gray-900 dark:text-white bg-gray-200 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                            {totalQty}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
