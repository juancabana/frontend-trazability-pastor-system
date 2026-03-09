export type UserRole = 'pastor' | 'admin';

export const ROLE_CONFIG: Record<
  UserRole,
  { label: string; color: string; bg: string }
> = {
  pastor: { label: 'Pastor', color: 'text-teal-700', bg: 'bg-teal-100' },
  admin: { label: 'Administrador', color: 'text-indigo-700', bg: 'bg-indigo-100' },
};

export const ROLE_ACCESS: Record<UserRole, string[]> = {
  pastor: ['calendar', 'report', 'consolidated'],
  admin: ['dashboard', 'pastores', 'reports', 'consolidated', 'usuarios'],
};
