import React from 'react';
import { cn } from '../../lib/cn';

export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ icon, title, description, action, className }) => (
  <div className={cn('text-center space-y-3', className)}>
    {icon && <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-800">{icon}</div>}
    <div className="space-y-1">
      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{title}</h4>
      {description && <p className="text-xs text-slate-400">{description}</p>}
    </div>
    {action}
  </div>
);
