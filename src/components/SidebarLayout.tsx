import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router';
import {
  LogOut,
  Menu,
  X,
  BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarLayoutProps {
  items: SidebarItem[];
}

export function SidebarLayout({ items }: SidebarLayoutProps) {
  const { currentUser, logout } = useAuth();
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

  const isAdmin = currentUser?.role === 'admin';
  const accentActive = isAdmin
    ? 'bg-indigo-50 text-indigo-700'
    : 'bg-teal-50 text-teal-700';
  const accentBadge = isAdmin ? 'bg-indigo-600' : 'bg-teal-600';
  const accentText = isAdmin ? 'text-indigo-600' : 'text-teal-600';

  const isActive = (href: string) => {
    if (href === '/pastor' || href === '/admin') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* Mobile top bar */}
      <header className="lg:hidden h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 shrink-0 z-40">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-7 h-7 text-teal-600" />
          <div>
            <div className="text-xs font-semibold text-gray-900 leading-tight">
              Trazabilidad Pastoral
            </div>
            <div className="text-[10px] text-gray-400">
              {isAdmin ? 'Administrador' : 'Pastor'}
            </div>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-all"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
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
              className="lg:hidden fixed top-14 left-0 right-0 z-30 bg-white border-b border-gray-100 shadow-xl rounded-b-2xl overflow-hidden"
            >
              <div className="p-3 space-y-1">
                {items.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive(item.href)
                        ? accentActive
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="border-t border-gray-100 p-3">
                <div className="flex items-center gap-3 px-4 py-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-semibold ${accentBadge}`}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {currentUser?.displayName}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {currentUser?.email}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
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
      <aside className="hidden lg:flex w-[220px] bg-white border-r border-gray-100 flex-col shrink-0">
        {/* Brand */}
        <div className="p-5 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-10 h-10 text-teal-600" />
            <div>
              <div className="text-sm font-semibold text-gray-900 leading-tight">
                Trazabilidad
              </div>
              <div className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">
                Pastoral
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl px-3 py-2">
            <p className="text-[11px] font-medium text-gray-500 truncate">
              {currentUser?.associationName || 'Asociacion'}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
            Menu
          </p>
          {items.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                isActive(item.href)
                  ? `${accentActive} shadow-sm`
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-semibold ${accentBadge}`}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">
                {currentUser?.displayName}
              </p>
              <p className="text-[10px] text-gray-400 capitalize">
                {isAdmin ? 'Administrador' : 'Pastor'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg transition-colors"
              title="Cerrar sesion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-auto p-4 sm:p-5 lg:p-8 pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 z-40">
        <div className="flex items-center max-w-md mx-auto">
          {items.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 pt-3 text-[10px] font-medium transition-all relative ${
                isActive(item.href) ? accentText : 'text-gray-400'
              }`}
            >
              {isActive(item.href) && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full ${accentBadge}`}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex-1 flex flex-col items-center gap-0.5 py-2.5 pt-3 text-[10px] font-medium text-gray-400"
          >
            <LogOut className="w-4 h-4" />
            <span>Salir</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
