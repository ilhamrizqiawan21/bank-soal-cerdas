import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { ToastMessage } from '../../types';
import { IconButton } from './IconButton';

const styles = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200',
  danger: 'border-red-200 bg-red-50 text-red-950 dark:bg-red-950/40 dark:border-red-800 dark:text-red-200',
  warning: 'border-amber-200 bg-amber-50 text-amber-950 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200',
  info: 'border-blue-200 bg-blue-50 text-blue-950 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-200',
};

const icons = {
  success: <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />,
  danger: <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />,
  warning: <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />,
  info: <Info className="h-5 w-5 shrink-0 text-blue-500" />,
};

export const Toast: React.FC<{ toast: ToastMessage; onClose: () => void; className?: string }> = ({ toast, onClose, className }) => (
  <div className={cn('pointer-events-auto flex items-start gap-3 rounded-lg border p-3.5 shadow-lg backdrop-blur-sm', styles[toast.type], className)}>
    {icons[toast.type]}
    <div className="flex-1 text-sm font-medium leading-snug">{toast.message}</div>
    <IconButton label="Tutup notifikasi" onClick={onClose} className="h-6 w-6">
      <X className="h-4 w-4" />
    </IconButton>
  </div>
);
