import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { useUsers } from '@/features/auth/presentation/hooks/use-auth-queries';
import { useAssociationConsolidated } from '@/features/consolidated/presentation/hooks/use-consolidated-queries';
import { formatMonthYear } from '@/lib/format-date';
import { SearchInput } from '@/components/atoms/SearchInput';
import {
  ChevronLeft,
  ChevronRight,
  ChevronRight as GoIcon,
  Calendar,
  Activity,
  Clock,
} from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminPastoresPage() {
  const { token, currentUser } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const { data: users = [] } = useUsers(token ?? '', currentUser?.associationId);
  const { data: consolidated } = useAssociationConsolidated(
    token ?? '',
    currentUser?.associationId ?? '',
    month + 1,
    year,
  );

  const pastors = useMemo(
    () => users.filter((u) => u.role === 'pastor'),
    [users],
  );

  const pastorSummaries = consolidated?.pastorSummaries || [];

  const filteredPastors = useMemo(() => {
    if (!search) return pastors;
    const q = search.toLowerCase();
    return pastors.filter(
      (p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q),
    );
  }, [pastors, search]);

  const getSummary = (pastorId: string) =>
    pastorSummaries.find((s) => s.pastorId === pastorId);

  const getInitials = (name: string) =>
    name
      .split(' ')
      .filter((w) => w.length > 2)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Pastores</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Lista de pastores de la asociacion
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar pastor..."
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
            className="p-2 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </button>
          <span className="text-sm font-medium text-gray-900 px-3 py-2 border border-gray-200 rounded-xl bg-white whitespace-nowrap">
            {formatMonthYear(currentMonth)}
          </span>
          <button
            onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
            className="p-2 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {filteredPastors.map((pastor, i) => {
            const summary = getSummary(pastor.id);
            return (
              <motion.button
                key={pastor.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/admin/pastor/${pastor.id}`)}
                className="w-full px-5 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left group"
              >
                <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center text-xs font-semibold text-indigo-600 shrink-0">
                  {getInitials(pastor.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {pastor.name}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {pastor.email}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-1 text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">
                      {summary
                        ? `${Math.round(summary.compliance * 100)}%`
                        : '—'}
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 text-gray-400">
                    <Activity className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">
                      {summary?.totalActivities || 0}
                    </span>
                  </div>
                  <div className="hidden md:flex items-center gap-1 text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">
                      {summary?.totalHours?.toFixed(0) || 0}h
                    </span>
                  </div>
                  <GoIcon className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
              </motion.button>
            );
          })}
          {filteredPastors.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-gray-400">
              No se encontraron pastores
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
