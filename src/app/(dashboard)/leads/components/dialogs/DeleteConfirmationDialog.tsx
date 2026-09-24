'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useModalHistory } from '@/hooks/use-modal-history'

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  leadName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  onOpenChange,
  leadName,
  onConfirm,
  onCancel
}) => {
  const handleOpenChange = useModalHistory(isOpen, onOpenChange, 'deleteConfirmDialog');

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[400px] max-sm:max-w-[calc(100vw-2rem)] max-sm:rounded-2xl">
        <DialogHeader className="max-sm:text-left">
          <DialogTitle>Delete Lead</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {leadName}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="border-t pt-4 mt-2 flex max-sm:flex-row max-sm:gap-3 flex-row items-center sm:justify-end gap-2 px-4 pb-4 sm:px-0 sm:pb-0">
          <Button variant="outline" onClick={() => { onCancel(); handleOpenChange(false); }} className="max-sm:flex-1 max-sm:h-12 max-sm:rounded-xl">
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="max-sm:flex-1 max-sm:h-12 max-sm:rounded-xl">
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
