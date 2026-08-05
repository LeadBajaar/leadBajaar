'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const pad = (n: number) => String(n).padStart(2, '0')

const TIME_OPTIONS: string[] = []
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 15) {
    TIME_OPTIONS.push(`${pad(h)}:${pad(m)}`)
  }
}

const formatTo12Hour = (time: string) => {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'pm' : 'am'
  const h12 = h % 12 || 12
  return `${h12}:${minutes}${ampm}`
}

interface TimePickerInputProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export const TimePickerInput = ({ value, onChange, className }: TimePickerInputProps) => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  useEffect(() => {
    if (open) selectedRef.current?.scrollIntoView({ block: 'center' })
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        readOnly
        value={formatTo12Hour(value)}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        className={cn('cursor-pointer', className)}
      />
      {open && (
        <div className="absolute left-0 top-full mt-1 z-30 w-full min-w-[104px] max-h-[168px] overflow-y-auto rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-1)] shadow-lg py-1">
          {TIME_OPTIONS.map(t => (
            <button
              key={t}
              ref={t === value ? selectedRef : undefined}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(t); setOpen(false) }}
              className={cn(
                'w-full text-left px-3 py-1.5 text-sm hover:bg-[var(--crm-surface-2)]',
                t === value ? 'bg-[var(--crm-accent-soft)] text-[var(--crm-accent)] font-medium' : 'text-[var(--crm-text-primary)]'
              )}
            >
              {formatTo12Hour(t)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
