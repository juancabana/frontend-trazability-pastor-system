import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAdminRecipients } from '@/features/consolidated/hooks/use-admin-recipients';
import { useSendReport } from '@/features/consolidated/hooks/use-send-report';
import { ROLE_CONFIG } from '@/features/auth/domain/entities/user-role';
import { MONTHS_ES } from '@/constants/shared';
import {
  Mail,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  Send,
  X,
  Users,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function AdminSendReportPage() {
  const { token, currentUser } = useAuth();

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1;
  const monthLabel = `${MONTHS_ES[currentMonth.getMonth()]} ${year}`;

  const { data: recipients = [], isLoading: loadingRecipients } =
    useAdminRecipients(token ?? '', currentUser?.associationId ?? null);

  const { mutate: sendReport, isPending: sending } = useSendReport();

  const toggleId = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(recipients.map((r) => r.id)));
  const clearAll = () => setSelectedIds(new Set());

  const handleConfirmSend = () => {
    if (!token || !currentUser?.associationId || selectedIds.size === 0) return;

    sendReport(
      {
        token,
        data: {
          recipientUserIds: Array.from(selectedIds),
          associationId: currentUser.associationId,
          month,
          year,
        },
      },
      {
        onSuccess: (res) => {
          toast.success(
            `Reporte enviado a ${res.sent} destinatario${res.sent !== 1 ? 's' : ''}`,
          );
          setShowConfirm(false);
          setSelectedIds(new Set());
        },
        onError: () => {
          toast.error('Error al enviar el reporte. Verifique la configuración de correo.');
          setShowConfirm(false);
        },
      },
    );
  };

  const selectedRecipients = recipients.filter((r) => selectedIds.has(r.id));

  return (
    <div className="max-w-[680px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Enviar Consolidado por Correo
          </h2>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
            Selecciona el periodo y los destinatarios que recibirán el reporte
          </p>
        </div>
      </div>

      {/* Month selector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 mb-4">
        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-3">
          Periodo del reporte
        </p>
        <div className="flex items-center gap-3">
          <button
            aria-label="Mes anterior"
            onClick={() => setCurrentMonth(new Date(year, month - 2, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-slate-400" />
          </button>
          <span className="text-sm font-semibold text-gray-900 dark:text-white px-5 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 min-w-[160px] text-center">
            {monthLabel}
          </span>
          <button
            aria-label="Mes siguiente"
            onClick={() => setCurrentMonth(new Date(year, month, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-500 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* Recipient selector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" />
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
              Destinatarios
            </p>
          </div>
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
              {selectedIds.size}/{recipients.length}
            </span>
          </div>
        </div>

        {loadingRecipients ? (
          <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Cargando destinatarios...</span>
          </div>
        ) : recipients.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-gray-400 dark:text-slate-500">
              No hay administradores disponibles en esta asociación
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {recipients.map((r) => {
              const isSelected = selectedIds.has(r.id);
              const roleConf = ROLE_CONFIG[r.role];
              return (
                <button
                  key={r.id}
                  onClick={() => toggleId(r.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50/60 dark:bg-indigo-900/20'
                      : 'border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {/* Checkbox */}
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500'
                        : 'border-gray-300 dark:border-slate-600'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>

                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">
                    {r.name
                      .split(' ')
                      .filter((w) => w.length > 2)
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {r.name}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-slate-500 truncate">
                      {r.email}
                    </p>
                  </div>

                  {/* Role badge */}
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${roleConf.bg} ${roleConf.color}`}
                  >
                    {roleConf.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Send button */}
      <div className="flex items-center justify-between">
        {selectedIds.size === 0 ? (
          <p className="text-xs text-gray-400 dark:text-slate-500">
            Selecciona al menos un destinatario para continuar
          </p>
        ) : (
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            {selectedIds.size} destinatario{selectedIds.size !== 1 ? 's' : ''} seleccionado{selectedIds.size !== 1 ? 's' : ''}
          </p>
        )}
        <button
          onClick={() => setShowConfirm(true)}
          disabled={selectedIds.size === 0 || sending}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors"
        >
          <Send className="w-4 h-4" />
          Enviar reporte
        </button>
      </div>

      {/* Confirmation dialog */}
      <AnimatePresence>
        {showConfirm && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40"
              onClick={() => !sending && setShowConfirm(false)}
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-2xl w-full max-w-md p-6">
                {/* Dialog header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                      <Mail className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        Confirmar envío
                      </h3>
                      <p className="text-xs text-gray-400 dark:text-slate-500">
                        Reporte de {monthLabel}
                      </p>
                    </div>
                  </div>
                  {!sending && (
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>

                {/* Summary */}
                <p className="text-sm text-gray-600 dark:text-slate-300 mb-4">
                  Se enviará el consolidado de <strong>{monthLabel}</strong> a los siguientes destinatarios:
                </p>

                <div className="space-y-1.5 mb-5 max-h-48 overflow-y-auto">
                  {selectedRecipients.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 dark:bg-slate-800 rounded-xl"
                    >
                      <div className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                        {r.name
                          .split(' ')
                          .filter((w) => w.length > 2)
                          .slice(0, 1)
                          .map((w) => w[0])
                          .join('')
                          .toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                          {r.name}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 truncate">
                          {r.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowConfirm(false)}
                    disabled={sending}
                    className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmSend}
                    disabled={sending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Confirmar envío
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
