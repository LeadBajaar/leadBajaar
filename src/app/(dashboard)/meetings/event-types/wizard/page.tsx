'use client'

import * as React from 'react'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser } from '@/contexts/UserContext'
import { toast } from 'sonner'
import {
  WizardAnswers, MeetingPurpose, MeetingFormat, MeetingLocation, SchedulePattern,
  NoticePeriod, BufferLength, DailyCap, ExtraQuestionKey,
  buildDraftFromWizardAnswers, WIZARD_DRAFT_STORAGE_KEY,
} from '@/lib/eventTypeWizard'
import { EVENT_TEMPLATES } from '@/constants/event-templates'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0] // Mon..Sun, a more natural work-week order

const DEFAULT_ANSWERS: WizardAnswers = {
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

interface ChoiceOption<T> { value: T; label: string; sublabel?: string }

type StepId =
  | 'purpose' | 'duration' | 'format' | 'groupSize' | 'location'
  | 'schedulePattern' | 'specificDays' | 'specificHours'
  | 'notice' | 'buffer' | 'dailyCap' | 'dailyCapCustom'
  | 'extraQuestions' | 'bookingWindow'

const getVisibleSteps = (answers: WizardAnswers): StepId[] => {
  const steps: StepId[] = ['purpose', 'duration', 'format']
  if (answers.format === 'group') steps.push('groupSize')
  steps.push('location', 'schedulePattern')
  if (answers.schedulePattern === 'specific') steps.push('specificDays', 'specificHours')
  steps.push('notice', 'buffer', 'dailyCap')
  if (answers.dailyCap === 'custom') steps.push('dailyCapCustom')
  steps.push('extraQuestions', 'bookingWindow')
  return steps
}

const PURPOSE_OPTIONS: ChoiceOption<MeetingPurpose>[] = [
  { value: 'sales', label: 'Sales call' },
  { value: 'consultation', label: 'Client consultation' },
  { value: 'sync', label: 'Team sync' },
  { value: 'interview', label: 'Interview' },
  { value: 'coaching', label: 'Coaching session' },
  { value: 'other', label: 'Something else' },
]

const DURATION_OPTIONS: ChoiceOption<number>[] = [15, 30, 45, 60, 90].map(d => ({ value: d, label: `${d} minutes` }))

const FORMAT_OPTIONS: ChoiceOption<MeetingFormat>[] = [
  { value: 'one_on_one', label: 'One-on-one', sublabel: 'Just you and one invitee' },
  { value: 'group', label: 'Group', sublabel: 'Multiple invitees per slot' },
]

const GROUP_SIZE_OPTIONS: ChoiceOption<number>[] = [2, 5, 10, 20].map(n => ({ value: n, label: `${n} people` }))

const LOCATION_OPTIONS: ChoiceOption<MeetingLocation>[] = [
  { value: 'video', label: 'Video call' },
  { value: 'phone', label: 'Phone call' },
  { value: 'in-person', label: 'In person' },
]

const SCHEDULE_PATTERN_OPTIONS: ChoiceOption<SchedulePattern>[] = [
  { value: 'wide_open', label: "I'm open most weekdays", sublabel: '9 AM – 5 PM, Monday to Friday' },
  { value: 'specific', label: 'Only specific days/hours', sublabel: "I'll pick exactly which" },
  { value: 'varies', label: 'It varies week to week', sublabel: "I'll fine-tune it with date overrides after" },
]

const HOURS_OPTIONS: ChoiceOption<{ start: string; end: string }>[] = [
  { value: { start: '09:00', end: '17:00' }, label: '9 AM – 5 PM' },
  { value: { start: '09:00', end: '12:00' }, label: '9 AM – 12 PM (mornings)' },
  { value: { start: '13:00', end: '17:00' }, label: '1 PM – 5 PM (afternoons)' },
  { value: { start: '10:00', end: '18:00' }, label: '10 AM – 6 PM' },
]

const NOTICE_OPTIONS: ChoiceOption<NoticePeriod>[] = [
  { value: 'same_day', label: 'Same day is fine' },
  { value: 'few_hours', label: 'At least a few hours' },
  { value: 'one_day', label: 'At least a full day' },
  { value: 'few_days', label: 'A few days' },
]

const BUFFER_OPTIONS: ChoiceOption<BufferLength>[] = [
  { value: 'none', label: 'No, back-to-back is fine' },
  { value: 'short', label: 'A short one (10 min)' },
  { value: 'long', label: 'A longer one (30 min)' },
]

const DAILY_CAP_OPTIONS: ChoiceOption<DailyCap>[] = [
  { value: 'none', label: 'No limit' },
  { value: 'few', label: 'A few per day (3)' },
  { value: 'custom', label: 'Set an exact number' },
]

const EXTRA_QUESTION_OPTIONS: ChoiceOption<ExtraQuestionKey>[] = [
  { value: 'company', label: 'Company name' },
  { value: 'reason', label: 'What they want to discuss' },
  { value: 'topic', label: 'Preferred topic' },
]

const BOOKING_WINDOW_OPTIONS: ChoiceOption<number>[] = [
  { value: 14, label: '2 weeks ahead' },
  { value: 30, label: '1 month ahead' },
  { value: 60, label: '2 months ahead' },
  { value: 90, label: '3 months ahead' },
]

const STEP_META: Record<StepId, { title: string; subtitle?: string }> = {
  purpose: { title: "What's this meeting for?" },
  duration: { title: 'How long do these usually run?' },
  format: { title: 'Who joins the call?' },
  groupSize: { title: 'How many people per slot?' },
  location: { title: 'How will you meet?' },
  schedulePattern: { title: 'How does your schedule usually look?' },
  specificDays: { title: 'Which days work?', subtitle: 'Click to select — pick at least one' },
  specificHours: { title: 'What hours on those days?' },
  notice: { title: 'How much heads-up do you need?', subtitle: 'Minimum time before someone can book' },
  buffer: { title: 'Want a break between meetings?' },
  dailyCap: { title: 'Cap how many you take per day?' },
  dailyCapCustom: { title: 'How many per day, exactly?' },
  extraQuestions: { title: 'Anything else to ask invitees?', subtitle: 'Beyond name, email and phone — optional' },
  bookingWindow: { title: 'How far ahead can people book?' },
}

const ChoiceRow = <T,>({
  option, selected, onClick,
}: { option: ChoiceOption<T>; selected: boolean; onClick: () => void }) => (
  <Button variant="ghost"
    type="button"
    onClick={onClick}
    className={cn(
      'w-full flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all h-auto',
      selected
        ? 'border-[var(--crm-accent)] bg-[var(--crm-accent-soft)] hover:bg-[var(--crm-accent-soft)] hover:text-[var(--crm-accent)]'
        : 'border-[var(--crm-border)] bg-[var(--crm-surface-1)] hover:border-[var(--crm-accent)]/50 hover:bg-transparent'
    )}
  >
    <div className="flex-1 min-w-0">
      <p className={cn('text-sm font-semibold', selected ? 'text-[var(--crm-accent)]' : 'text-[var(--crm-text-primary)]')}>{option.label}</p>
      {option.sublabel && <p className="text-xs text-[var(--crm-text-secondary)] mt-0.5">{option.sublabel}</p>}
    </div>
    {selected && <Check className="h-5 w-5 text-[var(--crm-accent)] shrink-0" />}
  </Button>
)

export default function EventTypeWizardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get('templateId')
  const { user } = useUser()
  
  const [answers, setAnswers] = useState<WizardAnswers>(() => {
    if (templateId) {
      const template = EVENT_TEMPLATES.find(t => t.id === templateId)
      if (template) {
        return { ...DEFAULT_ANSWERS, ...template.answers } as WizardAnswers
      }
    }
    return DEFAULT_ANSWERS
  })
  const [stepIndex, setStepIndex] = useState(0)

  const visibleSteps = getVisibleSteps(answers)
  const currentStepIndex = Math.min(stepIndex, visibleSteps.length - 1)
  const stepId = visibleSteps[currentStepIndex]
  const isLastStep = currentStepIndex === visibleSteps.length - 1

  const goToEditor = (finalAnswers: WizardAnswers) => {
    if (!user?.name) {
      toast.error('User profile name is required to create an event type.')
      return
    }
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    const draft = buildDraftFromWizardAnswers(finalAnswers, timezone)
    sessionStorage.setItem(WIZARD_DRAFT_STORAGE_KEY, JSON.stringify(draft))
    router.push(`/meetings/event-types/new?type=${finalAnswers.format}`)
  }

  const update = (partial: Partial<WizardAnswers>) => setAnswers(prev => ({ ...prev, ...partial }))

  const advance = () => {
    if (isLastStep) {
      goToEditor(answers)
    } else {
      setStepIndex(currentStepIndex + 1)
    }
  }

  const goBack = () => {
    if (currentStepIndex === 0) {
      router.push('/meetings/event-types')
    } else {
      setStepIndex(currentStepIndex - 1)
    }
  }

  const singleChoice = (partial: Partial<WizardAnswers>) => {
    update(partial)
    setTimeout(advance, 150)
  }

  const toggleDay = (day: number) => {
    const days = answers.specificDays || []
    update({ specificDays: days.includes(day) ? days.filter(d => d !== day) : [...days, day] })
  }

  const toggleExtraQuestion = (key: ExtraQuestionKey) => {
    const list = answers.extraQuestions
    update({ extraQuestions: list.includes(key) ? list.filter(k => k !== key) : [...list, key] })
  }

  const renderStepBody = () => {
    switch (stepId) {
      case 'purpose':
        return PURPOSE_OPTIONS.map(opt => (
          <ChoiceRow key={opt.value} option={opt} selected={answers.purpose === opt.value} onClick={() => singleChoice({ purpose: opt.value })} />
        ))
      case 'duration':
        return DURATION_OPTIONS.map(opt => (
          <ChoiceRow key={opt.value} option={opt} selected={answers.duration === opt.value} onClick={() => singleChoice({ duration: opt.value })} />
        ))
      case 'format':
        return FORMAT_OPTIONS.map(opt => (
          <ChoiceRow key={opt.value} option={opt} selected={answers.format === opt.value} onClick={() => singleChoice({ format: opt.value })} />
        ))
      case 'groupSize':
        return GROUP_SIZE_OPTIONS.map(opt => (
          <ChoiceRow key={opt.value} option={opt} selected={answers.groupSize === opt.value} onClick={() => singleChoice({ groupSize: opt.value })} />
        ))
      case 'location':
        return LOCATION_OPTIONS.map(opt => (
          <ChoiceRow key={opt.value} option={opt} selected={answers.location === opt.value} onClick={() => singleChoice({ location: opt.value })} />
        ))
      case 'schedulePattern':
        return SCHEDULE_PATTERN_OPTIONS.map(opt => (
          <ChoiceRow key={opt.value} option={opt} selected={answers.schedulePattern === opt.value} onClick={() => singleChoice({ schedulePattern: opt.value })} />
        ))
      case 'specificDays':
        return (
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {DAY_ORDER.map(day => {
              const selected = (answers.specificDays || []).includes(day)
              return (
                <Button variant="ghost"
                  type="button"
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={cn(
                    'h-11 rounded-xl border text-sm font-semibold transition-all w-auto p-0',
                    selected
                      ? 'bg-[var(--crm-accent)] border-[var(--crm-accent)] text-white hover:bg-[var(--crm-accent)] hover:text-white'
                      : 'border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:border-[var(--crm-accent)]/50 hover:bg-transparent'
                  )}
                >
                  {DAY_LABELS[day]}
                </Button>
              )
            })}
          </div>
        )
      case 'specificHours':
        return HOURS_OPTIONS.map(opt => {
          const selected = answers.specificStart === opt.value.start && answers.specificEnd === opt.value.end
          return (
            <ChoiceRow
              key={opt.label}
              option={opt}
              selected={selected}
              onClick={() => singleChoice({ specificStart: opt.value.start, specificEnd: opt.value.end })}
            />
          )
        })
      case 'notice':
        return NOTICE_OPTIONS.map(opt => (
          <ChoiceRow key={opt.value} option={opt} selected={answers.notice === opt.value} onClick={() => singleChoice({ notice: opt.value })} />
        ))
      case 'buffer':
        return BUFFER_OPTIONS.map(opt => (
          <ChoiceRow key={opt.value} option={opt} selected={answers.buffer === opt.value} onClick={() => singleChoice({ buffer: opt.value })} />
        ))
      case 'dailyCap':
        return DAILY_CAP_OPTIONS.map(opt => (
          <ChoiceRow key={opt.value} option={opt} selected={answers.dailyCap === opt.value} onClick={() => singleChoice({ dailyCap: opt.value })} />
        ))
      case 'dailyCapCustom':
        return [1, 2, 3, 4, 5, 6, 8, 10].map(n => (
          <ChoiceRow key={n} option={{ value: n, label: `${n} per day` }} selected={answers.dailyCapCustom === n} onClick={() => singleChoice({ dailyCapCustom: n })} />
        ))
      case 'extraQuestions':
        return EXTRA_QUESTION_OPTIONS.map(opt => (
          <ChoiceRow key={opt.value} option={opt} selected={answers.extraQuestions.includes(opt.value)} onClick={() => toggleExtraQuestion(opt.value)} />
        ))
      case 'bookingWindow':
        return BOOKING_WINDOW_OPTIONS.map(opt => (
          <ChoiceRow key={opt.value} option={opt} selected={answers.bookingWindowDays === opt.value} onClick={() => singleChoice({ bookingWindowDays: opt.value })} />
        ))
      default:
        return null
    }
  }

  // Multi-select steps (and the day picker) need an explicit Continue button
  // since there's no single click that unambiguously means "done".
  const needsContinueButton = stepId === 'specificDays' || stepId === 'extraQuestions'
  const continueDisabled = stepId === 'specificDays' && (answers.specificDays || []).length === 0

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden items-center">
      <div className="w-full max-w-xl flex flex-col flex-1 min-h-0 py-6 sm:py-10 px-4">
        <div className="flex items-center gap-3 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={goBack}
            className="h-9 w-9 shrink-0 border-[var(--crm-border)] bg-[var(--crm-surface-2)] rounded-full hover:bg-[var(--crm-surface-3)]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 h-1.5 rounded-full bg-[var(--crm-surface-3)] overflow-hidden">
            <div
              className="h-full bg-[var(--crm-accent)] rounded-full transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / visibleSteps.length) * 100}%` }}
            />
          </div>
          <Button variant="ghost"
            type="button"
            onClick={() => router.push('/meetings/event-types/new')}
            className="text-xs font-semibold text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] shrink-0 h-auto w-auto p-0 hover:bg-transparent"
          >
            Skip
          </Button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <h1 className="text-2xl font-bold text-[var(--crm-text-primary)] mb-1">{STEP_META[stepId].title}</h1>
          {STEP_META[stepId].subtitle && <p className="text-sm text-[var(--crm-text-secondary)] mb-6">{STEP_META[stepId].subtitle}</p>}
          {!STEP_META[stepId].subtitle && <div className="mb-6" />}

          <div className="flex flex-col gap-2.5 pb-8">
            {renderStepBody()}
          </div>
        </div>

        {needsContinueButton && (
          <div className="pt-4 border-t border-[var(--crm-border)]">
            <Button
              className="w-full h-11 bg-[var(--lb-navy)] hover:opacity-90 text-white font-semibold rounded-xl"
              onClick={advance}
              disabled={continueDisabled}
            >
              {isLastStep ? 'Review event' : 'Continue'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
