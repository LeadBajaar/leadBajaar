"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CustomCalendarProps {
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
  availableDates?: Date[]
  disabledDates?: Date[]
  minDate?: Date
  maxDate?: Date
  className?: string
  isDateAvailable?: (date: Date) => boolean
}

export function CustomCalendar({
  selectedDate,
  onDateSelect,
  availableDates = [],
  disabledDates = [],
  minDate,
  maxDate,
  className,
  isDateAvailable
}: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(() => {
    return selectedDate ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1) : new Date()
  })

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const checkDateAvailable = (date: Date) => {
    // Use custom function if provided
    if (isDateAvailable) {
      return isDateAvailable(date)
    }
    
    // Fallback to availableDates array
    if (availableDates.length === 0) return true
    return availableDates.some(availableDate => 
      availableDate.getDate() === date.getDate() &&
      availableDate.getMonth() === date.getMonth() &&
      availableDate.getFullYear() === date.getFullYear()
    )
  }

  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Check if date is in the past
    if (date < today) return true
    
    // Check if date is in disabled dates
    if (disabledDates.some(disabledDate => 
      disabledDate.getDate() === date.getDate() &&
      disabledDate.getMonth() === date.getMonth() &&
      disabledDate.getFullYear() === date.getFullYear()
    )) return true
    
    // Check min/max date constraints
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    
    return false
  }

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear()
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }

  const handleDateClick = (date: Date) => {
    if (!isDateDisabled(date) && onDateSelect) {
      onDateSelect(date)
      if (date.getMonth() !== currentMonth.getMonth() || date.getFullYear() !== currentMonth.getFullYear()) {
        setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1))
      }
    }
  }

  const isPrevDisabled = React.useMemo(() => {
    if (!minDate) {
      const today = new Date()
      const firstOfCurrent = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const firstOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      return firstOfCurrent <= firstOfThisMonth
    }
    const lastDayOfPrevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0)
    return lastDayOfPrevMonth < minDate
  }, [currentMonth, minDate])

  const isNextDisabled = React.useMemo(() => {
    if (!maxDate) return false
    const firstDayOfNextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    return firstDayOfNextMonth > maxDate
  }, [currentMonth, maxDate])

  const goToPreviousMonth = () => {
    if (!isPrevDisabled) {
      setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
    }
  }

  const goToNextMonth = () => {
    if (!isNextDisabled) {
      setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
    }
  }

  const renderDayCell = (date: Date, key: string, isFaded: boolean) => {
    const isAvailable = checkDateAvailable(date)
    const isDisabled = isDateDisabled(date)
    const isSelected = isDateSelected(date)
    const isTodayDate = isToday(date)
    
    return (
      <div
        key={key}
        className={cn(
          "aspect-square w-full max-w-[45px] sm:w-10 sm:h-10 flex items-center justify-center text-[14px] sm:text-[13px] rounded-full transition-all duration-200 mx-auto",
          isFaded && !isAvailable && "opacity-50",
          isSelected && "bg-[var(--lb-navy)] text-white font-medium shadow-sm",
          isTodayDate && !isSelected && "border-[0.5px] border-[var(--lb-navy)] text-[var(--lb-navy)] font-medium",
          isAvailable && !isDisabled && !isSelected && !isTodayDate && "text-[var(--lb-navy)] font-medium bg-[var(--lb-navy-soft)] border-[0.5px] border-[var(--lb-navy-border)] hover:bg-[var(--lb-navy)] hover:text-white cursor-pointer shadow-sm",
          isDisabled && "text-[var(--lb-t3)] cursor-default",
          !isAvailable && !isDisabled && !isSelected && !isTodayDate && "text-[var(--lb-t3)] cursor-default"
        )}
        onClick={() => {
          if (!isDisabled) {
            handleDateClick(date)
          } else if (isFaded) {
            // If it's disabled but faded, just navigate the month without selecting
            if (date < new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)) {
              if (!isPrevDisabled) goToPreviousMonth()
            } else {
              if (!isNextDisabled) goToNextMonth()
            }
          }
        }}
        role="button"
        tabIndex={isDisabled && !isFaded ? -1 : 0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && (!isDisabled || isFaded)) {
            e.preventDefault()
            if (!isDisabled) {
              handleDateClick(date)
            } else {
              if (date < new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)) {
                if (!isPrevDisabled) goToPreviousMonth()
              } else {
                if (!isNextDisabled) goToNextMonth()
              }
            }
          }
        }}
      >
        {date.getDate()}
      </div>
    )
  }

  const generateCalendarDays = () => {
    const days = []
    
    // Add days before the first day of the month (from previous month)
    const daysInPrevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate()
    for (let i = 0; i < firstDayOfMonth; i++) {
      const dayNum = daysInPrevMonth - firstDayOfMonth + i + 1
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, dayNum)
      days.push(renderDayCell(date, `prev-${i}`, true))
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      days.push(renderDayCell(date, `current-${day}`, false))
    }
    
    // Add days after the last day of the month (from next month)
    const totalCellsSoFar = firstDayOfMonth + daysInMonth
    const remainingCells = (7 - (totalCellsSoFar % 7)) % 7
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, i)
      days.push(renderDayCell(date, `next-${i}`, true))
    }
    
    return days
  }

  return (
    // Constrained width keeps the 7-column grid compact and evenly spaced —
    // full-width columns leave the 34-40px day circles scattered far apart.
    <div className={cn("p-0 mx-auto w-full sm:max-w-[360px]", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          disabled={isPrevDisabled}
          className={cn(
            "w-9 h-9 sm:w-7 sm:h-7 rounded-full border flex items-center justify-center transition-colors shadow-2xs",
            isPrevDisabled
              ? "opacity-30 cursor-not-allowed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              : "cursor-pointer border-[var(--lb-navy-border)] bg-[var(--lb-navy-soft)] text-[var(--lb-navy)] hover:bg-[var(--lb-navy)] hover:text-white active:scale-95"
          )}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        <h2 className="text-[15px] sm:text-[14px] font-bold text-slate-900 dark:text-white">
          {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        
        <button
          onClick={goToNextMonth}
          disabled={isNextDisabled}
          className={cn(
            "w-9 h-9 sm:w-7 sm:h-7 rounded-full border flex items-center justify-center transition-colors shadow-2xs",
            isNextDisabled
              ? "opacity-30 cursor-not-allowed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              : "cursor-pointer border-[var(--lb-navy-border)] bg-[var(--lb-navy-soft)] text-[var(--lb-navy)] hover:bg-[var(--lb-navy)] hover:text-white active:scale-95"
          )}
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Week days */}
      <div className="grid grid-cols-7 gap-x-1 mb-1">
        {weekDays.map(day => (
          <div
            key={day}
            className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--lb-t3)] text-center py-1.5"
          >
            {day.substring(0, 3)}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-x-1 gap-y-2 sm:gap-y-1.5">
        {generateCalendarDays()}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 pt-3 mt-2 border-t-[0.5px] border-[var(--lb-border)] text-[11px] text-[var(--lb-t2)]">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-[var(--lb-navy-soft)] border-[0.5px] border-[var(--lb-navy-border)]" />
          Available
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-[var(--lb-navy)]" />
          Selected
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full border-[0.5px] border-[var(--lb-navy)] bg-transparent" />
          Today
        </div>
      </div>
    </div>
  )
}
