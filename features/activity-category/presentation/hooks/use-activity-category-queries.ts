import { useQuery } from '@tanstack/react-query';
import { httpAdapter } from '@/shared/infra/adapters/fetch-http-adapter';
import { ActivityCategoryRepositoryApiImpl } from '../../infra/adapters/activity-category-repository-api-impl';
import { activityCategoryKeys } from '../../infra/activity-category-key-factory';

const repo = new ActivityCategoryRepositoryApiImpl(httpAdapter);

export const useActivityCategories = () =>
  useQuery({
    queryKey: activityCategoryKeys.list(),
    queryFn: () => repo.getAll(),
  });
