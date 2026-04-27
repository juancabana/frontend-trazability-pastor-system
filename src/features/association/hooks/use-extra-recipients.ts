import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { httpAdapter } from '@/shared/infra/adapters/fetch-http-adapter';
import { AssociationRepositoryApiImpl } from '../infra/adapters/association-repository-api-impl';
import { associationKeys } from '../infra/association-key-factory';
import type { AddExtraRecipientRequest } from '../domain/entities/association';

const repo = new AssociationRepositoryApiImpl(httpAdapter);

const extraRecipientsKey = (associationId: string | null) =>
  [...associationKeys.all, 'extra-recipients', associationId] as const;

export const useExtraRecipients = (
  token: string,
  associationId: string | null,
) =>
  useQuery({
    queryKey: extraRecipientsKey(associationId),
    queryFn: () => repo.getExtraRecipients(token, associationId!),
    enabled: !!token && !!associationId,
  });

export const useAddExtraRecipient = (associationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      token,
      data,
    }: {
      token: string;
      data: AddExtraRecipientRequest;
    }) => repo.addExtraRecipient(token, associationId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: extraRecipientsKey(associationId),
      });
    },
  });
};

export const useRemoveExtraRecipient = (associationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ token, recipientId }: { token: string; recipientId: string }) =>
      repo.removeExtraRecipient(token, associationId, recipientId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: extraRecipientsKey(associationId),
      });
    },
  });
};
