import { useState, useMemo } from 'react';
import { SEO } from '@/shared/presentation/SEO';
import {
  Settings,
  Info,
  Minus,
  Plus,
  CalendarDays,
  Globe,
  Trash2,
  UserPlus,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useUpdateDeadline } from '@/features/association/hooks/use-update-deadline';
import {
  useExtraRecipients,
  useAddExtraRecipient,
  useRemoveExtraRecipient,
} from '@/features/association/hooks/use-extra-recipients';
import { getCurrentPeriod } from '@/lib/format-date';
import { MONTHS_ES, MIN_REPORT_DEADLINE_DAY, MAX_REPORT_DEADLINE_DAY } from '@/constants/shared';
import { Tooltip } from '@/components/atoms/Tooltip';
import { toast } from 'sonner';

function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function formatPeriodPreview(deadlineDay: number): string {
  const today = new Date();
  const { start, end } = getCurrentPeriod(deadlineDay, today);
  const startDay = start.getDate();
  const startMonth = MONTHS_ES[start.getMonth()];
  const startYear = start.getFullYear();
  const endDay = end.getDate();
  const endMonth = MONTHS_ES[end.getMonth()];
  const endYear = end.getFullYear();

  if (startYear === endYear) {
    return `Del ${startDay} de ${startMonth} al ${endDay} de ${endMonth} de ${endYear}`;
  }
  return `Del ${startDay} de ${startMonth} de ${startYear} al ${endDay} de ${endMonth} de ${endYear}`;
}

