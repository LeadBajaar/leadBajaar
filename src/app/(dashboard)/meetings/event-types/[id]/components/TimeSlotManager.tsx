import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2, Clock, Calendar, Info } from 'lucide-react'
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

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  daysOfWeek: number[] // 0 = Sunday, 1 = Monday, etc.
  breaks: Break[]
}

interface Props {
  slots: TimeSlot[]
  onSlotsChange: (slots: TimeSlot[]) => void
}

const labelStyle = "text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block"
const inputStyle = "h-10 text-sm bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-lg no-scrollbar"

export const TimeSlotManager = ({ slots, onSlotsChange }: Props) => {
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

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const addSlot = () => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      startTime: '09:00',
      endTime: '17:00',
      daysOfWeek: [1, 2, 3, 4, 5],
      breaks: []
    }
    onSlotsChange([...slots, newSlot])
  }

  const updateSlot = (id: string, field: keyof TimeSlot, value: any) => {
    onSlotsChange(
      slots.map(slot => 
        slot.id === id ? { ...slot, [field]: value } : slot
      )
    )
  }

  const removeSlot = (id: string) => {
    onSlotsChange(slots.filter(slot => slot.id !== id))
  }

  const toggleDay = (slotId: string, day: number) => {
    const slot = slots.find(s => s.id === slotId)
    if (!slot) return

    const newDays = slot.daysOfWeek.includes(day)
      ? slot.daysOfWeek.filter(d => d !== day)
      : [...slot.daysOfWeek, day]

    updateSlot(slotId, 'daysOfWeek', newDays)
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
      <div className="flex justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-800/30 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center shadow-sm border border-slate-200/50 dark:border-slate-800">
            <Calendar className="h-4 w-4 text-indigo-500" />
          </div>
          <div>
            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white mb-0 leading-none">Availability Windows</Label>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Set your working hours</p>
          </div>
        </div>
        <Button 
          onClick={addSlot} 
          className="h-8 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[9px] uppercase tracking-widest gap-2 transition-all shadow-sm"
        >
          <Plus className="h-3 w-3" />
          Add Window
        </Button>
      </div>

      <div className="space-y-4">
        {slots.map((slot) => (
          <div key={slot.id} className="relative group/slot">
            <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900 transition-all hover:border-indigo-200/50 dark:hover:border-indigo-900/50">
              <CardContent className="p-0">
                <div className="grid lg:grid-cols-12">
                  {/* Time Range */}
                  <div className="lg:col-span-4 p-5 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className={labelStyle}>Start</Label>
                        <Input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => updateSlot(slot.id, 'startTime', e.target.value)}
                          className={cn(inputStyle, "pl-1.5")}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className={labelStyle}>End</Label>
                        <Input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateSlot(slot.id, 'endTime', e.target.value)}
                          className={cn(inputStyle, "pl-1.5")}
                        />
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSlot(slot.id)}
                      className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold text-[9px] uppercase tracking-[0.1em] gap-1.5 rounded-lg h-8 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Discard Window
                    </Button>
                  </div>

                  {/* Days and Breaks */}
                  <div className="lg:col-span-8 p-5 space-y-6 bg-slate-50/20 dark:bg-slate-900/40">
                    <div className="space-y-2.5">
                      <Label className={labelStyle}>Active Days</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {daysOfWeek.map((day, index) => {
                          const isActive = slot.daysOfWeek.includes(index)
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleDay(slot.id, index)}
                              className={cn(
                                "h-8 w-11 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all duration-200 border shadow-sm",
                                isActive 
                                  ? "bg-indigo-600 border-indigo-600 text-white shadow-sm" 
                                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:border-indigo-300 hover:text-indigo-600"
                              )}
                            >
                              {day}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-slate-100/50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <Label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 mb-0">Break Sequences</Label>
                        </div>
                        <Button 
                          onClick={() => addBreak(slot.id)} 
                          size="sm" 
                          variant="ghost"
                          className="h-6 px-2.5 text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md gap-1.5"
                        >
                          <Plus className="h-2.5 w-2.5" />
                          Add Break
                        </Button>
                      </div>

                      <div className="grid gap-2">
                        {slot.breaks?.map((breakItem) => (
                          <Dialog key={breakItem.id}>
                            <DialogTrigger asChild>
                              <div className="group/break flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-lg cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-all shadow-sm">
                                <div className="flex items-center gap-3">
                                  <div className="h-7 w-7 bg-slate-50 dark:bg-slate-800 rounded-md flex items-center justify-center border border-slate-100 dark:border-slate-700">
                                    <Clock className="h-3 w-3 text-slate-400" />
                                  </div>
                                  <div>
                                    <p className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-none">{breakItem.label}</p>
                                    <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mt-1">
                                      {formatTo12Hour(breakItem.startTime)} — {formatTo12Hour(breakItem.endTime)}
                                    </p>
                                  </div>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-7 w-7 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all sm:opacity-0 sm:group-hover/break:opacity-100"
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
                              <DialogHeader className="p-5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                                <DialogTitle className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Edit {breakItem.label} ({formatTo12Hour(breakItem.startTime)} — {formatTo12Hour(breakItem.endTime)})</DialogTitle>
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
                              <DialogFooter className="p-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700">
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 rounded-lg text-xs uppercase tracking-widest">Save Sequence</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        ))}

                        {(!slot.breaks || slot.breaks.length === 0) && (
                          <div className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-slate-200/60 dark:border-slate-800 rounded-lg bg-slate-100/20 dark:bg-slate-900/40">
                            <Clock className="h-5 w-5 text-slate-200 dark:text-slate-800 mb-1" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-700">No Breaks Active</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}

        {slots.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200/60 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
            <div className="h-12 w-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-md border border-slate-100 dark:border-slate-700 mb-4">
              <Calendar className="h-6 w-6 text-slate-200 dark:text-slate-700" />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-1">No Availability Windows</p>
            <p className="text-[11px] text-slate-400 font-medium max-w-[200px] text-center mb-6">Define your first working window.</p>
            <Button 
              onClick={addSlot} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 font-bold uppercase tracking-widest h-10 text-xs"
            >
              Initialize Window
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}