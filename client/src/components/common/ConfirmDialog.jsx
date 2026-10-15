import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from '../ui/Button';

export const ConfirmDialog = ({
  isOpen,
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  description,
  confirmText,
  confirmLabel,
  cancelText = 'Cancel',
  confirmVariant,
  variant = 'danger',
  loading = false,
}) => {
  const isModalOpen = Boolean(isOpen ?? open);
  const dialogMessage =
    message ||
    description ||
    'Are you sure you want to proceed with this action? This operation cannot be undone.';
  const confirmButtonText = confirmText || confirmLabel || 'Confirm';
  const buttonVariant = confirmVariant || variant || 'danger';

  return (
    <Modal isOpen={isModalOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-600">{dialogMessage}</p>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end space-x-3">
        <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          variant={buttonVariant}
          size="sm"
          onClick={onConfirm}
          loading={loading}
        >
          {confirmButtonText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
