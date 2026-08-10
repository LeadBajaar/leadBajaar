import React, { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2, Clock, Calendar, Check } from 'lucide-react'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface Break {
  id: string
  startTime: string
  endTime: string
  label: string
}

interface SpecificDateSlot {
  id: string
  date: string
  startTime: string
  endTime: string
  breaks: Break[]
}

interface Props {
  slots: SpecificDateSlot[]
  onSlotsChange: (slots: SpecificDateSlot[]) => void
}

const labelStyle = "text-[11px] font-bold uppercase tracking-wider text-[var(--crm-text-secondary)] mb-1.5 block"
const inputStyle = "h-10 text-sm bg-[var(--crm-surface-2)]  border-[var(--crm-border)]  focus:bg-[var(--crm-surface-1)] transition-all rounded-lg no-scrollbar text-[var(--crm-text-primary)] "

export const SpecificDateManager = ({ slots, onSlotsChange }: Props) => {
  const [isAdding, setIsAdding] = useState(false)
  const slotsEndRef = useRef<HTMLDivElement>(null)

  const formatTo12Hour = (time: string) => {
    if (!time) return '';
    try {
      const [hours, minutes] = time.split(':');
      const h = parseInt(hours);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12}:${minutes} ${ampm}`;
    } catch (e) {
      return time;
    }
  };

  const addSlot = () => {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    const dateStr = today.toISOString().split('T')[0];

    const newSlot: SpecificDateSlot = {
      id: Date.now().toString(),
      date: dateStr,
      startTime: '09:00',
      endTime: '17:00',
      breaks: []
    }
    onSlotsChange([...slots, newSlot])
    
    setIsAdding(true)
    setTimeout(() => {
      setIsAdding(false)
    }, 1000)
    
    setTimeout(() => {
      slotsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 100)
  }

  const updateSlot = (id: string, field: keyof SpecificDateSlot, value: any) => {
    onSlotsChange(
      slots.map(slot => 
        slot.id === id ? { ...slot, [field]: value } : slot
      )
    )
  }

  const removeSlot = (id: string) => {
    onSlotsChange(slots.filter(slot => slot.id !== id))
  }

  const addBreak = (slotId: string) => {
    const newBreak: Break = {
      id: Date.now().toString(),
      startTime: '12:00',
      endTime: '13:00',
      label: 'Lunch Break'
    }

    onSlotsChange(
      slots.map(slot => 
        slot.id === slotId 
          ? { ...slot, breaks: [...(slot.breaks || []), newBreak] }
          : slot
      )
    )
  }

  const updateBreak = (slotId: string, breakId: string, field: keyof Break, value: any) => {
    onSlotsChange(
      slots.map(slot => 
        slot.id === slotId 
          ? {
              ...slot,
              breaks: slot.breaks?.map(b => 
                b.id === breakId ? { ...b, [field]: value } : b
              )
            }
          : slot
      )
    )
  }

  const removeBreak = (slotId: string, breakId: string) => {
    onSlotsChange(
      slots.map(slot => 
        slot.id === slotId 
          ? { ...slot, breaks: slot.breaks?.filter(b => b.id !== breakId) }
          : slot
      )
    )
  }

  const validateBreakTime = (slotId: string, breakId: string, field: 'startTime' | 'endTime', value: string) => {
    const slot = slots.find(s => s.id === slotId)
    if (!slot) return false

    const breakItem = slot.breaks?.find(b => b.id === breakId)
    if (!breakItem) return false

    const breakStart = field === 'startTime' ? value : breakItem.startTime
    const breakEnd = field === 'endTime' ? value : breakItem.endTime

    return breakStart >= slot.startTime && breakEnd <= slot.endTime
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <Label className="text-[11px] font-black uppercase tracking-widest text-[var(--crm-text-primary)] mb-0 leading-none">Date Overrides</Label>
          <p className="text-xs text-[var(--crm-text-secondary)] mt-1">Give a specific date different hours — overrides the weekly schedule for that date only.</p>
        </div>
        <Button 
          onClick={addSlot} 
          variant="outline"
          disabled={isAdding}
          className={cn(
            "w-full sm:w-auto h-9 sm:h-8 px-4 sm:px-3.5 gap-2 transition-all shadow-sm shrink-0",
            isAdding && "bg-emerald-50 text-emerald-600 border-emerald-200"
          )}
        >
          {isAdding ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
          {isAdding ? "Added" : "Add Specific Date"}
        </Button>
      </div>

      <div className="space-y-4">
        {slots.map((slot) => (
          <div key={slot.id} className="relative group/slot">
            <Card className="border-[var(--crm-border)] shadow-sm rounded-xl overflow-hidden bg-[var(--crm-surface-1)] transition-all hover:border-primary/10 relative">
              <div className="absolute top-4 right-4 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSlot(slot.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 rounded-lg transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-4 sm:p-5 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg pr-10">
                  <div className="space-y-1.5">
                    <Label className={labelStyle}>Date</Label>
                    <Input
                      type="date"
                      value={slot.date}
                      onChange={(e) => updateSlot(slot.id, 'date', e.target.value)}
                      className={cn(inputStyle, "pl-3 h-11 sm:h-10")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className={labelStyle}>Start</Label>
                    <Input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateSlot(slot.id, 'startTime', e.target.value)}
                      className={cn(inputStyle, "pl-1.5 h-11 sm:h-10")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className={labelStyle}>End</Label>
                    <Input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateSlot(slot.id, 'endTime', e.target.value)}
                      className={cn(inputStyle, "pl-1.5 h-11 sm:h-10")}
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-5 border-t border-[var(--crm-border)]">
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px] font-black uppercase tracking-[0.1em] text-[var(--crm-text-secondary)] mb-0">Break Sequences</Label>
                    <button 
                      type="button"
                      onClick={() => addBreak(slot.id)} 
                      className="text-[9px] font-black uppercase tracking-widest text-[var(--crm-accent)] hover:underline flex items-center gap-1"
                    >
                      <Plus className="h-2.5 w-2.5" />
                      Add Break
                    </button>
                  </div>

                  <div className="grid gap-2">
                    {slot.breaks?.map((breakItem) => (
                      <Dialog key={breakItem.id}>
                        <DialogTrigger asChild>
                          <div className="group/break flex items-center justify-between p-3 bg-[var(--crm-surface-1)] border border-[var(--crm-border)] rounded-lg cursor-pointer hover:border-emerald-400 transition-all shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="h-7 w-7 bg-[var(--crm-surface-2)] rounded-md flex items-center justify-center border border-[var(--crm-border)]">
                                <Clock className="h-3 w-3 text-[var(--crm-text-secondary)]" />
                              </div>
                              <div>
                                <p className="text-[11px] font-bold text-[var(--crm-text-primary)] uppercase tracking-tight leading-none">{breakItem.label}</p>
                                <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1">
                                  {formatTo12Hour(breakItem.startTime)} — {formatTo12Hour(breakItem.endTime)}
                                </p>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-7 w-7 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all sm:opacity-0 sm:group-hover/break:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeBreak(slot.id, breakItem.id)
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="rounded-xl border-none shadow-2xl p-0 overflow-hidden max-w-sm">
                          <DialogHeader className="p-5 bg-[var(--crm-surface-2)] border-b border-[var(--crm-border)]">
                            <DialogTitle className="text-[11px] font-black uppercase tracking-widest text-[var(--crm-text-primary)]">Edit {breakItem.label} ({formatTo12Hour(breakItem.startTime)} — {formatTo12Hour(breakItem.endTime)})</DialogTitle>
                          </DialogHeader>
                          <div className="p-6 space-y-6">
                            <div className="space-y-1.5">
                              <Label className={labelStyle}>Sequence Title</Label>
                              <Input
                                value={breakItem.label}
                                onChange={(e) => updateBreak(slot.id, breakItem.id, 'label', e.target.value)}
                                placeholder="e.g., Lunch Break"
                                className={inputStyle}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <Label className={labelStyle}>Start</Label>
                                <Input
                                  type="time"
                                  value={breakItem.startTime}
                                  onChange={(e) => {
                                    if (validateBreakTime(slot.id, breakItem.id, 'startTime', e.target.value)) {
                                      updateBreak(slot.id, breakItem.id, 'startTime', e.target.value)
                                    }
                                  }}
                                  className={inputStyle}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label className={labelStyle}>End</Label>
                                <Input
                                  type="time"
                                  value={breakItem.endTime}
                                  onChange={(e) => {
                                    if (validateBreakTime(slot.id, breakItem.id, 'endTime', e.target.value)) {
                                      updateBreak(slot.id, breakItem.id, 'endTime', e.target.value)
                                    }
                                  }}
                                  className={inputStyle}
                                />
                              </div>
                            </div>
                          </div>
                          <DialogFooter className="p-5 bg-[var(--crm-surface-2)] border-t border-[var(--crm-border)]">
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 rounded-lg text-xs uppercase tracking-widest">Save Sequence</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    ))}
                    {(!slot.breaks || slot.breaks.length === 0) && (
                      <div className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-[var(--crm-border)] rounded-lg bg-[var(--crm-surface-3)]">
                        <Clock className="h-5 w-5 text-slate-200 mb-1" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">No Breaks Active</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
        <div ref={slotsEndRef} className="h-1 w-full shrink-0" />

        {slots.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 bg-[var(--crm-surface-1)] border border-[var(--crm-border)] rounded-xl">
            <p className="text-sm font-bold text-[var(--crm-text-primary)] uppercase tracking-widest mb-1">No Specific Dates</p>
            <p className="text-[11px] text-[var(--crm-text-secondary)] font-medium mb-4">Add fixed date availability.</p>
            <Button 
              onClick={addSlot} 
              variant="outline"
              disabled={isAdding}
              className={cn("gap-2 h-9 text-xs", isAdding && "bg-emerald-50 text-emerald-600 border-emerald-200")}
            >
              {isAdding ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              {isAdding ? "Added" : "Add Specific Date"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
