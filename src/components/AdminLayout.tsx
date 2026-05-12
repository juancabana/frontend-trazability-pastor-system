import { LayoutDashboard, Users, BarChart3, UserCog, MapPin, Mail, Settings, BookOpen } from 'lucide-react';
import { SidebarLayout } from './SidebarLayout';
import { useFeatureFlags } from '@/features/config/hooks/use-business-config';

const ADMIN_NAV = [
  { label: 'Panel', href: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Pastores', href: '/admin/pastores', icon: <Users className="w-4 h-4" /> },
  { label: 'Distritos', href: '/admin/distritos', icon: <MapPin className="w-4 h-4" /> },
  {
    label: 'Consolidado',
    href: '/admin/consolidated',
    icon: <BarChart3 className="w-4 h-4" />,
  },
  { label: 'Usuarios', href: '/admin/usuarios', icon: <UserCog className="w-4 h-4" /> },
  {
    label: 'Enviar Reporte',
    href: '/admin/send-report',
    icon: <Mail className="w-4 h-4" />,
    feature: 'emailEnabled' as const,
  },
  {
    label: 'Rúbricas PESCAR',
    href: '/admin/rubricas-pescar',
    icon: <BookOpen className="w-4 h-4" />,
  },
  {
    label: 'Configuración',
    href: '/admin/configuracion',
    icon: <Settings className="w-4 h-4" />,
  },
];

export function AdminLayout() {
  const { emailEnabled } = useFeatureFlags();
  const items = ADMIN_NAV.filter((item) => {
    if (item.feature === 'emailEnabled') return emailEnabled;
    return true;
  });
  return <SidebarLayout items={items} />;
}
