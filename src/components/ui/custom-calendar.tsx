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
    }
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const generateCalendarDays = () => {
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square w-full max-w-[45px] sm:w-10 sm:h-10 mx-auto" />)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
             const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
       const isAvailable = checkDateAvailable(date)
       const isDisabled = isDateDisabled(date)
       const isSelected = isDateSelected(date)
       const isTodayDate = isToday(date)
      
      days.push(
        <div
          key={day}
          className={cn(
            "aspect-square w-full max-w-[45px] sm:w-10 sm:h-10 flex items-center justify-center text-[13px] rounded-full transition-all duration-200",
            "mx-auto",
            isSelected && "bg-[var(--lb-navy)] text-white font-medium shadow-sm",
            isTodayDate && !isSelected && "border-[0.5px] border-[var(--lb-navy)] text-[var(--lb-navy)] font-medium",
            isAvailable && !isDisabled && !isSelected && !isTodayDate && "text-primary dark:text-indigo-300 font-medium bg-primary/10 dark:bg-indigo-900/40 border-[0.5px] border-indigo-100 dark:border-indigo-800/60 hover:bg-primary/20 dark:hover:bg-indigo-900/60 cursor-pointer shadow-sm",
            isDisabled && "text-[var(--lb-t3)] cursor-default",
            !isAvailable && !isDisabled && !isSelected && !isTodayDate && "text-[var(--lb-t3)] cursor-default"
          )}
          onClick={() => handleDateClick(date)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleDateClick(date)
            }
          }}
        >
          {day}
        </div>
      )
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
          className="w-7 h-7 rounded-md border-[0.5px] border-[var(--lb-border)] bg-[var(--lb-bg)] flex items-center justify-center cursor-pointer text-[var(--lb-t2)] hover:bg-[var(--lb-s3)] transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        <h2 className="text-[14px] font-medium text-[var(--lb-t1)]">
          {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        
        <button
          onClick={goToNextMonth}
          className="w-7 h-7 rounded-md border-[0.5px] border-[var(--lb-border)] bg-[var(--lb-bg)] flex items-center justify-center cursor-pointer text-[var(--lb-t2)] hover:bg-[var(--lb-s3)] transition-colors"
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
      <div className="grid grid-cols-7 gap-x-1 gap-y-1.5">
        {generateCalendarDays()}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 pt-3 mt-2 border-t-[0.5px] border-[var(--lb-border)] text-[11px] text-[var(--lb-t2)]">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-primary/10 dark:bg-indigo-900/40 border-[0.5px] border-indigo-100 dark:border-indigo-800/60" />
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
