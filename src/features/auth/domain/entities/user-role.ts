export type UserRole = 'pastor' | 'admin_readonly' | 'admin' | 'super_admin';

export const ROLE_CONFIG: Record<
  UserRole,
  { label: string; color: string; bg: string }
> = {
  pastor: { label: 'Pastor', color: 'text-teal-700', bg: 'bg-teal-100' },
  admin_readonly: { label: 'Administrador Lector', color: 'text-sky-700', bg: 'bg-sky-100' },
  admin: { label: 'Administrador', color: 'text-indigo-700', bg: 'bg-indigo-100' },
  super_admin: { label: 'Super Admin', color: 'text-purple-700', bg: 'bg-purple-100' },
};

export const ROLE_ACCESS: Record<UserRole, string[]> = {
  pastor: ['calendar', 'report', 'consolidated'],
  admin_readonly: ['dashboard', 'pastores', 'reports', 'consolidated', 'usuarios', 'distritos'],
  admin: ['dashboard', 'pastores', 'reports', 'consolidated', 'usuarios', 'distritos'],
  super_admin: ['dashboard', 'associations', 'consolidated', 'pastores', 'reports'],
};
