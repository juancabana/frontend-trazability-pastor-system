import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { useAssociationConsolidated } from '@/features/consolidated/presentation/hooks/use-consolidated-queries';
import { useAssociationsByUnion } from '@/features/association/presentation/hooks/use-association-queries';
import { formatMonthYear } from '@/lib/format-date';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Users,
  Activity,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  ChevronRight as GoIcon,
} from 'lucide-react';
import { motion } from 'motion/react';

export default function SuperAdminAssociationDetailPage() {
  const { associationId } = useParams<{ associationId: string }>();
  const navigate = useNavigate();
  const { token, currentUser } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const { data: associations = [] } = useAssociationsByUnion(currentUser?.unionId ?? undefined);
  const assoc = associations.find((a) => a.id === associationId);

  const { data: consolidated } = useAssociationConsolidated(
    token ?? '',
    associationId ?? '',
    month + 1,
    year,
  );

  const pastorSummaries = consolidated?.pastorSummaries ?? [];
  const totalActivities = consolidated?.totals?.totalActivities ?? 0;
  const totalHours = consolidated?.totals?.totalHours ?? 0;

  const getInitials = (name: string) =>
    name.split(' ').filter((w) => w.length > 2).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  const categoryBreakdown = useMemo(() => {
    if (!consolidated?.categories) return [];
    return consolidated.categories.map((c) => ({
      id: c.categoryId,
      name: c.categoryName,
      color: c.color,
      value: (Array.isArray(c.subcategories) ? c.subcategories : []).reduce((s, sub) => s + sub.totalQuantity, 0),
    }));
  }, [consolidated]);
  const maxVal = Math.max(...categoryBreakdown.map((c) => c.value), 1);

  const stats = [
    { icon: Users, label: 'Pastores', value: pastorSummaries.length, sub: 'activos', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30' },
    { icon: FileText, label: 'Informes', value: pastorSummaries.reduce((s, p) => s + Math.round(p.compliance * daysInMonth), 0), sub: 'este mes', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { icon: Activity, label: 'Actividades', value: totalActivities, sub: 'registradas', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/30' },
    { icon: Clock, label: 'Horas', value: `${totalHours.toFixed(0)}h`, sub: 'dedicadas', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/30' },
  ];

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate('/super-admin/associations')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400 dark:text-slate-500" />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {assoc?.name ?? 'Asociacion'}
          </h2>
          <p className="text-xs text-gray-400 dark:text-slate-500">Detalle de la asociacion</p>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pastors list */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Pastores — {formatMonthYear(currentMonth)}
            </h3>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-slate-800">
            {pastorSummaries.map((ps) => {
              const cumplimiento = Math.round(ps.compliance * 100);
              return (
                <button
                  key={ps.pastorId}
                  onClick={() => navigate(`/super-admin/pastor/${ps.pastorId}`)}
                  className="w-full px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left group"
                >
                  <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-xs font-semibold text-purple-600 dark:text-purple-400 shrink-0">
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
                    {cumplimiento >= 70 ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                    )}
                    <GoIcon className="w-4 h-4 text-gray-300 dark:text-slate-600 group-hover:text-gray-500 dark:group-hover:text-slate-400 transition-colors" />
                  </div>
                </button>
              );
            })}
            {pastorSummaries.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-gray-400 dark:text-slate-500">
                No hay datos para este periodo
              </div>
            )}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Rubros del Mes
            </h3>
          </div>
          <div className="p-5 space-y-4">
            {categoryBreakdown.map((cat) => {
              const pct = (cat.value / maxVal) * 100;
              return (
                <div key={cat.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-xs font-medium text-gray-600 dark:text-slate-400">{cat.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">{cat.value}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="h-2 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              );
            })}
            {categoryBreakdown.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-4">Sin datos</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
