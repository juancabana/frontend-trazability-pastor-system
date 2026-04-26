import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUsers } from '@/features/auth/presentation/hooks/use-auth-queries';
import { useAssociationConsolidated } from '@/features/consolidated/presentation/hooks/use-consolidated-queries';
import { useActivityCategories } from '@/features/activity-category/presentation/hooks/use-activity-category-queries';
import { ConsolidatedRepositoryApiImpl } from '@/features/consolidated/infra/adapters/consolidated-repository-api-impl';
import { httpAdapter } from '@/shared/infra/adapters/fetch-http-adapter';
import { exportConsolidatedPDF, exportConsolidatedExcel } from '@/lib/export-utils';
import { UNIT_LABELS, PASTOR_POSITION_LABEL } from '@/constants/shared';
import { useComplianceThresholds } from '@/features/config/hooks/use-business-config';
import { Tooltip } from '@/components/atoms/Tooltip';
import { EmptyState } from '@/components/atoms/EmptyState';
import { StatsGridSkeleton, BarChartSkeleton } from '@/components/atoms/Skeleton';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Clock,
  FileText,
  Users,
  Activity,
  Download,
  FileSpreadsheet,
  SlidersHorizontal,
  X,
  Check,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const repo = new ConsolidatedRepositoryApiImpl(httpAdapter);

