import React from 'react';
import { cn } from '../../lib/cn';

const controlClass = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 outline-none transition focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';

export const Field: React.FC<{
  label: string;
  required?: boolean;
  helper?: string;
  error?: string;
  children: React.ReactNode;
}> = ({ label, required, helper, error, children }) => (
  <label className="block space-y-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
    <span>
      {label} {required && <span className="text-rose-500">*</span>}
    </span>
    {children}
    {error ? <span className="block font-medium text-rose-600">{error}</span> : helper ? <span className="block font-medium text-slate-400">{helper}</span> : null}
  </label>
);

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(controlClass, className)} {...props} />,
);

Input.displayName = 'Input';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => <select ref={ref} className={cn(controlClass, className)} {...props} />,
);

Select.displayName = 'Select';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => <textarea ref={ref} className={cn(controlClass, 'resize-y', className)} {...props} />,
);

Textarea.displayName = 'Textarea';

export const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={cn('h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800', className)}
      {...props}
    />
  ),
);

Checkbox.displayName = 'Checkbox';

export const Radio = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type="radio"
      className={cn('h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800', className)}
      {...props}
    />
  ),
);

Radio.displayName = 'Radio';
