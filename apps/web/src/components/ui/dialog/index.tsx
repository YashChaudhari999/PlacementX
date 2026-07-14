// @ts-nocheck
import { forwardRef, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

// ============================================
// Modal
// ============================================
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const modalSizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' };

export const Modal = ({ isOpen, onClose, title, description, children, footer, size = 'md', className }: ModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center" onClick={(e) => e.target === overlayRef.current && onClose()}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className={['relative z-50 w-full rounded-lg border border-border bg-background p-6 shadow-lg', modalSizes[size], className].join(' ')}>
        <button onClick={onClose} className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 cursor-pointer">
          <X className="h-4 w-4" />
        </button>
        {title && <h2 className="text-lg font-semibold">{title}</h2>}
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        <div className="mt-4">{children}</div>
        {footer && <div className="mt-6 flex items-center justify-end space-x-2">{footer}</div>}
      </div>
    </div>
  );
};

// ============================================
// ConfirmationDialog
// ============================================
export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

export const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', isLoading }: ConfirmationDialogProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" footer={
      <>
        <button onClick={onClose} className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium hover:bg-accent">{cancelLabel}</button>
        <button onClick={onConfirm} disabled={isLoading} className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{confirmLabel}</button>
      </>
    }>
      <p className="text-sm text-muted-foreground">{message}</p>
    </Modal>
  );
};

// ============================================
// DeleteDialog
// ============================================
export interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  entityName: string;
  isLoading?: boolean;
}

export const DeleteDialog = ({ isOpen, onClose, onDelete, entityName, isLoading }: DeleteDialogProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Confirmation" size="sm" footer={
      <>
        <button onClick={onClose} className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium hover:bg-accent">Cancel</button>
        <button onClick={onDelete} disabled={isLoading} className="inline-flex h-10 items-center justify-center rounded-md bg-destructive px-4 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50">Delete</button>
      </>
    }>
      <p className="text-sm text-muted-foreground">
        Are you sure you want to delete <span className="font-semibold text-foreground">{entityName}</span>? This action cannot be undone.
      </p>
    </Modal>
  );
};

// ============================================
// Drawer
// ============================================
export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  side?: 'left' | 'right';
  className?: string;
}

export const Drawer = ({ isOpen, onClose, title, children, side = 'right', className }: DrawerProps) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className={[
        'fixed top-0 z-50 h-full w-80 border bg-background p-6 shadow-lg transition-transform',
        side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
        className,
      ].join(' ')}>
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          <button onClick={onClose} className="rounded-sm opacity-70 hover:opacity-100 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
