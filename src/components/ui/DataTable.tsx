import React from 'react';
import { cn } from '../../lib/cn';

export type DataTableColumn<T> = {
  key: string;
  header: React.ReactNode;
  className?: string;
  cell: (item: T) => React.ReactNode;
};

export function DataTable<T extends { id: string }>({
  data,
  columns,
  empty,
}: {
  data: T[];
  columns: Array<DataTableColumn<T>>;
  empty?: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {data.length === 0 ? (
        <div className="p-8">{empty}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/60">
              <tr>
                {columns.map(column => (
                  <th key={column.key} className={cn('p-4 font-bold uppercase tracking-wide', column.className)}>
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.map(item => (
                <tr key={item.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  {columns.map(column => (
                    <td key={column.key} className={cn('p-4 align-middle', column.className)}>
                      {column.cell(item)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
