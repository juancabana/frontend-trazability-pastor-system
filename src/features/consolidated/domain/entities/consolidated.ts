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
  totalReports: number;
  totalActivities: number;
  totalHours: number;
  totalTransportAmount: number;
  compliance: number;
}

export interface AssociationConsolidatedResponse {
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
}

export interface UnionConsolidatedResponse {
  associationSummaries: AssociationSummary[];
  totalAssociations: number;
  totalPastors: number;
  totalActivities: number;
  totalHours: number;
  avgCompliance: number;
}
