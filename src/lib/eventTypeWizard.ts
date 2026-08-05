import { EventType, Question } from '@/types/events'

export type MeetingPurpose = 'sales' | 'consultation' | 'sync' | 'interview' | 'coaching' | 'other'
export type MeetingFormat = 'one_on_one' | 'group'
export type MeetingLocation = 'video' | 'phone' | 'in-person'
export type SchedulePattern = 'wide_open' | 'specific' | 'varies'
export type NoticePeriod = 'same_day' | 'few_hours' | 'one_day' | 'few_days'
export type BufferLength = 'none' | 'short' | 'long'
export type DailyCap = 'none' | 'few' | 'custom'
export type ExtraQuestionKey = 'company' | 'reason' | 'topic'

export interface WizardAnswers {
  purpose: MeetingPurpose
  duration: number
  format: MeetingFormat
  groupSize?: number
  location: MeetingLocation
  schedulePattern: SchedulePattern
  specificDays?: number[]
  specificStart?: string
  specificEnd?: string
  notice: NoticePeriod
  buffer: BufferLength
  dailyCap: DailyCap
  dailyCapCustom?: number
  extraQuestions: ExtraQuestionKey[]
  bookingWindowDays: number
}

/** sessionStorage key used to hand the built draft off from the wizard page to the editor page. */
export const WIZARD_DRAFT_STORAGE_KEY = 'eventTypeWizardDraft'

export const PURPOSE_META: Record<MeetingPurpose, { title: string; color: string }> = {
  sales: { title: 'Sales Call', color: '#059669' },
  consultation: { title: 'Consultation', color: '#0891B2' },
  sync: { title: 'Team Sync', color: '#1A237E' },
  interview: { title: 'Interview', color: '#DC2626' },
  coaching: { title: 'Coaching Session', color: '#7C3AED' },
  other: { title: '', color: '#475569' },
}

const NOTICE_HOURS: Record<NoticePeriod, number> = {
  same_day: 0,
  few_hours: 4,
  one_day: 24,
  few_days: 72,
}

const BUFFER_MINUTES: Record<BufferLength, number> = {
  none: 0,
  short: 10,
  long: 30,
}

export const EXTRA_QUESTION_DEFS: Record<ExtraQuestionKey, Omit<Question, 'id'>> = {
  company: { question: 'Company name', type: 'text', required: false },
  reason: { question: 'What would you like to discuss?', type: 'textarea', required: true },
  topic: { question: 'Preferred topic', type: 'text', required: false },
}

export const LOCKED_QUESTIONS: Question[] = [
  { id: 'invitee_name', question: 'Name', type: 'text', required: true, isLocked: true },
  { id: 'invitee_email', question: 'Email', type: 'email', required: true, isLocked: true },
  { id: 'invitee_phone', question: 'Phone Number', type: 'phone', required: true, isLocked: true },
]

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const buildWeeklyTimeSlots = (answers: WizardAnswers) => {
  if (answers.schedulePattern === 'specific' && answers.specificDays && answers.specificDays.length > 0) {
    return [{
      id: 'wizard_slot',
      startTime: answers.specificStart || '09:00',
      endTime: answers.specificEnd || '17:00',
      daysOfWeek: answers.specificDays,
      breaks: [],
    }]
  }
  // "wide_open" and "varies" both start from a sensible Mon-Fri default — someone
  // whose schedule "varies" is expected to refine it with per-date overrides
  // afterwards in the full editor, not by getting a different weekly default here.
  return [1, 2, 3, 4, 5].map(day => ({
    id: `wizard_slot_${day}`,
    startTime: '09:00',
    endTime: '17:00',
    daysOfWeek: [day],
    breaks: [],
  }))
}

const dailyLimitFor = (answers: WizardAnswers): number => {
  if (answers.dailyCap === 'none') return 0
  if (answers.dailyCap === 'few') return 3
  return answers.dailyCapCustom && answers.dailyCapCustom > 0 ? answers.dailyCapCustom : 0
}

/** Turns a completed wizard answer set into a ready-to-review EventType draft for the full editor. */
export const buildDraftFromWizardAnswers = (answers: WizardAnswers, timezone: string): Partial<EventType> => {
  const purposeMeta = PURPOSE_META[answers.purpose]
  const bufferMinutes = BUFFER_MINUTES[answers.buffer]
  const timeSlots = buildWeeklyTimeSlots(answers)
  const usedDays = [...new Set(timeSlots.flatMap(s => s.daysOfWeek))].sort()

  const extraQuestions: Question[] = answers.extraQuestions.map(key => ({
    id: `wizard_${key}`,
    ...EXTRA_QUESTION_DEFS[key],
  }))

  return {
    title: purposeMeta.title,
    description: 'A quick meeting to discuss your needs.',
    duration: answers.duration,
    slot_interval: answers.duration,
    location: answers.location,
    type: answers.format,
    max_invitees: answers.format === 'group' ? (answers.groupSize && answers.groupSize > 1 ? answers.groupSize : 2) : null,
    color: purposeMeta.color,
    questions: [...LOCKED_QUESTIONS, ...extraQuestions],
    scheduling: {
      bufferBefore: bufferMinutes,
      bufferAfter: bufferMinutes,
      minimumNotice: NOTICE_HOURS[answers.notice],
      dailyLimit: dailyLimitFor(answers),
      weeklyLimit: 0,
      availableDays: usedDays.map(d => DAY_NAMES[d]),
      dateRange: answers.bookingWindowDays,
      timezone,
      timeSlots,
      recurring: null,
    },
    teamMembers: [],
  }
}
