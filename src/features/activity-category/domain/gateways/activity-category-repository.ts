import type { ActivityCategory } from '../entities/activity-category';

export interface ActivityCategoryRepository {
  getAll(): Promise<ActivityCategory[]>;
}
