import type { HttpGateway } from '@/shared/domain/gateways/http-gateway';
import type { ActivityCategoryRepository } from '../../domain/gateways/activity-category-repository';
import type { ActivityCategory } from '../../domain/entities/activity-category';
import { API_ENDPOINTS } from '@/constants/api';

export class ActivityCategoryRepositoryApiImpl implements ActivityCategoryRepository {
  constructor(private readonly http: HttpGateway) {}

  getAll(): Promise<ActivityCategory[]> {
    return this.http.get<ActivityCategory[]>(API_ENDPOINTS.ACTIVITY_CATEGORIES.LIST);
  }
}
