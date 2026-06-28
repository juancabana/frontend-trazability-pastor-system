export interface ActivityEntry {
  subcategoryId: string;
  categoryId: string;
  description: string;
  quantity: number;
  hours?: number;
  amount?: number;
  evidenceUrls?: string[];
  churchName?: string;
  visitedName?: string;
  visitReason?: string;
}

export interface DailyReport {
  id: string;
  pastorId: string;
  date: string;
  activities: ActivityEntry[];
  observations?: string;
  createdAt: string;
  updatedAt: string;
}
