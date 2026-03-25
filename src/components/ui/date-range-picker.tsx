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
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Pick a date range",
  className,
  disabled = false,
}: DateRangePickerProps) {
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
          <Button variant="outline" size="sm" onClick={handleClear}>
            Clear
          </Button>
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

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !selectedRange?.from && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(selectedRange)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" side="bottom">
          {renderCalendar()}
        </PopoverContent>
      </Popover>
    </div>
  )
}
