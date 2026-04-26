import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpAdapter } from '@/shared/infra/adapters/fetch-http-adapter';
import { ChurchRepositoryApiImpl } from '../../infra/adapters/church-repository-api-impl';
import { districtKeys } from '@/features/district/infra/district-key-factory';

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
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['churches'] });
      // El listado de distritos puede mostrar conteo/inventario de iglesias.
      void qc.invalidateQueries({ queryKey: districtKeys.all });
    },
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
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['churches'] });
      // Mover una iglesia afecta el distrito origen y destino.
      void qc.invalidateQueries({ queryKey: districtKeys.all });
    },
  });
};

export const useDeleteChurch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ token, id }: { token: string; id: string }) =>
      repo.delete(token, id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['churches'] });
      void qc.invalidateQueries({ queryKey: districtKeys.all });
    },
  });
};
