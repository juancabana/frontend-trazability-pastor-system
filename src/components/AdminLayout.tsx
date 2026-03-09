import { LayoutDashboard, Users, BarChart3, UserCog } from 'lucide-react';
import { SidebarLayout } from './SidebarLayout';

const ADMIN_NAV = [
  { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Pastores', href: '/admin/pastores', icon: <Users className="w-4 h-4" /> },
  {
    label: 'Consolidado',
    href: '/admin/consolidated',
    icon: <BarChart3 className="w-4 h-4" />,
  },
  { label: 'Usuarios', href: '/admin/usuarios', icon: <UserCog className="w-4 h-4" /> },
];

export function AdminLayout() {
  return <SidebarLayout items={ADMIN_NAV} />;
}
