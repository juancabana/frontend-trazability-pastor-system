import type { VisitDetail } from '@/features/daily-report/domain/entities/daily-report';

interface VisitListViewProps {
  visits: VisitDetail[];
}

/** Detalle de solo lectura de las visitas de una actividad de visitación. */
export function VisitListView({ visits }: VisitListViewProps) {
  if (visits.length === 0) return null;

  return (
    <div className="w-full mt-3 pt-3 border-t border-gray-100 dark:border-slate-800 space-y-2">
      {visits.map((visit, index) => (
        <div key={visit.id} className="space-y-1 min-w-0">
          {visits.length > 1 && (
            <p className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wide">
              Visita {index + 1}
            </p>
          )}
          {visit.churchName && <VisitDetailLine label="Iglesia" value={visit.churchName} />}
          {visit.visitedName && <VisitDetailLine label="Persona" value={visit.visitedName} />}
          {visit.whatsappPhone && <VisitDetailLine label="WhatsApp" value={visit.whatsappPhone} />}
          {visit.visitReason && <VisitDetailLine label="Motivo" value={visit.visitReason} />}
        </div>
      ))}
    </div>
  );
}

function VisitDetailLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-xs text-gray-600 dark:text-slate-400 break-words">
      <span className="font-semibold">{label}:</span> {value}
    </p>
  );
}
