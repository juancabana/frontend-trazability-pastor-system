export const dailyReportKeys = {
  all: ['daily-reports'] as const,
  byPastor: (pastorId: string) => [...dailyReportKeys.all, 'pastor', pastorId] as const,
  byPastorAndMonth: (pastorId: string, month: number, year: number) =>
    [...dailyReportKeys.all, 'pastor', pastorId, month, year] as const,
  byPastorAndDate: (pastorId: string, date: string) =>
    [...dailyReportKeys.all, 'pastor', pastorId, 'date', date] as const,
};
