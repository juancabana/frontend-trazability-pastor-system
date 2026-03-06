import React from 'react';
import { text } from '@/config/theme';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className={text.pageTitle}>{title}</h1>
        {subtitle && <p className={text.small}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
