"use client"

import * as React from "react"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isWithinInterval } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DateRange {
  from?: Date
  to?: Date
}

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  isIconTriggerOnly?: boolean
  isHoverExpand?: boolean
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Pick a date range",
  className,
  disabled = false,
  isIconTriggerOnly = false,
  isHoverExpand = false,
  icon
}: DateRangePickerProps & { icon?: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [currentMonth, setCurrentMonth] = React.useState(value?.from || new Date())
  const [selectedRange, setSelectedRange] = React.useState<DateRange | undefined>(value)
  const [hoveredDate, setHoveredDate] = React.useState<Date | undefined>(undefined)

  // Sync internal state with external value
  React.useEffect(() => {
    setSelectedRange(value)
  }, [value])

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return placeholder

    if (range.to) {
      return `${format(range.from, "MMM dd")} - ${format(range.to, "MMM dd")}`
    }

    return format(range.from, "MMM dd")
  }

  const handleDateClick = (date: Date) => {

    if (!selectedRange?.from || (selectedRange.from && selectedRange.to)) {
      // Start new selection
      const newRange = { from: date, to: undefined }
      setSelectedRange(newRange)
      setHoveredDate(undefined)
    } else {
      // Complete the range (but don't apply yet)
      const from = selectedRange.from
      const to = date

      let newRange: DateRange
      if (to < from) {
        // If end date is before start date, swap them
        newRange = { from: to, to: from }
      } else {
        newRange = { from, to }
      }

      setSelectedRange(newRange)
      setHoveredDate(undefined)
      // Don't call onChange here - wait for Apply button
    }
  }

  const handleDateHover = (date: Date) => {
    if (selectedRange?.from && !selectedRange.to) {
      setHoveredDate(date)
    }
  }

  const handleDateLeave = () => {
    setHoveredDate(undefined)
  }

  const handleApply = () => {
    onChange?.(selectedRange)
    setIsOpen(false)
  }

  const handleClear = () => {
    setSelectedRange(undefined)
    setHoveredDate(undefined)
    onChange?.(undefined)
  }

  const isDateSelected = (date: Date) => {
    if (!selectedRange?.from) return false
    if (selectedRange.to) {
      return isWithinInterval(date, { start: selectedRange.from, end: selectedRange.to })
    }
    return isSameDay(date, selectedRange.from)
  }

  const isDateInRange = (date: Date) => {
    if (!selectedRange?.from || !selectedRange.to) return false
    return isWithinInterval(date, { start: selectedRange.from, end: selectedRange.to })
  }

  const isDateInHoverRange = (date: Date) => {
    if (!selectedRange?.from || selectedRange.to || !hoveredDate) return false

    const start = selectedRange.from < hoveredDate ? selectedRange.from : hoveredDate
    const end = selectedRange.from < hoveredDate ? hoveredDate : selectedRange.from

    return isWithinInterval(date, { start, end })
  }

  const isStartDate = (date: Date) => {
    return selectedRange?.from && isSameDay(date, selectedRange.from)
  }

  const isEndDate = (date: Date) => {
    return selectedRange?.to && isSameDay(date, selectedRange.to)
  }

  const isHoverStartDate = (date: Date) => {
    if (!selectedRange?.from || selectedRange.to || !hoveredDate) return false

    const start = selectedRange.from < hoveredDate ? selectedRange.from : hoveredDate
    return isSameDay(date, start)
  }

  const isHoverEndDate = (date: Date) => {
    if (!selectedRange?.from || selectedRange.to || !hoveredDate) return false

    const end = selectedRange.from < hoveredDate ? hoveredDate : selectedRange.from
    return isSameDay(date, end)
  }

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const dateFormat = "d"
    const rows = []
    let days = []
    let day = startDate

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day
        days.push(
          <div
            key={day.toString()}
            className={cn(
              "h-9 w-9 flex items-center justify-center text-sm cursor-pointer rounded-md transition-colors",
              !isSameMonth(day, monthStart) && "text-muted-foreground opacity-50",
              isSameMonth(day, monthStart) && "hover:bg-accent hover:text-accent-foreground",
              // Selected range styling (pending application)
              isDateSelected(day) && "bg-primary/80 text-primary-foreground font-semibold border-2 border-primary",
              isStartDate(day) && "rounded-l-md",
              isEndDate(day) && "rounded-r-md",
              isDateInRange(day) && !isStartDate(day) && !isEndDate(day) && "bg-accent/80 text-accent-foreground border border-accent",
              // Hover preview styling
              isDateInHoverRange(day) && !isDateSelected(day) && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
              isHoverStartDate(day) && !isDateSelected(day) && "bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-100 rounded-l-md font-medium",
              isHoverEndDate(day) && !isDateSelected(day) && "bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-100 rounded-r-md font-medium"
            )}
            onClick={() => handleDateClick(cloneDay)}
            onMouseEnter={() => handleDateHover(cloneDay)}
            onMouseLeave={handleDateLeave}
          >
            {format(day, dateFormat)}
          </div>
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div key={day.toString()} className="flex w-full">
          {days}
        </div>
      )
      days = []
    }

    return (
      <div className="p-3">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <h3 className="text-sm font-medium">
              {format(currentMonth, "MMMM yyyy")}
            </h3>
            {selectedRange?.from && (
              <p className="text-xs text-muted-foreground">
                {selectedRange.to ? 'Range selected' : 'Select end date'}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="h-9 w-9 flex items-center justify-center text-xs font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        <div className="space-y-1">
          {rows}
        </div>

        <div className="flex justify-between mt-4 pt-4 border-t">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleClear}>
              Clear
            </Button>
          </div>
          <Button
            size="sm"
            onClick={handleApply}
            disabled={!selectedRange?.from}
            className="bg-primary hover:bg-primary/90"
          >
            {selectedRange?.from && selectedRange?.to ? 'Apply Range' : 'Apply Date'}
          </Button>
        </div>
      </div>
    )
  }

  // Common quick presets
  const presets = [
    { label: "Last 7 Days", range: { from: addDays(new Date(), -7), to: new Date() } },
    { label: "Last 30 Days", range: { from: addDays(new Date(), -30), to: new Date() } },
    { label: "Last 90 Days", range: { from: addDays(new Date(), -90), to: new Date() } },
  ]

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "px-0 flex items-center justify-start rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-bold text-[10px] uppercase transition-all duration-300 overflow-hidden group/picker",
              !className?.includes('h-') && "h-10",
              isIconTriggerOnly && "w-10 [&:has(.icon-trigger:hover)]:w-auto [&:has(.icon-trigger:hover)]:px-4 hover:w-auto hover:px-4 delay-75 [&:has(.icon-trigger:hover)]:delay-0",
              isHoverExpand && !isIconTriggerOnly && "w-10 hover:w-auto hover:px-4",
              selectedRange?.from && "w-auto px-4",
              !selectedRange?.from && !isIconTriggerOnly && !isHoverExpand && !className?.includes('w-') && "w-10",
              !selectedRange?.from && "text-slate-500",
              className
            )}
            disabled={disabled}
          >
            <div className="flex items-center justify-start w-full h-full">
              <div className={cn(
                "w-10 h-10 flex-shrink-0 flex items-center justify-center icon-trigger peer/icon",
                isIconTriggerOnly && "icon-trigger"
              )}>
                {icon ? icon : <CalendarIcon className="h-3.5 w-3.5 text-indigo-500" />}
              </div>
              <span className={cn(
                "transition-all duration-300 whitespace-nowrap overflow-hidden",
                (!isIconTriggerOnly && !isHoverExpand) ? "max-w-[150px] opacity-100 ml-2" : "max-w-0 opacity-0 ml-0",
                isIconTriggerOnly && "peer-hover/icon:max-w-[150px] peer-hover/icon:opacity-100 peer-hover/icon:ml-2 group-hover/picker:max-w-[150px] group-hover/picker:opacity-100 group-hover/picker:ml-2",
                isHoverExpand && !isIconTriggerOnly && "group-hover/picker:max-w-[150px] group-hover/picker:opacity-100 group-hover/picker:ml-2",
                selectedRange?.from && "max-w-[150px] opacity-100 ml-2"
              )}>
                {formatDateRange(selectedRange)}
              </span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 flex flex-col md:flex-row" align="start" side="bottom">
          {/* Presets Sidebar */}
          <div className="border-r p-2 flex flex-col gap-1 min-w-[140px] bg-slate-50/50 dark:bg-slate-900/50">
            <p className="text-[10px] font-bold uppercase text-slate-400 p-2">Quick Presets</p>
            {presets.map((p) => (
              <Button
                key={p.label}
                variant="ghost"
                size="sm"
                className="justify-start text-[10px] font-bold h-8 px-2 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950"
                onClick={() => {
                  setSelectedRange(p.range)
                  onChange?.(p.range)
                  setIsOpen(false)
                }}
              >
                {p.label}
              </Button>
            ))}
          </div>
          {renderCalendar()}
        </PopoverContent>
      </Popover>
    </div>
  )
}
