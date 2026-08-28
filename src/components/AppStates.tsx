import React from 'react';
import { Button, Skeleton } from './ui';
import { landingViewForRole, roleLabel } from '../lib/roleAccess';
import { useApp } from '../context/AppContext';
import type { Role } from '../types';

export const ForbiddenState: React.FC<{ role: Role; onBack: () => void }> = ({ role, onBack }) => {
  const { setCurrentView } = useApp();

  const handleBack = () => {
    setCurrentView(landingViewForRole(role));
    onBack();
  };

  return (
    <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-white dark:bg-slate-900 p-6 text-center space-y-3">
      <h2 className="text-base font-bold text-slate-900 dark:text-white">Halaman tidak tersedia untuk role ini</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Akun Anda masuk sebagai {roleLabel(role)}. Menu ini hanya ditampilkan jika izin akun sesuai.
      </p>
      <Button variant="warning" onClick={handleBack}>
        Kembali ke Halaman Utama
      </Button>
    </div>
  );
};

export const DataLoadingState: React.FC = () => (
  <div className="space-y-4" aria-busy="true" aria-live="polite">
    <Skeleton className="h-8 w-56" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[0, 1, 2].map(item => (
        <div key={item} className="h-28 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-5 h-7 w-16" />
        </div>
      ))}
    </div>
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
      {[0, 1, 2, 3].map(item => (
        <Skeleton key={item} className="h-9 bg-slate-100" />
      ))}
    </div>
  </div>
);

export const DataErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="rounded-lg border border-rose-200 dark:border-rose-900 bg-white dark:bg-slate-900 p-6 text-center space-y-3">
    <h2 className="text-base font-bold text-slate-900 dark:text-white">Data gagal dimuat</h2>
    <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
    <Button variant="danger" onClick={onRetry}>
      Coba Lagi
    </Button>
  </div>
);
