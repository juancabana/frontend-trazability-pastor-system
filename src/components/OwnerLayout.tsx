import { ScrollText } from 'lucide-react';
import { SidebarLayout } from './SidebarLayout';

const OWNER_NAV = [
  { label: 'Registros de Auditoría', href: '/owner/audit-logs', icon: <ScrollText className="w-4 h-4" /> },
];

export function OwnerLayout() {
  return <SidebarLayout items={OWNER_NAV} />;
}
