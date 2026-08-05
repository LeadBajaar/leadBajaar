import { buildDraftFromWizardAnswers, WizardAnswers } from '../eventTypeWizard'

const baseAnswers: WizardAnswers = {
  purpose: 'consultation',
  duration: 30,
  format: 'one_on_one',
  location: 'video',
  schedulePattern: 'wide_open',
  notice: 'one_day',
  buffer: 'none',
  dailyCap: 'none',
  extraQuestions: [],
  bookingWindowDays: 60,
}

describe('buildDraftFromWizardAnswers', () => {
  it('maps duration to both duration and slot_interval', () => {
    const draft = buildDraftFromWizardAnswers({ ...baseAnswers, duration: 45 }, 'UTC')
    expect(draft.duration).toBe(45)
    expect(draft.slot_interval).toBe(45)
  })

  it('always includes the three locked invitee questions', () => {
    const draft = buildDraftFromWizardAnswers(baseAnswers, 'UTC')
    const lockedIds = draft.questions?.filter(q => q.isLocked).map(q => q.id)
    expect(lockedIds).toEqual(['invitee_name', 'invitee_email', 'invitee_phone'])
  })

  it('appends the selected extra questions after the locked ones, without duplicating them', () => {
    const draft = buildDraftFromWizardAnswers({ ...baseAnswers, extraQuestions: ['company', 'reason'] }, 'UTC')
    expect(draft.questions).toHaveLength(5)
    expect(draft.questions?.[3].question).toBe('Company name')
    expect(draft.questions?.[4].question).toBe('What would you like to discuss?')
  })

  it('sets max_invitees only for group meetings, defaulting to 2 if no size was chosen', () => {
    const solo = buildDraftFromWizardAnswers({ ...baseAnswers, format: 'one_on_one' }, 'UTC')
    expect(solo.max_invitees).toBeNull()
    expect(solo.type).toBe('one_on_one')

    const group = buildDraftFromWizardAnswers({ ...baseAnswers, format: 'group' }, 'UTC')
    expect(group.max_invitees).toBe(2)

    const groupWithSize = buildDraftFromWizardAnswers({ ...baseAnswers, format: 'group', groupSize: 10 }, 'UTC')
    expect(groupWithSize.max_invitees).toBe(10)
  })

  it('builds a Mon-Fri 9-5 weekly schedule for "wide open" and "varies" alike', () => {
    const wideOpen = buildDraftFromWizardAnswers({ ...baseAnswers, schedulePattern: 'wide_open' }, 'UTC')
    const varies = buildDraftFromWizardAnswers({ ...baseAnswers, schedulePattern: 'varies' }, 'UTC')

    for (const draft of [wideOpen, varies]) {
      const days = draft.scheduling?.timeSlots.flatMap((s: any) => s.daysOfWeek).sort()
      expect(days).toEqual([1, 2, 3, 4, 5])
      expect(draft.scheduling?.timeSlots.every((s: any) => s.startTime === '09:00' && s.endTime === '17:00')).toBe(true)
      expect(draft.scheduling?.availableDays).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])
    }
  })

  it('builds a single custom time slot for "specific" days/hours', () => {
    const draft = buildDraftFromWizardAnswers({
      ...baseAnswers,
      schedulePattern: 'specific',
      specificDays: [2, 4],
      specificStart: '13:00',
      specificEnd: '17:00',
    }, 'UTC')

    expect(draft.scheduling?.timeSlots).toEqual([
      { id: 'wizard_slot', startTime: '13:00', endTime: '17:00', daysOfWeek: [2, 4], breaks: [] },
    ])
    expect(draft.scheduling?.availableDays).toEqual(['Tuesday', 'Thursday'])
  })

  it('falls back to the wide-open default if "specific" was picked but no days were actually selected', () => {
    const draft = buildDraftFromWizardAnswers({ ...baseAnswers, schedulePattern: 'specific', specificDays: [] }, 'UTC')
    const days = draft.scheduling?.timeSlots.flatMap((s: any) => s.daysOfWeek).sort()
    expect(days).toEqual([1, 2, 3, 4, 5])
  })

  it('maps notice period to minimumNotice hours', () => {
    expect(buildDraftFromWizardAnswers({ ...baseAnswers, notice: 'same_day' }, 'UTC').scheduling?.minimumNotice).toBe(0)
    expect(buildDraftFromWizardAnswers({ ...baseAnswers, notice: 'few_hours' }, 'UTC').scheduling?.minimumNotice).toBe(4)
    expect(buildDraftFromWizardAnswers({ ...baseAnswers, notice: 'one_day' }, 'UTC').scheduling?.minimumNotice).toBe(24)
    expect(buildDraftFromWizardAnswers({ ...baseAnswers, notice: 'few_days' }, 'UTC').scheduling?.minimumNotice).toBe(72)
  })

  it('applies the same buffer minutes before and after', () => {
    const draft = buildDraftFromWizardAnswers({ ...baseAnswers, buffer: 'short' }, 'UTC')
    expect(draft.scheduling?.bufferBefore).toBe(10)
    expect(draft.scheduling?.bufferAfter).toBe(10)
  })

  it('maps daily cap choices, including a custom exact number', () => {
    expect(buildDraftFromWizardAnswers({ ...baseAnswers, dailyCap: 'none' }, 'UTC').scheduling?.dailyLimit).toBe(0)
    expect(buildDraftFromWizardAnswers({ ...baseAnswers, dailyCap: 'few' }, 'UTC').scheduling?.dailyLimit).toBe(3)
    expect(buildDraftFromWizardAnswers({ ...baseAnswers, dailyCap: 'custom', dailyCapCustom: 7 }, 'UTC').scheduling?.dailyLimit).toBe(7)
  })

  it('ignores a non-positive custom daily cap rather than saving a broken limit', () => {
    const draft = buildDraftFromWizardAnswers({ ...baseAnswers, dailyCap: 'custom', dailyCapCustom: 0 }, 'UTC')
    expect(draft.scheduling?.dailyLimit).toBe(0)
  })

  it('carries the booking window straight through to dateRange', () => {
    const draft = buildDraftFromWizardAnswers({ ...baseAnswers, bookingWindowDays: 14 }, 'UTC')
    expect(draft.scheduling?.dateRange).toBe(14)
  })

  it('passes through the given timezone', () => {
    const draft = buildDraftFromWizardAnswers(baseAnswers, 'Asia/Kolkata')
    expect(draft.scheduling?.timezone).toBe('Asia/Kolkata')
  })

  it('titles and colors the draft based on purpose, leaving "other" untitled', () => {
    expect(buildDraftFromWizardAnswers({ ...baseAnswers, purpose: 'sales' }, 'UTC').title).toBe('Sales Call')
    expect(buildDraftFromWizardAnswers({ ...baseAnswers, purpose: 'interview' }, 'UTC').title).toBe('Interview')
    expect(buildDraftFromWizardAnswers({ ...baseAnswers, purpose: 'other' }, 'UTC').title).toBe('')
  })

  it('carries the chosen location straight through', () => {
    expect(buildDraftFromWizardAnswers({ ...baseAnswers, location: 'phone' }, 'UTC').location).toBe('phone')
    expect(buildDraftFromWizardAnswers({ ...baseAnswers, location: 'in-person' }, 'UTC').location).toBe('in-person')
  })
})
