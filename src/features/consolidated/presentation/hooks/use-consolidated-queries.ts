import { useQuery } from '@tanstack/react-query';
import { httpAdapter } from '@/shared/infra/adapters/fetch-http-adapter';
import { ConsolidatedRepositoryApiImpl } from '../../infra/adapters/consolidated-repository-api-impl';
import { consolidatedKeys } from '../../infra/consolidated-key-factory';

const repo = new ConsolidatedRepositoryApiImpl(httpAdapter);

export const usePastorConsolidated = (
  token: string,
  pastorId: string,
  month: number,
  year: number,
) =>
  useQuery({
    queryKey: consolidatedKeys.byPastor(pastorId, month, year),
    queryFn: () => repo.getByPastor(token, pastorId, month, year),
    enabled: !!token && !!pastorId,
  });

export const useAssociationConsolidated = (
  token: string,
  assocId: string,
  month: number,
  year: number,
) =>
  useQuery({
    queryKey: consolidatedKeys.byAssociation(assocId, month, year),
    queryFn: () => repo.getByAssociation(token, assocId, month, year),
    enabled: !!token && !!assocId,
  });

export const useUnionConsolidated = (
  token: string,
  unionId: string,
  month: number,
  year: number,
) =>
  useQuery({
    queryKey: consolidatedKeys.byUnion(unionId, month, year),
    queryFn: () => repo.getByUnion(token, unionId, month, year),
    enabled: !!token && !!unionId,
  });
