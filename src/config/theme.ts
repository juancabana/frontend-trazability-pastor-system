/**
 * Design tokens para Pastor Activity Tracking.
 * Paleta principal: teal/slate (vs orange en Takillero).
 */

// ── Botones ──────────────────────────────────────────────────────────
export const btn = {
  base: 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  primary:
    'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 px-4 py-2',
  primaryPill:
    'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 px-6 py-2 rounded-full',
  outline:
    'border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 focus:ring-teal-500 px-4 py-2',
  success:
    'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 px-4 py-2',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 px-4 py-2',
  ghost: 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 focus:ring-gray-400 px-4 py-2',
  sm: 'text-sm px-3 py-1.5',
  lg: 'text-lg px-6 py-3',
  icon: 'p-2',
} as const;

// ── Inputs ───────────────────────────────────────────────────────────
export const input = {
  base: 'w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600',
  error: 'border-red-400 focus:border-red-500 focus:ring-red-500',
  select:
    'w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white',
  textarea:
    'w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none resize-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600',
} as const;

// ── Cards ────────────────────────────────────────────────────────────
export const card = {
  base: 'bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm',
  hover: 'bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer',
  flat: 'bg-gray-50 dark:bg-slate-950 rounded-xl p-4',
} as const;

// ── Badges ───────────────────────────────────────────────────────────
export const badge = {
  base: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  danger: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
  warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
  info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  primary: 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-400',
  neutral: 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-300',
} as const;

// ── Layout ───────────────────────────────────────────────────────────
export const layout = {
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  page: 'py-6 space-y-6',
  section: 'space-y-4',
} as const;

// ── Overlay / Modal ──────────────────────────────────────────────────
// El backdrop es el contenedor de scroll (overflow-y-auto) y `container`
// es el wrapper interno que centra el panel pero permite que el contenido
// crezca verticalmente y se haga scroll cuando excede el viewport (móvil).
export const overlay = {
  backdrop:
    'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm overflow-y-auto overscroll-contain',
  container:
    'flex min-h-full items-center justify-center p-4',
  panel:
    'w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden my-auto',
} as const;

// ── IconBox ─────────────────────────────────────────────────────────
export const iconBox = {
  sm: 'w-8 h-8 rounded-lg flex items-center justify-center',
  md: 'w-10 h-10 rounded-xl flex items-center justify-center',
  lg: 'w-12 h-12 rounded-xl flex items-center justify-center',
  xl: 'w-16 h-16 rounded-2xl flex items-center justify-center',
  primary: 'bg-teal-100 dark:bg-teal-900/30',
} as const;

// ── Typography ───────────────────────────────────────────────────────
export const text = {
  pageTitle: 'text-2xl font-bold text-gray-900 dark:text-white',
  sectionTitle: 'text-lg font-semibold text-gray-900 dark:text-white',
  cardTitle: 'text-base font-semibold text-gray-900 dark:text-white',
  label: 'text-sm font-medium text-gray-700 dark:text-slate-300',
  small: 'text-xs text-gray-500 dark:text-slate-400',
  body: 'text-sm text-gray-600 dark:text-slate-400',
} as const;
