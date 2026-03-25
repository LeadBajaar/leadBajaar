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
import { Loader2, FileDown } from 'lucide-react'

interface ExportLeadsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  isExporting: boolean;
  onExport: (all: boolean) => void;
  onCancel: () => void;
}

export const ExportLeadsDialog: React.FC<ExportLeadsDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedCount,
  isExporting,
  onExport,
  onCancel
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Export Leads</DialogTitle>
          <DialogDescription>
            Choose how you want to export your leads.
          </DialogDescription>
          {selectedCount > 0 && (
            <div className="mt-2 text-sm text-muted-foreground">
              You have {selectedCount} leads selected.
            </div>
          )}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            onClick={() => onExport(true)}
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Export All Leads
              </>
            )}
          </Button>
          {selectedCount > 0 && (
            <Button
              onClick={() => onExport(false)}
              disabled={isExporting}
              variant="outline"
              className="w-full"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-4 w-4" />
                  Export Selected ({selectedCount})
                </>
              )}
            </Button>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isExporting}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
