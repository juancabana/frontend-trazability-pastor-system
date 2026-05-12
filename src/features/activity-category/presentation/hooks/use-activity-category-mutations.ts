import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpAdapter } from '@/shared/infra/adapters/fetch-http-adapter';
import { ActivityCategoryRepositoryApiImpl } from '../../infra/adapters/activity-category-repository-api-impl';
import { activityCategoryKeys } from '../../infra/activity-category-key-factory';
import type { CreateSubcategoryPayload, UpdateSubcategoryPayload } from '../../domain/gateways/activity-category-repository';

const repo = new ActivityCategoryRepositoryApiImpl(httpAdapter);

export const useCreateSubcategory = (categoryId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, token }: { data: CreateSubcategoryPayload; token: string }) =>
      repo.createSubcategory(categoryId, data, token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: activityCategoryKeys.all }),
  });
};

export const useUpdateSubcategory = (categoryId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      subcategoryId,
      data,
      token,
    }: {
      subcategoryId: string;
      data: UpdateSubcategoryPayload;
      token: string;
    }) => repo.updateSubcategory(categoryId, subcategoryId, data, token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: activityCategoryKeys.all }),
  });
};

export const useDeleteSubcategory = (categoryId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subcategoryId, token }: { subcategoryId: string; token: string }) =>
      repo.deleteSubcategory(categoryId, subcategoryId, token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: activityCategoryKeys.all }),
  });
};

export const useRestoreSubcategory = (categoryId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subcategoryId, token }: { subcategoryId: string; token: string }) =>
      repo.restoreSubcategory(categoryId, subcategoryId, token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: activityCategoryKeys.all }),
  });
};
