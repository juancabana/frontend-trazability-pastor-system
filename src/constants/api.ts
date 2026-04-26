export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    ME: '/auth/me',
    USERS: '/auth/users',
    USER_BY_ID: (id: string) => `/auth/users/${id}`,
    CHANGE_PASSWORD: '/auth/me/password',
  },
  ASSOCIATIONS: {
    LIST: '/associations',
    BY_ID: (id: string) => `/associations/${id}`,
    MY_DEADLINE: '/associations/my/deadline',
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
    BY_PASTOR: (pastorId: string, periodOffset: number) =>
      `/consolidated/pastor/${pastorId}?periodOffset=${periodOffset}`,
    BY_ASSOCIATION: (assocId: string, periodOffset: number) =>
      `/consolidated/association/${assocId}?periodOffset=${periodOffset}`,
    BY_UNION: (unionId: string, periodOffset: number) =>
      `/consolidated/union/${unionId}?periodOffset=${periodOffset}`,
    BY_PASTORS: (pastorIds: string[], periodOffset: number) =>
      `/consolidated/custom?pastorIds=${pastorIds.join(',')}&periodOffset=${periodOffset}`,
    SEND_REPORT: '/consolidated/send-report',
  },
  ADMIN_RECIPIENTS: (associationId: string) =>
    `/auth/admin-recipients?associationId=${associationId}`,
  UNIONS: {
    LIST: '/unions',
  },
  CHURCHES: {
    LIST: '/churches',
    BY_ID: (id: string) => `/churches/${id}`,
  },
} as const;
