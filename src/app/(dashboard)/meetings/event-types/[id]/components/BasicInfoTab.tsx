import React from 'react'
import { TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface Props {
  eventType: any
  setEventType: (eventType: any) => void
  errors?: Record<string, string>
}

const labelStyle = "text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block"
const inputStyle = "h-10 text-sm bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 transition-all rounded-lg no-scrollbar"
const COLORS = [
  '#4f46e5', // indigo
  '#2563eb', // blue
  '#0ea5e9', // sky
  '#10b981', // emerald
  '#84cc16', // lime
  '#eab308', // yellow
  '#f97316', // orange
  '#ef4444', // red
  '#d946ef', // fuchsia
  '#8b5cf6', // violet
  '#64748b', // slate
]

export const BasicInfoTab = ({ eventType, setEventType, errors }: Props) => {
  return (
    <TabsContent value="basic" className="mt-0 outline-none">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-0.5">Basic Settings</h3>
          <p className="text-[11px] text-slate-500 font-medium tracking-tight">General information about your event type.</p>
        </div>

        <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-5 space-y-5">
            <div className="grid gap-y-4 gap-x-6 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="title" className={cn(labelStyle, errors?.title && "text-red-500")}>Event Title <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  value={eventType.title}
                  onChange={(e) => setEventType({ ...eventType, title: e.target.value })}
                  placeholder="e.g., Product Demo Call"
                  className={cn(inputStyle, errors?.title && "border-red-500 bg-red-50/50 focus:bg-white")}
                />
                {errors?.title && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.title}</p>}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="description" className={cn(labelStyle, errors?.description && "text-red-500")}>Description <span className="text-red-500">*</span></Label>
                <Textarea
                  id="description"
                  value={eventType.description}
                  onChange={(e) => setEventType({ ...eventType, description: e.target.value })}
                  placeholder="Add a description for your event"
                  className={cn(inputStyle, "min-h-[70px] py-2 no-scrollbar resize-none", errors?.description && "border-red-500 bg-red-50/50 focus:bg-white")}
                />
                {errors?.description && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-1 animate-in fade-in slide-in-from-top-1 duration-200">{Array.isArray(errors.description) ? errors.description[0] : errors.description}</p>}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className={labelStyle}>Meeting Type</Label>
                <Select
                  value={eventType.type || 'one_on_one'}
                  onValueChange={(value) => setEventType({ ...eventType, type: value, max_invitees: value === 'one_on_one' ? null : (eventType.max_invitees || 2) })}
                >
                  <SelectTrigger className={inputStyle}>
                    <SelectValue placeholder="Select meeting type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="one_on_one">One-on-One</SelectItem>
                    <SelectItem value="group">Group Meeting (Webinar/Class)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {eventType.type === 'group' && (
                <div className="space-y-1.5 sm:col-span-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Label htmlFor="max_invitees" className={cn(labelStyle, errors?.max_invitees && "text-red-500")}>Maximum Invitees <span className="text-red-500">*</span></Label>
                  <Input
                    id="max_invitees"
                    type="number"
                    min="2"
                    value={eventType.max_invitees || 2}
                    onChange={(e) => setEventType({ ...eventType, max_invitees: parseInt(e.target.value) || 2 })}
                    placeholder="e.g., 10"
                    className={cn(inputStyle, errors?.max_invitees && "border-red-500 bg-red-50/50 focus:bg-white")}
                  />
                  <p className="text-[9px] text-slate-400 font-medium italic mt-1.5 leading-tight uppercase tracking-tighter">
                    Maximum number of people that can book the exact same time slot.
                  </p>
                  {errors?.max_invitees && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.max_invitees}</p>}
                </div>
              )}

              <div className="space-y-1.5">
                <Label className={cn(labelStyle, errors?.duration && "text-red-500")}>Duration <span className="text-red-500">*</span></Label>
                <Select
                  value={eventType.duration?.toString()}
                  onValueChange={(value) => setEventType({ ...eventType, duration: parseInt(value) })}
                >
                  <SelectTrigger className={cn(inputStyle, errors?.duration && "border-red-500 bg-red-50/50 focus:bg-white")}>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                    <SelectItem value="120">120 minutes</SelectItem>
                  </SelectContent>
                </Select>
                {errors?.duration && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.duration}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className={labelStyle}>Slot Interval</Label>
                <Select
                  value={eventType.slot_interval?.toString()}
                  onValueChange={(value) => setEventType({ ...eventType, slot_interval: parseInt(value) })}
                >
                  <SelectTrigger className={inputStyle}>
                    <SelectValue placeholder="Select gap" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                    <SelectItem value="120">120 minutes</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[9px] text-slate-400 font-medium italic mt-1.5 leading-tight uppercase tracking-tighter">
                  Start times grid (e.g., 30 mins means slots start at 11:00, 11:30, etc.). 
                  Breaks are calculated dynamically after each booking.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className={labelStyle}>Location Type</Label>
                <Select
                  value={eventType.location}
                  onValueChange={(value: 'video' | 'phone' | 'in-person') => 
                    setEventType({ ...eventType, location: value })}
                >
                  <SelectTrigger className={inputStyle}>
                    <SelectValue placeholder="Select location type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="in-person">In Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {eventType.location === 'video' && (
                <div className="space-y-1.5 sm:col-span-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Label className={labelStyle}>Video Platform</Label>
                  <Select
                    value={eventType.videoPlatform}
                    onValueChange={(value) => setEventType({ ...eventType, videoPlatform: value })}
                  >
                    <SelectTrigger className={inputStyle}>
                      <SelectValue placeholder="Select video platform" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="google">Google Meet</SelectItem>
                      <SelectItem value="zoom">Zoom</SelectItem>
                      <SelectItem value="teams">Microsoft Teams</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {eventType.location === 'in-person' && (
                <div className="space-y-1.5 sm:col-span-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Label className={labelStyle}>Location Details</Label>
                  <Textarea
                    value={eventType.locationDetails}
                    onChange={(e) => setEventType({ ...eventType, locationDetails: e.target.value })}
                    placeholder="Enter the meeting location details"
                    className={cn(inputStyle, "min-h-[60px] py-2 no-scrollbar resize-none")}
                  />
                </div>
              )}

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="redirect_url" className={labelStyle}>Redirect URL (Optional)</Label>
                <Input
                  id="redirect_url"
                  value={eventType.redirect_url}
                  onChange={(e) => setEventType({ ...eventType, redirect_url: e.target.value })}
                  placeholder="e.g., https://yourwebsite.com/thank-you"
                  className={inputStyle}
                />
                <p className="text-[9px] text-slate-400 font-medium italic mt-1.5 leading-tight uppercase tracking-tighter">Redirect users to this URL after they successfully book a meeting.</p>
              </div>

              <div className="space-y-2 sm:col-span-2 mt-2">
                <Label className={labelStyle}>Event Color</Label>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map((color) => {
                    const isSelected = (eventType.color || '#4f46e5') === color
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setEventType({ ...eventType, color })}
                        className={cn(
                          "w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center",
                          isSelected 
                            ? "ring-2 ring-offset-2 scale-110 shadow-md" 
                            : "hover:scale-110 shadow-sm opacity-80 hover:opacity-100"
                        )}
                        style={{ 
                          backgroundColor: color,
                          ringColor: color,
                        }}
                      >
                        {isSelected && (
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    )
                  })}
                </div>
                <p className="text-[10px] text-slate-400 font-medium italic mt-1.5 leading-tight uppercase tracking-tighter">
                  This color helps you visually identify this event type on your meetings dashboard.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


    </TabsContent>
  )
}
 