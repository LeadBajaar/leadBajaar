import React from 'react'
import { TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TimeSlotManager } from './TimeSlotManager'
import { cn } from "@/lib/utils"

interface Props {
  eventType: any
  updateScheduling: (field: string, value: any) => void
}

const labelStyle = "text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block"
const inputStyle = "h-10 text-sm bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-lg no-scrollbar"

export const SchedulingTab = ({ eventType, updateScheduling }: Props) => {
  return (
    <TabsContent value="scheduling" className="mt-0 outline-none">
      <div className="space-y-6 pb-6">
        {/* Availability Settings */}
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-0.5">Availability Protocol</h3>
            <p className="text-[11px] text-slate-500 font-medium tracking-tight">Define when you are available for bookings.</p>
          </div>

          <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
            <CardContent className="p-4 space-y-6">
              <TimeSlotManager
                slots={eventType.scheduling.timeSlots || []}
                onSlotsChange={(slots) => updateScheduling('timeSlots', slots)}
              />

              <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between gap-4 mb-3.5">
                  <div>
                    <Label className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">Recurring Availability</Label>
                    <p className="text-[11px] text-slate-500 font-medium tracking-tight">Set this schedule to repeat automatically.</p>
                  </div>
                  <Switch
                    checked={!!eventType.scheduling.recurring}
                    onCheckedChange={(checked) => {
                      updateScheduling('recurring', checked ? {
                        frequency: 'weekly',
                        interval: 1,
                        timeslots: []
                      } : null)
                    }}
                    className="scale-90 data-[state=checked]:bg-indigo-600"
                  />
                </div>

                {eventType.scheduling.recurring && (
                  <div className="grid sm:grid-cols-2 gap-4 p-3.5 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="space-y-1.5">
                      <Label className={labelStyle}>Frequency</Label>
                      <Select
                        value={eventType.scheduling.recurring.frequency}
                        onValueChange={(value) => updateScheduling('recurring', {
                          ...eventType.scheduling.recurring,
                          frequency: value
                        })}
                      >
                        <SelectTrigger className={inputStyle}>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className={labelStyle}>Repeat Every</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          value={eventType.scheduling.recurring.interval}
                          onChange={(e) => updateScheduling('recurring', {
                            ...eventType.scheduling.recurring,
                            interval: parseInt(e.target.value)
                          })}
                          className={cn(inputStyle, "w-16 text-center font-bold")}
                        />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {eventType.scheduling.recurring.frequency === 'daily' ? 'Days' : 
                           eventType.scheduling.recurring.frequency === 'weekly' ? 'Weeks' : 'Months'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Rules */}
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-0.5">Booking Limits</h3>
            <p className="text-[11px] text-slate-500 font-medium tracking-tight">Control the frequency and timing of meetings.</p>
          </div>

          <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
            <CardContent className="p-4 space-y-5">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                <div className="space-y-1.5">
                  <Label className={labelStyle}>Buffer Before</Label>
                  <Select
                    value={eventType.scheduling.bufferBefore.toString()}
                    onValueChange={(value) => updateScheduling('bufferBefore', parseInt(value))}
                  >
                    <SelectTrigger className={inputStyle}>
                      <SelectValue placeholder="Select buffer" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="0">No buffer</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className={labelStyle}>Buffer After</Label>
                  <Select
                    value={eventType.scheduling.bufferAfter.toString()}
                    onValueChange={(value) => updateScheduling('bufferAfter', parseInt(value))}
                  >
                    <SelectTrigger className={inputStyle}>
                      <SelectValue placeholder="Select buffer" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="0">No buffer</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className={labelStyle}>Minimum Notice</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      value={eventType.scheduling.minimumNotice}
                      onChange={(e) => updateScheduling('minimumNotice', parseInt(e.target.value))}
                      className={cn(inputStyle, "w-16 text-center font-bold")}
                    />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hours</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className={labelStyle}>Max Date Range</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={eventType.scheduling.dateRange}
                      onChange={(e) => updateScheduling('dateRange', parseInt(e.target.value))}
                      className={cn(inputStyle, "w-16 text-center font-bold")}
                    />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Days</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className={labelStyle}>Daily Limit</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      value={eventType.scheduling.dailyLimit || ''}
                      onChange={(e) => updateScheduling('dailyLimit', parseInt(e.target.value))}
                      className={cn(inputStyle, "w-16 text-center font-bold")}
                      placeholder="∞"
                    />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Count</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className={labelStyle}>Time Zone</Label>
                  <Select
                    value={eventType.scheduling.timezone}
                    onValueChange={(value) => updateScheduling('timezone', value)}
                  >
                    <SelectTrigger className={inputStyle}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl max-h-[250px]">
                      {Intl.supportedValuesOf('timeZone').map((tz) => (
                        <SelectItem key={tz} value={tz} className="text-[10px] font-medium">
                          {tz.split('/').pop()?.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TabsContent>
  )
}

 