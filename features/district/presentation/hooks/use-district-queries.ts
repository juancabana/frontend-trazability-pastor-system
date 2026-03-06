import { useQuery } from '@tanstack/react-query';
import { httpAdapter } from '@/shared/infra/adapters/fetch-http-adapter';
import { DistrictRepositoryApiImpl } from '../../infra/adapters/district-repository-api-impl';
import { districtKeys } from '../../infra/district-key-factory';

const repo = new DistrictRepositoryApiImpl(httpAdapter);

export const useDistricts = (associationId?: string) =>
  useQuery({
    queryKey: districtKeys.list(associationId),
    queryFn: () => repo.getAll(associationId),
  });
