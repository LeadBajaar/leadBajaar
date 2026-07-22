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
import { SpecificDateManager } from './SpecificDateManager'
import { cn } from "@/lib/utils"

interface Props {
  eventType: any
  updateScheduling: (field: string, value: any) => void
  updateEventField?: (field: string, value: any) => void
}

const labelStyle = "text-[11px] font-bold uppercase tracking-wider text-[var(--crm-text-secondary)] mb-1.5 block"
const inputStyle = "h-10 text-sm bg-[var(--crm-surface-2)]  border-[var(--crm-border)]  focus:bg-[var(--crm-surface-1)] transition-all rounded-lg no-scrollbar"

export const SchedulingTab = ({ eventType, updateScheduling, updateEventField }: Props) => {
  return (
    <TabsContent value="scheduling" className="mt-0 outline-none">
      <div className="space-y-6 pb-6">
        {/* Availability Settings */}
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-bold text-[var(--crm-text-primary)] uppercase tracking-wider mb-0.5">Availability Protocol</h3>
            <p className="text-[11px] text-[var(--crm-text-secondary)] font-medium tracking-tight">Define when you are available for bookings.</p>
          </div>

          <Card className="border-[var(--crm-border)] shadow-sm rounded-xl overflow-hidden bg-[var(--crm-surface-1)]">
            <CardContent className="p-4 space-y-6">
              <div className="flex items-center space-x-2 border border-[var(--crm-border)] p-1 rounded-lg w-fit mb-4 bg-[var(--crm-surface-2)]">
                <Button
                  variant={eventType.scheduling.availabilityType !== 'specific_dates' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => updateScheduling('availabilityType', 'recurring')}
                  className={cn(
                    "text-xs h-8 px-4 rounded-md transition-all",
                    eventType.scheduling.availabilityType !== 'specific_dates' 
                      ? "bg-[var(--crm-surface-1)] text-[var(--crm-text-primary)] shadow-sm" 
                      : "text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-surface-1)]"
                  )}
                >
                  Weekly Recurring
                </Button>
                <Button
                  variant={eventType.scheduling.availabilityType === 'specific_dates' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => updateScheduling('availabilityType', 'specific_dates')}
                  className={cn(
                    "text-xs h-8 px-4 rounded-md transition-all",
                    eventType.scheduling.availabilityType === 'specific_dates' 
                      ? "bg-[var(--crm-surface-1)] text-[var(--crm-text-primary)] shadow-sm" 
                      : "text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-surface-1)]"
                  )}
                >
                  Specific Dates
                </Button>
              </div>

              {eventType.scheduling.availabilityType !== 'specific_dates' ? (
                <TimeSlotManager
                  slots={eventType.scheduling.timeSlots || []}
                  onSlotsChange={(slots) => updateScheduling('timeSlots', slots)}
                />
              ) : (
                <SpecificDateManager
                  slots={eventType.scheduling.specificDates || []}
                  onSlotsChange={(slots) => updateScheduling('specificDates', slots)}
                />
              )}

              <div className="pt-3.5 border-t border-[var(--crm-border)]">
                <div className="flex items-center justify-between gap-4 mb-3.5">
                  <div>
                    <Label className="text-sm font-bold text-[var(--crm-text-primary)] mb-0.5">Recurring Availability</Label>
                    <p className="text-[11px] text-[var(--crm-text-secondary)] font-medium tracking-tight">Set this schedule to repeat automatically.</p>
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
                    className="scale-90 data-[state=checked]:bg-[var(--crm-accent)]"
                  />
                </div>

                {eventType.scheduling.recurring && (
                  <div className="grid sm:grid-cols-2 gap-4 p-3.5 bg-[var(--crm-surface-2)] rounded-xl border border-[var(--crm-border)] animate-in fade-in slide-in-from-top-1 duration-200">
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
                        <span className="text-[10px] font-bold text-[var(--crm-text-secondary)] uppercase tracking-widest">
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
            <h3 className="text-sm font-bold text-[var(--crm-text-primary)] uppercase tracking-wider mb-0.5">Booking Limits</h3>
            <p className="text-[11px] text-[var(--crm-text-secondary)] font-medium tracking-tight">Control the frequency and timing of meetings.</p>
          </div>

          <Card className="border-[var(--crm-border)] shadow-sm rounded-xl overflow-hidden bg-[var(--crm-surface-1)]">
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
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
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
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[9px] text-[var(--crm-accent)] font-bold italic mt-2 uppercase tracking-tight">
                    Tip: Set a 30 min buffer here to ensure a gap after every meeting. 
                    The next available slot will automatically jump forward.
                  </p>
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
                    <span className="text-[10px] font-bold text-[var(--crm-text-secondary)] uppercase tracking-widest">Hours</span>
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
                    <span className="text-[10px] font-bold text-[var(--crm-text-secondary)] uppercase tracking-widest">Days</span>
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
                    <span className="text-[10px] font-bold text-[var(--crm-text-secondary)] uppercase tracking-widest">Count</span>
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
                      {Array.from(new Set([...Intl.supportedValuesOf('timeZone'), eventType.scheduling.timezone || 'Asia/Kolkata'])).map((tz) => (
                        <SelectItem key={tz} value={tz} className="text-[10px] font-medium">
                          {tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta' ? 'Calcutta' : tz.split('/').pop()?.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className={labelStyle}>Invitee Bookings Limit</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={eventType.max_bookings_per_invitee || ''}
                      onChange={(e) => updateEventField && updateEventField('max_bookings_per_invitee', e.target.value ? parseInt(e.target.value) : null)}
                      className={cn(inputStyle, "w-16 text-center font-bold")}
                      placeholder="∞"
                    />
                    <span className="text-[10px] font-bold text-[var(--crm-text-secondary)] uppercase tracking-widest">Count</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className={labelStyle}>Limit Timeframe</Label>
                  <Select
                    value={eventType.invitee_booking_limit_timeframe || 'ACTIVE'}
                    onValueChange={(value) => updateEventField && updateEventField('invitee_booking_limit_timeframe', value)}
                  >
                    <SelectTrigger className={inputStyle}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="ACTIVE" className="text-[10px] font-medium">Active (At a time)</SelectItem>
                      <SelectItem value="PER_WEEK" className="text-[10px] font-medium">Per Week</SelectItem>
                      <SelectItem value="PER_MONTH" className="text-[10px] font-medium">Per Month</SelectItem>
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

 