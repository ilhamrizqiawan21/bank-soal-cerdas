import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { getBreadcrumbLabels } from '../lib/viewRegistry';

export const AppBreadcrumb: React.FC<{ currentView: string; onNavigate: (view: string) => void }> = ({ currentView, onNavigate }) => {
  const labels = getBreadcrumbLabels(currentView);
  const items = currentView === 'dashboard' ? labels : ['Dashboard', ...labels];

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={`${item}-${index}`}>
            {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />}
            {index === 0 && !isLast ? (
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 font-medium text-slate-500 hover:bg-slate-100 hover:text-blue-700 dark:hover:bg-slate-900 dark:hover:text-blue-300"
              >
                <Home className="h-3.5 w-3.5" />
                {item}
              </button>
            ) : (
              <span className={isLast ? 'font-semibold text-slate-800 dark:text-slate-100' : 'font-medium'}>
                {item}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
