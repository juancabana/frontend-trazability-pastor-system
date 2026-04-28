export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  httpMethod: string;
  endpoint: string;
  ipAddress: string;
  statusCode: number;
  eventType: 'http_request' | 'login' | 'login_failed';
  createdAt: string;
}

export interface PaginatedAuditLogs {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditLogFilters {
  userId?: string;
  eventType?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}
