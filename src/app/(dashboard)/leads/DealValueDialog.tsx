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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, IndianRupee, Wallet } from 'lucide-react'

interface DealValueDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  leadName: string;
  dealValueAmount: string;
  setDealValueAmount: (amount: string) => void;
  recordInitialPayment: boolean;
  setRecordInitialPayment: (record: boolean) => void;
  initialPaymentAmount: string;
  setInitialPaymentAmount: (amount: string) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export const DealValueDialog: React.FC<DealValueDialogProps> = ({
  isOpen,
  onOpenChange,
  leadName,
  dealValueAmount,
  setDealValueAmount,
  recordInitialPayment,
  setRecordInitialPayment,
  initialPaymentAmount,
  setInitialPaymentAmount,
  paymentMethod,
  setPaymentMethod,
  isSaving,
  onSave,
  onCancel
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Contract Details</DialogTitle>
          <DialogDescription>
            Set the agreement details for {leadName}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Deal Amount (Contract Value)</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="number"
                placeholder="0.00"
                className="pl-9 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 transition-colors font-bold text-lg"
                value={dealValueAmount}
                onChange={(e) => setDealValueAmount(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700">
            <input
              type="checkbox"
              id="recordPayment"
              className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
              checked={recordInitialPayment}
              onChange={(e) => setRecordInitialPayment(e.target.checked)}
            />
            <Label htmlFor="recordPayment" className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-300">
              <Wallet className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Record an initial payment now
            </Label>
          </div>

          {recordInitialPayment && (
            <div className="grid gap-4 p-5 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 animate-in slide-in-from-top-2 duration-300">
              <div className="grid gap-2">
                <Label className="text-xs font-bold text-indigo-700 dark:text-indigo-400">Initial Paid Amount</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-indigo-400" />
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="pl-9 h-10 bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800 focus:bg-white dark:focus:bg-slate-900 text-sm"
                    value={initialPaymentAmount}
                    onChange={(e) => setInitialPaymentAmount(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-bold text-indigo-700 dark:text-indigo-400">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800 h-10 text-sm">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={!dealValueAmount || isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 font-bold"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Confirm Contract & Payment'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
