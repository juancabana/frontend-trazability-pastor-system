import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { useUnionConsolidated } from '@/features/consolidated/presentation/hooks/use-consolidated-queries';
import { useAssociationsByUnion } from '@/features/association/presentation/hooks/use-association-queries';
import { formatMonthYear } from '@/lib/format-date';
import { startOfCurrentMonthBogota } from '@/lib/bogota-time';
import {
  Building2,
  Users,
  Activity,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronRight as GoIcon,
  LayoutDashboard,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useComplianceThresholds } from '@/features/config/hooks/use-business-config';

export default function SuperAdminDashboardPage() {
  const { token, currentUser } = useAuth();
  const { thresholdPct } = useComplianceThresholds();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(() => startOfCurrentMonthBogota());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const { data: unionData } = useUnionConsolidated(
    token ?? '',
    currentUser?.unionId ?? '',
    month + 1,
    year,
  );
  const { data: associations = [] } = useAssociationsByUnion(currentUser?.unionId ?? undefined);

  const stats = [
    { icon: Building2, label: 'Asociaciones', value: unionData?.totalAssociations ?? associations.length, sub: 'registradas', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30' },
    { icon: Users, label: 'Pastores', value: unionData?.totalPastors ?? 0, sub: 'activos', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { icon: Activity, label: 'Actividades', value: unionData?.totalActivities ?? 0, sub: 'registradas', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/30' },
    { icon: Clock, label: 'Horas', value: `${(unionData?.totalHours ?? 0).toFixed(0)}h`, sub: 'dedicadas', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/30' },
  ];

  const assocSummaries = unionData?.associationSummaries ?? [];

  return (
    <div className="max-w-[1100px] mx-auto">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Panel de Union
        </h2>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
          Vista general de todas las asociaciones
        </p>
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

      {/* Association cards */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Asociaciones — {formatMonthYear(currentMonth)}
          </h3>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-slate-800">
          {assocSummaries.map((assoc) => {
            const compliance = Math.round(assoc.avgCompliance * 100);
            return (
              <button
                key={assoc.associationId}
                onClick={() => navigate(`/super-admin/association/${assoc.associationId}`)}
                className="w-full px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left group"
              >
                <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center shrink-0">
                  <Building2 className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {assoc.associationName}
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-slate-500">
                    {assoc.totalPastors} pastores · {assoc.totalActivities} actividades
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-center hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{assoc.totalHours.toFixed(0)}h</p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500">horas</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                      compliance >= thresholdPct
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}
                  >
                    {compliance}%
                  </span>
                  <GoIcon className="w-4 h-4 text-gray-300 dark:text-slate-600 group-hover:text-gray-500 dark:group-hover:text-slate-400 transition-colors" />
                </div>
              </button>
            );
          })}
          {assocSummaries.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-gray-400 dark:text-slate-500">
              No hay datos para este periodo
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
