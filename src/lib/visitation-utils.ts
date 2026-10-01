import { VISITATION_SUBCATEGORY_ID } from '@/constants/shared';
import type { ActivityEntry, VisitDetail } from '@/features/daily-report/domain/entities/daily-report';

const cleanText = (value?: string): string => value?.trim() ?? '';

export function isVisitationActivity(entry: Pick<ActivityEntry, 'subcategoryId'>): boolean {
  return entry.subcategoryId === VISITATION_SUBCATEGORY_ID;
}

export function createEmptyVisit(generateId: () => string = () => crypto.randomUUID()): VisitDetail {
  return { id: generateId(), visitedName: '', visitReason: '' };
}

export function isVisitComplete(visit: VisitDetail): boolean {
  return cleanText(visit.visitedName) !== '' && cleanText(visit.visitReason) !== '';
}

export function hasIncompleteVisits(entry: ActivityEntry): boolean {
  if (!isVisitationActivity(entry)) return false;
  const visits = entry.visits ?? [];
  return visits.length === 0 || !visits.every(isVisitComplete);
}

function extractLegacyVisits(entry: ActivityEntry): VisitDetail[] {
  const { churchName, visitedName, whatsappPhone, visitReason } = entry;
  const hasData = [churchName, visitedName, whatsappPhone, visitReason].some(
    (value) => cleanText(value) !== '',
  );
  if (!hasData) return [];
  return [
    {
      id: 'legacy-1',
      churchName,
      visitedName: visitedName ?? '',
      whatsappPhone,
      visitReason: visitReason ?? '',
    },
  ];
}

/** Visitas de una actividad, incluyendo el formato legado de una sola visita. */
export function getActivityVisits(entry: ActivityEntry): VisitDetail[] {
  return entry.visits?.length ? entry.visits : extractLegacyVisits(entry);
}

function toVisitsFormat(entry: ActivityEntry): ActivityEntry {
  const { churchName, visitedName, whatsappPhone, visitReason, ...base } = entry;
  return { ...base, visits: extractLegacyVisits(entry) };
}

/**
 * Convierte visitaciones en formato legado (campos planos) a `visits[]`.
 * Determinista: el mismo input produce siempre el mismo output, lo que
 * mantiene estable la comparación de snapshots borrador vs. servidor.
 */
export function normalizeVisitationActivities(activities: ActivityEntry[]): ActivityEntry[] {
  return activities.map((entry) =>
    isVisitationActivity(entry) && !entry.visits ? toVisitsFormat(entry) : entry,
  );
}
