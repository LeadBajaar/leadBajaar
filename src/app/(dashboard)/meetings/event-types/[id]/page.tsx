'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  GripVertical, 
  AlertCircle, 
  XCircle 
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"

import { BasicInfoTab } from './components/BasicInfoTab'
import { QuestionsTab } from './components/QuestionsTab'
import { SchedulingTab } from './components/SchedulingTab'
import { TeamTab } from './components/TeamTab'
import { eventTypeService } from '@/services/event-types'
import { useUser } from '@/contexts/UserContext'

import { EventType, Question, QuestionSection, SchedulingSettings, TimeSlot, TeamMember } from '@/types/events'

// ... (teamMembers constant remains)
const teamMembers = [
  {
    id: 1,
    name: "Alex Thompson",
    email: "alex@example.com",
    avatar: "https://www.svgrepo.com/show/65453/avatar.svg",
    role: "Sales Representative"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    avatar: "https://www.svgrepo.com/show/65453/avatar.svg",
    role: "Senior Sales Executive"
  },
]

export default function EventTypeForm() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const { toast } = useToast()
  const isNew = params.id === 'new'

  const [loading, setLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [eventType, setEventType] = useState<EventType>({
    id: isNew ? 'new' : '', // Satisfy interface
    title: isNew ? `30 Minutes with ${user?.name || 'Coach'} Health & Wellness Coach` : '',
    description: isNew ? 'Take out 30 minutes for your health. Sit in a comfortable, less noise area and make sure you have a stable internet connection.' : '',
    duration: 30,
    location: 'video',
    questions: isNew ? [
      { id: 'q-name', question: 'NAME', type: 'text', required: true, isLocked: true },
      { id: 'q-phone', question: 'PHONE', type: 'text', required: true, isLocked: true },
      { id: 'q-reason', question: 'What is the reason for the call?', type: 'text', required: true },
      { 
        id: 'q-tried', 
        question: 'Have you tried anything before for your weight loss/weight gain?', 
        type: 'radio', 
        required: true,
        options: ['Yes', 'No']
      },
      { id: 'q-describe', question: 'If YES, then describe shortly.', type: 'text', required: false },
      { 
        id: 'q-health', 
        question: 'What are your current health problems?', 
        type: 'checkbox', 
        required: true,
        options: ['Tiredness', 'Belly fat', 'Poor digestion', 'PCOD', 'Stress', 'Hyper tension']
      },
      { 
        id: 'q-confirm', 
        question: "Do you 100% confirm that you'll be available for the call at the selected date and time in a noise-free environment?", 
        type: 'radio', 
        required: true,
        options: ['Yes', 'No']
      }
    ] as Question[] : [] as Question[],
    scheduling: {
      bufferBefore: 0,
      bufferAfter: 0,
      minimumNotice: 4,
      dailyLimit: 0,
      weeklyLimit: 0,
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      dateRange: 7,
      timezone: 'Asia/Kolkata',
      timeSlots: [
        {
          id: 'default-1',
          startTime: '09:00',
          endTime: '17:00',
          daysOfWeek: [1, 2, 3, 4, 5, 6], // Mon-Sat
          breaks: [
            { id: 'break-1', label: 'Lunch Break', startTime: '15:00', endTime: '16:30' },
            { id: 'break-2', label: 'Lunch Break', startTime: '19:00', endTime: '20:30' }
          ]
        }
      ],
      recurring: null
    },
    slots: [] as TimeSlot[],
    teamMembers: [] as TeamMember[],
    sections: [] as QuestionSection[],
  })

  // ... (sensors, useEffect remain same)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    if (isNew) {
      setLoading(false)
      return
    }

    const loadEventType = async () => {
      try {
        setLoading(true)
        const data = await eventTypeService.getById(params.id as string)
        const newEventType: EventType = {
          id: data.id,
          title: data.title || '',
          description: data.description || '',
          duration: data.duration || 30,
          location: data.location || 'video',
          questions: data.questions || [],
          scheduling: {
            bufferBefore: data.scheduling?.bufferBefore || 0,
            bufferAfter: data.scheduling?.bufferAfter || 0,
            minimumNotice: data.scheduling?.minimumNotice || 24,
            dailyLimit: data.scheduling?.dailyLimit || 0,
            weeklyLimit: data.scheduling?.weeklyLimit || 0,
            availableDays: data.scheduling?.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            dateRange: data.scheduling?.dateRange || 60,
            timezone: data.scheduling?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            timeSlots: data.scheduling?.timeSlots || [],
            recurring: data.scheduling?.recurring || null
          },
          slots: data.slots || [],
          teamMembers: data.teamMembers || [],
          sections: data.sections || [],
        }
        setEventType(newEventType)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load event type",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    loadEventType()
  }, [isNew, params.id])

  useEffect(() => {
    if (isNew && user?.name && !eventType.title) {
      setEventType(prev => ({
        ...prev,
        title: `30 Minutes with ${user.name} Health & Wellness Coach`
      }))
    }
  }, [isNew, user?.name])

  // Use specific skeletons instead of a full-page loading spinner
  // if (loading) return <LoadingSpinner />

  // Handlers (Questions, Scheduling, Team - unchanged logic but omitted for brevity in chunk)
  const addQuestion = () => {
    const newQuestion: Question = { id: Date.now().toString(), question: '', type: 'text', required: false }
    setEventType({ ...eventType, questions: [...eventType.questions, newQuestion] })
  }
  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...eventType.questions]; updated[index] = { ...updated[index], [field]: value }
    setEventType({ ...eventType, questions: updated })
  }
  const removeQuestion = (index: number) => {
    const question = eventType.questions[index]
    if (question.isLocked) {
      toast({
        title: "Action Denied",
        description: "This mandatory question cannot be deleted.",
        variant: "destructive",
      })
      return
    }
    setEventType({ ...eventType, questions: eventType.questions.filter((_, i) => i !== index) })
  }
  const handleQuestionDragEnd = (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      setEventType((prev) => {
        const oldIndex = prev.questions.findIndex((q) => q.id === active.id)
        const newIndex = prev.questions.findIndex((q) => q.id === over.id)
        return { ...prev, questions: arrayMove(prev.questions, oldIndex, newIndex) }
      })
    }
  }
  const updateScheduling = (field: keyof SchedulingSettings, value: any) => {
    setEventType({ ...eventType, scheduling: { ...eventType.scheduling, [field]: value } })
  }
  const toggleTeamMember = (member: TeamMember) => {
    const members = eventType.teamMembers || []; const isSelected = members.some(m => m.id === member.id)
    setEventType({ ...eventType, teamMembers: isSelected ? members.filter(m => m.id !== member.id) : [...members, member] })
  }

  const handleSave = async () => {
    // Basic frontend validation
    const errors: Record<string, string> = {}
    if (!eventType.title?.trim()) errors.title = 'Title is required'
    if (!eventType.duration) errors.duration = 'Duration is required'
    if (!eventType.description?.trim()) errors.description = 'Description is required'
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setErrorMessage("Please fill in all mandatory fields highlighted in red (Title, Description, Duration).")
      setShowErrorDialog(true)
      return
    }

    try {
      setIsSaving(true)
      setFormErrors({})
      if (isNew) {
        await eventTypeService.create(eventType)
      } else {
        await eventTypeService.update(params.id as string, eventType)
      }
      toast({ title: "Success", description: "Event type saved successfully" })
      router.push('/meetings/event-types')
    } catch (error: any) {
      if (error.response?.status === 422) {
        const beErrors = error.response.data.errors || {}
        setFormErrors(beErrors)
        setErrorMessage(error.response.data.message || "The data provided is invalid.")
        setShowErrorDialog(true)
      } else {
        toast({ title: "Error", description: "A system error occurred.", variant: "destructive" })
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 overflow-hidden font-sans">
      <div className="shrink-0 flex flex-col border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm z-50">
        <div className="px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()} className="h-8 w-8 rounded-lg shrink-0">
              <ArrowLeft className="h-3.5 w-3.5 text-slate-600" />
            </Button>
            <div>
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                <span>Meetings</span> <span className="h-0.5 w-0.5 rounded-full bg-slate-300" /> <span>Event Config</span>
              </div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white leading-none">
                {loading ? <Skeleton className="h-4 w-32" /> : (isNew ? 'Create Event Type' : eventType.title || 'Edit Event')}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth bg-slate-50/30 dark:bg-slate-900/10">
        <Tabs defaultValue="basic" className="w-full">
          <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-6 py-2">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <TabsList className="bg-slate-100/50 p-1 h-8 rounded-lg">
                <TabsTrigger value="basic" className="rounded-md px-3.5 py-1 text-[11px] font-bold text-slate-500 data-[state=active]:bg-white data-[state=active]:text-indigo-600 shadow-sm">Basic</TabsTrigger>
                <TabsTrigger value="questions" className="rounded-md px-3.5 py-1 text-[11px] font-bold text-slate-500 data-[state=active]:bg-white data-[state=active]:text-indigo-600 shadow-sm">Questions</TabsTrigger>
                <TabsTrigger value="scheduling" className="rounded-md px-3.5 py-1 text-[11px] font-bold text-slate-500 data-[state=active]:bg-white data-[state=active]:text-indigo-600 shadow-sm">Scheduling</TabsTrigger>
                <TabsTrigger value="team" className="rounded-md px-3.5 py-1 text-[11px] font-bold text-slate-500 data-[state=active]:bg-white data-[state=active]:text-indigo-600 shadow-sm">Team</TabsTrigger>
              </TabsList>
              <Button onClick={handleSave} disabled={isSaving} className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] px-4 gap-2 transition-all active:scale-95 shadow-sm">
                {isSaving ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save className="h-3.5 w-3.5" />}
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </Button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-6 py-6 space-y-8">
            {loading ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ) : (
              <>
                <TabsContent value="basic" className="m-0">
                  <BasicInfoTab eventType={eventType} setEventType={setEventType} errors={formErrors} />
                </TabsContent>
                <TabsContent value="questions" className="m-0">
                   <QuestionsTab eventType={eventType} setEventType={setEventType} addQuestion={addQuestion} updateQuestion={(index: number, field: string, value: any) => updateQuestion(index, field as keyof Question, value)} removeQuestion={removeQuestion} handleQuestionDragEnd={handleQuestionDragEnd} sensors={sensors} />
                </TabsContent>
                <TabsContent value="scheduling" className="m-0">
                   <SchedulingTab eventType={eventType} updateScheduling={(field: string, value: any) => updateScheduling(field as keyof SchedulingSettings, value)} />
                </TabsContent>
                <TabsContent value="team" className="m-0">
                   <TeamTab eventType={eventType} toggleTeamMember={toggleTeamMember} />
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </div>

      {/* Error Modal */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl overflow-hidden p-0 gap-0 border-none bg-white dark:bg-slate-900 shadow-2xl">
          <div className="bg-red-50 dark:bg-red-900/20 p-6 flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-12 w-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
              <XCircle className="h-7 w-7 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-red-900 dark:text-red-400 uppercase tracking-tighter">Configuration Failure</DialogTitle>
              <DialogDescription className="text-red-700/70 dark:text-red-400/60 font-medium text-xs">Some fields require your immediate attention.</DialogDescription>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed uppercase tracking-wide">{errorMessage}</p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowErrorDialog(false)} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[10px] uppercase tracking-widest h-11 rounded-xl shadow-lg hover:opacity-90 transition-all">
                Review Fields
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
