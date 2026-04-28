import type { HttpGateway } from '@/shared/domain/gateways/http-gateway';
import type { AuditLogRepository } from '../../domain/gateways/audit-log-repository';
import type { AuditLogFilters, PaginatedAuditLogs } from '../../domain/entities/audit-log';
import { API_ENDPOINTS } from '@/constants/api';

export class AuditLogRepositoryApiImpl implements AuditLogRepository {
  constructor(private readonly http: HttpGateway) {}

  getAll(token: string, filters?: AuditLogFilters): Promise<PaginatedAuditLogs> {
    const params = new URLSearchParams();
    if (filters?.userId) params.set('userId', filters.userId);
    if (filters?.eventType) params.set('eventType', filters.eventType);
    if (filters?.from) params.set('from', filters.from);
    if (filters?.to) params.set('to', filters.to);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));

    const qs = params.toString();
    const url = qs ? `${API_ENDPOINTS.AUDIT_LOGS.LIST}?${qs}` : API_ENDPOINTS.AUDIT_LOGS.LIST;
    return this.http.get<PaginatedAuditLogs>(url, token);
  }
}
