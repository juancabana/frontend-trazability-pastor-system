import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { useAssociationsByUnion } from '@/features/association/presentation/hooks/use-association-queries';
import {
  Building2,
  Search,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Skeleton } from '@/components/atoms/Skeleton';

export default function SuperAdminAssociationsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: associations = [], isLoading: loadingAssociations } = useAssociationsByUnion(currentUser?.unionId ?? undefined);

  const filtered = useMemo(
    () =>
      associations.filter((a) =>
        a.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [associations, search],
  );

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Asociaciones
        </h2>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
          Todas las asociaciones de tu union
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
        <input
          type="text"
          placeholder="Buscar asociacion..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 rounded-xl text-sm border border-gray-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-400 outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 transition-colors"
        />
      </div>

      {/* List */}
      {loadingAssociations && associations.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4 flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="w-4 h-4 rounded" />
            </div>
          ))}
        </div>
      ) : (
      <div className="space-y-3">
        {filtered.map((assoc, i) => (
          <motion.button
            key={assoc.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => navigate(`/super-admin/association/${assoc.id}`)}
            className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4 flex items-center gap-4 hover:shadow-md dark:hover:border-slate-700 transition-all text-left group"
          >
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {assoc.name}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-slate-500">
                {assoc.country} · Cierre dia {assoc.reportDeadlineDay}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-600 group-hover:text-gray-500 dark:group-hover:text-slate-400 transition-colors shrink-0" />
          </motion.button>
        ))}
        {filtered.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-8 text-center text-sm text-gray-400 dark:text-slate-500">
            No se encontraron asociaciones
          </div>
        )}
      </div>
      )}
    </div>
  );
}
