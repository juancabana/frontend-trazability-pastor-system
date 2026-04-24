interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom';
  className?: string;
}

/**
 * Tooltip ligero basado en CSS/Tailwind puro.
 * Solo se muestra en hover (desktop). En mobile no interfiere.
 * Usa group/tt para aislar el scope de otros `group` del DOM.
 */
export function Tooltip({ content, children, side = 'top', className = '' }: TooltipProps) {
  return (
    <div className={`relative group/tt inline-flex ${className}`}>
      {children}
      <div
        className={`
          pointer-events-none absolute z-50 whitespace-nowrap
          px-2.5 py-1.5 rounded-lg text-xs font-medium text-white
          bg-gray-900 dark:bg-slate-700
          opacity-0 group-hover/tt:opacity-100
          transition-opacity duration-150
          ${side === 'top'
            ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
            : 'top-full left-1/2 -translate-x-1/2 mt-2'}
        `}
      >
        {content}
        {/* Arrow */}
        <span
          className={`
            absolute left-1/2 -translate-x-1/2 border-4 border-transparent
            ${side === 'top'
              ? 'top-full border-t-gray-900 dark:border-t-slate-700'
              : 'bottom-full border-b-gray-900 dark:border-b-slate-700'}
          `}
        />
      </div>
    </div>
  );
}
