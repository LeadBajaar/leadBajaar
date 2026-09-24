import { WizardAnswers } from '@/lib/eventTypeWizard'
import { Clock, Phone, Video, Users, Coffee, Presentation, HeartHandshake } from 'lucide-react'

export interface EventTemplate {
  id: string
  name: string
  description: string
  icon: any
  badge: string
  answers?: Partial<WizardAnswers>
  fullPayload?: any
}

export const EVENT_TEMPLATES: EventTemplate[] = [
  {
    id: 'discovery-call',
    name: '30 Minutes with {{userName}} Health & Wellness Coach',
    description: 'Take out 30 minutes for your health. Sit in a comfortable, less noise area and make sure you have a stable internet connection.',
    icon: Coffee, // Assuming 'Coffee' or similar lucide icon is fine for spa/coach
    badge: 'Custom',
    fullPayload: {
        duration: 30,
        slot_interval: 30,
        location: 'video',
        video_platform: 'Zoom',
        type: 'one_on_one',
        max_bookings_per_invitee: 1,
        invitee_booking_limit_timeframe: 'PER_WEEK',
        scheduling: {
            bufferBefore: 0,
            bufferAfter: 0,
            minimumNotice: 4,
            dailyLimit: 0,
            weeklyLimit: 0,
            dateRange: 60,
            timezone: 'Asia/Calcutta',
            timeSlots: [{
                id: 'health_coach_slot',
                startTime: '10:30',
                endTime: '20:00',
                daysOfWeek: [1, 2, 3, 4, 5, 6],
                breaks: [
                    { id: 'b1', startTime: '15:00', endTime: '16:30', label: 'Lunch Break' },
                    { id: 'b2', startTime: '19:00', endTime: '20:30', label: 'Lunch Break' }
                ]
            }]
        },
        questions: [
            { id: 'invitee_name', question: 'Name', type: 'text', required: true, isLocked: true },
            { id: 'invitee_email', question: 'Email', type: 'email', required: false, isLocked: true },
            { id: 'invitee_phone', question: 'Phone Number', type: 'phone', required: true, isLocked: true },
            { id: 'q_reason', question: 'What is the reason for the call?', type: 'text', required: true },
            { id: 'q_tried', question: 'Have you tried anything before for your weight loss/weight gain?', type: 'radio', required: true, options: ['Yes', 'No'] },
            { id: 'q_tried_desc', question: 'If YES, then describe shortly.', type: 'text', required: false },
            { id: 'q_health', question: 'What are your current health problems?', type: 'checkbox', required: false, options: ['Tiredness', 'Belly fat', 'Poor digestion', 'PCOD', 'Stress', 'Hyper tension'] },
            { id: 'q_confirm', question: "Do you 100% confirm that you'll be available for the call at the selected date and time in a noise-free environment?", type: 'radio', required: true, options: ['Yes', 'No'] }
        ]
    }
  },
  {
    id: 'product-demo',
    name: '30-Min Product Demo',
    description: 'Standard product walkthrough with potential clients over a video call.',
    icon: Presentation,
    badge: 'Sales',
    answers: {
      purpose: 'sales',
      duration: 30,
      format: 'one_on_one',
      location: 'video',
      schedulePattern: 'wide_open',
      notice: 'one_day',
      buffer: 'short',
      dailyCap: 'none',
      bookingWindowDays: 30,
      extraQuestions: ['company', 'reason'],
    }
  },
  {
    id: 'technical-support',
    name: '60-Min Support Session',
    description: 'In-depth troubleshooting session for existing clients.',
    icon: HeartHandshake,
    badge: 'Support',
    answers: {
      purpose: 'consultation',
      duration: 60,
      format: 'one_on_one',
      location: 'video',
      schedulePattern: 'specific',
      notice: 'few_hours',
      buffer: 'short',
      dailyCap: 'few',
      bookingWindowDays: 14,
      extraQuestions: ['reason'],
    }
  },
  {
    id: 'group-onboarding',
    name: 'Group Onboarding',
    description: 'Weekly group training session for multiple new users.',
    icon: Users,
    badge: 'Operations',
    answers: {
      purpose: 'coaching',
      duration: 60,
      format: 'group',
      groupSize: 10,
      location: 'video',
      schedulePattern: 'specific',
      notice: 'one_day',
      buffer: 'long',
      dailyCap: 'custom',
      dailyCapCustom: 2,
      bookingWindowDays: 30,
      extraQuestions: [],
    }
  },
  {
    id: 'coffee-chat',
    name: 'Networking Coffee Chat',
    description: 'Informal networking or interview meeting in person.',
    icon: Coffee,
    badge: 'Networking',
    answers: {
      purpose: 'interview',
      duration: 30,
      format: 'one_on_one',
      location: 'in-person',
      schedulePattern: 'varies',
      notice: 'few_days',
      buffer: 'long',
      dailyCap: 'few',
      bookingWindowDays: 30,
      extraQuestions: ['topic'],
    }
  }
]
