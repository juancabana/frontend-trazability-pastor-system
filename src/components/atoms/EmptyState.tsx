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
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  actionIcon: ActionIcon,
}: EmptyStateProps) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center p-8">
        {Icon && (
          <div className={`${iconBox.xl} ${iconBox.primary} mx-auto mb-6`}>
            <Icon size={40} className="text-teal-500" />
          </div>
        )}
        <h2 className="text-gray-900 text-2xl font-bold mb-2">{title}</h2>
        {description && (
          <p className="text-gray-500 mb-6">{description}</p>
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
