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
import { Textarea } from '@/components/ui/textarea'
import { IndianRupee, Wallet, MessageSquare, Loader2 } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Lead, temperatureConfig, sourceConfig, TemperatureType } from './types'

interface EditLeadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  setLead: (lead: Lead | ((prev: Lead | null) => Lead | null)) => void;
  stages: Record<string, { color: string; icon: any }>;
  isUpdating: boolean;
  onUpdate: (lead: Lead | null) => void;
  onCancel: () => void;
}

export const EditLeadDialog: React.FC<EditLeadDialogProps> = ({
  isOpen,
  onOpenChange,
  lead,
  setLead,
  stages,
  isUpdating,
  onUpdate,
  onCancel
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px] h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Edit Lead</DialogTitle>
          <DialogDescription>
            Update lead information and stage.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Name</Label>
              <Input
                value={lead?.name || ''}
                onChange={(e) => setLead(prev => prev ? { ...prev, name: e.target.value } : null)}
                className="h-10 text-sm bg-slate-50 border-slate-200"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</Label>
              <Input
                value={lead?.email || ''}
                onChange={(e) => setLead(prev => prev ? { ...prev, email: e.target.value } : null)}
                className="h-10 text-sm bg-slate-50 border-slate-200"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone</Label>
              <Input
                value={lead?.phone || ''}
                onChange={(e) => setLead(prev => prev ? { ...prev, phone: e.target.value } : null)}
                className="h-10 text-sm bg-slate-50 border-slate-200"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Company</Label>
              <Input
                value={lead?.company || ''}
                onChange={(e) => setLead(prev => prev ? { ...prev, company: e.target.value } : null)}
                className="h-10 text-sm bg-slate-50 border-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Profession</Label>
                <Input
                  value={lead?.profession || ''}
                  onChange={(e) => setLead(prev => prev ? { ...prev, profession: e.target.value } : null)}
                  className="h-10 text-sm bg-slate-50 border-slate-200"
                  placeholder="Profession"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">City</Label>
                <Input
                  value={lead?.city || ''}
                  onChange={(e) => setLead(prev => prev ? { ...prev, city: e.target.value } : null)}
                  className="h-10 text-sm bg-slate-50 border-slate-200"
                  placeholder="City"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Stage</Label>
              <Select
                value={lead?.stage || ''}
                onValueChange={(value) => setLead(prev => prev ? { ...prev, stage: value } : null)}
              >
                <SelectTrigger className="h-10 text-sm bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(stages).map(([name, config]) => (
                    <SelectItem key={name} value={name} className="text-sm">
                      <div className="flex items-center gap-2">
                        {React.createElement(config.icon, { className: "h-4 w-4" })}
                        <span>{name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Temperature</Label>
              <Select
                value={lead?.status || ''}
                onValueChange={(value) => {
                  if (value in temperatureConfig) {
                    setLead(prev => prev ? { ...prev, status: value as TemperatureType } : null)
                  }
                }}
              >
                <SelectTrigger className="h-10 text-sm bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Select temperature" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(temperatureConfig) as TemperatureType[]).map((temp) => (
                    <SelectItem key={temp} value={temp} className="text-sm">
                      <div className="flex items-center gap-2">
                        {React.createElement((temperatureConfig as any)[temp].icon, { className: "h-4 w-4" })}
                        <span>{temp}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Source</Label>
              <Select
                value={lead?.source || ''}
                onValueChange={(value) => setLead(prev => prev ? { ...prev, source: value } : null)}
              >
                <SelectTrigger className="h-10 text-sm bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(sourceConfig).map((source) => (
                    <SelectItem key={source} value={source} className="text-sm">
                      <div className="flex items-center gap-2">
                        {React.createElement((sourceConfig as any)[source].icon, { className: "h-4 w-4" })}
                        <span>{source}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Financial Details */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Wallet className="h-4 w-4" />
                Financial Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold text-slate-400">Total Deal Value</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      type="number"
                      className="pl-8 h-9 text-sm bg-slate-50 border-slate-200"
                      placeholder="0.00"
                      value={lead?.deal_value || ''}
                      onChange={(e) => setLead(prev => prev ? { ...prev, deal_value: parseFloat(e.target.value) || 0 } : null)}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold text-slate-400">Paid Amount</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      type="number"
                      className="pl-8 h-9 text-sm bg-slate-50 border-slate-200"
                      placeholder="0.00"
                      value={lead?.paid_amount || ''}
                      onChange={(e) => setLead(prev => prev ? { ...prev, paid_amount: parseFloat(e.target.value) || 0 } : null)}
                    />
                  </div>
                </div>
              </div>
              {lead && lead.deal_value !== undefined && lead.paid_amount !== undefined && (
                <div className="mt-3 p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-xs flex justify-between items-center animate-in slide-in-from-right-2 duration-300">
                  <span className="text-indigo-700 dark:text-indigo-400 font-bold uppercase tracking-wider">Balance Due</span>
                  <span className={cn(
                    "font-black text-base",
                    (lead.deal_value - lead.paid_amount) > 0 ? "text-red-500" : "text-emerald-500"
                  )}>
                    ₹{(lead.deal_value - lead.paid_amount).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Notes Section */}
            <div className="mt-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <MessageSquare className="h-4 w-4" />
                Notes / History
              </h3>
              <div className="grid gap-2">
                <Textarea
                  placeholder="Add notes about this lead..."
                  className="min-h-[100px] bg-slate-50/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:bg-white dark:focus:bg-slate-900 transition-all no-scrollbar"
                  value={lead?.notes || ''}
                  onChange={(e) => setLead(prev => prev ? { ...prev, notes: e.target.value } : null)}
                />
                <p className="text-[10px] text-slate-400 italic">
                  Notes are stored with timestamps automatically when updated.
                </p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isUpdating}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => onUpdate(lead)}
            disabled={isUpdating}
            className="bg-indigo-600 hover:bg-indigo-700 font-bold"
          >
            {isUpdating ? (
               <>
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                 Saving...
               </>
            ) : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
