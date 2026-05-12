export type SubCategoryUnit = 'cantidad' | 'horas' | 'veces' | 'dias' | 'noches';

export interface SubCategory {
  id: string;
  name: string;
  unit: SubCategoryUnit;
  hasHours: boolean;
  description?: string;
  isActive: boolean;
}

export interface ActivityCategory {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  subcategories: SubCategory[];
  sortOrder: number;
}
