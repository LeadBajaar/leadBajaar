'use client'

import * as React from 'react'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, X, RefreshCw, CalendarDays, ChevronUp, ChevronDown, Check, Pencil, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getDayRanges, addDayRange, updateDayRange, removeDayRange, DayTimeRange } from '@/lib/availabilityRows'
import { TimePickerInput } from './TimePickerInput'

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const DAY_ORDER = [0, 1, 2, 3, 4, 5, 6]
const WEEKDAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const uid = () => `id_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

const formatTo12Hour = (time: string) => {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'pm' : 'am'
  const h12 = h % 12 || 12
  return `${h12}:${minutes}${ampm}`
}

const getMonthDays = (monthDate: Date): (number | null)[] => {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: (number | null)[] = Array(firstWeekday).fill(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)
  return days
}

const toDateKey = (monthDate: Date, day: number) => {
  const y = monthDate.getFullYear()
  const m = String(monthDate.getMonth() + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${y}-${m}-${d}`
}

interface DateOverrideRange {
  id: string
  startTime: string
  endTime: string
}

interface SpecificDate {
  id: string
  date: string
  ranges: DateOverrideRange[]
}

interface Scheduling {
  dateRange: number
  minimumNotice: number
  timezone: string
  timeSlots: DayTimeRange[]
  specificDates?: SpecificDate[]
}

interface AvailabilityEditorProps {
  scheduling: Scheduling
  onChange: (field: string, value: any) => void
}

const rowInputStyle = 'h-8 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-350 dark:border-slate-750 rounded-md px-2.5 w-[104px] text-slate-800 dark:text-slate-100 shadow-sm'

