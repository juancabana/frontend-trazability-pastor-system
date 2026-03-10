import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { useReportByDate } from '@/features/daily-report/presentation/hooks/use-daily-report-queries';
import { useSaveReport, useDeleteReport } from '@/features/daily-report/presentation/hooks/use-daily-report-mutations';
import { useActivityCategories } from '@/features/activity-category/presentation/hooks/use-activity-category-queries';
import type { ActivityEntry } from '@/features/daily-report/domain/entities/daily-report';
import { formatDate, isDateEditable } from '@/lib/format-date';
import { UNIT_LABELS } from '@/constants/shared';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Save,
  Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function PastorReportEditPage() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const { token, currentUser } = useAuth();
  const deadlineDay = 19;

  const reportDate = date ? new Date(date + 'T12:00:00') : new Date();
  const editable = isDateEditable(reportDate, deadlineDay);
  const isFuture = reportDate > new Date();

  const { data: existingReport } = useReportByDate(
    token ?? '',
    currentUser?.id ?? '',
    date ?? '',
  );
  const { data: categories = [] } = useActivityCategories();
  const saveReport = useSaveReport();
  const deleteReport = useDeleteReport();

  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [observations, setObservations] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (existingReport && !initialized) {
      setActivities(existingReport.activities || []);
      setObservations(existingReport.observations || '');
      setInitialized(true);
    }
  }, [existingReport, initialized]);

  useEffect(() => {
    if (isFuture) navigate('/pastor', { replace: true });
  }, [isFuture, navigate]);

  const categoriesMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const addActivity = (categoryId: string, subcategoryId: string) => {
    const cat = categoriesMap.get(categoryId);
    const sub = cat?.subcategories.find((s) => s.id === subcategoryId);
    if (!sub || activities.some((a) => a.subcategoryId === subcategoryId)) return;
    const isTransport = categoryId === 'transporte';
    setActivities((prev) => [
      ...prev,
      {
        subcategoryId,
        categoryId,
        description: '',
        quantity: 1,
        hours: sub.hasHours ? 1 : undefined,
        amount: isTransport ? 0 : undefined,
      },
    ]);
  };

  const removeActivity = (subcategoryId: string) => {
    setActivities((prev) => prev.filter((a) => a.subcategoryId !== subcategoryId));
  };

  const updateActivity = (subcategoryId: string, field: string, value: string | number) => {
    setActivities((prev) =>
      prev.map((a) =>
        a.subcategoryId === subcategoryId ? { ...a, [field]: value } : a,
      ),
    );
  };

  const handleSave = async () => {
    if (!date || !token) return;
    setSaving(true);
    try {
      await saveReport.mutateAsync({
        token,
        data: { date, activities, observations: observations || undefined },
      });
      toast.success('Informe guardado correctamente');
      navigate('/pastor');
    } catch {
      toast.error('Error al guardar el informe');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!existingReport || !token) return;
    try {
      await deleteReport.mutateAsync({ token, id: existingReport.id });
      toast.success('Informe eliminado');
      navigate('/pastor');
    } catch {
      toast.error('Error al eliminar el informe');
    }
  };

  const activitiesByCategory: Record<string, ActivityEntry[]> = {};
  activities.forEach((a) => {
    if (!activitiesByCategory[a.categoryId]) activitiesByCategory[a.categoryId] = [];
    activitiesByCategory[a.categoryId].push(a);
  });

  if (isFuture) return null;

  return (
    <div className="max-w-[700px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate('/pastor')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400 dark:text-slate-500" />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {existingReport ? 'Editar Informe' : 'Nuevo Informe'}
          </h2>
          <p className="text-xs text-gray-400 dark:text-slate-500">{formatDate(reportDate)}</p>
        </div>
        {existingReport && editable && (
          <button
            onClick={handleDelete}
            className="ml-auto p-2 text-gray-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
            title="Eliminar informe"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {!editable && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-5 flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Solo lectura</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">Periodo cerrado.</p>
          </div>
        </div>
      )}

      {/* Current activities grouped by category */}
      <AnimatePresence mode="popLayout">
        {Object.entries(activitiesByCategory).map(([catId, acts]) => {
          const cat = categoriesMap.get(catId);
          if (!cat) return null;
          return (
            <motion.div
              key={catId}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden"
            >
              <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100 dark:border-slate-800">
                <div
                  className="w-1.5 h-6 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{cat.name}</h3>
                <span className="text-[11px] font-medium text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                  {acts.length}
                </span>
              </div>

              <div className="divide-y divide-gray-50 dark:divide-slate-800">
                {acts.map((act) => {
                  const sub = cat.subcategories.find(
                    (s) => s.id === act.subcategoryId,
                  );
                  if (!sub) return null;
                  const isTransport = act.categoryId === 'transporte';

                  return (
                    <div key={act.subcategoryId} className="px-5 py-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {sub.name}
                          </p>
                          {sub.description && (
                            <p className="text-[11px] text-gray-400 dark:text-slate-500">
                              {sub.description}
                            </p>
                          )}
                        </div>
                        {editable && (
                          <button
                            onClick={() => removeActivity(act.subcategoryId)}
                            className="p-1.5 text-gray-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {editable ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={act.description}
                            onChange={(e) =>
                              updateActivity(
                                act.subcategoryId,
                                'description',
                                e.target.value,
                              )
                            }
                            placeholder="Descripcion (opcional)..."
                            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-950 rounded-xl text-sm border border-transparent focus:border-teal-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 transition-colors"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-medium text-gray-400 dark:text-slate-500 mb-1 block uppercase tracking-wide">
                                {UNIT_LABELS[sub.unit] || 'Cantidad'}
                              </label>
                              <input
                                type="number"
                                min="0"
                                step={sub.unit === 'horas' ? '0.5' : '1'}
                                value={act.quantity}
                                onChange={(e) =>
                                  updateActivity(
                                    act.subcategoryId,
                                    'quantity',
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-950 rounded-xl text-sm border border-transparent focus:border-teal-500 outline-none text-gray-900 dark:text-white transition-colors"
                              />
                            </div>
                            {sub.hasHours && (
                              <div>
                                <label className="text-[11px] font-medium text-gray-400 dark:text-slate-500 mb-1 block uppercase tracking-wide">
                                  Horas
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  value={act.hours || 0}
                                  onChange={(e) =>
                                    updateActivity(
                                      act.subcategoryId,
                                      'hours',
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-950 rounded-xl text-sm border border-transparent focus:border-teal-500 outline-none text-gray-900 dark:text-white transition-colors"
                                />
                              </div>
                            )}
                          </div>

                          {isTransport && (
                            <div>
                              <label className="text-[11px] font-medium text-gray-400 dark:text-slate-500 mb-1 block uppercase tracking-wide">
                                Gasto COP
                              </label>
                              <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-slate-500 font-medium">
                                  $
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  step="100"
                                  value={act.amount || 0}
                                  onChange={(e) =>
                                    updateActivity(
                                      act.subcategoryId,
                                      'amount',
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className="w-full pl-8 pr-3.5 py-2.5 bg-gray-50 dark:bg-slate-950 rounded-xl text-sm border border-transparent focus:border-emerald-500 outline-none text-gray-900 dark:text-white transition-colors"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {act.description && (
                            <span className="text-sm text-gray-500 dark:text-slate-400">
                              {act.description}
                            </span>
                          )}
                          <span className="text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 px-2 py-1 rounded-lg">
                            {act.quantity} {sub.unit}
                          </span>
                          {act.hours != null && act.hours > 0 && (
                            <span className="text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 px-2 py-1 rounded-lg">
                              {act.hours}h
                            </span>
                          )}
                          {isTransport && act.amount != null && act.amount > 0 && (
                            <span className="text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-lg">
                              ${act.amount.toLocaleString('es-CO')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Add activity accordion */}
      {editable && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 mb-4">
          <div className="px-5 py-3.5 border-b border-gray-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-6 h-6 bg-teal-50 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              </div>
              Agregar Actividad
            </h3>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-slate-800">
            {categories.map((cat) => {
              const isExpanded = expandedCategories[cat.id];
              return (
                <div key={cat.id}>
                  <button
                    onClick={() => toggleCategory(cat.id)}
                    className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                        {cat.name}
                      </span>
                      <span className="text-[11px] text-gray-400 dark:text-slate-500">
                        ({cat.subcategories.length})
                      </span>
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
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-3 space-y-1">
                          {cat.subcategories.map((sub) => {
                            const isAdded = activities.some(
                              (a) => a.subcategoryId === sub.id,
                            );
                            return (
                              <button
                                key={sub.id}
                                onClick={() =>
                                  !isAdded && addActivity(cat.id, sub.id)
                                }
                                disabled={isAdded}
                                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm flex items-center justify-between transition-all ${
                                  isAdded
                                    ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 cursor-default'
                                    : 'hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400'
                                }`}
                              >
                                <span>{sub.name}</span>
                                {isAdded ? (
                                  <span className="text-[11px] font-medium text-teal-500">
                                    Agregado
                                  </span>
                                ) : (
                                  <Plus className="w-4 h-4 text-gray-300 dark:text-slate-600" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Observations */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 mb-5">
        <div className="px-5 py-3.5 border-b border-gray-100 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Observaciones</h3>
        </div>
        <div className="p-5">
          {editable ? (
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Observaciones adicionales del dia (opcional)..."
              rows={3}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-950 rounded-xl text-sm border border-transparent focus:border-teal-500 outline-none resize-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 transition-colors"
            />
          ) : (
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {observations || 'Sin observaciones'}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      {editable && (
        <div className="flex items-center justify-between mb-8 gap-4">
          <button
            onClick={() => navigate('/pastor')}
            className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || activities.length === 0}
            className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl text-sm font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-teal-600/20 transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar Informe'}
          </button>
        </div>
      )}
    </div>
  );
}
