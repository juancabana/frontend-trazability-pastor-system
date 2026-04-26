import { useQuery } from '@tanstack/react-query';
import { httpAdapter } from '@/shared/infra/adapters/fetch-http-adapter';
import { ConsolidatedRepositoryApiImpl } from '../infra/adapters/consolidated-repository-api-impl';
import { consolidatedKeys } from '../infra/consolidated-key-factory';

const repo = new ConsolidatedRepositoryApiImpl(httpAdapter);

export const useAdminRecipients = (token: string, associationId: string | null) =>
  useQuery({
    queryKey: [...consolidatedKeys.all, 'admin-recipients', associationId],
    queryFn: () => repo.getAdminRecipients(token, associationId!),
    enabled: !!token && !!associationId,
  });
