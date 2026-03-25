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
const inputStyle = "h-10 text-sm bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-lg no-scrollbar"

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
                  </SelectContent>
                </Select>
                {errors?.duration && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.duration}</p>}
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
            </div>
          </CardContent>
        </Card>
      </div>


    </TabsContent>
  )
}
 