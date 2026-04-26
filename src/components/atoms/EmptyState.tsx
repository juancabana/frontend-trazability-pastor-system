import React from 'react';
import { Link } from 'react-router';
import type { LucideIcon } from 'lucide-react';
import { iconBox, btn } from '@/config/theme';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  actionIcon?: LucideIcon;
  /** compact: para usar dentro de secciones o cards (sin min-height). */
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  actionIcon: ActionIcon,
  compact = false,
}: EmptyStateProps) {
  if (compact) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
        {Icon && (
          <div className={`${iconBox.md} ${iconBox.primary} mb-4`}>
            <Icon size={22} className="text-teal-500" />
          </div>
        )}
        <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">{title}</p>
        {description && (
          <p className="text-xs text-gray-400 dark:text-slate-500 max-w-xs">{description}</p>
        )}
        {actionLabel && actionHref && (
          <Link
            to={actionHref}
            className={`mt-4 ${btn.base} ${btn.primary} gap-2 text-sm`}
          >
            {ActionIcon && <ActionIcon size={15} />}
            {actionLabel}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center p-8">
        {Icon && (
          <div className={`${iconBox.xl} ${iconBox.primary} mx-auto mb-6`}>
            <Icon size={40} className="text-teal-500" />
          </div>
        )}
        <h2 className="text-gray-900 dark:text-white text-2xl font-bold mb-2">{title}</h2>
        {description && (
          <p className="text-gray-500 dark:text-slate-400 mb-6">{description}</p>
        )}
        {actionLabel && actionHref && (
          <Link
            to={actionHref}
            className={`${btn.base} ${btn.primary} gap-2`}
          >
            {ActionIcon && <ActionIcon size={18} />}
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
