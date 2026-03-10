import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUnionConsolidated } from '@/features/consolidated/presentation/hooks/use-consolidated-queries';
import { formatMonthYear } from '@/lib/format-date';
import {
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Building2,
  Users,
  Activity,
  Clock,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { exportUnionConsolidatedPDF, exportUnionConsolidatedExcel } from '@/lib/export-utils';

export default function SuperAdminConsolidatedPage() {
  const { token, currentUser } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthLabel = formatMonthYear(currentMonth);

  const { data: unionData } = useUnionConsolidated(
    token ?? '',
    currentUser?.unionId ?? '',
    month + 1,
    year,
  );

  const assocSummaries = unionData?.associationSummaries ?? [];

  const stats = [
    { icon: Building2, label: 'Asociaciones', value: unionData?.totalAssociations ?? 0, sub: 'en la union', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30' },
    { icon: Users, label: 'Pastores', value: unionData?.totalPastors ?? 0, sub: 'activos', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { icon: Activity, label: 'Actividades', value: unionData?.totalActivities ?? 0, sub: 'registradas', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/30' },
    { icon: Clock, label: 'Horas', value: `${(unionData?.totalHours ?? 0).toFixed(0)}h`, sub: 'dedicadas', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/30' },
  ];

  const handleExportPDF = async () => {
    if (!unionData) return;
    try {
      await exportUnionConsolidatedPDF(unionData, monthLabel, currentUser?.unionName ?? 'Union');
      toast.success('PDF generado correctamente');
    } catch {
      toast.error('Error al generar PDF');
    }
  };

  const handleExportExcel = async () => {
    if (!unionData) return;
    try {
      await exportUnionConsolidatedExcel(unionData, monthLabel, currentUser?.unionName ?? 'Union');
      toast.success('Excel generado correctamente');
    } catch {
      toast.error('Error al generar Excel');
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Consolidado de Union
          </h2>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
            Resumen consolidado de todas las asociaciones
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            disabled={!unionData}
            className="px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
          <button
            onClick={handleExportExcel}
            disabled={!unionData}
            className="px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
          </button>
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
          {monthLabel}
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
            <div className={`w-7 h-7 ${s.bg} rounded-lg flex items-center justify-center mb-2`}>
              <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
            </div>
            <p className={`text-lg font-semibold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-500">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Association summaries table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Resumen por Asociacion
          </h3>
        </div>
        {/* Desktop header */}
        <div
          className="hidden sm:grid px-5 py-2 bg-gray-50 dark:bg-slate-800/50 text-[11px] font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider"
          style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr' }}
        >
          <span>Asociacion</span>
          <span className="text-right">Pastores</span>
          <span className="text-right">Actividades</span>
          <span className="text-right">Horas</span>
          <span className="text-right">Cumplimiento</span>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-slate-800">
          {assocSummaries.map((assoc) => {
            const compliance = Math.round(assoc.avgCompliance * 100);
            return (
              <div key={assoc.associationId} className="px-5 py-3.5">
                {/* Desktop */}
                <div className="hidden sm:grid items-center" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr' }}>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{assoc.associationName}</p>
                  <p className="text-sm text-right text-gray-900 dark:text-white font-medium">{assoc.totalPastors}</p>
                  <p className="text-sm text-right text-gray-900 dark:text-white">{assoc.totalActivities}</p>
                  <p className="text-sm text-right text-gray-400 dark:text-slate-500">{assoc.totalHours.toFixed(0)}h</p>
                  <div className="flex justify-end">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                      compliance >= 70
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>{compliance}%</span>
                  </div>
                </div>
                {/* Mobile */}
                <div className="sm:hidden">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{assoc.associationName}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white font-medium px-2 py-0.5 rounded-md">{assoc.totalPastors} pastores</span>
                    <span className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white px-2 py-0.5 rounded-md">{assoc.totalActivities} act.</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                      compliance >= 70
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>{compliance}%</span>
                  </div>
                </div>
              </div>
            );
          })}
          {assocSummaries.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-gray-400 dark:text-slate-500">
              Sin datos para este periodo
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
