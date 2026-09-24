import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface NotificationConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function NotificationConfirmModal({
  isOpen,
  title,
  description,
  onConfirm,
  onClose
}: NotificationConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[400px] bg-[var(--crm-surface-1)] border-[var(--crm-border)] rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-[var(--crm-text-primary)] font-black">{title}</DialogTitle>
          <DialogDescription className="text-[var(--crm-text-secondary)] mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-lg text-[10px] font-bold uppercase tracking-wider"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="rounded-lg text-[10px] font-bold uppercase tracking-wider bg-red-500 hover:bg-red-600 text-white"
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
