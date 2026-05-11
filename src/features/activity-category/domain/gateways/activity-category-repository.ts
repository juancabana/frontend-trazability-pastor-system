import type { ActivityCategory, SubCategory, SubCategoryUnit } from '../entities/activity-category';

export interface CreateSubcategoryPayload {
  name: string;
  unit: SubCategoryUnit;
  hasHours: boolean;
  description?: string;
}

export interface UpdateSubcategoryPayload {
  name?: string;
  unit?: SubCategoryUnit;
  hasHours?: boolean;
  description?: string;
}

export interface ActivityCategoryRepository {
  getAll(): Promise<ActivityCategory[]>;
  createSubcategory(categoryId: string, data: CreateSubcategoryPayload): Promise<SubCategory>;
  updateSubcategory(categoryId: string, subcategoryId: string, data: UpdateSubcategoryPayload): Promise<SubCategory>;
  deleteSubcategory(categoryId: string, subcategoryId: string): Promise<void>;
  restoreSubcategory(categoryId: string, subcategoryId: string): Promise<SubCategory>;
}
