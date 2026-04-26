import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router';
import {
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarLayoutProps {
  items: SidebarItem[];
}

const ROLE_ACCENT = {
  super_admin: {
    active: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    badge: 'bg-purple-600',
    text: 'text-purple-600 dark:text-purple-400',
    indicator: 'bg-purple-600 dark:bg-purple-400',
    label: 'Super Admin',
  },
  admin: {
    active: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    badge: 'bg-indigo-600',
    text: 'text-indigo-600 dark:text-indigo-400',
    indicator: 'bg-indigo-600 dark:bg-indigo-400',
    label: 'Administrador',
  },
  admin_readonly: {
    active: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    badge: 'bg-sky-600',
    text: 'text-sky-600 dark:text-sky-400',
    indicator: 'bg-sky-600 dark:bg-sky-400',
    label: 'Solo Lectura',
  },
  pastor: {
    active: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    badge: 'bg-teal-600',
    text: 'text-teal-600 dark:text-teal-400',
    indicator: 'bg-teal-600 dark:bg-teal-400',
    label: 'Pastor',
  },
};

export function SidebarLayout({ items }: SidebarLayoutProps) {
  const { currentUser, logout } = useAuth();
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = currentUser?.displayName
    .split(' ')
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'U';

  const accent = ROLE_ACCENT[currentUser?.role ?? 'pastor'];
  const logoSrc = resolvedTheme === 'dark' ? '/iasd-logo-dark.png' : '/iasd-logo-ligth.png';

  const isActive = (href: string) => {
    if (href === '/pastor' || href === '/admin' || href === '/super-admin') return pathname === href;
    return pathname.startsWith(href);
  };

  const orgName = currentUser?.role === 'super_admin'
    ? (currentUser?.unionName || 'Union')
    : (currentUser?.associationName || 'Asociacion');

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
      {/* Mobile top bar */}
      <header className="lg:hidden h-14 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 z-40 transition-colors duration-300">
        <div className="flex items-center gap-2.5">
          <img src={logoSrc} alt="IASD" className="w-7 h-7 rounded-full" />
          <div>
            <div className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">
              Trazabilidad Pastoral
            </div>
            <div className="text-[10px] text-gray-400 dark:text-slate-500">
              {accent.label}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
          >
            {resolvedTheme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile slide-down menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 top-14 z-30 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed top-14 left-0 right-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shadow-xl rounded-b-2xl overflow-hidden transition-colors"
            >
              <div className="p-3 space-y-1">
                {items.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive(item.href)
                        ? accent.active
                        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="border-t border-gray-100 dark:border-slate-800 p-3">
                <div className="flex items-center gap-3 px-4 py-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-semibold ${accent.badge}`}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {currentUser?.displayName}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-slate-500">
                      {currentUser?.email}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[220px] h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex-col shrink-0 transition-colors duration-300">
        {/* Brand */}
        <div className="p-5 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <img src={logoSrc} alt="IASD" className="w-10 h-10 rounded-full" />
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                Trazabilidad
              </div>
              <div className="text-[10px] text-gray-400 dark:text-slate-500 font-medium tracking-wide uppercase">
                Pastoral
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl px-3 py-2 transition-colors">
            <p className="text-[11px] font-medium text-gray-500 dark:text-slate-400 truncate">
              {orgName}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 min-h-0 overflow-y-auto px-3 space-y-1">
          <p className="text-[10px] font-semibold text-gray-400 dark:text-slate-600 uppercase tracking-wider px-3 mb-2">
            Menu
          </p>
          {items.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                isActive(item.href)
                  ? `${accent.active} shadow-sm`
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/50'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Theme toggle */}
        <div className="px-3 pb-2">
          <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-xl p-1 transition-colors">
            {([
              { value: 'light' as const, icon: Sun, label: 'Claro' },
              { value: 'system' as const, icon: Monitor, label: 'Auto' },
              { value: 'dark' as const, icon: Moon, label: 'Oscuro' },
            ]).map(({ value, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex-1 flex items-center justify-center py-1.5 rounded-lg text-xs transition-all duration-200 ${
                  theme === value
                    ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
                }`}
                title={value === 'light' ? 'Claro' : value === 'dark' ? 'Oscuro' : 'Sistema'}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>

        {/* User */}
        <div className="p-3 border-t border-gray-100 dark:border-slate-800 transition-colors">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-semibold ${accent.badge}`}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                {currentUser?.displayName}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 capitalize">
                {accent.label}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-colors"
              title="Cerrar sesion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 lg:p-8 pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-slate-800/50 z-40 transition-colors duration-300">
        <div className="flex items-center max-w-md mx-auto">
          {items.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 pt-3 text-[10px] font-medium transition-all relative ${
                isActive(item.href) ? accent.text : 'text-gray-400 dark:text-slate-500'
              }`}
            >
              {isActive(item.href) && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full ${accent.indicator}`}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex-1 flex flex-col items-center gap-0.5 py-2.5 pt-3 text-[10px] font-medium text-gray-400 dark:text-slate-500"
          >
            <LogOut className="w-4 h-4" />
            <span>Salir</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
