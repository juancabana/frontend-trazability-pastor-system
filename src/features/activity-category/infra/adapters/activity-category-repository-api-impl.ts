import type { HttpGateway } from '@/shared/domain/gateways/http-gateway';
import type { ActivityCategoryRepository, CreateSubcategoryPayload, UpdateSubcategoryPayload } from '../../domain/gateways/activity-category-repository';
import type { ActivityCategory, SubCategory } from '../../domain/entities/activity-category';
import { API_ENDPOINTS } from '@/constants/api';

export class ActivityCategoryRepositoryApiImpl implements ActivityCategoryRepository {
  constructor(private readonly http: HttpGateway) {}

  getAll(): Promise<ActivityCategory[]> {
    return this.http.get<ActivityCategory[]>(API_ENDPOINTS.ACTIVITY_CATEGORIES.LIST);
  }

  createSubcategory(categoryId: string, data: CreateSubcategoryPayload, token?: string): Promise<SubCategory> {
    return this.http.post<SubCategory>(
      API_ENDPOINTS.ACTIVITY_CATEGORIES.CREATE_SUBCATEGORY(categoryId),
      data,
      token,
    );
  }

  updateSubcategory(categoryId: string, subcategoryId: string, data: UpdateSubcategoryPayload, token?: string): Promise<SubCategory> {
    return this.http.patch<SubCategory>(
      API_ENDPOINTS.ACTIVITY_CATEGORIES.UPDATE_SUBCATEGORY(categoryId, subcategoryId),
      data,
      token,
    );
  }

  deleteSubcategory(categoryId: string, subcategoryId: string, token?: string): Promise<void> {
    return this.http.delete(
      API_ENDPOINTS.ACTIVITY_CATEGORIES.DELETE_SUBCATEGORY(categoryId, subcategoryId),
      token,
    );
  }

  restoreSubcategory(categoryId: string, subcategoryId: string, token?: string): Promise<SubCategory> {
    return this.http.patch<SubCategory>(
      API_ENDPOINTS.ACTIVITY_CATEGORIES.RESTORE_SUBCATEGORY(categoryId, subcategoryId),
      {},
      token,
    );
  }
}
