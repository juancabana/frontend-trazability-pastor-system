import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAdminRecipients } from '@/features/consolidated/hooks/use-admin-recipients';
import { SEO } from '@/shared/presentation/SEO';
import { useExtraRecipients } from '@/features/association/hooks/use-extra-recipients';
import { useSendReport } from '@/features/consolidated/hooks/use-send-report';
import { useUsers } from '@/features/auth/presentation/hooks/use-auth-queries';
import { useAssociationConsolidated } from '@/features/consolidated/presentation/hooks/use-consolidated-queries';
import { useFeatureFlags } from '@/features/config/hooks/use-business-config';
import { ROLE_CONFIG } from '@/features/auth/domain/entities/user-role';
import type { ResolvedRecipient } from '@/features/consolidated/domain/entities/send-report';
import {
  Mail,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  Send,
  X,
  Users,
  MailX,
  Globe,
  UserCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Tooltip } from '@/components/atoms/Tooltip';

export default function AdminSendReportPage() {
  const { token, currentUser } = useAuth();
  const { emailEnabled } = useFeatureFlags();

  const [periodOffset, setPeriodOffset] = useState(0);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [selectedExtraIds, setSelectedExtraIds] = useState<Set<string>>(new Set());
  // null = todos los pastores incluidos (por defecto)
  const [selectedPastorIds, setSelectedPastorIds] = useState<Set<string> | null>(null);
  const [pastorSectionOpen, setPastorSectionOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: consolidated } = useAssociationConsolidated(
    token ?? '',
    currentUser?.associationId ?? '',
    periodOffset,
  );
  const periodLabel = consolidated?.period?.label ?? 'Cargando periodo...';

  const { data: systemRecipients = [], isLoading: loadingSystem } =
    useAdminRecipients(token ?? '', currentUser?.associationId ?? null);

  const { data: extraRecipients = [], isLoading: loadingExtras } =
    useExtraRecipients(token ?? '', currentUser?.associationId ?? null);

  const { data: allUsers = [], isLoading: loadingPastors } = useUsers(
    token ?? '',
    currentUser?.associationId ?? '',
  );
  const pastors = useMemo(
    () => allUsers.filter((u) => u.role === 'pastor'),
    [allUsers],
  );

  const { send, progress, reset } = useSendReport();

  // ── Selección de destinatarios ────────────────────────────────────────────
  const toggleUserId = (id: string) =>
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleExtraId = (id: string) =>
    setSelectedExtraIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const selectAll = () => {
    setSelectedUserIds(new Set(systemRecipients.map((r) => r.id)));
    setSelectedExtraIds(new Set(extraRecipients.map((r) => r.id)));
  };
  const clearAll = () => {
    setSelectedUserIds(new Set());
    setSelectedExtraIds(new Set());
  };

  // ── Selección de pastores para adjuntar ───────────────────────────────────
  const allPastorsSelected = selectedPastorIds === null;

  const togglePastor = (id: string) => {
    setSelectedPastorIds((prev) => {
      // Si estaba en modo "todos", convertir a set sin este
      const base = prev === null ? new Set(pastors.map((p) => p.id)) : new Set(prev);
      base.has(id) ? base.delete(id) : base.add(id);
      // Si vuelven a estar todos, volver a null
      if (base.size === pastors.length) return null;
      return base;
    });
  };

  const selectAllPastors = () => setSelectedPastorIds(null);
  const clearAllPastors = () => setSelectedPastorIds(new Set());

  const isPastorSelected = (id: string) =>
    selectedPastorIds === null || selectedPastorIds.has(id);

  const selectedPastorCount = selectedPastorIds === null ? pastors.length : selectedPastorIds.size;

  // ── Totales ────────────────────────────────────────────────────────────────
  const totalSelected = selectedUserIds.size + selectedExtraIds.size;
  const totalRecipients = systemRecipients.length + extraRecipients.length;

  const selectedRecipients = useMemo<ResolvedRecipient[]>(
    () => [
      ...systemRecipients
        .filter((r) => selectedUserIds.has(r.id))
        .map((r) => ({ id: r.id, type: 'user' as const, name: r.name, email: r.email })),
      ...extraRecipients
        .filter((r) => selectedExtraIds.has(r.id))
        .map((r) => ({ id: r.id, type: 'extra' as const, name: r.name, email: r.email })),
    ],
    [systemRecipients, extraRecipients, selectedUserIds, selectedExtraIds],
  );

  const isSending = progress.status === 'sending';

  const handleConfirmSend = async () => {
    if (!token || !currentUser?.associationId || selectedRecipients.length === 0) return;
    reset();

    const includedPastorIds =
      selectedPastorIds === null ? undefined : [...selectedPastorIds];

    await send(
      token,
      { associationId: currentUser.associationId, periodOffset, includedPastorIds },
      selectedRecipients,
    );
  };

  const handleDialogClose = () => {
    if (isSending) return;
    if (progress.status === 'done') {
      const sent = progress.total - progress.failed.length;
      if (progress.failed.length === 0) {
        toast.success(`Reporte enviado a ${sent} destinatario${sent !== 1 ? 's' : ''}`);
      } else {
        toast.warning(
          `Enviado a ${sent}/${progress.total}. Fallaron: ${progress.failed.join(', ')}`,
        );
      }
      setSelectedUserIds(new Set());
      setSelectedExtraIds(new Set());
      reset();
    }
    setShowConfirm(false);
  };

  if (!emailEnabled) {
    return (
      <div className="max-w-[680px] mx-auto">
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-8 text-center">
          <MailX className="w-10 h-10 mx-auto text-amber-600 dark:text-amber-400 mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Envío de correos deshabilitado
          </h2>
          <p className="text-sm text-gray-600 dark:text-slate-300">
            Esta funcionalidad está temporalmente desactivada. Contacta al
            administrador del sistema para habilitarla.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[680px] mx-auto">
      <SEO title="Enviar Reporte" noIndex />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Enviar Consolidado por Correo
          </h2>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
            Selecciona el periodo, los pastores a incluir y los destinatarios
          </p>
        </div>
      </div>

      {/* Period selector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 mb-4">
        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-3">
          Periodo del reporte
        </p>
        <div className="flex items-center gap-3">
          <button
            aria-label="Periodo anterior"
            onClick={() => setPeriodOffset((o) => o - 1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-slate-400" />
          </button>
          <span className="text-sm font-semibold text-gray-900 dark:text-white px-5 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 min-w-[200px] text-center">
            {periodLabel}
          </span>
          <Tooltip content={periodOffset >= 0 ? 'Ya estás en el periodo más reciente' : false} side="bottom">
            <button
              aria-label="Periodo siguiente"
              onClick={() => setPeriodOffset((o) => Math.min(0, o + 1))}
              disabled={periodOffset >= 0}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 text-gray-500 dark:text-slate-400" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Pastor selection card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 mb-4">
        <button
          onClick={() => setPastorSectionOpen((o) => !o)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-teal-500" />
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
              Pastores en el adjunto
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-teal-600 dark:text-teal-400">
              {allPastorsSelected
                ? 'Todos'
                : selectedPastorCount === 0
                  ? 'Ninguno'
                  : `${selectedPastorCount} de ${pastors.length}`}
            </span>
            {pastorSectionOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </button>

        <AnimatePresence initial={false}>
          {pastorSectionOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="pt-4">
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">
                  Selecciona los pastores cuyos reportes individuales se adjuntarán al correo. El Excel consolidado siempre se incluye.
                </p>
                <div className="flex items-center gap-3 mb-3">
                  <button
                    onClick={selectAllPastors}
                    className="text-[11px] font-medium text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    Todos
                  </button>
                  <span className="text-gray-300 dark:text-slate-600">·</span>
                  <button
                    onClick={clearAllPastors}
                    className="text-[11px] font-medium text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    Ninguno
                  </button>
                </div>

                {loadingPastors ? (
                  <PastorSkeleton />
                ) : pastors.length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-slate-500 py-2">
                    No hay pastores en esta asociación
                  </p>
                ) : (
                  <div className="relative">
                    <div className="space-y-1.5 max-h-52 overflow-y-auto scroll-subtle pr-1">
                      {pastors.map((p) => {
                        const selected = isPastorSelected(p.id);
                        return (
                          <button
                            key={p.id}
                            onClick={() => togglePastor(p.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                              selected
                                ? 'border-teal-400 dark:border-teal-600 bg-teal-50/60 dark:bg-teal-900/20'
                                : 'border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            <div
                              className={`w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                                selected ? 'border-teal-500 bg-teal-500' : 'border-gray-300 dark:border-slate-600'
                              }`}
                            >
                              {selected && <Check className="w-2.5 h-2.5 text-white" />}
                            </div>
                            <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-[10px] font-semibold text-teal-600 dark:text-teal-400 shrink-0">
                              {p.name.split(' ').filter((w) => w.length > 2).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.name}</p>
                              {p.position && (
                                <p className="text-[10px] text-gray-400 dark:text-slate-500 truncate">{p.position}</p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <div className="pointer-events-none absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-white dark:from-slate-900 to-transparent rounded-b-xl" />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recipients card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
            Destinatarios
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={selectAll}
              className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Seleccionar todos
            </button>
            <span className="text-gray-300 dark:text-slate-600">·</span>
            <button
              onClick={clearAll}
              className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Limpiar
            </button>
            <span className="text-[11px] text-gray-400 dark:text-slate-500 ml-1">
              {totalSelected}/{totalRecipients}
            </span>
          </div>
        </div>

        {/* Usuarios del sistema */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide">
              Administradores del sistema
            </span>
          </div>

          {loadingSystem ? (
            <RecipientSkeleton />
          ) : systemRecipients.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-slate-500 py-3 pl-1">
              No hay administradores disponibles
            </p>
          ) : (
            <div className="space-y-1.5">
              {systemRecipients.map((r) => {
                const isSelected = selectedUserIds.has(r.id);
                const roleConf = ROLE_CONFIG[r.role];
                return (
                  <RecipientRow
                    key={r.id}
                    name={r.name}
                    email={r.email}
                    badge={
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${roleConf.bg} ${roleConf.color}`}>
                        {roleConf.label}
                      </span>
                    }
                    isSelected={isSelected}
                    onClick={() => toggleUserId(r.id)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Destinatarios externos */}
        <div className="border-t border-gray-100 dark:border-slate-800 pt-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide">
              Correos externos
            </span>
          </div>

          {loadingExtras ? (
            <RecipientSkeleton count={2} />
          ) : extraRecipients.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-slate-500 py-3 pl-1">
              No hay correos externos guardados.{' '}
              <span className="text-indigo-500 dark:text-indigo-400">
                Agrégalos en Configuración → Destinatarios de reporte.
              </span>
            </p>
          ) : (
            <div className="space-y-1.5">
              {extraRecipients.map((r) => {
                const isSelected = selectedExtraIds.has(r.id);
                return (
                  <RecipientRow
                    key={r.id}
                    name={r.name}
                    email={r.email}
                    badge={
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400">
                        Externo
                      </span>
                    }
                    isSelected={isSelected}
                    onClick={() => toggleExtraId(r.id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Send button */}
      <div className="flex items-center justify-between">
        {totalSelected === 0 ? (
          <p className="text-xs text-gray-400 dark:text-slate-500">
            Selecciona al menos un destinatario para continuar
          </p>
        ) : (
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            {totalSelected} destinatario{totalSelected !== 1 ? 's' : ''} seleccionado{totalSelected !== 1 ? 's' : ''}
            {' · '}
            {selectedPastorCount === 0
              ? 'sin pastores adjuntos'
              : allPastorsSelected
                ? `${pastors.length} pastor${pastors.length !== 1 ? 'es' : ''} adjunto${pastors.length !== 1 ? 's' : ''}`
                : `${selectedPastorCount}/${pastors.length} pastores adjuntos`}
          </p>
        )}
        <Tooltip
          content={totalSelected === 0 ? 'Selecciona al menos un destinatario' : false}
          side="top"
        >
          <button
            onClick={() => setShowConfirm(true)}
            disabled={totalSelected === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors"
          >
            <Send className="w-4 h-4" />
            Enviar reporte
          </button>
        </Tooltip>
      </div>

      {/* Confirmation + progress dialog */}
      <AnimatePresence>
        {showConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40"
              onClick={handleDialogClose}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 overflow-y-auto overscroll-contain"
            >
              <div className="flex min-h-full items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-2xl w-full max-w-md p-6 my-auto">
                  {/* Dialog header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                        <Mail className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          {progress.status === 'done' ? 'Envío completado' : 'Confirmar envío'}
                        </h3>
                        <p className="text-xs text-gray-400 dark:text-slate-500">
                          Reporte de {periodLabel}
                        </p>
                      </div>
                    </div>
                    {!isSending && (
                      <button
                        onClick={handleDialogClose}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>

                  {/* idle → recipient list */}
                  {progress.status === 'idle' && (
                    <>
                      <p className="text-sm text-gray-600 dark:text-slate-300 mb-1">
                        Se enviará el consolidado de <strong>{periodLabel}</strong> a:
                      </p>
                      <div className="space-y-1.5 mb-4 max-h-40 overflow-y-auto scroll-subtle pr-1">
                        {selectedRecipients.map((r) => (
                          <DialogRecipientRow key={`${r.type}-${r.id}`} recipient={r} />
                        ))}
                      </div>
                      <div className="mb-5 p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 rounded-xl">
                        <p className="text-xs text-teal-700 dark:text-teal-300">
                          <strong>Adjuntos:</strong>{' '}
                          1 Excel consolidado
                          {selectedPastorCount > 0
                            ? ` + ${selectedPastorCount} Excel${selectedPastorCount !== 1 ? ' individuales' : ' individual'} de pastor`
                            : ''}
                          {' '}por correo.
                        </p>
                      </div>
                    </>
                  )}

                  {/* sending → progress bar */}
                  {isSending && (
                    <div className="mb-5">
                      <p className="text-sm text-gray-600 dark:text-slate-300 mb-3">
                        Enviando correo a{' '}
                        <strong>
                          {selectedRecipients[progress.current]?.name ?? '...'}
                        </strong>
                      </p>
                      <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2 mb-2">
                        <div
                          className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(progress.current / progress.total) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 dark:text-slate-500 text-right">
                        {progress.current} de {progress.total}
                      </p>
                    </div>
                  )}

                  {/* done → summary */}
                  {progress.status === 'done' && (
                    <div className="mb-5">
                      {progress.failed.length === 0 ? (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                          <Check className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                          <p className="text-sm text-green-700 dark:text-green-300">
                            Reporte enviado a {progress.current} destinatario{progress.current !== 1 ? 's' : ''} exitosamente.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {progress.current > 0 && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                              <Check className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                              <p className="text-sm text-green-700 dark:text-green-300">
                                Enviado a {progress.current} destinatario{progress.current !== 1 ? 's' : ''}.
                              </p>
                            </div>
                          )}
                          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                            <p className="text-sm text-red-700 dark:text-red-300 font-medium mb-1">
                              Fallaron {progress.failed.length}:
                            </p>
                            <p className="text-xs text-red-600 dark:text-red-400">
                              {progress.failed.join(', ')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  {progress.status === 'idle' && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleDialogClose}
                        className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleConfirmSend}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        Confirmar envío
                      </button>
                    </div>
                  )}

                  {isSending && (
                    <div className="flex justify-center">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        No cierres esta ventana...
                      </div>
                    </div>
                  )}

                  {progress.status === 'done' && (
                    <button
                      onClick={handleDialogClose}
                      className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors"
                    >
                      Cerrar
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sub-componentes ────────────────────────────────────────────────────────────

function RecipientRow({
  name,
  email,
  badge,
  isSelected,
  onClick,
}: {
  name: string;
  email: string;
  badge: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition-all ${
        isSelected
          ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50/60 dark:bg-indigo-900/20'
          : 'border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'
      }`}
    >
      <div
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
          isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300 dark:border-slate-600'
        }`}
      >
        {isSelected && <Check className="w-3 h-3 text-white" />}
      </div>
      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">
        {name
          .split(' ')
          .filter((w) => w.length > 2)
          .slice(0, 2)
          .map((w) => w[0])
          .join('')
          .toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{name}</p>
        <p className="text-[11px] text-gray-400 dark:text-slate-500 truncate">{email}</p>
      </div>
      {badge}
    </button>
  );
}

function DialogRecipientRow({ recipient }: { recipient: ResolvedRecipient }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 dark:bg-slate-800 rounded-xl">
      <div className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
        {recipient.name
          .split(' ')
          .filter((w) => w.length > 2)
          .slice(0, 1)
          .map((w) => w[0])
          .join('')
          .toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{recipient.name}</p>
        <p className="text-[10px] text-gray-400 dark:text-slate-500 truncate">{recipient.email}</p>
      </div>
      {recipient.type === 'extra' && (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 shrink-0">
          Externo
        </span>
      )}
    </div>
  );
}

function RecipientSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2 py-1">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-gray-100 dark:border-slate-800 animate-pulse"
        >
          <div className="w-5 h-5 rounded-md bg-gray-200 dark:bg-slate-700 shrink-0" />
          <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-slate-700 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-slate-700" />
            <div className="h-2.5 w-1/2 rounded bg-gray-200 dark:bg-slate-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

function PastorSkeleton() {
  return (
    <div className="space-y-2 py-1">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-100 dark:border-slate-800 animate-pulse"
        >
          <div className="w-4.5 h-4.5 rounded-md bg-gray-200 dark:bg-slate-700 shrink-0" />
          <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-slate-700 shrink-0" />
          <div className="flex-1 h-3 w-1/3 rounded bg-gray-200 dark:bg-slate-700" />
        </div>
      ))}
    </div>
  );
}
