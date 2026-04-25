import { useState, useMemo } from 'react';
import { Settings, Info, Minus, Plus, CalendarDays } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useUpdateDeadline } from '@/features/association/hooks/use-update-deadline';
import { getCurrentPeriod } from '@/lib/format-date';
import { MONTHS_ES } from '@/constants/shared';

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
  const { currentUser } = useAuth();
  const updateDeadline = useUpdateDeadline();

  const today = new Date();
  const maxDay = useMemo(
    () => getLastDayOfMonth(today.getFullYear(), today.getMonth()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const minDay = 1;

  const currentDeadline = currentUser?.reportDeadlineDay ?? 19;
  const [value, setValue] = useState<number>(currentDeadline);

  const isChanged = value !== currentDeadline;
  const isValid = value >= minDay && value <= maxDay;
  const canSave = isChanged && isValid && !updateDeadline.isPending;

  function clamp(n: number): number {
    return Math.min(maxDay, Math.max(minDay, n));
  }

  function handleDecrement() {
    setValue((v) => clamp(v - 1));
  }

  function handleIncrement() {
    setValue((v) => clamp(v + 1));
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const parsed = parseInt(e.target.value, 10);
    if (!isNaN(parsed)) setValue(parsed);
    else if (e.target.value === '') setValue(minDay);
  }

  function handleInputBlur() {
    setValue((v) => clamp(v));
  }

  function handleSave() {
    if (!canSave) return;
    updateDeadline.mutate(value);
  }

  const periodPreview = useMemo(() => {
    if (!isValid) return null;
    return formatPeriodPreview(value);
  }, [value, isValid]);

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
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

      {/* Card principal */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        {/* Sección título */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-semibold text-gray-800 dark:text-white">
            Día de cierre del periodo
          </h2>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Descripción */}
          <div className="flex gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
              El periodo de reporte se cierra el día que configures cada mes. Los pastores
              podrán crear y editar reportes hasta ese día inclusive. A partir del día
              siguiente se abre el nuevo periodo.
            </p>
          </div>

          {/* Control numérico */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Día de cierre &nbsp;
              <span className="normal-case font-normal text-gray-400">
                (del {minDay} al {maxDay} — días del mes actual)
              </span>
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={value <= minDay || updateDeadline.isPending}
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Disminuir día"
              >
                <Minus className="w-4 h-4" />
              </button>

              <input
                type="number"
                min={minDay}
                max={maxDay}
                value={value}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                disabled={updateDeadline.isPending}
                className="w-20 text-center text-2xl font-semibold text-gray-900 dark:text-white bg-transparent border-b-2 border-indigo-400 dark:border-indigo-500 focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-400 disabled:opacity-50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />

              <button
                type="button"
                onClick={handleIncrement}
                disabled={value >= maxDay || updateDeadline.isPending}
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Aumentar día"
              >
                <Plus className="w-4 h-4" />
              </button>

              <span className="text-sm text-gray-400 dark:text-gray-500">
                de cada mes
              </span>
            </div>

            {!isValid && (
              <p className="text-xs text-red-500">
                El valor debe estar entre {minDay} y {maxDay}.
              </p>
            )}
          </div>

          {/* Vista previa del periodo */}
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

          {/* Aviso de propagación */}
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Los pastores verán el cambio en su próximo inicio de sesión.
          </p>
        </div>

        {/* Footer con botón */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-gray-50 dark:bg-slate-800/50">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Valor actual guardado: día <strong>{currentDeadline}</strong>
          </span>
          <button
            type="button"
            onClick={handleSave}
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
        </div>
      </div>
    </div>
  );
}
