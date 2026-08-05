import { getDayRanges, addDayRange, updateDayRange, removeDayRange, DayTimeRange } from '../availabilityRows'

describe('getDayRanges', () => {
  it('returns ranges that include the given day, even when shared across multiple days', () => {
    const slots: DayTimeRange[] = [
      { id: 'a', startTime: '09:00', endTime: '17:00', daysOfWeek: [1, 2, 3, 4, 5] },
      { id: 'b', startTime: '10:00', endTime: '12:00', daysOfWeek: [6] },
    ]
    expect(getDayRanges(slots, 2)).toEqual([slots[0]])
    expect(getDayRanges(slots, 6)).toEqual([slots[1]])
    expect(getDayRanges(slots, 0)).toEqual([])
  })
})

describe('addDayRange', () => {
  it('appends a new single-day range with default hours', () => {
    const result = addDayRange([], 1)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ startTime: '09:00', endTime: '17:00', daysOfWeek: [1] })
  })

  it('accepts custom start/end times', () => {
    const result = addDayRange([], 3, '13:00', '15:00')
    expect(result[0]).toMatchObject({ startTime: '13:00', endTime: '15:00', daysOfWeek: [3] })
  })

  it('never merges into an existing rule, even if identical', () => {
    const existing: DayTimeRange[] = [{ id: 'a', startTime: '09:00', endTime: '17:00', daysOfWeek: [1] }]
    const result = addDayRange(existing, 1)
    expect(result).toHaveLength(2)
  })
})

describe('updateDayRange', () => {
  it('updates in place when the range only covers the edited day', () => {
    const slots: DayTimeRange[] = [{ id: 'a', startTime: '09:00', endTime: '17:00', daysOfWeek: [1] }]
    const result = updateDayRange(slots, 1, 'a', 'startTime', '10:00')
    expect(result).toEqual([{ id: 'a', startTime: '10:00', endTime: '17:00', daysOfWeek: [1] }])
  })

  it('splits a shared rule so only the edited day changes, leaving the others intact', () => {
    const slots: DayTimeRange[] = [{ id: 'a', startTime: '09:00', endTime: '17:00', daysOfWeek: [1, 2, 3, 4, 5] }]
    const result = updateDayRange(slots, 3, 'a', 'startTime', '11:00')

    // Original rule keeps every day except the one that diverged.
    const original = result.find(r => r.id === 'a')
    expect(original?.daysOfWeek).toEqual([1, 2, 4, 5])
    expect(original?.startTime).toBe('09:00')

    // A new rule covers only Wednesday, with the edited time.
    const split = result.find(r => r.id !== 'a')
    expect(split?.daysOfWeek).toEqual([3])
    expect(split?.startTime).toBe('11:00')
    expect(split?.endTime).toBe('17:00')
  })

  it('leaves unrelated ranges untouched', () => {
    const slots: DayTimeRange[] = [
      { id: 'a', startTime: '09:00', endTime: '17:00', daysOfWeek: [1] },
      { id: 'b', startTime: '10:00', endTime: '12:00', daysOfWeek: [6] },
    ]
    const result = updateDayRange(slots, 1, 'a', 'endTime', '18:00')
    expect(result.find(r => r.id === 'b')).toEqual(slots[1])
  })
})

describe('removeDayRange', () => {
  it('deletes the rule entirely when it only covered the removed day', () => {
    const slots: DayTimeRange[] = [{ id: 'a', startTime: '09:00', endTime: '17:00', daysOfWeek: [1] }]
    expect(removeDayRange(slots, 1, 'a')).toEqual([])
  })

  it('only drops the target day from a rule shared across multiple days', () => {
    const slots: DayTimeRange[] = [{ id: 'a', startTime: '09:00', endTime: '17:00', daysOfWeek: [1, 2, 3] }]
    const result = removeDayRange(slots, 2, 'a')
    expect(result).toEqual([{ id: 'a', startTime: '09:00', endTime: '17:00', daysOfWeek: [1, 3] }])
  })

  it('leaves other ranges on the same day untouched', () => {
    const slots: DayTimeRange[] = [
      { id: 'a', startTime: '09:00', endTime: '12:00', daysOfWeek: [1] },
      { id: 'b', startTime: '13:00', endTime: '17:00', daysOfWeek: [1] },
    ]
    const result = removeDayRange(slots, 1, 'a')
    expect(result).toEqual([slots[1]])
  })
})
