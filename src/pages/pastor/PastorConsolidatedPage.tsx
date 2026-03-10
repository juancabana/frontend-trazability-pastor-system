import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePastorConsolidated } from '@/features/consolidated/presentation/hooks/use-consolidated-queries';
import { useActivityCategories } from '@/features/activity-category/presentation/hooks/use-activity-category-queries';
import { formatMonthYear } from '@/lib/format-date';
import { UNIT_LABELS } from '@/constants/shared';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PastorConsolidatedPage() {
  const { token, currentUser } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const { data: consolidated } = usePastorConsolidated(
    token ?? '',
    currentUser?.id ?? '',
    month + 1,
    year,
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
  const totalHours = consolidated?.totals?.totalHours || 0;

  const stats = [
    {
      icon: Calendar,
      label: 'Dias',
      value: compliance > 0 ? Math.round((compliance / 100) * daysInMonth) : 0,
      sub: `de ${daysInMonth}`,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/30',
    },
    {
      icon: TrendingUp,
      label: 'Cumplimiento',
      value: `${compliance}%`,
      sub: 'del mes',
      color: compliance >= 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400',
      bg: compliance >= 70 ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-amber-50 dark:bg-amber-900/30',
    },
    {
      icon: Activity,
      label: 'Registros',
      value: totalActivities,
      sub: 'entradas',
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-900/30',
    },
    {
      icon: DollarSign,
      label: 'Horas',
      value: totalHours.toFixed(1),
      sub: 'totales',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    },
  ];

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-teal-600" /> Mi Consolidado Mensual
        </h2>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
          Resumen personal de actividades por rubro y subcategoria
        </p>
      </div>

      {/* Month nav */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-slate-400" />
        </button>
        <span className="text-sm font-medium text-gray-900 dark:text-white px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900">
          {formatMonthYear(currentMonth)}
        </span>
        <button
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
            className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-3.5 hover:shadow-md transition-all"
          >
            <div
              className={`w-7 h-7 ${s.bg} rounded-lg flex items-center justify-center mb-2`}
            >
              <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
            </div>
            <p className={`text-lg font-semibold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-500">{s.sub}</p>
          </motion.div>
        ))}
      </div>

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
