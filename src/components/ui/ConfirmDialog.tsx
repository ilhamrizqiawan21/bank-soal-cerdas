import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';

export const ConfirmDialog: React.FC<{
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ open, title, message, confirmLabel = 'Konfirmasi', cancelLabel = 'Batal', loading, onConfirm, onCancel }) => (
  <Modal
    open={open}
    title={title}
    onClose={onCancel}
    maxWidth="sm"
    footer={(
      <>
        <Button variant="ghost" onClick={onCancel}> {cancelLabel} </Button>
        <Button variant="danger" loading={loading} onClick={onConfirm}> {confirmLabel} </Button>
      </>
    )}
  >
    <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60">
        <AlertTriangle className="h-5 w-5" />
      </span>
      <p className="leading-relaxed">{message}</p>
    </div>
  </Modal>
);
