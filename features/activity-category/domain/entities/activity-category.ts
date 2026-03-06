export interface SubCategory {
  id: string;
  name: string;
  unit: string;
  hasHours: boolean;
  description?: string;
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
