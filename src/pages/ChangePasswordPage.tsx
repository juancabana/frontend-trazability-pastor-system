import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Lock, Eye, EyeOff, Check, X, Loader2, ShieldCheck, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { useChangeOwnPassword } from '@/features/auth/presentation/hooks/use-auth-mutations';
import { getRoleRedirect } from '@/components/ProtectedRoute';

interface StrengthRule {
  label: string;
  test: (v: string) => boolean;
}

const RULES: StrengthRule[] = [
  { label: 'Al menos 8 caracteres', test: (v) => v.length >= 8 },
  { label: 'Una letra mayúscula', test: (v) => /[A-Z]/.test(v) },
  { label: 'Una letra minúscula', test: (v) => /[a-z]/.test(v) },
  { label: 'Un número', test: (v) => /\d/.test(v) },
];

function getStrengthLevel(password: string): number {
  return RULES.filter((r) => r.test(password)).length;
}

const STRENGTH_CONFIG = [
  { label: '', color: 'bg-gray-200 dark:bg-slate-700' },
  { label: 'Muy débil', color: 'bg-red-500' },
  { label: 'Débil', color: 'bg-orange-500' },
  { label: 'Aceptable', color: 'bg-yellow-500' },
  { label: 'Fuerte', color: 'bg-teal-500' },
];

export default function ChangePasswordPage() {
  const { token, currentUser, role, clearMustChangePassword, logout } = useAuth();
  const navigate = useNavigate();
  const mutation = useChangeOwnPassword();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const strength = getStrengthLevel(newPassword);
  const passwordsMatch = newPassword.length > 0 && confirmPassword === newPassword;
  const canSubmit =
    strength === RULES.length && passwordsMatch && !mutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!passwordsMatch) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (strength < RULES.length) {
      setError('La contraseña no cumple todos los requisitos.');
      return;
    }

    try {
      await mutation.mutateAsync({ token: token!, newPassword });
      clearMustChangePassword();
      setSuccess(true);
      setTimeout(() => {
        navigate(getRoleRedirect(role), { replace: true });
      }, 1500);
    } catch {
      setError('No se pudo actualizar la contraseña. Intente de nuevo.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-slate-950">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[48%] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <img src="/iasd-logo-dark.png" alt="IASD" className="w-12 h-12 rounded-full" />
            <div>
              <span className="text-sm font-semibold tracking-wide">IASD</span>
              <p className="text-[10px] text-white/40 font-medium tracking-wider uppercase">
                Sistema Pastoral
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-teal-400" />
            </div>
          </div>

          <h1 className="text-[38px] font-light mb-5 leading-[1.15] tracking-tight">
            Configura tu
            <br />
            <span className="font-semibold bg-gradient-to-r from-teal-300 to-emerald-300 bg-clip-text text-transparent">
              contraseña
            </span>
            <br />
            segura
          </h1>
          <p className="text-sm text-white/50 max-w-sm leading-relaxed">
            Por seguridad, debes establecer una contraseña personal antes de continuar.
            Esta es la única vez que se te solicitará este paso.
          </p>
        </div>

        <div className="relative z-10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
            <p className="text-xs text-white/40 leading-relaxed mb-3 font-medium uppercase tracking-wider">
              Requisitos de seguridad
            </p>
            <ul className="space-y-2">
              {RULES.map((rule) => {
                const passes = rule.test(newPassword);
                return (
                  <li key={rule.label} className="flex items-center gap-2.5 text-sm">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        passes
                          ? 'bg-teal-500/30 text-teal-400'
                          : 'bg-white/10 text-white/20'
                      }`}
                    >
                      <Check className="w-2.5 h-2.5" />
                    </span>
                    <span className={passes ? 'text-white/80' : 'text-white/30'}>
                      {rule.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="mt-10 text-[11px] text-white/20">
            &copy; {new Date().getFullYear()} Iglesia Adventista del Séptimo Día
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="lg:hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white px-6 py-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/15 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-4">
            <img src="/iasd-logo-dark.png" alt="IASD" className="w-10 h-10 rounded-full" />
            <span className="text-xs font-semibold tracking-wide opacity-80">IASD</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <h1 className="text-2xl font-semibold leading-tight">
              Configura tu <span className="text-teal-400">contraseña</span>
            </h1>
          </div>
          <p className="text-xs text-white/50">
            Establece una contraseña segura para continuar
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-start lg:items-center justify-center p-5 sm:p-8 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-[420px]"
        >
          {currentUser && (
            <div className="flex items-center gap-3 mb-7 p-3.5 bg-white dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700 rounded-2xl">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {currentUser.displayName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {currentUser.displayName}
                </p>
                <p className="text-xs text-gray-400 dark:text-slate-500 truncate">
                  {currentUser.email}
                </p>
              </div>
            </div>
          )}

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
            Nueva contraseña
          </h2>
          <p className="text-sm text-gray-400 dark:text-slate-500 mb-7">
            Elige una contraseña que no hayas usado antes
          </p>

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 rounded-xl p-4 mb-6"
              >
                <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm font-medium text-teal-700 dark:text-teal-300">
                  Contraseña actualizada. Redirigiendo...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New password */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 bg-gray-100 dark:bg-slate-800 rounded-xl text-sm border border-transparent focus:border-teal-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 transition-colors"
                  disabled={mutation.isPending ?? success}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength bar */}
              {newPassword.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2.5"
                >
                  <div className="flex gap-1 mb-1.5">
                    {RULES.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i < strength
                            ? STRENGTH_CONFIG[strength].color
                            : 'bg-gray-200 dark:bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  {strength < RULES.length && (
                    <p className="text-xs text-gray-400 dark:text-slate-500">
                      {STRENGTH_CONFIG[strength].label}
                    </p>
                  )}
                </motion.div>
              )}

              {/* Rules checklist — mobile only (desktop shows in left panel) */}
              {newPassword.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="lg:hidden mt-3 space-y-1"
                >
                  {RULES.map((rule) => {
                    const passes = rule.test(newPassword);
                    return (
                      <li key={rule.label} className="flex items-center gap-2 text-xs">
                        {passes ? (
                          <Check className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600 flex-shrink-0" />
                        )}
                        <span className={passes ? 'text-gray-700 dark:text-slate-300' : 'text-gray-400 dark:text-slate-600'}>
                          {rule.label}
                        </span>
                      </li>
                    );
                  })}
                </motion.ul>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pr-11 bg-gray-100 dark:bg-slate-800 rounded-xl text-sm border outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 transition-colors ${
                    confirmPassword.length > 0
                      ? passwordsMatch
                        ? 'border-teal-500'
                        : 'border-red-400 dark:border-red-600'
                      : 'border-transparent focus:border-teal-500'
                  }`}
                  disabled={mutation.isPending || success}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-red-500 mt-1.5">Las contraseñas no coinciden</p>
              )}
              {confirmPassword.length > 0 && passwordsMatch && (
                <p className="text-xs text-teal-500 mt-1.5 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Las contraseñas coinciden
                </p>
              )}
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
              disabled={!canSubmit}
              className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl flex items-center justify-center gap-2 text-sm font-medium hover:shadow-lg hover:shadow-teal-900/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Establecer contraseña
                </>
              )}
            </button>
          </form>

          <button
            type="button"
            onClick={() => { logout(); navigate('/login', { replace: true }); }}
            className="mt-5 w-full flex items-center justify-center gap-2 text-sm text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors py-2"
          >
            <LogOut className="w-3.5 h-3.5" /> Cerrar sesión e ingresar con otra cuenta
          </button>
        </motion.div>
      </div>
    </div>
  );
}
