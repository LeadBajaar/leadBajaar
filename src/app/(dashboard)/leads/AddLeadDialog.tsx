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
import { Loader2, AlertCircle } from 'lucide-react'
import { cn } from "@/lib/utils"
import { NewLead, temperatureConfig, sourceConfig, TemperatureType } from './types'

interface AddLeadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newLead: NewLead;
  setNewLead: (lead: NewLead | ((prev: NewLead) => NewLead)) => void;
  formErrors: Record<string, string>;
  setFormErrors: (errors: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
  submitError: string | null;
  isSubmitting: boolean;
  onSave: () => void;
  onCancel: () => void;
  stages: Record<string, { color: string; icon: any }>;
}

export const AddLeadDialog: React.FC<AddLeadDialogProps> = ({
  isOpen,
  onOpenChange,
  newLead,
  setNewLead,
  formErrors,
  setFormErrors,
  submitError,
  isSubmitting,
  onSave,
  onCancel,
  stages
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px] max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>
            Enter the details for the new lead.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
          {submitError && (
             <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 mb-6 flex items-center gap-2 animate-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm font-medium">{submitError}</p>
             </div>
          )}

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={newLead.name}
                onChange={(e) => {
                  setNewLead(prev => ({ ...prev, name: e.target.value }));
                  if (formErrors.name) {
                    setFormErrors(prev => ({ ...prev, name: "" }));
                  }
                }}
                placeholder="John Doe"
                className={cn(
                  "h-10 text-sm bg-slate-50 border-slate-200 focus:bg-white transition-all",
                  formErrors.name && "border-red-500 ring-1 ring-red-500"
                )}
              />
              {formErrors.name && (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">{formErrors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={newLead.email}
                onChange={(e) => {
                  setNewLead(prev => ({ ...prev, email: e.target.value }));
                  if (formErrors.email) {
                    setFormErrors(prev => ({ ...prev, email: "" }));
                  }
                }}
                placeholder="john@example.com"
                className={cn(
                  "h-10 text-sm bg-slate-50 border-slate-200 focus:bg-white transition-all",
                  formErrors.email && "border-red-500 ring-1 ring-red-500"
                )}
              />
              {formErrors.email && (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">{formErrors.email}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone</Label>
              <Input
                id="phone"
                value={newLead.phone}
                onChange={(e) => {
                  setNewLead(prev => ({ ...prev, phone: e.target.value }));
                  if (formErrors.phone) {
                    setFormErrors(prev => ({ ...prev, phone: "" }));
                  }
                }}
                placeholder="+1234567890"
                className={cn(
                  "h-10 text-sm bg-slate-50 border-slate-200 focus:bg-white transition-all",
                  formErrors.phone && "border-red-500 ring-1 ring-red-500"
                )}
              />
              {formErrors.phone && (
                 <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">{formErrors.phone}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="company" className="text-xs font-bold uppercase tracking-wider text-slate-500">Company</Label>
              <Input
                id="company"
                value={newLead.company}
                onChange={(e) => setNewLead(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Company Name"
                className="h-10 text-sm bg-slate-50 border-slate-200 focus:bg-white transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="profession" className="text-xs font-bold uppercase tracking-wider text-slate-500">Profession</Label>
                <Input
                  id="profession"
                  value={newLead.profession}
                  onChange={(e) => setNewLead(prev => ({ ...prev, profession: e.target.value }))}
                  placeholder="Software Engineer"
                  className="h-10 text-sm bg-slate-50 border-slate-200 focus:bg-white transition-all"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city" className="text-xs font-bold uppercase tracking-wider text-slate-500">City</Label>
                <Input
                  id="city"
                  value={newLead.city}
                  onChange={(e) => setNewLead(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Pune"
                  className="h-10 text-sm bg-slate-50 border-slate-200 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="stage" className="text-xs font-bold uppercase tracking-wider text-slate-500">Stage</Label>
              <Select
                value={newLead.stage}
                onValueChange={(value) => setNewLead(prev => ({ ...prev, stage: value }))}>
                <SelectTrigger id="stage" className="h-10 text-sm bg-slate-50 border-slate-200">
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
              <Label htmlFor="temperature" className="text-xs font-bold uppercase tracking-wider text-slate-500">Temperature</Label>
              <Select
                value={newLead.status}
                onValueChange={(value) => setNewLead(prev => ({ ...prev, status: value as TemperatureType }))}>
                <SelectTrigger id="temperature" className="h-10 text-sm bg-slate-50 border-slate-200">
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
              <Label htmlFor="source" className="text-xs font-bold uppercase tracking-wider text-slate-500">Source</Label>
              <Select
                value={newLead.source}
                onValueChange={(value) => setNewLead(prev => ({ ...prev, source: value }))}>
                <SelectTrigger id="source" className="h-10 text-sm bg-slate-50 border-slate-200">
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
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-slate-50/10">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onSave}
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 font-bold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Lead'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
