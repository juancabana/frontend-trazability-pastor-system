import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { VisitDetail } from '@/features/daily-report/domain/entities/daily-report';
import { MAX_VISITS_PER_ACTIVITY } from '@/constants/shared';
import { createEmptyVisit, isVisitComplete } from '@/lib/visitation-utils';

type VisitField = Exclude<keyof VisitDetail, 'id'>;

interface VisitListEditorProps {
  visits: VisitDetail[];
  onChange: (visits: VisitDetail[]) => void;
}

const LABEL_CLASS =
  'text-[11px] font-medium text-gray-400 dark:text-slate-500 mb-1 block uppercase tracking-wide';
const INPUT_CLASS =
  'w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-950 rounded-xl text-sm border border-transparent focus:border-teal-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 transition-colors';

/**
 * Editor de las visitas de una actividad de visitación: permite agregar,
 * editar y eliminar visitas. Siempre conserva al menos una visita.
 */
export function VisitListEditor({ visits, onChange }: VisitListEditorProps) {
  const [focusVisitId, setFocusVisitId] = useState<string | null>(null);
  const canAddVisit = visits.length < MAX_VISITS_PER_ACTIVITY;

  const addVisit = () => {
    const visit = createEmptyVisit();
    setFocusVisitId(visit.id);
    onChange([...visits, visit]);
  };

  const removeVisit = (visitId: string) => {
    onChange(visits.filter((visit) => visit.id !== visitId));
  };

  const updateVisit = (visitId: string, field: VisitField, value: string) => {
    onChange(visits.map((visit) => (visit.id === visitId ? { ...visit, [field]: value } : visit)));
  };

  return (
    <div className="space-y-3 pt-1 border-t border-gray-100 dark:border-slate-800">
      <p className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wide pt-2">
        Detalle de las visitas ({visits.length})
      </p>

      {visits.map((visit, index) => (
        <VisitFields
          key={visit.id}
          visit={visit}
          position={index + 1}
          canRemove={visits.length > 1}
          autoFocus={visit.id === focusVisitId}
          onRemove={removeVisit}
          onFieldChange={updateVisit}
        />
      ))}

      <button
        type="button"
        onClick={addVisit}
        disabled={!canAddVisit}
        className="w-full min-h-11 px-3.5 py-2.5 rounded-xl border border-dashed border-teal-200 dark:border-teal-800 text-sm font-medium text-teal-600 dark:text-teal-400 flex items-center justify-center gap-2 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4" />
        {canAddVisit
          ? visits.length === 0
            ? 'Agregar visita'
            : 'Agregar otra visita'
          : `Máximo ${MAX_VISITS_PER_ACTIVITY} visitas`}
      </button>
    </div>
  );
}

interface VisitFieldsProps {
  visit: VisitDetail;
  position: number;
  canRemove: boolean;
  autoFocus: boolean;
  onRemove: (visitId: string) => void;
  onFieldChange: (visitId: string, field: VisitField, value: string) => void;
}

function VisitFields({ visit, position, canRemove, autoFocus, onRemove, onFieldChange }: VisitFieldsProps) {
  const fieldId = (field: VisitField) => `visit-${visit.id}-${field}`;

  return (
    <div className="rounded-xl border border-gray-100 dark:border-slate-800 p-3.5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white">Visita {position}</p>
          {!isVisitComplete(visit) && (
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-lg truncate">
              Falta nombre o motivo
            </span>
          )}
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(visit.id)}
            aria-label={`Eliminar visita ${position}`}
            className="shrink-0 min-w-11 min-h-11 md:min-w-0 md:min-h-0 inline-flex items-center justify-center p-1.5 text-gray-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div>
        <label htmlFor={fieldId('churchName')} className={LABEL_CLASS}>
          Nombre de la iglesia
        </label>
        <input
          id={fieldId('churchName')}
          type="text"
          value={visit.churchName ?? ''}
          onChange={(e) => onFieldChange(visit.id, 'churchName', e.target.value)}
          placeholder="Opcional — Ej. Iglesia Central"
          maxLength={200}
          className={INPUT_CLASS}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="min-w-0">
          <label htmlFor={fieldId('visitedName')} className={LABEL_CLASS}>
            Nombre persona <span className="text-red-500">*</span>
          </label>
          <input
            id={fieldId('visitedName')}
            type="text"
            value={visit.visitedName}
            onChange={(e) => onFieldChange(visit.id, 'visitedName', e.target.value)}
            placeholder="Ej. María Pérez"
            maxLength={200}
            autoFocus={autoFocus}
            className={INPUT_CLASS}
          />
        </div>
        <div className="min-w-0">
          <label htmlFor={fieldId('whatsappPhone')} className={LABEL_CLASS}>
            WhatsApp
          </label>
          <input
            id={fieldId('whatsappPhone')}
            type="tel"
            value={visit.whatsappPhone ?? ''}
            onChange={(e) => onFieldChange(visit.id, 'whatsappPhone', e.target.value)}
            placeholder="Opcional — Ej. +57 300 123 4567"
            maxLength={30}
            className={INPUT_CLASS}
          />
        </div>
      </div>
      <div>
        <label htmlFor={fieldId('visitReason')} className={LABEL_CLASS}>
          Motivo de la visita <span className="text-red-500">*</span>
        </label>
        <textarea
          id={fieldId('visitReason')}
          value={visit.visitReason}
          onChange={(e) => onFieldChange(visit.id, 'visitReason', e.target.value)}
          placeholder="Ej. Acompañamiento espiritual..."
          rows={2}
          maxLength={1000}
          className={`${INPUT_CLASS} resize-none`}
        />
      </div>
    </div>
  );
}
