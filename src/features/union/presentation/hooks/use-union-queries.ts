import { useQuery } from '@tanstack/react-query';
import { httpAdapter } from '@/shared/infra/adapters/fetch-http-adapter';
import { UnionRepositoryApiImpl } from '../../infra/adapters/union-repository-api-impl';

const repo = new UnionRepositoryApiImpl(httpAdapter);

export const useUnions = (token: string) =>
  useQuery({
    queryKey: ['unions'],
    queryFn: () => repo.getAll(token),
    enabled: !!token,
  });
