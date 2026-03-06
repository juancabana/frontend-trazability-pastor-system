import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpAdapter } from '@/shared/infra/adapters/fetch-http-adapter';
import { DailyReportRepositoryApiImpl } from '../../infra/adapters/daily-report-repository-api-impl';
import { dailyReportKeys } from '../../infra/daily-report-key-factory';
import type { CreateDailyReportRequest } from '../../domain/dto/create-daily-report-request';

const repo = new DailyReportRepositoryApiImpl(httpAdapter);

export const useSaveReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ token, data }: { token: string; data: CreateDailyReportRequest }) =>
      repo.createOrUpdate(token, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dailyReportKeys.all });
    },
  });
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ token, id }: { token: string; id: string }) =>
      repo.delete(token, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dailyReportKeys.all });
    },
  });
};
