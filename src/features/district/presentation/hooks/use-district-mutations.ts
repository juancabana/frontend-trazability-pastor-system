import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpAdapter } from '@/shared/infra/adapters/fetch-http-adapter';
import { DistrictRepositoryApiImpl } from '../../infra/adapters/district-repository-api-impl';
import { districtKeys } from '../../infra/district-key-factory';

const repo = new DistrictRepositoryApiImpl(httpAdapter);

export const useCreateDistrict = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ token, data }: { token: string; data: { name: string; associationId: string } }) =>
      repo.create(token, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: districtKeys.all });
    },
  });
};

export const useUpdateDistrict = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ token, id, data }: { token: string; id: string; data: { name: string } }) =>
      repo.update(token, id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: districtKeys.all });
    },
  });
};

export const useDeleteDistrict = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ token, id }: { token: string; id: string }) =>
      repo.delete(token, id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: districtKeys.all });
    },
  });
};
