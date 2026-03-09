import { useQuery } from '@tanstack/react-query';
import { httpAdapter } from '@/shared/infra/adapters/fetch-http-adapter';
import { AssociationRepositoryApiImpl } from '../../infra/adapters/association-repository-api-impl';
import { associationKeys } from '../../infra/association-key-factory';

const repo = new AssociationRepositoryApiImpl(httpAdapter);

export const useAssociations = () =>
  useQuery({
    queryKey: associationKeys.list(),
    queryFn: () => repo.getAll(),
  });
