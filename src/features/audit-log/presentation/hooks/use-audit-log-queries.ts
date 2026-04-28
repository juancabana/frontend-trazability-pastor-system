import { useQuery } from '@tanstack/react-query';
import { httpAdapter } from '@/shared/infra/adapters/fetch-http-adapter';
import { useAuth } from '@/context/AuthContext';
import { AuditLogRepositoryApiImpl } from '../../infra/adapters/audit-log-repository-api-impl';
import { auditLogKeys } from '../../infra/audit-log-key-factory';
import type { AuditLogFilters } from '../../domain/entities/audit-log';

const repo = new AuditLogRepositoryApiImpl(httpAdapter);

export const useAuditLogs = (filters?: AuditLogFilters) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: auditLogKeys.list(filters),
    queryFn: () => repo.getAll(token!, filters),
    enabled: !!token,
  });
};
