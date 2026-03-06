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
    'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-teal-500 px-4 py-2',
  success:
    'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 px-4 py-2',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 px-4 py-2',
  ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-400 px-4 py-2',
  sm: 'text-sm px-3 py-1.5',
  lg: 'text-lg px-6 py-3',
  icon: 'p-2',
} as const;

// ── Inputs ───────────────────────────────────────────────────────────
export const input = {
  base: 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors',
  error: 'border-red-400 focus:border-red-500 focus:ring-red-500',
  select:
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white',
  textarea:
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none resize-none',
} as const;

// ── Cards ────────────────────────────────────────────────────────────
export const card = {
  base: 'bg-white rounded-xl border border-gray-200 p-4 shadow-sm',
  hover: 'bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer',
  flat: 'bg-gray-50 rounded-xl p-4',
} as const;

// ── Badges ───────────────────────────────────────────────────────────
export const badge = {
  base: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  success: 'bg-green-100 text-green-800',
  danger: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  info: 'bg-blue-100 text-blue-800',
  primary: 'bg-teal-100 text-teal-800',
  neutral: 'bg-gray-100 text-gray-800',
} as const;

// ── Layout ───────────────────────────────────────────────────────────
export const layout = {
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  page: 'py-6 space-y-6',
  section: 'space-y-4',
} as const;

// ── Overlay / Modal ──────────────────────────────────────────────────
export const overlay = {
  backdrop:
    'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4',
  panel:
    'w-full bg-white rounded-2xl shadow-xl overflow-hidden',
} as const;

// ── IconBox ─────────────────────────────────────────────────────────
export const iconBox = {
  sm: 'w-8 h-8 rounded-lg flex items-center justify-center',
  md: 'w-10 h-10 rounded-xl flex items-center justify-center',
  lg: 'w-12 h-12 rounded-xl flex items-center justify-center',
  xl: 'w-16 h-16 rounded-2xl flex items-center justify-center',
  primary: 'bg-teal-100',
} as const;

// ── Typography ───────────────────────────────────────────────────────
export const text = {
  pageTitle: 'text-2xl font-bold text-gray-900',
  sectionTitle: 'text-lg font-semibold text-gray-900',
  cardTitle: 'text-base font-semibold text-gray-900',
  label: 'text-sm font-medium text-gray-700',
  small: 'text-xs text-gray-500',
  body: 'text-sm text-gray-600',
} as const;
