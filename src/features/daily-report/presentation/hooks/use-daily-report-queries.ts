import { useQuery } from '@tanstack/react-query';
import { httpAdapter } from '@/shared/infra/adapters/fetch-http-adapter';
import { DailyReportRepositoryApiImpl } from '../../infra/adapters/daily-report-repository-api-impl';
import { dailyReportKeys } from '../../infra/daily-report-key-factory';

const repo = new DailyReportRepositoryApiImpl(httpAdapter);

export const useReportsByPastorMonth = (
  token: string,
  pastorId: string,
  month: number,
  year: number,
) =>
  useQuery({
    queryKey: dailyReportKeys.byPastorAndMonth(pastorId, month, year),
    queryFn: () => repo.getByPastorAndMonth(token, pastorId, month, year),
    enabled: !!token && !!pastorId,
  });

export const useReportByDate = (token: string, pastorId: string, date: string) =>
  useQuery({
    queryKey: dailyReportKeys.byPastorAndDate(pastorId, date),
    queryFn: () => repo.getByPastorAndDate(token, pastorId, date),
    enabled: !!token && !!pastorId && !!date,
  });
