import { LayoutDashboard, Building2, BarChart3 } from 'lucide-react';
import { SidebarLayout } from './SidebarLayout';

const SUPER_ADMIN_NAV = [
  { label: 'Dashboard', href: '/super-admin', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Asociaciones', href: '/super-admin/associations', icon: <Building2 className="w-4 h-4" /> },
  { label: 'Consolidado', href: '/super-admin/consolidated', icon: <BarChart3 className="w-4 h-4" /> },
];

export function SuperAdminLayout() {
  return <SidebarLayout items={SUPER_ADMIN_NAV} />;
}
