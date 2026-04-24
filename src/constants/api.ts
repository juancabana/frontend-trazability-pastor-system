export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    USERS: '/auth/users',
    USER_BY_ID: (id: string) => `/auth/users/${id}`,
    CHANGE_PASSWORD: '/auth/me/password',
  },
  ASSOCIATIONS: {
    LIST: '/associations',
    BY_ID: (id: string) => `/associations/${id}`,
  },
  DISTRICTS: {
    LIST: '/districts',
    BY_ASSOCIATION: (assocId: string) =>
      `/districts?associationId=${assocId}`,
  },
  ACTIVITY_CATEGORIES: {
    LIST: '/activity-categories',
  },
  DAILY_REPORTS: {
    CREATE: '/daily-reports',
    BY_PASTOR: (pastorId: string) => `/daily-reports/pastor/${pastorId}`,
    BY_PASTOR_AND_MONTH: (pastorId: string, month: number, year: number) =>
      `/daily-reports/pastor/${pastorId}?month=${month}&year=${year}`,
    BY_PASTOR_AND_DATE: (pastorId: string, date: string) =>
      `/daily-reports/pastor/${pastorId}/date/${date}`,
    DELETE: (id: string) => `/daily-reports/${id}`,
  },
  CONSOLIDATED: {
    BY_PASTOR: (pastorId: string, month: number, year: number) =>
      `/consolidated/pastor/${pastorId}?month=${month}&year=${year}`,
    BY_ASSOCIATION: (assocId: string, month: number, year: number) =>
      `/consolidated/association/${assocId}?month=${month}&year=${year}`,
    BY_UNION: (unionId: string, month: number, year: number) =>
      `/consolidated/union/${unionId}?month=${month}&year=${year}`,
  },
  UNIONS: {
    LIST: '/unions',
  },
  CHURCHES: {
    LIST: '/churches',
    BY_ID: (id: string) => `/churches/${id}`,
  },
} as const;
