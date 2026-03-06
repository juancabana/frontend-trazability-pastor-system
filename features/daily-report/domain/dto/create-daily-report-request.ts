import type { ActivityEntry } from '../entities/daily-report';

export interface CreateDailyReportRequest {
  date: string;
  activities: ActivityEntry[];
  observations?: string;
}
