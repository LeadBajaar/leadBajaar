'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CustomCalendar } from "@/components/ui/custom-calendar"
import { format, addDays, isBefore, isAfter, startOfDay, endOfDay, isWithinInterval } from "date-fns"
import { ChevronLeft, ChevronRight, Clock, Globe, CheckCircle2, Zap, Calendar, AlertCircle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { validateQuestionResponse } from '@/lib/validations/questions'
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { API_BASE_URL } from '@/lib/api'

interface EventType {
  id: string
  title: string
  description: string
  duration: number
  questions: any[]
  scheduling: any
  teamMembers: any[]
  owner?: {
    name: string;
    avatar_url?: string;
  }
  redirect_url?: string
}

interface TimeSlot {
  startTime: string
  endTime: string
  available: boolean
  spotsRemaining?: number
  maxInvitees?: number
}

const isDateAvailable = (date: Date, eventType: EventType) => {
  const today = startOfDay(new Date());
  const maxDate = addDays(today, eventType.scheduling.dateRange);

  // Check if date is within allowed range
  if (isBefore(date, today) || isAfter(date, maxDate)) {
    return false;
  }

  // Derive available days from timeSlots[].daysOfWeek (0=Sun, 1=Mon … 6=Sat)
  // This is the real source of truth — the legacy 'availableDays' string array
  // does not reflect Saturday/Sunday changes made in TimeSlotManager.
  const timeSlots: Array<{ daysOfWeek: number[] }> =
    eventType.scheduling.timeSlots ?? [];

  if (timeSlots.length > 0) {
    // Collect all day numbers configured across all time slots
    const availableDayNumbers = new Set<number>(
      timeSlots.flatMap((slot) => slot.daysOfWeek)
    );
    // date-fns getDay(): 0=Sun, 1=Mon … 6=Sat — same convention as the backend
    return availableDayNumbers.has(date.getDay());
  }

  // Fallback: use the legacy string-name array if no timeSlots configured
  const dayName = format(date, 'EEEE'); // 'Monday', 'Saturday', etc.
  return (eventType.scheduling.availableDays ?? []).includes(dayName);
};

function CalendarSkeleton() {
  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="flex justify-between items-center px-2">
        <div className="h-5 w-32 bg-muted rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
          <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-y-2 gap-x-1">
        {/* Week days */}
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-4 w-full max-w-6 mx-auto bg-muted/50 rounded animate-pulse mb-2" />
        ))}
        {/* Date cells */}
        {[...Array(35)].map((_, i) => (
          <div key={i} className="aspect-square w-full max-w-10 rounded-full bg-muted/30 animate-pulse mx-auto" />
        ))}
      </div>
    </div>
  )
}

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEmbed = searchParams.get('embed') === 'true'
  const username = params.username as string
  const eventSlug = params.eventSlug as string
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [eventType, setEventType] = useState<EventType | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [error, setError] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [bookingDetails, setBookingDetails] = useState<any>(null)
  const slotsRef = useRef<HTMLDivElement | null>(null)
  const nextButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const fetchEventType = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/event-types/${eventSlug}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch event type');
        }

        const data = await response.json();
        
        // Map API response to frontend model with proper scheduling data
        const mappedEventType = {
          id: data.id,
          title: data.title,
          description: data.description,
          duration: data.duration,
          location: data.location,
          questions: data.questions || [],
          scheduling: {
            bufferBefore: data.scheduling?.bufferBefore || data.buffer_before || 0,
            bufferAfter: data.scheduling?.bufferAfter || data.buffer_after || 0,
            minimumNotice: data.scheduling?.minimumNotice || data.minimum_notice_time || 24,
            dailyLimit: data.scheduling?.dailyLimit || data.daily_meeting_limit || 0,
            weeklyLimit: data.scheduling?.weeklyLimit || data.weekly_meeting_limit || 0,
            availableDays: data.scheduling?.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            dateRange: data.scheduling?.dateRange || data.date_range_booking || 60,
            timezone: data.scheduling?.timezone || data.timezone || 'UTC',
            timeSlots: data.scheduling?.timeSlots || [],
            startTime: data.scheduling?.startTime || '09:00',
            endTime: data.scheduling?.endTime || '17:00',
            recurring: data.scheduling?.recurring || null
          },
          teamMembers: data.team_members ? 
            (Array.isArray(data.team_members) ? data.team_members : [data.team_members]) 
            : [],
          owner: data.owner ? {
            name: data.owner.name,
            avatar_url: data.owner.avatar_url
          } : undefined,
          redirect_url: data.redirect_url
        };

        setEventType(mappedEventType);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch event type');
      }
    };

    if (username && eventSlug) {
      fetchEventType();
    }
  }, [username, eventSlug]);

  useEffect(() => {
    // Fetch available time slots when date is selected
    if (selectedDate && eventType) {
      fetchAvailableSlots(selectedDate)
    }
  }, [selectedDate, eventType])

  // Smoothly scroll to the slots section when a date is selected
  useEffect(() => {
    if (selectedDate && slotsRef.current) {
      slotsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [selectedDate])

  // Smoothly scroll to the Next button when a time slot is selected
  useEffect(() => {
    if (selectedTime && nextButtonRef.current) {
      nextButtonRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [selectedTime])

  const fetchAvailableSlots = async (date: Date) => {
    setIsLoadingSlots(true);
    try {
      console.log('Fetching slots for date:', format(date, 'yyyy-MM-dd'));
      
      const queryParams = new URLSearchParams({
        date: format(date, 'yyyy-MM-dd'),
        timezone: eventType?.scheduling.timezone || 'UTC',
        duration: eventType?.duration.toString() || '30',
        buffer_before: eventType?.scheduling.bufferBefore.toString() || '0',
        buffer_after: eventType?.scheduling.bufferAfter.toString() || '0'
      });
      
      const response = await fetch(
        `${API_BASE_URL}/event-types/${eventType?.id}/availability?${queryParams.toString()}&_t=${Date.now()}`,
        {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error('Failed to fetch availability');
      }

      const data = await response.json();
      console.log('Available Slots:', data);

      // Ensure slots are in the correct format and filtered for availability
      const formattedSlots = (data.slots || []).map((slot: any) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        available: slot.available !== false, // default to true if not specified
        spotsRemaining: slot.spotsRemaining,
        maxInvitees: slot.maxInvitees
      }));

      setAvailableSlots(formattedSlots);
    } catch (error) {
      console.error('Error fetching availability:', error);
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  }

  const formatTimeSlot = (slot: TimeSlot) => {
    return format(new Date(slot.startTime), 'h:mm a')
  }

  const isCurrentQuestionValid = () => {
    const currentQuestion = eventType?.questions[currentQuestionIndex]
    if (!currentQuestion) return false
    
    const value = answers[currentQuestion.id]
    
    // Required check
    if (currentQuestion.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return false
    }
    
    // Type-specific validation check
    if (value) {
      const validation = validateQuestionResponse(currentQuestion.type, value, currentQuestion.question)
      if (!validation.isValid) return false
    }
    
    return true
  }

  const handleAnswerChange = (questionId: string, value: any, type: string) => {
    const question = eventType?.questions.find(q => q.id === questionId)
    const validation = validateQuestionResponse(type, value, question?.question)
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))

    setErrors(prev => ({
      ...prev,
      [questionId]: validation.error || ''
    }))
  }

  const renderQuestion = (question: any) => {
    switch (question.type) {
      case 'text':
      case 'email':
        return (
          <Input
            type={question.type}
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value, question.type)}
            placeholder={`Enter your ${question.question.toLowerCase()}`}
          />
        )

      case 'phone':
        return (
          <Input
            type="tel"
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value, 'phone')}
            placeholder="Enter your phone number"
          />
        )

      case 'textarea':
        return (
          <Textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value, 'text')}
            placeholder={`Enter your response`}
          />
        )

      case 'select':
        return (
          <Select
            value={answers[question.id] || ''}
            onValueChange={(value) => handleAnswerChange(question.id, value, 'select')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'multiselect':
        return (
          <div className="space-y-2">
            {question.options.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${option}`}
                  checked={(answers[question.id] || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const currentAnswers = answers[question.id] || []
                    const newAnswers = checked
                      ? [...currentAnswers, option]
                      : currentAnswers.filter((a: string) => a !== option)
                    handleAnswerChange(question.id, newAnswers, 'multiselect')
                  }}
                />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        )

      case 'radio':
        return (
          <RadioGroup
            value={answers[question.id] || ''}
            onValueChange={(value) => handleAnswerChange(question.id, value, 'radio')}
          >
            {question.options.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${option}`}
                  checked={(answers[question.id] || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const currentAnswers = answers[question.id] || []
                    const newAnswers = checked
                      ? [...currentAnswers, option]
                      : currentAnswers.filter((a: string) => a !== option)
                    handleAnswerChange(question.id, newAnswers, 'checkbox')
                  }}
                />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  const handleSubmit = async () => {
    // Validate all answers before submitting
    const currentErrors: Record<string, string> = {}
    let hasErrors = false

    eventType?.questions?.forEach(question => {
      const value = answers[question.id]
      const validation = validateQuestionResponse(question.type, value, question.question)
      if (!validation.isValid) {
        currentErrors[question.id] = validation.error || 'Invalid answer'
        hasErrors = true
      }
    })

    if (hasErrors) {
      setErrors(currentErrors)
      setIsSubmitting(false)
      return
    }

    setIsSubmitting(true)
    
    try {
      const bookingData = {
        eventTypeId: eventType?.id,
        date: format(selectedDate!, 'yyyy-MM-dd'),
        time: format(new Date(selectedTime!), 'HH:mm:ss'),
        duration: eventType?.duration,
        timezone: eventType?.scheduling.timezone || 'UTC',
        answers
      };

      console.log('Submitting booking with data:', bookingData);

      const response = await fetch(
        `${API_BASE_URL}/bookings`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(bookingData)
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        if (data.message === "This time slot is no longer available" || data.message === "This group slot is already full" || response.status === 422) {
          toast.error("This slot was just taken. Please choose another.");
          setStep(1);
          
          // Eagerly remove the slot from the UI so it hides instantly
          setAvailableSlots(prev => prev.filter(slot => slot.startTime !== selectedTime));
          
          setSelectedTime(null);
          
          if (selectedDate) {
             fetchAvailableSlots(selectedDate);
          }
          return;
        }
        throw new Error(data.message || 'Failed to create booking');
      }

      console.log('Booking Response:', data);

      if (!data.booking) {
        throw new Error('Invalid booking response');
      }

      setBookingDetails(data.booking);
      setShowSuccess(true);

      // Handle Redirection if configured
      if (eventType?.redirect_url && eventType.redirect_url.trim() !== '') {
        setTimeout(() => {
          // Double check the value just before redirecting
          if (eventType.redirect_url) {
            window.location.href = eventType.redirect_url;
          }
        }, 2500); 
      }
      
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create booking');
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNextQuestion = () => {
    if (!eventType?.questions || eventType.questions.length === 0) {
      handleSubmit()
      return
    }

    const currentQuestion = eventType.questions[currentQuestionIndex]
    
    // Validate current question
    if (currentQuestion.required && !answers[currentQuestion.id]) {
      setErrors({
        ...errors,
        [currentQuestion.id]: 'This field is required'
      })
      return
    }
    
    if (answers[currentQuestion.id]) {
      const validation = validateQuestionResponse(currentQuestion.type, answers[currentQuestion.id], currentQuestion.question)
      if (!validation.isValid) {
        setErrors({
          ...errors,
          [currentQuestion.id]: validation.error || 'Invalid input'
        })
        return
      }
    }

    // Clear error if validation passes
    setErrors({
      ...errors,
      [currentQuestion.id]: ''
    })

    // Move to next question or submit if last question
    if (eventType && currentQuestionIndex < eventType.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    } else {
      setStep(1) // Go back to calendar view
    }
  }

  if (error) {
    return (
      <div className={cn(isEmbed ? "p-0 bg-transparent w-full" : "min-h-screen flex flex-col items-center justify-center bg-[var(--lb-bg)] py-6 px-4")}>
        <div className="w-full max-w-md mx-auto text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--crm-text-primary)]">Event Not Found</h2>
          <p className="text-[var(--crm-text-secondary)]">The event type you are looking for does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  if (!eventType) return (
    <div className={cn(isEmbed ? "p-0 bg-transparent w-full" : "min-h-screen flex flex-col items-center justify-center bg-[var(--lb-bg)] py-6 px-4")}>
      <div className="w-full max-w-[820px] mx-auto">
        <Card className="border-[0.5px] border-[var(--lb-border)] bg-white shadow-sm rounded-[16px] overflow-hidden w-full">
          <CardContent className="p-0 relative overflow-hidden">
          <div className="grid sm:grid-cols-[220px,1fr]">
            {/* Left Section Skeleton */}
            <div className="p-6 border-r">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
                <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-20 w-full bg-muted rounded animate-pulse" />
              </div>
            </div>
            
            {/* Right Section Skeleton */}
            <div className="p-6">
              <CalendarSkeleton />
            </div>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className={cn(isEmbed ? "p-0 bg-transparent w-full" : "min-h-[100dvh] flex flex-col items-center sm:justify-center bg-[var(--lb-s1)] sm:bg-[var(--lb-bg)] sm:py-6 sm:px-4")}>
      <div className="w-full h-full sm:h-auto max-w-[700px] mx-auto flex flex-col flex-1 sm:flex-none">
        <Card className="border-0 sm:border-[0.5px] border-[var(--lb-border)] bg-[var(--lb-s1)] shadow-none sm:shadow-sm rounded-none sm:rounded-[16px] overflow-hidden w-full flex-1 flex flex-col">
          <CardContent className="p-0 relative flex-1 flex flex-col">
          <div className="grid sm:grid-cols-[220px,1fr] flex-1">
            <div className={cn("p-4 sm:p-[24px_20px] border-b sm:border-b-0 sm:border-r border-[var(--lb-border)] bg-[var(--lb-s1)] flex flex-row sm:flex-col items-center sm:items-center text-left sm:text-center gap-4 sm:gap-0")}>
              <div className="mb-0 sm:mb-[16px] shrink-0">
                <Avatar className="w-[48px] h-[48px] sm:w-[64px] sm:h-[64px] rounded-2xl border-[0.5px] border-[var(--lb-border)] shadow-sm">
                  <AvatarImage src={eventType?.owner?.avatar_url || eventType?.teamMembers?.[0]?.avatar} className="object-cover" />
                  <AvatarFallback className="bg-[var(--lb-s2)] text-[var(--lb-navy)] font-bold text-lg sm:text-xl rounded-2xl">
                    {eventType?.owner?.name?.[0]?.toUpperCase() || 'LB'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex flex-col flex-1">
                <div className="text-[15px] font-medium text-[var(--lb-t1)] mb-0.5 sm:mb-1">
                  {eventType?.owner?.name || eventType?.teamMembers?.[0]?.name || 'LeadBajaar'}
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-[var(--lb-t2)] mb-0 sm:mb-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{eventType?.duration} min</span>
                </div>
                <div className="hidden sm:block text-[12px] text-[var(--lb-t3)] leading-relaxed">
                  {eventType?.description || eventType?.title}
                </div>
              </div>

              {/* Meeting Summary */}
              {selectedDate && selectedTime && (
                <div className="hidden sm:block mt-4 p-[12px_14px] bg-[var(--lb-s2)] border-[0.5px] border-[var(--lb-border)] rounded-xl w-full">
                  <div className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[var(--lb-navy)] mb-2">
                    Meeting summary
                  </div>
                  <div className="space-y-0">
                    <div className="flex justify-between items-center py-1.5 border-b-[0.5px] border-[var(--lb-border)]">
                      <span className="text-[11px] text-[var(--lb-t3)]">Date</span>
                      <span className="text-[11px] font-medium text-[var(--lb-t1)]">{format(selectedDate, 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b-[0.5px] border-[var(--lb-border)]">
                      <span className="text-[11px] text-[var(--lb-t3)]">Time</span>
                      <span className="text-[11px] font-medium text-[var(--lb-t1)]">{selectedTime ? format(new Date(selectedTime), 'h:mm a') : ''}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b-[0.5px] border-[var(--lb-border)]">
                      <span className="text-[11px] text-[var(--lb-t3)]">Duration</span>
                      <span className="text-[11px] font-medium text-[var(--lb-t1)]">{eventType?.duration} minutes</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Section - Calendar & Questions */}
            <div className="p-4 sm:p-6 min-h-[500px] relative flex flex-col w-full max-w-[100vw] sm:max-w-none overflow-x-hidden sm:overflow-x-visible">
              {showSuccess && bookingDetails ? (
                <div className="flex flex-col py-2 animate-in fade-in slide-in-from-bottom-4 duration-300 w-full">
                  <div className="w-14 h-14 rounded-full bg-[var(--lb-green-soft)] border-[0.5px] border-[var(--lb-green-border)] flex items-center justify-center mx-auto mb-3.5">
                    <CheckCircle2 className="w-[26px] h-[26px] text-[var(--lb-green)]" />
                  </div>
                  <h2 className="text-[20px] font-medium text-center mb-1.5 text-[var(--lb-t1)]">
                    Booking confirmed!
                  </h2>
                  <p className="text-[13px] text-[var(--lb-t2)] text-center mb-5">
                    Your meeting has been scheduled and confirmed.
                  </p>

                  <div className="bg-[var(--lb-s2)] border-[0.5px] border-[var(--lb-border)] rounded-xl overflow-hidden mb-3 w-full max-w-md mx-auto">
                    <div className="text-[10px] font-semibold tracking-[0.10em] uppercase text-[var(--lb-navy)] px-3.5 py-2.5 border-b-[0.5px] border-[var(--lb-border)]">
                      Meeting Details
                    </div>
                    <div className="flex justify-between items-center px-3.5 py-[9px] border-b-[0.5px] border-[var(--lb-border)]">
                      <span className="text-[12px] text-[var(--lb-t3)]">Date</span>
                      <span className="text-[12px] font-medium text-[var(--lb-t1)]">
                        {/* Prefer the visitor's own selection (already in their local timezone).
                            The API's start_time is raw UTC, so the fallback formats it in the
                            browser's local zone — never as UTC wall time. */}
                        {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') :
                          bookingDetails?.start_time ? format(new Date(bookingDetails.start_time), 'EEEE, MMMM d, yyyy') : ''}
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-3.5 py-[9px] border-b-[0.5px] border-[var(--lb-border)]">
                      <span className="text-[12px] text-[var(--lb-t3)]">Time</span>
                      <span className="text-[12px] font-medium text-[var(--lb-t1)]">
                        {selectedTime ? format(new Date(selectedTime), 'h:mm a') :
                          bookingDetails?.start_time ? format(new Date(bookingDetails.start_time), 'h:mm a') : ''}
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-3.5 py-[9px]">
                      <span className="text-[12px] text-[var(--lb-t3)]">Duration</span>
                      <span className="text-[12px] font-medium text-[var(--lb-t1)]">{eventType?.duration} minutes</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-[var(--lb-green-soft)] border-[0.5px] border-[var(--lb-green-border)] rounded-xl px-3.5 py-2.5 text-[12px] text-[var(--lb-green)] mb-3.5 w-full max-w-md mx-auto">
                    <Calendar className="w-[15px] h-[15px] flex-shrink-0" />
                    A calendar invite has been sent to your email
                  </div>

                  {eventType?.redirect_url && (
                    <p className="text-xs text-muted-foreground animate-pulse mt-2">
                      Redirecting you in a few seconds...
                    </p>
                  )}

                  <button
                    onClick={() => {
                      setShowSuccess(false);
                      setBookingDetails(null);
                      // Handle Redirection if configured
                      if (eventType?.redirect_url) {
                        window.location.href = eventType.redirect_url;
                      } else {
                        // Reset everything back to step 1
                        setAnswers({});
                        setSelectedDate(undefined);
                        setSelectedTime(null);
                        setStep(1);
                        setCurrentQuestionIndex(0);
                      }
                    }}
                    className="w-full max-w-md mx-auto bg-[var(--lb-navy)] text-white border-none rounded-xl p-[13px] text-[14px] font-medium cursor-pointer tracking-[0.04em] uppercase hover:opacity-90 transition-opacity"
                  >
                    Done
                  </button>
                </div>
              ) : step === 1 ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[16px] font-medium text-[var(--lb-t1)]">
                      {selectedDate ? (
                        <>
                          Available times
                          <span className="text-[13px] font-normal text-[var(--lb-t2)] ml-1.5">
                            — {format(selectedDate, 'EEEE, MMMM d')}
                          </span>
                        </>
                      ) : (
                        'Select date & time'
                      )}
                    </h3>
                    <div className="flex items-center gap-[5px] text-[11px] text-[var(--lb-t2)] bg-[var(--lb-s2)] border-[0.5px] border-[var(--lb-border)] rounded-full px-2.5 py-1">
                      <Globe className="h-[13px] w-[13px]" />
                      <span>{eventType.scheduling.timezone}</span>
                    </div>
                  </div>
                  
                  <div className="grid gap-0">
                    {/* Calendar/Slots Transition Container */}
                    <div className="p-0 rounded-lg flex-grow">
                      {/* Calendar View */}
                      <div
                        className={cn(
                          "transition-all duration-300",
                          selectedDate ? "opacity-0 -translate-y-2 pointer-events-none h-0 overflow-hidden" : "opacity-100 translate-y-0"
                        )}
                        aria-hidden={!!selectedDate}
                      >
                        <CustomCalendar
                          selectedDate={selectedDate}
                          onDateSelect={setSelectedDate}
                          minDate={new Date()}
                          maxDate={addDays(new Date(), eventType.scheduling.dateRange)}
                          className="w-full"
                          isDateAvailable={(date) => isDateAvailable(date, eventType)}
                        />
                        {!selectedDate && (
                          <div className="pt-6 text-center text-sm text-[var(--crm-text-secondary)]">
                            Select a date to view available times
                          </div>
                        )}
                      </div>

                      {/* Slots View */}
                      <div
                        ref={slotsRef}
                        className={cn(
                          "transition-all duration-300",
                          selectedDate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none h-0 overflow-hidden"
                        )}
                        aria-hidden={!selectedDate}
                      >
                        <div className="flex items-center justify-between mb-3.5 mt-[-8px]">
                          <button
                            onClick={() => {
                              setSelectedTime(null)
                              setSelectedDate(undefined)
                            }}
                            className="inline-flex items-center gap-[6px] bg-[var(--lb-s2)] border-[0.5px] border-[var(--lb-border)] rounded-xl px-3 py-[7px] text-[12px] text-[var(--lb-t2)] hover:bg-[var(--lb-s3)] transition-colors cursor-pointer"
                          >
                            <ChevronLeft className="h-[13px] w-[13px]" /> Change date
                          </button>
                          <div className="flex items-center gap-2">
                            {availableSlots.length > 0 && (
                              <span className="text-[11px] text-[var(--lb-t3)]">
                                {availableSlots.length} slots available
                              </span>
                            )}
                          </div>
                        </div>

                        {isLoadingSlots ? (
                          <div className="grid grid-cols-3 gap-2">
                            {[...Array(6)].map((_, i) => (
                              <div key={i} className="h-10 bg-muted/50 rounded animate-pulse" />
                            ))}
                          </div>
                        ) : availableSlots.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2">
                            {availableSlots.map((slot) => (
                              <button
                                key={slot.startTime}
                                className={cn(
                                  "w-full transition-all duration-200 border-[0.5px] rounded-xl font-medium text-[13px] p-[10px] flex flex-col items-center justify-center gap-1",
                                  !slot.available && "opacity-50 cursor-not-allowed bg-[var(--lb-s2)] border-[var(--lb-border)] text-[var(--lb-t3)]",
                                  selectedTime !== slot.startTime && slot.available && "bg-[var(--lb-s2)] border-[var(--lb-border)] text-[var(--lb-t1)] hover:border-[var(--lb-navy)]",
                                  selectedTime === slot.startTime && "bg-[var(--lb-navy)] text-white border-[var(--lb-navy)]"
                                )}
                                onClick={() => slot.available && setSelectedTime(slot.startTime)}
                                disabled={!slot.available}
                              >
                                <span>{format(new Date(slot.startTime), 'h:mm a')}</span>
                                {slot.maxInvitees && slot.maxInvitees > 1 && (
                                  <span className={cn("text-[9px] font-bold uppercase tracking-widest", selectedTime === slot.startTime ? "text-white/80" : "text-emerald-600 dark:text-emerald-400")}>
                                    {slot.spotsRemaining} spot{slot.spotsRemaining !== 1 ? 's' : ''} left
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="py-8 text-center">
                            <p className="text-[var(--lb-t2)] text-[13px]">No available slots for this date</p>
                          </div>
                        )}

                        {/* Next Button */}
                        {selectedDate && selectedTime && (
                          <button 
                            ref={nextButtonRef}
                            className="w-full mt-4 bg-[var(--lb-navy)] text-white border-none rounded-xl p-[13px] text-[14px] font-medium cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setStep(2)}
                          >
                            Next &rarr;
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between pb-3.5 border-b-[0.5px] border-[var(--lb-border)] mb-4">
                    <button onClick={handlePreviousQuestion} className="flex items-center gap-[5px] bg-transparent border-none text-[13px] text-[var(--lb-t2)] cursor-pointer hover:text-[var(--lb-t1)] transition-colors">
                      <ChevronLeft className="w-[14px] h-[14px]" /> Back
                    </button>
                    <span className="text-[15px] font-medium text-[var(--lb-t1)]">Enter your details</span>
                    <div className="w-10" />
                  </div>

                  {/* Progress Bar & Questions */}
                  {eventType?.questions && eventType.questions.length > 0 ? (
                    <>
                      <div className="mb-6 flex flex-col items-center w-full">
                        <div className="flex items-center justify-center mb-2 w-full px-1 py-1">
                          {eventType.questions.map((_, index) => {
                            const isCompleted = index < currentQuestionIndex;
                            const isCurrent = index === currentQuestionIndex;
                            return (
                              <React.Fragment key={index}>
                                <div
                                  className={cn(
                                    "flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full text-[10px] sm:text-[12px] font-medium transition-all duration-300 shrink-0",
                                    isCompleted
                                      ? "bg-[var(--lb-green)] text-white border border-[var(--lb-green)]"
                                      : isCurrent
                                      ? "bg-[var(--lb-navy)] text-white border border-[var(--lb-navy)] shadow-sm"
                                      : "bg-[var(--lb-s2)] text-[var(--lb-t3)] border border-[var(--lb-border)]"
                                  )}
                                >
                                  {isCompleted ? "✓" : index + 1}
                                </div>
                                {index < eventType.questions.length - 1 && (
                                  <div
                                    className={cn(
                                      "flex-1 h-[2px] mx-0.5 sm:mx-1.5 rounded-full transition-colors duration-300 min-w-[2px] max-w-[24px] sm:max-w-[32px]",
                                      isCompleted ? "bg-[var(--lb-green)]" : "bg-[var(--lb-s3)]"
                                    )}
                                  />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                        <div className="text-[11px] text-[var(--lb-t3)]">
                          Question {currentQuestionIndex + 1} of {eventType.questions.length}
                        </div>
                      </div>

                  {/* Current Question */}
                  <div className="space-y-6">
                    <div 
                      key={eventType.questions[currentQuestionIndex].id} 
                      className="space-y-1.5 min-h-[200px]"
                    >
                      <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[var(--lb-t2)] flex items-center gap-1">
                        {eventType.questions[currentQuestionIndex].question}
                        {eventType.questions[currentQuestionIndex].required && (
                          <span className="text-[var(--lb-red)] text-[12px]">*</span>
                        )}
                      </div>
                      {eventType.questions[currentQuestionIndex].description && (
                        <p className="text-[11px] text-[var(--lb-t3)]">
                          {eventType.questions[currentQuestionIndex].description}
                        </p>
                      )}

                      {renderQuestion(eventType.questions[currentQuestionIndex])}
                      
                      {errors[eventType.questions[currentQuestionIndex].id] && (
                        <p className="text-sm text-destructive">
                          {errors[eventType.questions[currentQuestionIndex].id]}
                        </p>
                      )}
                    </div>
                  </div>
                  </>
                  ) : (
                    <div className="py-12 text-center border rounded-xl bg-[var(--lb-s2)] border-[var(--lb-border)]">
                      <p className="text-[var(--lb-t2)] text-[13px] font-medium">No additional details required.</p>
                      <p className="text-[12px] text-[var(--lb-t3)] mt-2">Click Schedule below to confirm your booking.</p>
                    </div>
                  )}

                  <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 mt-6">
                      <button 
                        onClick={handlePreviousQuestion}
                        className="w-full sm:w-auto bg-[var(--lb-s2)] text-[var(--lb-t1)] border-[0.5px] border-[var(--lb-border)] rounded-xl px-5 py-2.5 text-[13px] font-medium cursor-pointer hover:bg-[var(--lb-s3)] transition-colors"
                      >
                        Previous
                      </button>
                      <button 
                        onClick={currentQuestionIndex === eventType.questions.length - 1 ? handleSubmit : handleNextQuestion}
                        className="w-full sm:w-auto bg-[var(--lb-navy)] text-white border-none rounded-xl px-7 py-2.5 text-[13px] font-medium cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        disabled={isSubmitting || !isCurrentQuestionValid()}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center">
                            <span className="animate-spin mr-2">⏳</span> 
                            Scheduling...
                          </div>
                        ) : (
                          (!eventType?.questions?.length || currentQuestionIndex === eventType.questions.length - 1) ? 'Schedule' : 'Next →'
                        )}
                      </button>
                    </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {!isEmbed && (
        <div className="mt-4 text-center flex items-center justify-center text-[var(--lb-t3)] text-[11px] font-medium space-x-1">
           <Zap className="h-3 w-3" />
           <span>Powered by LeadBajaar</span>
        </div>
      )}
      </div>
    </div>
  )
} 