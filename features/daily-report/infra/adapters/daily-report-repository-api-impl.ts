import type { HttpGateway } from '@/shared/domain/gateways/http-gateway';
import type { DailyReportRepository } from '../../domain/gateways/daily-report-repository';
import type { DailyReport } from '../../domain/entities/daily-report';
import type { CreateDailyReportRequest } from '../../domain/dto/create-daily-report-request';
import { API_ENDPOINTS } from '@/constants/api';

export class DailyReportRepositoryApiImpl implements DailyReportRepository {
  constructor(private readonly http: HttpGateway) {}

  createOrUpdate(token: string, data: CreateDailyReportRequest): Promise<DailyReport> {
    return this.http.post<DailyReport>(API_ENDPOINTS.DAILY_REPORTS.CREATE, data, token);
  }

  getByPastor(token: string, pastorId: string): Promise<DailyReport[]> {
    return this.http.get<DailyReport[]>(API_ENDPOINTS.DAILY_REPORTS.BY_PASTOR(pastorId), token);
  }

  getByPastorAndMonth(token: string, pastorId: string, month: number, year: number): Promise<DailyReport[]> {
    return this.http.get<DailyReport[]>(
      API_ENDPOINTS.DAILY_REPORTS.BY_PASTOR_AND_MONTH(pastorId, month, year),
      token,
    );
  }

  getByPastorAndDate(token: string, pastorId: string, date: string): Promise<DailyReport | null> {
    return this.http.get<DailyReport | null>(
      API_ENDPOINTS.DAILY_REPORTS.BY_PASTOR_AND_DATE(pastorId, date),
      token,
    );
  }

  delete(token: string, id: string): Promise<void> {
    return this.http.delete(API_ENDPOINTS.DAILY_REPORTS.DELETE(id), token);
  }
}
