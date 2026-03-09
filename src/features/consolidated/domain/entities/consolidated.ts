export interface ConsolidatedSubcategory {
  subcategoryId: string;
  subcategoryName: string;
  unit: string;
  totalQuantity: number;
  totalHours: number;
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
}

export interface PastorSummary {
  pastorId: string;
  pastorName: string;
  districtName?: string;
  totalActivities: number;
  totalHours: number;
  compliance: number;
}

export interface AssociationConsolidatedResponse {
  categories: ConsolidatedCategory[];
  pastorSummaries: PastorSummary[];
  totals: ConsolidatedTotals;
}
