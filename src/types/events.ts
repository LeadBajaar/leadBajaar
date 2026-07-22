export interface EventType {
  id: string | number
  slug?: string
  title: string
  description: string
  duration: number
  slot_interval?: number
  location: string
  redirect_url?: string
  type?: 'one_on_one' | 'group'
  max_invitees?: number | null
  max_bookings_per_invitee?: number | null
  invitee_booking_limit_timeframe?: 'ACTIVE' | 'PER_WEEK' | 'PER_MONTH'
  color?: string
  questions: Question[]
  scheduling: {
    bufferBefore: number
    bufferAfter: number
    minimumNotice: number
    dailyLimit: number
    weeklyLimit: number
    availableDays: string[]
    dateRange: number
    timezone: string
    availabilityType?: 'recurring' | 'specific_dates'
    timeSlots: any[]
    specificDates?: any[]
    startTime?: string
    endTime?: string
    recurring?: {
      frequency: string
      interval: number
      timeslots: any[]
    } | null
  }
  slots?: TimeSlot[]
  teamMembers: TeamMember[]
  sections?: QuestionSection[]
}

export interface Question {
  id: string
  question: string
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'dropdown' | 'date' | 'time' | 'phone' | 'email'
  required: boolean
  options?: string[]
  placeholder?: string
  description?: string
  isLocked?: boolean
}

export interface QuestionSection {
  id: string
  title: string
  description?: string
  questions: Question[]
}


export interface EventQuestion {
  id: string
  question: string
  type: 'text' | 'select' | 'multiselect'
  required: boolean
  options?: string[]
}

export interface SchedulingSettings {
  bufferBefore: number
  bufferAfter: number
  minimumNotice: number
  availableDays: string[]
  dateRange: number
  timezone: string
}

export interface TimeSlot {
  day: string
  startTime: string
  endTime: string
}

export interface TeamMember {
  id: number
  name: string
  email: string
  avatar: string
  role: string
} 