export default function AdminSettingsPage() {
  const { token, currentUser } = useAuth();
  const updateDeadline = useUpdateDeadline();

  const today = new Date();
  const maxDay = useMemo(
    // Clampeamos al maximo del sistema (27) aunque el mes tenga mas dias,
    // para evitar el desbordamiento de fecha en febrero.
    () => Math.min(getLastDayOfMonth(today.getFullYear(), today.getMonth()), MAX_REPORT_DEADLINE_DAY),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const minDay = MIN_REPORT_DEADLINE_DAY;

  const currentDeadline = currentUser?.reportDeadlineDay ?? 19;
  const [value, setValue] = useState<number>(currentDeadline);

  const isChanged = value !== currentDeadline;
  const isValid = value >= minDay && value <= maxDay;
  const canSave = isChanged && isValid && !updateDeadline.isPending;

  function clamp(n: number): number {
    return Math.min(maxDay, Math.max(minDay, n));
  }

  const periodPreview = useMemo(() => {
    if (!isValid) return null;
    return formatPeriodPreview(value);
  }, [value, isValid]);

  // ── Extra recipients ────────────────────────────────────────────────────────
  const associationId = currentUser?.associationId ?? '';
  const { data: extras = [], isLoading: loadingExtras } = useExtraRecipients(
    token ?? '',
    associationId || null,
  );
  const addExtra = useAddExtraRecipient(associationId);
  const removeExtra = useRemoveExtraRecipient(associationId);

  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');

  const canAdd =
    newEmail.trim().length > 0 &&
    newName.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim()) &&
    !addExtra.isPending;

  function handleAdd() {
    if (!token || !canAdd) return;
    addExtra.mutate(
      { token, data: { email: newEmail.trim(), name: newName.trim() } },
      {
        onSuccess: () => {
          setNewEmail('');
          setNewName('');
          toast.success('Destinatario agregado');
        },
        onError: (err: unknown) => {
          const msg =
            (err as any)?.message?.includes('ya está registrado')
              ? 'Ese correo ya está en la lista'
              : 'No se pudo agregar el destinatario';
          toast.error(msg);
        },
      },
    );
  }

  function handleRemove(id: string, email: string) {
    if (!token) return;
    removeExtra.mutate(
      { token, recipientId: id },
      {
        onSuccess: () => toast.success(`${email} eliminado`),
        onError: () => toast.error('No se pudo eliminar'),
      },
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      <SEO title="Configuración" noIndex />
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
          <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Configuración de la Asociación
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {currentUser?.associationName ?? 'Asociación'}
          </p>
        </div>
      </div>

      {/* ── Card: Día de cierre ──────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-semibold text-gray-800 dark:text-white">
            Día de cierre del periodo
          </h2>
        </div>

        <div className="px-5 py-5 space-y-5">
          <div className="flex gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
              El periodo de reporte se cierra el día que configures cada mes. Los pastores
              podrán crear y editar reportes hasta ese día inclusive.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Día de cierre &nbsp;
              <span className="normal-case font-normal text-gray-400">
                (del {minDay} al {maxDay} — días del mes actual)
              </span>
            </label>
            <div className="flex items-center gap-3">
              <Tooltip content={value <= minDay ? `Mínimo permitido: día ${minDay}` : false} side="top">
                <button
                  type="button"
                  onClick={() => setValue((v) => clamp(v - 1))}
                  disabled={value <= minDay || updateDeadline.isPending}
                  className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Disminuir día"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </Tooltip>

              <input
                type="number"
                min={minDay}
                max={maxDay}
                value={value}
                onChange={(e) => {
                  const parsed = parseInt(e.target.value, 10);
                  if (!isNaN(parsed)) setValue(parsed);
                  else if (e.target.value === '') setValue(minDay);
                }}
                onBlur={() => setValue((v) => clamp(v))}
                disabled={updateDeadline.isPending}
                className="w-20 text-center text-2xl font-semibold text-gray-900 dark:text-white bg-transparent border-b-2 border-indigo-400 dark:border-indigo-500 focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-400 disabled:opacity-50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />

              <Tooltip content={value >= maxDay ? `Máximo permitido: día ${maxDay}` : false} side="top">
                <button
                  type="button"
                  onClick={() => setValue((v) => clamp(v + 1))}
                  disabled={value >= maxDay || updateDeadline.isPending}
                  className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Aumentar día"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </Tooltip>

              <span className="text-sm text-gray-400 dark:text-gray-500">de cada mes</span>
            </div>
            {!isValid && (
              <p className="text-xs text-red-500">
                El valor debe estar entre {minDay} y {maxDay}.
              </p>
            )}
          </div>

          {periodPreview && (
            <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
              <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-0.5">
                Periodo activo con este valor
              </p>
              <p className="text-sm text-indigo-800 dark:text-indigo-300 font-medium">
                {periodPreview}
              </p>
            </div>
          )}

          <p className="text-xs text-gray-400 dark:text-gray-500">
            Los pastores verán el cambio en su próximo inicio de sesión.
          </p>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-gray-50 dark:bg-slate-800/50">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Valor actual guardado: día <strong>{currentDeadline}</strong>
          </span>
          <Tooltip
            content={
              updateDeadline.isPending
                ? 'Guardando...'
                : !isChanged
                  ? 'No hay cambios para guardar'
                  : !isValid
                    ? `El valor debe estar entre ${minDay} y ${maxDay}`
                    : false
            }
            side="top"
          >
            <button
              type="button"
              onClick={() => canSave && updateDeadline.mutate(value)}
              disabled={!canSave}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {updateDeadline.isPending ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </button>
          </Tooltip>
        </div>
      </div>

      {/* ── Card: Destinatarios externos del reporte ──────────��──────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-2">
          <Globe className="w-4 h-4 text-teal-500" />
          <h2 className="text-sm font-semibold text-gray-800 dark:text-white">
            Destinatarios externos del reporte
          </h2>
        </div>

        <div className="px-5 py-5 space-y-4">
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Correos fuera del sistema que recibirán el consolidado mensual. Se reutilizan en cada envío.
          </p>

          {/* Lista de externos guardados */}
          {loadingExtras ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-gray-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : extras.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-slate-500 py-2">
              Aún no hay correos externos registrados.
            </p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-800 border border-gray-100 dark:border-slate-800 rounded-lg overflow-hidden">
              {extras.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900"
                >
                  <div className="w-7 h-7 rounded-md bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-[10px] font-bold text-teal-600 dark:text-teal-400 shrink-0">
                    {r.name
                      .split(' ')
                      .filter((w) => w.length > 2)
                      .slice(0, 1)
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {r.name}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 truncate">
                      {r.email}
                    </p>
                  </div>
                  <Tooltip content="Eliminar destinatario" side="top">
                    <button
                      onClick={() => handleRemove(r.id, r.email)}
                      disabled={removeExtra.isPending}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Tooltip>
                </div>
              ))}
            </div>
          )}

          {/* Formulario agregar */}
          <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
              Agregar correo externo
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  maxLength={255}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600 transition"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && canAdd && handleAdd()}
                  placeholder="Ej. juan@ejemplo.com"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600 transition"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleAdd}
                disabled={!canAdd}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {addExtra.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                Agregar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
