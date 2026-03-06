'use client';

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useUsers } from '@/features/auth/presentation/hooks/use-auth-queries';
import { useReportByDate } from '@/features/daily-report/presentation/hooks/use-daily-report-queries';
import { useActivityCategories } from '@/features/activity-category/presentation/hooks/use-activity-category-queries';
import { formatDate } from '@/lib/format-date';
import { ArrowLeft, Shield } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminReportDetailPage() {
  const { pastorId, date } = useParams<{ pastorId: string; date: string }>();
  const router = useRouter();
  const { token, currentUser } = useAuth();

  const reportDate = date ? new Date(date + 'T12:00:00') : new Date();

  const { data: users = [] } = useUsers(token ?? '', currentUser?.associationId);
  const { data: report, isLoading } = useReportByDate(
    token ?? '',
    pastorId ?? '',
    date ?? '',
  );
  const { data: categories = [] } = useActivityCategories();

  const pastor = users.find((u) => u.id === pastorId);
  const categoriesMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  const activitiesByCategory: Record<string, typeof report.activities> = {};
  if (report?.activities) {
    report.activities.forEach((a) => {
      if (!activitiesByCategory[a.categoryId]) activitiesByCategory[a.categoryId] = [];
      activitiesByCategory[a.categoryId].push(a);
    });
  }

  if (isLoading) {
    return (
      <div className="max-w-[700px] mx-auto flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-400 text-sm">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[700px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.push(`/admin/pastor/${pastorId}`)}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900">
            Informe — {pastor?.name || 'Pastor'}
          </h2>
          <p className="text-xs text-gray-400">{formatDate(reportDate)}</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-medium">
          <Shield className="w-3.5 h-3.5" /> Admin
        </div>
      </div>

      {!report ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <p className="text-sm text-gray-400">
            No hay informe para esta fecha
          </p>
        </div>
      ) : (
        <>
          {Object.entries(activitiesByCategory).map(([catId, acts]) => {
            const cat = categoriesMap.get(catId);
            if (!cat) return null;
            return (
              <motion.div
                key={catId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 bg-white rounded-2xl border border-gray-100 overflow-hidden"
              >
                <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100">
                  <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: cat.color }} />
                  <h3 className="text-sm font-semibold text-gray-900">{cat.name}</h3>
                  <span className="text-[11px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg">{acts.length}</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {acts.map((act) => {
                    const sub = cat.subcategories.find((s) => s.id === act.subcategoryId);
                    if (!sub) return null;
                    const isTransport = act.categoryId === 'transporte';
                    return (
                      <div key={act.subcategoryId} className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-900 mb-1">{sub.name}</p>
                        <div className="flex flex-wrap gap-2">
                          {act.description && <span className="text-sm text-gray-500">{act.description}</span>}
                          <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">{act.quantity} {sub.unit}</span>
                          {act.hours != null && act.hours > 0 && <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">{act.hours}h</span>}
                          {isTransport && act.amount != null && act.amount > 0 && (
                            <span className="text-xs font-medium bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg">${act.amount.toLocaleString('es-CO')}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}

          {report.observations && (
            <div className="bg-white rounded-2xl border border-gray-100 mb-5">
              <div className="px-5 py-3.5 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">Observaciones</h3>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-500">{report.observations}</p>
              </div>
            </div>
          )}

          <p className="text-[11px] text-gray-400 text-center mb-8">
            Registrado: {new Date(report.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </>
      )}
    </div>
  );
}
