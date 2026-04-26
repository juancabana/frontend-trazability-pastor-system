import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpAdapter } from '@/shared/infra/adapters/fetch-http-adapter';
import { ConsolidatedRepositoryApiImpl } from '../infra/adapters/consolidated-repository-api-impl';
import { consolidatedKeys } from '../infra/consolidated-key-factory';
import type { SendReportRequest } from '../domain/entities/send-report';

const repo = new ConsolidatedRepositoryApiImpl(httpAdapter);

export const useSendReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ token, data }: { token: string; data: SendReportRequest }) =>
      repo.sendReport(token, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: consolidatedKeys.all });
    },
  });
};
