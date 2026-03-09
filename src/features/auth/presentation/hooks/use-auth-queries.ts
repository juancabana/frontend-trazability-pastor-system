import { useQuery } from '@tanstack/react-query';
import { httpAdapter } from '@/shared/infra/adapters/fetch-http-adapter';
import { AuthRepositoryApiImpl } from '../../infra/adapters/auth-repository-api-impl';
import { authKeys } from '../../infra/auth-key-factory';

const repo = new AuthRepositoryApiImpl(httpAdapter);

export const useUsers = (token: string, associationId?: string) =>
  useQuery({
    queryKey: authKeys.users(),
    queryFn: () => repo.getUsers(token, associationId),
    enabled: !!token,
  });
