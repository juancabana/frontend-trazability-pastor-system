import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpAdapter } from '@/shared/infra/adapters/fetch-http-adapter';
import { ChurchRepositoryApiImpl } from '../../infra/adapters/church-repository-api-impl';

const repo = new ChurchRepositoryApiImpl(httpAdapter);

export const useChurches = (token: string, districtId?: string, associationId?: string) =>
  useQuery({
    queryKey: ['churches', districtId, associationId],
    queryFn: () => repo.getAll(token, districtId, associationId),
    enabled: !!token,
  });

export const useCreateChurch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ token, data }: { token: string; data: { name: string; address?: string; districtId: string } }) =>
      repo.create(token, data),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['churches'] }); },
  });
};

export const useUpdateChurch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ token, id, data }: { token: string; id: string; data: { name?: string; address?: string } }) =>
      repo.update(token, id, data),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['churches'] }); },
  });
};

export const useMoveChurch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ token, id, districtId }: { token: string; id: string; districtId: string }) =>
      repo.move(token, id, districtId),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['churches'] }); },
  });
};

export const useDeleteChurch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ token, id }: { token: string; id: string }) =>
      repo.delete(token, id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['churches'] }); },
  });
};
