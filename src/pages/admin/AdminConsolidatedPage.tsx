import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUsers } from '@/features/auth/presentation/hooks/use-auth-queries';
import { useAssociationConsolidated } from '@/features/consolidated/presentation/hooks/use-consolidated-queries';
import { useActivityCategories } from '@/features/activity-category/presentation/hooks/use-activity-category-queries';
import { formatMonthYear } from '@/lib/format-date';
import { exportConsolidatedPDF, exportConsolidatedExcel } from '@/lib/export-utils';
import { UNIT_LABELS } from '@/constants/shared';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function AdminConsolidatedPage() {
  const { token, currentUser } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [pastorFilter, setPastorFilter] = useState('all');

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const { data: users = [] } = useUsers(token ?? '', currentUser?.associationId ?? undefined);
  const { data: consolidated } = useAssociationConsolidated(
    token ?? '',
    currentUser?.associationId ?? '',
    month + 1,
    year,
  );
  const { data: allCategories = [] } = useActivityCategories();

  const pastors = useMemo(
    () => users.filter((u) => u.role === 'pastor'),
    [users],
  );

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const pastorSummaries = consolidated?.pastorSummaries || [];
  const totalActivities = consolidated?.totals?.totalActivities || 0;
  const totalHours = consolidated?.totals?.totalHours || 0;
  const activePastors = pastorSummaries.filter((p) => p.totalActivities > 0).length;
  const monthLabel = formatMonthYear(currentMonth);

  const stats = [
    { icon: FileText, label: 'Informes', value: pastorSummaries.reduce((s, p) => s + Math.round(p.compliance * daysInMonth), 0), sub: 'recibidos', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { icon: Users, label: 'Pastores', value: `${activePastors}/${pastors.length}`, sub: 'activos', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
    { icon: Activity, label: 'Actividades', value: totalActivities, sub: 'registradas', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/30' },
    { icon: Clock, label: 'Horas', value: `${totalHours.toFixed(0)}h`, sub: 'dedicadas', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/30' },
  ];

  const handleExportPDF = async () => {
    if (!consolidated) return;
    try {
      await exportConsolidatedPDF(consolidated, monthLabel);
      toast.success('PDF generado correctamente');
    } catch {
      toast.error('Error al generar PDF');
    }
  };

  const handleExportExcel = async () => {
    if (!consolidated) return;
    try {
      await exportConsolidatedExcel(consolidated, monthLabel);
      toast.success('Excel generado correctamente');
    } catch {
      toast.error('Error al generar Excel');
    }
  };

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
          <button
            onClick={handleExportPDF}
            disabled={!consolidated}
            className="px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
          <button
            onClick={handleExportExcel}
            disabled={!consolidated}
            className="px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
          </button>
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
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{ps.pastorName}</p>
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
                      cumplimiento >= 70
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
