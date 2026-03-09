export const ROLE_CONFIG = {
  pastor: { label: 'Pastor', color: 'text-teal-700', bg: 'bg-teal-100' },
  admin: {
    label: 'Administrador',
    color: 'text-indigo-700',
    bg: 'bg-indigo-100',
  },
} as const;

export const ROLE_ACCESS: Record<string, string[]> = {
  pastor: ['calendar', 'report', 'consolidated'],
  admin: ['dashboard', 'pastores', 'reports', 'consolidated', 'usuarios'],
};

export const SIDEBAR_NAV = {
  pastor: [
    { label: 'Calendario', href: '/pastor', icon: 'Calendar' },
    {
      label: 'Consolidado',
      href: '/pastor/consolidated',
      icon: 'BarChart3',
    },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
    { label: 'Pastores', href: '/admin/pastores', icon: 'Users' },
    {
      label: 'Consolidado',
      href: '/admin/consolidated',
      icon: 'BarChart3',
    },
    { label: 'Usuarios', href: '/admin/usuarios', icon: 'UserCog' },
  ],
} as const;
