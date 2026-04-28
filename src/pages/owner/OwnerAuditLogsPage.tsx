import { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { useAuditLogs } from '@/features/audit-log/presentation/hooks/use-audit-log-queries';
import type { AuditLogFilters } from '@/features/audit-log/domain/entities/audit-log';
import { ROLE_CONFIG } from '@/features/auth/domain/entities/user-role';
import type { UserRole } from '@/features/auth/domain/entities/user-role';

// ─── Badges ──────────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const cfg = ROLE_CONFIG[role as UserRole];
  if (!cfg) return <span className="text-xs text-gray-400">{role}</span>;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color} dark:bg-opacity-20`}>
      {cfg.label}
    </span>
  );
}

function EventTypeBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    login: { label: 'Login', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    login_failed: { label: 'Login fallido', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    http_request: { label: 'Solicitud', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  };
  const cfg = map[type] ?? { label: type, cls: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function StatusBadge({ code }: { code: number }) {
  const cls =
    code >= 500 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    : code >= 400 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium font-mono ${cls}`}>
      {code}
    </span>
  );
}

function MethodBadge({ method }: { method: string }) {
  const map: Record<string, string> = {
    GET: 'text-blue-600 dark:text-blue-400',
    POST: 'text-green-600 dark:text-green-400',
    PATCH: 'text-amber-600 dark:text-amber-400',
    DELETE: 'text-red-600 dark:text-red-400',
  };
  return (
    <span className={`text-xs font-bold font-mono ${map[method] ?? 'text-gray-500'}`}>
      {method}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const EVENT_TYPES = [
  { value: '', label: 'Todos los eventos' },
  { value: 'http_request', label: 'Solicitudes HTTP' },
  { value: 'login', label: 'Logins exitosos' },
  { value: 'login_failed', label: 'Logins fallidos' },
];

const LIMIT = 50;

export default function OwnerAuditLogsPage() {
  const [filters, setFilters] = useState<AuditLogFilters>({ page: 1, limit: LIMIT });
  const [userIdInput, setUserIdInput] = useState('');

  const { data, isLoading, isFetching } = useAuditLogs(filters);

  const setPage = (p: number) => setFilters((f) => ({ ...f, page: p }));

  const applyUserId = () => {
    setFilters((f) => ({ ...f, userId: userIdInput.trim() || undefined, page: 1 }));
  };

  const clearUserId = () => {
    setUserIdInput('');
    setFilters((f) => ({ ...f, userId: undefined, page: 1 }));
  };

  const totalPages = data?.totalPages ?? 1;
  const currentPage = filters.page ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Registros de Auditoría</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Actividad de administradores y accesos al sistema
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4 flex flex-wrap gap-3 items-end">
        {/* Tipo de evento */}
        <div className="flex flex-col gap-1 min-w-[180px]">
          <label className="text-xs font-medium text-gray-500 dark:text-slate-400">Tipo de evento</label>
          <select
            value={filters.eventType ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, eventType: e.target.value || undefined, page: 1 }))}
            className="text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Desde */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-slate-400">Desde</label>
          <input
            type="date"
            value={filters.from ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value || undefined, page: 1 }))}
            className="text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Hasta */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-slate-400">Hasta</label>
          <input
            type="date"
            value={filters.to ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value || undefined, page: 1 }))}
            className="text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Buscar por userId */}
        <div className="flex flex-col gap-1 flex-1 min-w-[220px]">
          <label className="text-xs font-medium text-gray-500 dark:text-slate-400">ID de usuario</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyUserId()}
              placeholder="UUID del usuario..."
              className="flex-1 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              onClick={applyUserId}
              className="p-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-colors"
              title="Buscar"
            >
              <Search className="w-4 h-4" />
            </button>
            {filters.userId && (
              <button
                onClick={clearUserId}
                className="p-2 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-400 hover:text-red-500 transition-colors"
                title="Limpiar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
        {/* Contador */}
        <div className="px-5 py-3 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-gray-400 dark:text-slate-500">
            {isLoading ? 'Cargando...' : `${data?.total ?? 0} registros totales`}
          </span>
          {isFetching && !isLoading && (
            <span className="text-xs text-amber-500 animate-pulse">Actualizando…</span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Usuario</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Rol</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Evento</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Acción</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">IP</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Fecha / Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400 dark:text-slate-500">
                    No hay registros para los filtros seleccionados
                  </td>
                </tr>
              ) : (
                data?.data.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white text-xs">{log.userName}</div>
                      <div className="text-[10px] text-gray-400 dark:text-slate-500 font-mono truncate max-w-[140px]">{log.userId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={log.userRole} />
                    </td>
                    <td className="px-4 py-3">
                      <EventTypeBadge type={log.eventType} />
                    </td>
                    <td className="px-4 py-3 max-w-[260px]">
                      <div className="flex items-center gap-1.5">
                        <MethodBadge method={log.httpMethod} />
                        <span className="text-xs text-gray-500 dark:text-slate-400 font-mono truncate" title={log.endpoint}>
                          {log.endpoint}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge code={log.statusCode} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-gray-500 dark:text-slate-400">{log.ipAddress}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-xs text-gray-700 dark:text-slate-300">
                        {new Date(log.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-[10px] text-gray-400 dark:text-slate-500 font-mono">
                        {new Date(log.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {!isLoading && totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-gray-400 dark:text-slate-500">
              Página {currentPage} de {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