export const AvailabilityEditor = ({ scheduling, onChange }: AvailabilityEditorProps) => {
  const [editingRange, setEditingRange] = useState(false)
  const [editingNotice, setEditingNotice] = useState(false)
  const [scheduleOption, setScheduleOption] = useState<'default' | 'custom'>('default')
  const [scheduleDropdownOpen, setScheduleDropdownOpen] = useState(false)

  const [overrideModalOpen, setOverrideModalOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(() => new Date())
  const [selectedCalendarDates, setSelectedCalendarDates] = useState<string[]>([])
  const [modalRanges, setModalRanges] = useState<DateOverrideRange[]>([])

  const timeSlots = scheduling.timeSlots || []
  const specificDates = scheduling.specificDates || []
  const sortedOverrides = [...specificDates].sort((a, b) => a.date.localeCompare(b.date))
  const overriddenDateKeys = new Set(specificDates.map(o => o.date))

  const addRange = (day: number) => onChange('timeSlots', addDayRange(timeSlots, day))
  const updateRange = (day: number, rangeId: string, field: 'startTime' | 'endTime', value: string) =>
    onChange('timeSlots', updateDayRange(timeSlots, day, rangeId, field, value))
  const removeRange = (day: number, rangeId: string) => onChange('timeSlots', removeDayRange(timeSlots, day, rangeId))

  const removeOverrideDate = (date: string) => {
    onChange('specificDates', specificDates.filter(o => o.date !== date))
  }

  const openOverrideModal = () => {
    setCalendarMonth(new Date())
    setSelectedCalendarDates([])
    setModalRanges([{ id: uid(), startTime: '09:00', endTime: '17:00' }])
    setOverrideModalOpen(true)
  }
  const toggleCalendarDate = (dateKey: string) => {
    setSelectedCalendarDates(prev => prev.includes(dateKey) ? prev.filter(d => d !== dateKey) : [...prev, dateKey])
  }
  const addModalRange = () => setModalRanges(prev => [...prev, { id: uid(), startTime: '09:00', endTime: '17:00' }])
  const updateModalRange = (rangeId: string, field: 'startTime' | 'endTime', value: string) =>
    setModalRanges(prev => prev.map(r => r.id === rangeId ? { ...r, [field]: value } : r))
  const removeModalRange = (rangeId: string) => setModalRanges(prev => prev.filter(r => r.id !== rangeId))

  const applyOverrides = () => {
    if (selectedCalendarDates.length === 0) return
    const kept = specificDates.filter(o => !selectedCalendarDates.includes(o.date))
    const added = modalRanges.length === 0
      ? []
      : selectedCalendarDates.map(date => ({
          id: uid(),
          date,
          ranges: modalRanges.map(r => ({ ...r, id: uid() })),
        }))
    onChange('specificDates', [...kept, ...added])
    setOverrideModalOpen(false)
  }

  return (
    <div>
      {/* Date-range + minimum notice — compact summary, click a value to edit inline */}
      <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--crm-text-secondary)] mb-1.5">Date-range</p>
      <p className="text-sm text-[var(--crm-text-primary)] leading-relaxed mb-2">
        Invitees can schedule{' '}
        <Button variant="link" type="button" onClick={() => setEditingRange(v => !v)} className="inline-flex items-center gap-0.5 font-semibold text-[var(--crm-accent)] underline decoration-dotted underline-offset-2 p-0 h-auto">
          {scheduling.dateRange} days
          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', editingRange && 'rotate-180')} />
        </Button>{' '}
        into the future with at least{' '}
        <Button variant="link" type="button" onClick={() => setEditingNotice(v => !v)} className="inline-flex items-center gap-0.5 font-semibold text-[var(--crm-accent)] underline decoration-dotted underline-offset-2 p-0 h-auto">
          {scheduling.minimumNotice} hours
          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', editingNotice && 'rotate-180')} />
        </Button>{' '}
        notice.
      </p>

      {editingRange && (
        <div className="flex items-center gap-2 mb-2 p-2 bg-[var(--crm-surface-2)] rounded-lg border border-[var(--crm-border)]">
          <Input
            type="number" min="1"
            value={scheduling.dateRange}
            onChange={(e) => onChange('dateRange', parseInt(e.target.value) || 1)}
            className="h-8 w-20 text-xs bg-[var(--crm-surface-1)]"
          />
          <span className="text-xs text-[var(--crm-text-secondary)]">calendar days into the future</span>
          <Button size="sm" variant="ghost" className="h-7 text-xs ml-auto" onClick={() => setEditingRange(false)}>Done</Button>
        </div>
      )}
      {editingNotice && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-[var(--crm-surface-2)] rounded-lg border border-[var(--crm-border)]">
          <Input
            type="number" min="0"
            value={scheduling.minimumNotice}
            onChange={(e) => onChange('minimumNotice', parseInt(e.target.value) || 0)}
            className="h-8 w-20 text-xs bg-[var(--crm-surface-1)]"
          />
          <span className="text-xs text-[var(--crm-text-secondary)]">hours of an event start time</span>
          <Button size="sm" variant="ghost" className="h-7 text-xs ml-auto" onClick={() => setEditingNotice(false)}>Done</Button>
        </div>
      )}

      {/* Schedule — both options edit the same underlying hours for this event type only;
          there's no separate shared/default schedule stored anywhere, so switching the
          label doesn't change any data, it just switches between a read-only summary
          (with a pencil to jump into editing) and the directly-editable rows. */}
      <div className="relative mt-4 mb-3">
        <span className="text-sm text-[var(--crm-text-secondary)] mr-1.5">Schedule:</span>
        <Button
          variant="ghost"
          type="button"
          onClick={() => setScheduleDropdownOpen(v => !v)}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--crm-accent)] p-0 h-auto hover:bg-transparent hover:text-[var(--crm-accent)]"
        >
          {scheduleOption === 'default' ? 'Working hours (Default)' : 'Custom'}
          <ChevronUp className={cn('h-4 w-4 transition-transform', !scheduleDropdownOpen && 'rotate-180')} />
        </Button>
        {scheduleDropdownOpen && (
          <div className="absolute left-0 top-full mt-1 z-20 w-56 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-1)] shadow-lg p-1">
            {([
              { value: 'default', label: 'Working hours (Default)' },
              { value: 'custom', label: 'Custom schedule' },
            ] as const).map(opt => (
              <Button
                variant="ghost"
                key={opt.value}
                type="button"
                onClick={() => { setScheduleOption(opt.value); setScheduleDropdownOpen(false) }}
                className="w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-md hover:bg-[var(--crm-surface-2)] text-[var(--crm-text-primary)] h-auto"
              >
                {opt.label}
                {scheduleOption === opt.value && <Check className="h-3.5 w-3.5 text-[var(--crm-accent)]" />}
              </Button>
            ))}
          </div>
        )}
      </div>

      {scheduleOption === 'default' ? (
        <div className="rounded-xl border border-[var(--crm-border)] overflow-hidden">
          <div className="flex items-start justify-between gap-3 p-4">
            <p className="text-sm text-[var(--crm-text-secondary)] leading-relaxed">
              This event type uses the weekly and custom hours saved on the schedule
            </p>
            <Button
              variant="ghost" size="icon"
              type="button"
              onClick={() => setScheduleOption('custom')}
              title="Edit hours"
              className="text-[var(--crm-text-secondary)] hover:text-[var(--crm-accent)] shrink-0 h-auto w-auto p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
          <div className="border-t border-[var(--crm-border)] p-4 bg-[var(--crm-surface-2)]">
            <div className="flex items-center gap-1.5 mb-3">
              <RefreshCw className="h-4 w-4 text-[var(--crm-text-primary)]" />
              <p className="text-sm font-semibold text-[var(--crm-text-primary)]">Weekly hours</p>
            </div>
            <div className="space-y-2.5">
              {DAY_ORDER.map(day => {
                const ranges = getDayRanges(timeSlots, day)
                return (
                  <div key={day} className="flex items-center gap-3">
                    <div className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                      ranges.length > 0 ? 'bg-[#FE4548] text-white font-extrabold shadow-sm' : 'bg-[var(--crm-surface-3)] text-[var(--crm-text-tertiary)]'
                    )}>
                      {DAY_LETTERS[day]}
                    </div>
                    {ranges.length === 0 ? (
                      <span className="text-sm text-[var(--crm-text-tertiary)]">Unavailable</span>
                    ) : (
                      <div className="space-y-1">
                        {ranges.map(r => (
                          <p key={r.id} className="text-sm text-[var(--crm-text-primary)]">
                            {formatTo12Hour(r.startTime)}&nbsp;&nbsp;-&nbsp;&nbsp;{formatTo12Hour(r.endTime)}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <p className="text-sm text-[var(--crm-text-primary)] mt-4">{scheduling.timezone || 'UTC'}</p>

            <div className="flex items-center gap-1.5 mt-4 mb-3">
              <CalendarDays className="h-4 w-4 text-[var(--crm-text-primary)]" />
              <p className="text-sm font-semibold text-[var(--crm-text-primary)]">Date-specific hours</p>
            </div>

            {sortedOverrides.length === 0 ? (
              <p className="text-sm text-[var(--crm-text-tertiary)]">No date-specific hours set.</p>
            ) : (
              Object.entries(
                sortedOverrides.reduce<Record<string, SpecificDate[]>>((acc, o) => {
                  const year = o.date.slice(0, 4)
                  acc[year] = acc[year] || []
                  acc[year].push(o)
                  return acc
                }, {})
              ).map(([year, dates]) => (
                <div key={year}>
                  <p className="text-xs text-[var(--crm-text-tertiary)] mb-1">{year}</p>
                  {dates.map(o => (
                    <div key={o.id} className="border-t border-[var(--crm-border)] py-2.5">
                      <p className="text-sm font-semibold text-[var(--crm-text-primary)]">
                        {new Date(o.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      {o.ranges.map(r => (
                        <p key={r.id} className="text-sm text-[var(--crm-text-secondary)]">
                          {formatTo12Hour(r.startTime)} – {formatTo12Hour(r.endTime)}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-1.5 mb-1">
            <RefreshCw className="h-4 w-4 text-[var(--crm-text-primary)]" />
            <p className="text-sm font-semibold text-[var(--crm-text-primary)]">Weekly hours</p>
          </div>
          <p className="text-sm text-[var(--crm-accent)] mb-4">Set when you are available for meetings</p>

          <div className="space-y-3">
            {DAY_ORDER.map(day => {
              const ranges = getDayRanges(timeSlots, day)
              return (
                <div key={day} className="flex items-start gap-2">
                  <div className={cn(
                    'h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5',
                    ranges.length > 0 ? 'bg-[#FE4548] text-white font-extrabold shadow-sm' : 'bg-[var(--crm-surface-3)] text-[var(--crm-text-tertiary)]'
                  )}>
                    {DAY_LETTERS[day]}
                  </div>
                  {ranges.length === 0 ? (
                    <div className="flex-1 flex items-center gap-2 h-7">
                      <span className="text-sm text-[var(--crm-text-tertiary)]">Unavailable</span>
                      <Button
                        variant="ghost" size="icon"
                        type="button"
                        onClick={() => addRange(day)}
                        className="h-5 w-5 rounded-full border-2 border-[var(--crm-text-tertiary)]/50 flex items-center justify-center text-[var(--crm-text-secondary)] hover:border-[var(--crm-accent)] hover:text-[var(--crm-accent)] p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex-1 space-y-1.5">
                      {ranges.map(range => (
                        <div key={range.id} className="flex items-center gap-1">
                          <TimePickerInput
                            value={range.startTime}
                            onChange={(v) => updateRange(day, range.id, 'startTime', v)}
                            className={rowInputStyle}
                          />
                          <span className="text-[var(--crm-text-tertiary)] text-xs">–</span>
                          <TimePickerInput
                            value={range.endTime}
                            onChange={(v) => updateRange(day, range.id, 'endTime', v)}
                            className={rowInputStyle}
                          />
                          <Button variant="ghost" size="icon" type="button" onClick={() => removeRange(day, range.id)} className="text-[var(--crm-text-tertiary)] hover:text-red-500 shrink-0 h-auto w-auto p-0 hover:bg-transparent">
                            <X className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            type="button"
                            onClick={() => addRange(day)}
                            className="h-5 w-5 rounded-full border-2 border-[var(--crm-text-tertiary)]/50 flex items-center justify-center text-[var(--crm-text-secondary)] hover:border-[var(--crm-accent)] hover:text-[var(--crm-accent)] shrink-0 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <Select value={scheduling.timezone || 'UTC'} onValueChange={(v) => onChange('timezone', v)}>
            <SelectTrigger className="h-7 w-fit gap-1.5 border-none shadow-none px-0 mt-4 text-sm text-[var(--crm-accent)] font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl max-h-[250px]">
              {Array.from(new Set([...(typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : []), scheduling.timezone || 'UTC'])).map((tz) => (
                <SelectItem key={tz} value={tz} className="text-xs">{tz}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-start justify-between mt-4 mb-3">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <CalendarDays className="h-4 w-4 text-[var(--crm-text-primary)]" />
                <p className="text-sm font-semibold text-[var(--crm-text-primary)]">Date-specific hours</p>
              </div>
              <p className="text-sm text-[var(--crm-accent)]">Adjust hours for specific days</p>
            </div>
            <Button
              variant="outline"
              type="button"
              onClick={openOverrideModal}
              className="inline-flex items-center gap-1 h-8 px-3 rounded-full border border-[var(--crm-border)] text-xs font-semibold text-[var(--crm-text-primary)] hover:bg-[var(--crm-surface-2)] shrink-0 w-auto"
            >
              <Plus className="h-3.5 w-3.5" /> Hours
            </Button>
          </div>

          {sortedOverrides.length === 0 ? (
            <p className="text-xs text-[var(--crm-text-tertiary)]">No date-specific hours set.</p>
          ) : (
            Object.entries(
              sortedOverrides.reduce<Record<string, SpecificDate[]>>((acc, o) => {
                const year = o.date.slice(0, 4)
                acc[year] = acc[year] || []
                acc[year].push(o)
                return acc
              }, {})
            ).map(([year, dates]) => (
              <div key={year} className="mb-3 last:mb-0">
                <p className="text-xs text-[var(--crm-text-tertiary)] mb-2">{year}</p>
                <div className="space-y-2">
                  {dates.map(o => (
                    <div key={o.id} className="flex items-center justify-between gap-3 bg-[var(--crm-surface-2)] rounded-lg px-3.5 py-3">
                      <span className="text-sm font-semibold text-[var(--crm-text-primary)] shrink-0">
                        {new Date(o.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex-1 text-right space-y-0.5">
                        {o.ranges.map(r => (
                          <p key={r.id} className="text-sm text-[var(--crm-text-primary)]">
                            {formatTo12Hour(r.startTime)} – {formatTo12Hour(r.endTime)}
                          </p>
                        ))}
                      </div>
                      <Button variant="ghost" size="icon" type="button" onClick={() => removeOverrideDate(o.date)} className="text-[var(--crm-text-tertiary)] hover:text-red-500 shrink-0 h-auto w-auto p-0 hover:bg-transparent">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* Date-specific hours modal — pick one or more dates on a calendar, then set the
          hours that apply to all of them at once. */}
      <Dialog open={overrideModalOpen} onOpenChange={setOverrideModalOpen}>
        <DialogContent className="max-w-lg p-0 gap-0 rounded-2xl">
          <DialogHeader className="p-5 pb-0">
            <DialogTitle className="text-lg leading-snug">Select the date(s) you want to assign specific hours</DialogTitle>
          </DialogHeader>

          <div className="px-5 pt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-[var(--crm-text-primary)]">
                {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" type="button" onClick={() => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))} className="text-[var(--crm-text-secondary)] hover:text-[var(--crm-accent)] h-auto w-auto p-0 hover:bg-transparent">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" type="button" onClick={() => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))} className="text-[var(--crm-text-secondary)] hover:text-[var(--crm-accent)] h-auto w-auto p-0 hover:bg-transparent">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 mb-2">
              {WEEKDAY_LABELS.map(w => (
                <div key={w} className="text-center text-[10px] font-semibold text-[var(--crm-text-tertiary)]">{w}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1">
              {getMonthDays(calendarMonth).map((day, i) => {
                if (day === null) return <div key={`pad_${i}`} />
                const key = toDateKey(calendarMonth, day)
                const selected = selectedCalendarDates.includes(key)
                const hasOverride = overriddenDateKeys.has(key)
                return (
                  <div key={key} className="flex flex-col items-center">
                    <button /* TODO: Calendar date toggle */
                      type="button"
                      onClick={() => toggleCalendarDate(key)}
                      className={cn(
                        'h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                        selected ? 'bg-[#FE4548] text-white font-bold shadow-sm' : 'bg-[var(--crm-accent-soft)] text-[#FE4548] hover:bg-[var(--crm-accent-soft)]/70'
                      )}
                    >
                      {day}
                    </button>
                    <span className={cn('h-1 w-1 rounded-full mt-0.5', hasOverride ? 'bg-[#FE4548]' : 'bg-transparent')} />
                  </div>
                )
              })}
            </div>
          </div>

          <div className="border-t border-[var(--crm-border)] mt-4 p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-base font-semibold text-[var(--crm-text-primary)]">What hours are you available?</p>
              <Button variant="ghost" size="icon" type="button" onClick={addModalRange} className="text-[var(--crm-text-primary)] hover:text-[var(--crm-accent)] h-auto w-auto p-0 hover:bg-transparent">
                <Plus className="h-6 w-6" strokeWidth={2.5} />
              </Button>
            </div>
            <div className="space-y-3">
              {modalRanges.map(range => (
                <div key={range.id} className="flex items-center gap-2.5">
                  <TimePickerInput
                    value={range.startTime}
                    onChange={(v) => updateModalRange(range.id, 'startTime', v)}
                    className="h-11 text-base font-medium bg-[var(--crm-surface-1)] border border-[var(--crm-accent)]/30 rounded-lg px-3 w-[152px] text-[var(--crm-text-primary)]"
                  />
                  <span className="text-[var(--crm-text-tertiary)] text-base">-</span>
                  <TimePickerInput
                    value={range.endTime}
                    onChange={(v) => updateModalRange(range.id, 'endTime', v)}
                    className="h-11 text-base font-medium bg-[var(--crm-surface-1)] border border-[var(--crm-accent)]/30 rounded-lg px-3 w-[152px] text-[var(--crm-text-primary)]"
                  />
                  <Button variant="ghost" size="icon" type="button" onClick={() => removeModalRange(range.id)} className="text-[var(--crm-text-secondary)] hover:text-red-500 shrink-0 h-auto w-auto p-0 hover:bg-transparent">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              ))}
              {modalRanges.length === 0 && (
                <p className="text-xs text-[var(--crm-text-tertiary)]">No hours — the selected date(s) will be marked unavailable.</p>
              )}
            </div>
          </div>

          <DialogFooter className="p-5 pt-0">
            <Button variant="outline" size="sm" onClick={() => setOverrideModalOpen(false)}>Cancel</Button>
            <Button
              size="sm"
              disabled={selectedCalendarDates.length === 0}
              onClick={applyOverrides}
              className="bg-[#FE4548] hover:bg-[#E03A3C] text-white disabled:opacity-40 font-extrabold rounded-full shadow-sm hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer px-4 h-8"
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
