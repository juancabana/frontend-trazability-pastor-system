import React from 'react';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  sub?: string;
  /** Tailwind text color class (e.g. `text-violet-600 dark:text-violet-400`). */
  color: string;
  /** Tailwind background color class para el badge del icono. */
  bg: string;
  /** Animación de entrada (delay en segundos). */
  delay?: number;
}

/**
 * Tarjeta de métrica reutilizable usada en dashboards y consolidados.
 *
 * Diseño responsive:
 * - Padding e iconos más compactos en mobile para aprovechar el ancho.
 * - El label puede truncarse si excede el espacio disponible (evita overflow
 *   con palabras largas tipo "ACTIVIDADES" o "CUMPLIMIENTO").
 * - El valor reduce un escalón en mobile para no apretar el contenedor.
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bg,
  delay = 0,
}: Readonly<StatCardProps>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-3 sm:p-4 hover:shadow-md transition-all duration-200 min-w-0"
    >
      <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 min-w-0">
        <div
          className={`w-6 h-6 sm:w-7 sm:h-7 ${bg} rounded-lg flex items-center justify-center shrink-0`}
        >
          <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${color}`} />
        </div>
        <span
          className="text-[10px] sm:text-[11px] font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide truncate min-w-0 flex-1"
          title={label}
        >
          {label}
        </span>
      </div>
      <p className={`text-lg sm:text-xl font-semibold ${color} truncate`}>
        {value}
      </p>
      {sub && (
        <p className="text-[10px] sm:text-[11px] text-gray-400 dark:text-slate-500 truncate">
          {sub}
        </p>
      )}
    </motion.div>
  );
}

/** Wrapper de grilla responsive para `StatCard` (2 cols mobile / 4 desktop). */
export function StatsGrid({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-5">
      {children}
    </div>
  );
}
