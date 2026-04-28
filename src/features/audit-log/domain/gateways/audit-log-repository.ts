import type { AuditLogFilters, PaginatedAuditLogs } from '../entities/audit-log';

export interface AuditLogRepository {
  getAll(token: string, filters?: AuditLogFilters): Promise<PaginatedAuditLogs>;
}
