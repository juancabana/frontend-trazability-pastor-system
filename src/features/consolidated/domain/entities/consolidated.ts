export interface PeriodMeta {
  /** Fecha de inicio del periodo (YYYY-MM-DD). */
  startDate: string;
  /** Fecha de fin del periodo (YYYY-MM-DD). */
  endDate: string;
  /** Etiqueta legible. Ej: "20 feb - 19 mar 2026". */
  label: string;
  /** Dia de cierre usado para calcular el periodo. */
  deadlineDay: number;
  /** Offset solicitado: 0=actual, -1=anterior, +1=siguiente. */
  offset: number;
}

export interface ConsolidatedSubcategory {
  subcategoryId: string;
  subcategoryName: string;
  unit: string;
  totalQuantity: number;
  totalHours: number;
  totalAmount: number;
}

export interface ConsolidatedCategory {
  categoryId: string;
  categoryName: string;
  color: string;
  bgColor: string;
  subcategories: ConsolidatedSubcategory[];
}

export interface ConsolidatedTotals {
  totalActivities: number;
  totalHours: number;
}

export interface ConsolidatedResponse {
  period: PeriodMeta;
  categories: ConsolidatedCategory[];
  totals: ConsolidatedTotals;
  compliance: number;
  totalReports: number;
  daysInPeriod: number;
  daysWithReports: number;
  totalTransportAmount: number;
}

export interface PastorSummary {
  pastorId: string;
  pastorName: string;
  districtName?: string;
  position?: string | null;
  totalReports: number;
  totalActivities: number;
  totalHours: number;
  totalTransportAmount: number;
  compliance: number;
}

export interface AssociationConsolidatedResponse {
  period: PeriodMeta;
  categories: ConsolidatedCategory[];
  pastorSummaries: PastorSummary[];
  totals: ConsolidatedTotals;
  totalTransportAmount: number;
}

export interface AssociationSummary {
  associationId: string;
  associationName: string;
  totalPastors: number;
  totalActivities: number;
  totalHours: number;
  avgCompliance: number;
  period: PeriodMeta;
}

export interface UnionConsolidatedResponse {
  period: PeriodMeta;
  associationSummaries: AssociationSummary[];
  totalAssociations: number;
  totalPastors: number;
  totalActivities: number;
  totalHours: number;
  avgCompliance: number;
}

