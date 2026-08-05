export interface DayTimeRange {
  id: string
  startTime: string
  endTime: string
  daysOfWeek: number[]
  breaks?: any[]
}

const uid = () => `slot_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

/** Every range that applies to a given day of week (0=Sun..6=Sat), regardless of how many other days share the same rule. */
export const getDayRanges = (timeSlots: DayTimeRange[], day: number): DayTimeRange[] =>
  timeSlots.filter(s => s.daysOfWeek.includes(day))

/** Adds a brand-new single-day range — never merged into an existing multi-day rule. */
export const addDayRange = (timeSlots: DayTimeRange[], day: number, startTime = '09:00', endTime = '17:00'): DayTimeRange[] => [
  ...timeSlots,
  { id: uid(), startTime, endTime, daysOfWeek: [day] },
]

/**
 * Updates one range on one day. If that range's rule is still shared with other
 * days, the day being edited is split off into its own rule first so the other
 * days keep their original hours untouched.
 */
export const updateDayRange = (
  timeSlots: DayTimeRange[], day: number, rangeId: string, field: 'startTime' | 'endTime', value: string
): DayTimeRange[] => {
  return timeSlots.flatMap(slot => {
    if (slot.id !== rangeId) return [slot]
    if (slot.daysOfWeek.length <= 1) {
      return [{ ...slot, [field]: value }]
    }
    const remaining = { ...slot, daysOfWeek: slot.daysOfWeek.filter(d => d !== day) }
    const split = { ...slot, id: uid(), daysOfWeek: [day], [field]: value }
    return [remaining, split]
  })
}

/** Removes one range from one day. If shared with other days, only that day is dropped from the rule. */
export const removeDayRange = (timeSlots: DayTimeRange[], day: number, rangeId: string): DayTimeRange[] => {
  return timeSlots.flatMap(slot => {
    if (slot.id !== rangeId) return [slot]
    if (slot.daysOfWeek.length <= 1) return []
    return [{ ...slot, daysOfWeek: slot.daysOfWeek.filter(d => d !== day) }]
  })
}
