export const appRoutes = {
  LOGIN: {
    path: '/login',
    getHref: () => '/login',
  },
  PASTOR: {
    CALENDAR: {
      path: '/pastor',
      getHref: () => '/pastor',
    },
    REPORT_EDIT: {
      path: '/pastor/report/[date]/edit',
      getHref: (date: string) => `/pastor/report/${date}/edit`,
    },
    REPORT_DETAIL: {
      path: '/pastor/report/[date]',
      getHref: (date: string) => `/pastor/report/${date}`,
    },
    CONSOLIDATED: {
      path: '/pastor/consolidated',
      getHref: () => '/pastor/consolidated',
    },
  },
  ADMIN: {
    DASHBOARD: {
      path: '/admin',
      getHref: () => '/admin',
    },
    PASTORES: {
      path: '/admin/pastores',
      getHref: () => '/admin/pastores',
    },
    PASTOR_REPORTS: {
      path: '/admin/pastor/[pastorId]',
      getHref: (pastorId: string) => `/admin/pastor/${pastorId}`,
    },
    REPORT_DETAIL: {
      path: '/admin/pastor/[pastorId]/report/[date]',
      getHref: (pastorId: string, date: string) =>
        `/admin/pastor/${pastorId}/report/${date}`,
    },
    CONSOLIDATED: {
      path: '/admin/consolidated',
      getHref: () => '/admin/consolidated',
    },
    USERS: {
      path: '/admin/usuarios',
      getHref: () => '/admin/usuarios',
    },
  },
} as const;