export default function AdminConsolidatedPage() {
  const { token, currentUser } = useAuth();
  const { thresholdPct } = useComplianceThresholds();
  const [periodOffset, setPeriodOffset] = useState(0);
  const [pastorFilter] = useState('all');
  const [showCustomPanel, setShowCustomPanel] = useState(false);
  const [selectedPastorIds, setSelectedPastorIds] = useState<Set<string>>(new Set());
  const [customExporting, setCustomExporting] = useState<'pdf' | 'excel' | null>(null);

  const { data: users = [] } = useUsers(token ?? '', currentUser?.associationId ?? undefined);
  const { data: consolidated, isLoading: loadingConsolidated } = useAssociationConsolidated(
    token ?? '',
    currentUser?.associationId ?? '',
    periodOffset,
  );
  const { data: allCategories = [] } = useActivityCategories();

  const pastors = useMemo(
    () => users.filter((u) => u.role === 'pastor'),
    [users],
  );

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Reset selection when panel closes or period changes
  useEffect(() => {
    if (!showCustomPanel) setSelectedPastorIds(new Set());
  }, [showCustomPanel]);

  const pastorSummaries = consolidated?.pastorSummaries || [];
  const totalActivities = consolidated?.totals?.totalActivities || 0;
  const totalHours = consolidated?.totals?.totalHours || 0;
  const activePastors = pastorSummaries.filter((p) => p.totalActivities > 0).length;
  const periodLabel = consolidated?.period?.label ?? 'Cargando periodo...';

  const totalReports = pastorSummaries.reduce((s, p) => s + p.totalReports, 0);

  const stats = [
    { icon: FileText, label: 'Informes', value: totalReports, sub: 'recibidos', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { icon: Users, label: 'Pastores', value: `${activePastors}/${pastors.length}`, sub: 'activos', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
    { icon: Activity, label: 'Actividades', value: totalActivities, sub: 'registradas', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/30' },
    { icon: Clock, label: 'Horas', value: `${totalHours.toFixed(0)}h`, sub: 'dedicadas', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/30' },
  ];

  const handleExportPDF = async () => {
    if (!consolidated) return;
    try {
      await exportConsolidatedPDF(consolidated, periodLabel);
      toast.success('PDF generado correctamente');
    } catch {
      toast.error('Error al generar PDF');
    }
  };

  const handleExportExcel = async () => {
    if (!consolidated) return;
    try {
      await exportConsolidatedExcel(consolidated, periodLabel);
      toast.success('Excel generado correctamente');
    } catch {
      toast.error('Error al generar Excel');
    }
  };

  const handleCustomExport = async (format: 'pdf' | 'excel') => {
    if (selectedPastorIds.size === 0) return;
    setCustomExporting(format);
    try {
      const data = await repo.getByPastors(
        token ?? '',
        Array.from(selectedPastorIds),
        periodOffset,
      );
      const customTitle = `Consolidado Personalizado (${selectedPastorIds.size} pastor${selectedPastorIds.size > 1 ? 'es' : ''})`;
      if (format === 'pdf') {
        await exportConsolidatedPDF(data, periodLabel, customTitle);
      } else {
        await exportConsolidatedExcel(data, periodLabel, customTitle);
      }
      toast.success(`${format === 'pdf' ? 'PDF' : 'Excel'} generado correctamente`);
    } catch {
      toast.error(`Error al generar ${format === 'pdf' ? 'PDF' : 'Excel'}`);
    } finally {
      setCustomExporting(null);
    }
  };

  const togglePastor = (id: string) => {
    setSelectedPastorIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedPastorIds(new Set(pastors.map((p) => p.id)));
  const clearAll = () => setSelectedPastorIds(new Set());

  const getInitials = (name: string) =>
    name.split(' ').filter((w) => w.length > 2).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Consolidado General
          </h2>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
            Resumen de actividades de todos los pastores
          </p>
        </div>
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
          <Tooltip content="Descarga personalizada por pastor" side="bottom">
            <button
              onClick={() => setShowCustomPanel((v) => !v)}
              className={`px-3 py-2 border rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 ${
                showCustomPanel
                  ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> Personalizar
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Panel de descarga personalizada */}
      <AnimatePresence>
        {showCustomPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mb-5"
          >
            <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                    Descarga personalizada
                  </p>
                  <p className="text-[11px] text-indigo-500 dark:text-indigo-400 mt-0.5">
                    Selecciona los pastores que deseas incluir en el consolidado
                  </p>
                </div>
                <button
                  onClick={() => setShowCustomPanel(false)}
                  className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-indigo-400" />
                </button>
              </div>

              {/* Acciones rápidas */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={selectAll}
                  className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Seleccionar todos
                </button>
                <span className="text-indigo-300 dark:text-indigo-700">·</span>
                <button
                  onClick={clearAll}
                  className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Limpiar
                </button>
                <span className="text-[11px] text-indigo-400 ml-auto">
                  {selectedPastorIds.size}/{pastors.length} seleccionados
                </span>
              </div>

              {/* Lista de pastores */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-4 max-h-64 overflow-y-auto">
                {pastors.map((pastor) => {
                  const summary = pastorSummaries.find((s) => s.pastorId === pastor.id);
                  const pct = summary ? Math.round(summary.compliance * 100) : null;
                  const isSelected = selectedPastorIds.has(pastor.id);
                  return (
                    <button
                      key={pastor.id}
                      onClick={() => togglePastor(pastor.id)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-indigo-400 dark:border-indigo-600 bg-white dark:bg-indigo-900/20'
                          : 'border-transparent bg-white/60 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900/60'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-500'
                            : 'border-gray-300 dark:border-slate-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                          {pastor.name}
                        </p>
                        {summary && (
                          <p className="text-[10px] text-gray-400 dark:text-slate-500">
                            {summary.totalActivities} act. · {pct}% cumpl.
                          </p>
                        )}
                      </div>
                      {pastor.position && (
                        <span className={`text-[9px] font-medium px-1 py-0.5 rounded shrink-0 ${
                          pastor.position === PASTOR_POSITION_LABEL
                            ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'
                            : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                        }`}>
                          {pastor.position}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Botones de descarga personalizada */}
              <div className="flex items-center gap-2 pt-3 border-t border-indigo-200 dark:border-indigo-800">
                <button
                  onClick={() => handleCustomExport('pdf')}
                  disabled={selectedPastorIds.size === 0 || customExporting !== null}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  {customExporting === 'pdf' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  PDF personalizado
                </button>
                <button
                  onClick={() => handleCustomExport('excel')}
                  disabled={selectedPastorIds.size === 0 || customExporting !== null}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  {customExporting === 'excel' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                  )}
                  Excel personalizado
                </button>
                {selectedPastorIds.size === 0 && (
                  <span className="text-[11px] text-indigo-400 dark:text-indigo-500 ml-1">
                    Selecciona al menos un pastor
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
      {loadingConsolidated && !consolidated ? (
        <StatsGridSkeleton count={4} />
      ) : (
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

      {/* Empty state cuando no hay actividades en ninguna categoría */}
      {consolidated && (!consolidated.categories?.length ||
        consolidated.categories.every(
          (cat) => (cat.subcategories ?? []).reduce((s, sub) => s + sub.totalQuantity, 0) === 0,
        )) && (
        <div className="mb-3 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
          <EmptyState
            compact
            icon={BarChart3}
            title="Sin actividades registradas"
            description="Los pastores aún no han registrado actividades para este periodo."
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
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <div className="text-left">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{cat.categoryName}</h3>
                  <p className="text-[11px] text-gray-400 dark:text-slate-500">{totalQty} total · {activeSubs} activas</p>
                </div>
              </div>
              {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 dark:text-slate-500" /> : <ChevronDown className="w-4 h-4 text-gray-400 dark:text-slate-500" />}
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
                        <div key={sub.subcategoryId} className="px-5 py-3 border-t border-gray-50 dark:border-slate-800">
                          <div className="hidden sm:grid items-center" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{sub.subcategoryName}</p>
                              <p className="text-[10px] text-gray-400 dark:text-slate-500 italic">{sub.unit}</p>
                            </div>
                            <p className="text-sm text-right text-gray-900 dark:text-white font-medium">
                              {sub.totalQuantity} <span className="text-[10px] text-gray-400 dark:text-slate-500 font-normal">{UNIT_LABELS[sub.unit] || sub.unit}</span>
                            </p>
                            <p className="text-sm text-right text-gray-400 dark:text-slate-500">
                              {sub.totalHours > 0 ? `${sub.totalHours.toFixed(1)}h` : '\u2014'}
                            </p>
                          </div>
                          <div className="sm:hidden">
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{sub.subcategoryName}</p>
                            <div className="flex flex-wrap gap-2">
                              <span className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white font-medium px-2 py-0.5 rounded-md">{sub.totalQuantity} {UNIT_LABELS[sub.unit] || sub.unit}</span>
                              {sub.totalHours > 0 && <span className="text-xs bg-orange-50 dark:bg-orange-900/30 text-orange-600 px-2 py-0.5 rounded-md">{sub.totalHours.toFixed(1)}h</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div className="px-5 py-3 border-t-2 border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-950/50">
                      <div className="hidden sm:grid items-center" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Total</p>
                        <p className="text-sm text-right font-semibold text-gray-900 dark:text-white">{totalQty}</p>
                        <p className="text-sm text-right text-gray-500 dark:text-slate-400">{totalHrs > 0 ? `${totalHrs.toFixed(1)}h` : '\u2014'}</p>
                      </div>
                      <div className="sm:hidden flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Total</p>
                        <span className="text-xs font-semibold text-gray-900 dark:text-white bg-gray-200 dark:bg-slate-700 px-2 py-0.5 rounded-md">{totalQty}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Pastor summaries */}
      <div className="mt-5 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Resumen por Pastor
          </h3>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-slate-800">
          {pastorSummaries.map((ps) => {
            const cumplimiento = Math.round(ps.compliance * 100);
            return (
              <div key={ps.pastorId} className="px-5 py-3.5 flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">
                  {getInitials(ps.pastorName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{ps.pastorName}</p>
                    {ps.position && (
                      <span className={`text-[9px] font-medium px-1 py-0.5 rounded shrink-0 ${
                        ps.position === PASTOR_POSITION_LABEL
                          ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'
                          : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                      }`}>
                        {ps.position}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 dark:text-slate-500">{ps.districtName || 'Sin distrito'}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-center hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{ps.totalActivities}</p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500">act.</p>
                  </div>
                  <div className="text-center hidden md:block">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{ps.totalHours.toFixed(0)}h</p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500">horas</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                      cumplimiento >= thresholdPct
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {cumplimiento}%
                  </span>
                </div>
              </div>
            );
          })}
          {pastorSummaries.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-gray-400 dark:text-slate-500">
              Sin datos para este periodo
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
