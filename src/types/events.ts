export interface EventType {
  id: string | number
  title: string
  description: string
  duration: number
  location: string
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
    timeSlots: any[]
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