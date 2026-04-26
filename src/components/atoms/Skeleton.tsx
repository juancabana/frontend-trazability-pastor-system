import React from 'react';

/**
 * Skeleton primitives ligeros y consistentes con el design system.
 *
 * Reglas de uso:
 * - `<Skeleton />` es el bloque base. Acepta `className` para tamaño y forma
 *   (ancho/alto/rounded).
 * - Las composiciones específicas (StatsGridSkeleton, TableSkeleton, etc.)
 *   replican fielmente la estructura final para evitar layout shift cuando
 *   llega la data del backend.
 * - Todos los skeletons usan `animate-pulse` de Tailwind y los mismos colores
 *   neutros que las cards reales (`bg-gray-100 dark:bg-slate-800`).
 */

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = '', ...rest }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-gray-200/80 dark:bg-slate-700/60 rounded-md ${className}`}
      {...rest}
    />
  );
}

/** Skeleton de una "stat card" (icono + label + valor + sub). */
export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Skeleton className="w-7 h-7 rounded-lg" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-6 w-20 mb-1.5" />
      <Skeleton className="h-3 w-12" />
    </div>
  );
}

/** Grilla de stat cards (responsive 2/4 columnas). */
export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Skeleton de un ítem de lista con avatar + 2 líneas + métricas opcionales. */
export function ListItemSkeleton({ withMetrics = true }: { withMetrics?: boolean }) {
  return (
    <div className="w-full px-5 py-3.5 flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      {withMetrics && (
        <div className="hidden sm:flex items-center gap-4 shrink-0">
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-8" />
            <Skeleton className="h-2.5 w-6" />
          </div>
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      )}
    </div>
  );
}

/** Lista skeleton con header + N filas, dentro de una card. */
export function ListSkeleton({
  rows = 5,
  withHeader = true,
  withMetrics = true,
}: {
  rows?: number;
  withHeader?: boolean;
  withMetrics?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
      {withHeader && (
        <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800">
          <Skeleton className="h-4 w-48" />
        </div>
      )}
      <div className="divide-y divide-gray-50 dark:divide-slate-800">
        {Array.from({ length: rows }).map((_, i) => (
          <ListItemSkeleton key={i} withMetrics={withMetrics} />
        ))}
      </div>
    </div>
  );
}

/** Skeleton de barras horizontales (breakdown por categoría). */
export function BarChartSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5">
      <Skeleton className="h-4 w-40 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton
              className="h-2 rounded-full"
              style={{ width: `${85 - i * 12}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton de calendario mensual (7 columnas, 6 filas). */
export function CalendarSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4">
      <div className="grid grid-cols-7 gap-2 mb-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-6 mx-auto" />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 42 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    </div>
  );
}

/** Skeleton de tabla (header + filas). */
export function TableSkeleton({
  columns = 5,
  rows = 5,
  title,
}: {
  columns?: number;
  rows?: number;
  title?: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
      {title !== undefined && (
        <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800">
          <Skeleton className="h-4 w-48" />
        </div>
      )}
      <div className="px-5 py-3 border-b border-gray-100 dark:border-slate-800 hidden sm:grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-16" />
        ))}
      </div>
      <div className="divide-y divide-gray-50 dark:divide-slate-800">
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className="px-5 py-3.5 grid gap-3 items-center"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={c} className="h-3.5 w-full max-w-[140px]" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton para un detalle (encabezado + bloques de contenido). */
export function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 space-y-3">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 space-y-3">
        <Skeleton className="h-4 w-32" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
