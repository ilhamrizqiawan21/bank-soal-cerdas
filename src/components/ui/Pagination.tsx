import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export const Pagination: React.FC<{
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ page, totalPages, onPageChange }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
    <span>Halaman {page} dari {Math.max(totalPages, 1)}</span>
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft className="h-4 w-4" /> Sebelumnya
      </Button>
      <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Selanjutnya <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  </div>
);
