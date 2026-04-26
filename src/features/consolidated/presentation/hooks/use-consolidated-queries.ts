import { useQuery } from '@tanstack/react-query';
import { httpAdapter } from '@/shared/infra/adapters/fetch-http-adapter';
import { ConsolidatedRepositoryApiImpl } from '../../infra/adapters/consolidated-repository-api-impl';
import { consolidatedKeys } from '../../infra/consolidated-key-factory';

const repo = new ConsolidatedRepositoryApiImpl(httpAdapter);

export const usePastorConsolidated = (
  token: string,
  pastorId: string,
  periodOffset: number,
) =>
  useQuery({
    queryKey: consolidatedKeys.byPastor(pastorId, periodOffset),
    queryFn: () => repo.getByPastor(token, pastorId, periodOffset),
    enabled: !!token && !!pastorId,
  });

export const useAssociationConsolidated = (
  token: string,
  assocId: string,
  periodOffset: number,
) =>
  useQuery({
    queryKey: consolidatedKeys.byAssociation(assocId, periodOffset),
    queryFn: () => repo.getByAssociation(token, assocId, periodOffset),
    enabled: !!token && !!assocId,
  });

export const useUnionConsolidated = (
  token: string,
  unionId: string,
  periodOffset: number,
) =>
  useQuery({
    queryKey: consolidatedKeys.byUnion(unionId, periodOffset),
    queryFn: () => repo.getByUnion(token, unionId, periodOffset),
    enabled: !!token && !!unionId,
  });
