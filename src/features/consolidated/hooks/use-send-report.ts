import { useMutation } from '@tanstack/react-query';
import { httpAdapter } from '@/shared/infra/adapters/fetch-http-adapter';
import { ConsolidatedRepositoryApiImpl } from '../infra/adapters/consolidated-repository-api-impl';
import type { SendReportRequest } from '../domain/entities/send-report';

const repo = new ConsolidatedRepositoryApiImpl(httpAdapter);

export const useSendReport = () =>
  useMutation({
    mutationFn: ({ token, data }: { token: string; data: SendReportRequest }) =>
      repo.sendReport(token, data),
  });
