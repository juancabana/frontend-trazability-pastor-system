import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  ChevronRight,
  Mail,
  Lock,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { getRoleRedirect } from '@/components/ProtectedRoute';

export default function LoginPage() {
  const { login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && role) {
      navigate(getRoleRedirect(role), { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await login(email, password);
    if (result) {
      if (result.mustChangePassword) {
        navigate('/change-password', { replace: true });
      } else {
        navigate(getRoleRedirect(result.role));
      }
    } else {
      setError('Credenciales invalidas. Verifique su correo y contraseña.');
    }
    setSubmitting(false);
  };

  const handleQuickAccess = async (demoRole: 'pastor' | 'admin' | 'super_admin') => {
    setError('');
    setSubmitting(true);
    const emailMap = {
      pastor: import.meta.env.VITE_DEMO_PASTOR_EMAIL || '',
      admin: import.meta.env.VITE_DEMO_ADMIN_EMAIL || '',
      super_admin: import.meta.env.VITE_DEMO_SUPERADMIN_EMAIL || '',
    };
    const result = await login(emailMap[demoRole], import.meta.env.VITE_DEMO_PASSWORD || '');
    if (result) {
      if (result.mustChangePassword) {
        navigate('/change-password', { replace: true });
      } else {
        navigate(getRoleRedirect(result.role));
      }
    } else {
      setError('Error en acceso rapido. Verifique que el backend esta corriendo.');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-slate-950">
      {/* Left panel - desktop only */}
      <div className="hidden lg:flex lg:w-[48%] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-16"
          >
            <img src="/iasd-logo-dark.png" alt="IASD" className="w-12 h-12 rounded-full" />
            <div>
              <span className="text-sm font-semibold tracking-wide">IASD</span>
              <p className="text-[10px] text-white/40 font-medium tracking-wider uppercase">
                Sistema Pastoral
              </p>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[42px] font-light mb-5 leading-[1.15] tracking-tight"
          >
            Sistema de
            <br />
            <span className="font-semibold bg-gradient-to-r from-teal-300 to-emerald-300 bg-clip-text text-transparent">
              Trazabilidad
            </span>
            <br />
            Pastoral
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm text-white/50 max-w-sm leading-relaxed"
          >
            Plataforma para el registro y seguimiento de actividades diarias de
            pastores distritales en la Iglesia Adventista del Septimo Dia.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative z-10"
        >
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span className="text-sm font-medium">
                Plataforma Multi-Union
              </span>
            </div>
            <p className="text-xs text-white/40 leading-relaxed">
              Cada union, asociacion y distrito tiene su propio espacio con datos
              independientes, pastores y administradores.
            </p>
          </div>

          <div className="flex gap-10">
            {[
              { value: 7, label: 'Rubros' },
              { value: 42, label: 'Subcategorias' },
              { value: 3, label: 'Roles' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-2xl font-semibold">{stat.value}</div>
                <div className="text-[11px] text-white/30 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-[11px] text-white/20">
            &copy; {new Date().getFullYear()} Iglesia Adventista del Septimo Dia
          </div>
        </motion.div>
      </div>

      {/* Mobile header */}
      <div className="lg:hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white px-6 py-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/15 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-4">
            <img src="/iasd-logo-dark.png" alt="IASD" className="w-10 h-10 rounded-full" />
            <span className="text-xs font-semibold tracking-wide opacity-80">
              IASD
            </span>
          </div>
          <h1 className="text-2xl font-semibold leading-tight mb-1">
            Sistema de{' '}
            <span className="text-teal-400">Trazabilidad</span> Pastoral
          </h1>
          <p className="text-xs text-white/50">
            Registro y seguimiento de actividades pastorales
          </p>
        </div>
      </div>

      {/* Login form */}
      <div className="flex-1 flex items-start lg:items-center justify-center p-5 sm:p-8 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="w-full max-w-[420px]"
        >
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
            Iniciar Sesion
          </h2>
          <p className="text-sm text-gray-400 dark:text-slate-500 mb-7">
            Ingrese sus credenciales para acceder al sistema
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Correo electronico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-800 rounded-xl text-sm border border-transparent focus:border-teal-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 transition-colors"
                disabled={submitting}
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-800 rounded-xl text-sm border border-transparent focus:border-teal-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 transition-colors"
                disabled={submitting}
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/30 px-4 py-2.5 rounded-xl"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl flex items-center justify-center gap-2 text-sm font-medium hover:shadow-lg hover:shadow-slate-900/20 transition-all duration-200 disabled:opacity-50 active:scale-[0.98]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Ingresando...
                </>
              ) : (
                <>
                  Ingresar <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick access - solo en desarrollo */}
          {!import.meta.env.PROD && (
            <QuickAccessDemo onAccess={handleQuickAccess} submitting={submitting} />
          )}

        </motion.div>
      </div>
    </div>
  );
}

function QuickAccessDemo({
  onAccess,
  submitting,
}: {
  onAccess: (role: 'pastor' | 'admin' | 'super_admin') => void;
  submitting: boolean;
}) {
  const roles = [
    { key: 'pastor' as const, label: 'Pastor', initials: 'CM', color: 'from-teal-500 to-teal-600' },
    { key: 'admin' as const, label: 'Admin', initials: 'AD', color: 'from-indigo-500 to-indigo-600' },
    { key: 'super_admin' as const, label: 'Super', initials: 'SA', color: 'from-purple-500 to-purple-600' },
  ];

  return (
    <div className="mt-8">
      <div className="relative flex items-center justify-center mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-slate-700" />
        </div>
        <span className="relative bg-gray-50 dark:bg-slate-950 px-3 text-xs text-gray-400 dark:text-slate-500">
          Acceso rapido demo
        </span>
      </div>
      <div className="flex gap-3">
        {roles.map((r) => (
          <button
            key={r.key}
            onClick={() => onAccess(r.key)}
            disabled={submitting}
            className="flex-1 py-3.5 border border-gray-200 dark:border-slate-700 rounded-xl flex items-center justify-center gap-2.5 hover:bg-white dark:hover:bg-slate-800 transition-all bg-white/50 dark:bg-slate-900/50 disabled:opacity-50 active:scale-[0.98]"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            ) : (
              <>
                <span className={`w-8 h-8 bg-gradient-to-br ${r.color} text-white rounded-xl flex items-center justify-center text-xs font-semibold shadow-sm`}>
                  {r.initials}
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  {r.label}
                </span>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
