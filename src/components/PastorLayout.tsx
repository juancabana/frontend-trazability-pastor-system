import { Calendar, BarChart3 } from 'lucide-react';
import { SidebarLayout } from './SidebarLayout';

const PASTOR_NAV = [
  { label: 'Calendario', href: '/pastor', icon: <Calendar className="w-4 h-4" /> },
  {
    label: 'Consolidado',
    href: '/pastor/consolidated',
    icon: <BarChart3 className="w-4 h-4" />,
  },
];

export function PastorLayout() {
  return <SidebarLayout items={PASTOR_NAV} />;
}
