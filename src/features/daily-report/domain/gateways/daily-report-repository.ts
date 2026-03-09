import type { DailyReport } from '../entities/daily-report';
import type { CreateDailyReportRequest } from '../dto/create-daily-report-request';

export interface DailyReportRepository {
  createOrUpdate(token: string, data: CreateDailyReportRequest): Promise<DailyReport>;
  getByPastor(token: string, pastorId: string): Promise<DailyReport[]>;
  getByPastorAndMonth(token: string, pastorId: string, month: number, year: number): Promise<DailyReport[]>;
  getByPastorAndDate(token: string, pastorId: string, date: string): Promise<DailyReport | null>;
  delete(token: string, id: string): Promise<void>;
}
