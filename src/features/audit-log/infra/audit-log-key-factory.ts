import type { AuditLogFilters } from '../domain/entities/audit-log';

export const auditLogKeys = {
  all: ['audit-logs'] as const,
  list: (filters?: AuditLogFilters) => [...auditLogKeys.all, 'list', filters] as const,
};
