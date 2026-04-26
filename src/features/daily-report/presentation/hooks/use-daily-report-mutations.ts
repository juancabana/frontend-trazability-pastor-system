import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpAdapter } from '@/shared/infra/adapters/fetch-http-adapter';
import { DailyReportRepositoryApiImpl } from '../../infra/adapters/daily-report-repository-api-impl';
import { dailyReportKeys } from '../../infra/daily-report-key-factory';
import { consolidatedKeys } from '@/features/consolidated/infra/consolidated-key-factory';
import type { CreateDailyReportRequest } from '../../domain/dto/create-daily-report-request';

const repo = new DailyReportRepositoryApiImpl(httpAdapter);

export const useSaveReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ token, data }: { token: string; data: CreateDailyReportRequest }) =>
      repo.createOrUpdate(token, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dailyReportKeys.all });
      // Los reportes alimentan el consolidado (cumplimiento, dias con reporte,
      // totales). Hay que invalidar para refrescar dashboards.
      void queryClient.invalidateQueries({ queryKey: consolidatedKeys.all });
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
      void queryClient.invalidateQueries({ queryKey: consolidatedKeys.all });
    },
  });
};
