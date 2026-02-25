'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from '@/lib/utils'
import {
  User, Bell, Shield, Mail,
  Settings, ChevronRight, Camera,
  Check, Info, LucideIcon, Globe,
  Briefcase, Phone, CreditCard, Lock
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface SettingsSection {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
}

const SECTIONS: SettingsSection[] = [
  { id: 'profile', title: 'Public Profile', icon: User, description: 'Manage your personal brand and details' },
  { id: 'notifications', title: 'Notifications', icon: Bell, description: 'Choose how you want to be alerted' },
  { id: 'security', title: 'Security', icon: Shield, description: 'Secure your account and sessions' },
  { id: 'billing', title: 'Billing', icon: CreditCard, description: 'Manage your plan and invoices' }
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [profileSettings, setProfileSettings] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    company: 'LeadBajaar Inc',
    phone: '+1 234 567 890',
    bio: 'Sales Operations Manager focused on growth.',
    image: null
  })

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
      setProfileSettings(prev => ({ ...prev, image: previewUrl as any }))
    }
  }

  return (
    <div className="flex flex-col lg:flex-row h-full p-4 md:p-6 lg:p-8 gap-6 lg:gap-8 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20">

      {/* ── Sidebar Navigation ── */}
      <div className="w-full lg:w-72 flex flex-col gap-4 lg:gap-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Configure your account preferences</p>
        </div>

        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible no-scrollbar pb-2 lg:pb-0">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveTab(section.id)}
              className={cn(
                "group flex items-center lg:items-start gap-3 lg:gap-4 p-3 lg:p-4 rounded-xl lg:rounded-2xl transition-all duration-200 text-left relative shrink-0 lg:shrink",
                activeTab === section.id
                  ? "bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800"
                  : "hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
              )}
            >
              <div className={cn(
                "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center transition-colors",
                activeTab === section.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-slate-200"
              )}>
                <section.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-bold text-sm",
                  activeTab === section.id ? "text-indigo-600 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300"
                )}>
                  {section.title}
                </p>
                <p className="hidden lg:block text-[11px] text-slate-500 leading-tight mt-0.5">{section.description}</p>
              </div>
              {activeTab === section.id && (
                <div className="hidden lg:block absolute right-4 top-1/2 -translate-y-1/2">
                  <ChevronRight className="h-4 w-4 text-indigo-400" />
                </div>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Content Area ── */}
      <div className="flex-1 overflow-y-auto pr-0 lg:pr-4 custom-scrollbar">
        <div className="max-w-3xl mx-auto lg:mx-0 space-y-6 lg:space-y-8 pb-12">

          {activeTab === 'profile' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Header Info */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Profile Details</h2>
                  <p className="text-sm text-slate-500">Update your photo and personal information here.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="h-10 rounded-xl border-slate-200 dark:border-slate-800 px-6 font-bold">Cancel</Button>
                  <Button className="h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-8 font-bold shadow-lg shadow-indigo-500/20">Save</Button>
                </div>
              </div>

              {/* Profile Photo */}
              <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-4 lg:p-6 rounded-2xl lg:rounded-3xl ring-1 ring-slate-100 dark:ring-slate-800/50">
                <div className="flex flex-col sm:flex-row items-center gap-6 lg:gap-8 text-center sm:text-left">
                  <div className="relative group shrink-0">
                    <Avatar className="h-24 w-24 lg:h-28 lg:w-28 ring-4 ring-indigo-50 dark:ring-indigo-900/20 shadow-xl">
                      <AvatarImage src={imagePreview || undefined} />
                      <AvatarFallback className="text-2xl font-bold bg-slate-50 dark:bg-slate-800">JD</AvatarFallback>
                    </Avatar>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 rounded-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer backdrop-blur-[2px]"
                    >
                      <div className="bg-white/20 p-2 rounded-full border border-white/40">
                        <Camera className="h-5 w-5 text-white" />
                      </div>
                    </button>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Change Avatar</h3>
                    <p className="text-xs text-slate-400 max-w-xs leading-relaxed mx-auto sm:mx-0">
                      Recommended: 400x400px. JPG, PNG or WebP. Max size: 2MB. Your avatar will be visible to team members.
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                      <Button variant="outline" size="sm" className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider px-3" onClick={() => fileInputRef.current?.click()}>Upload New</Button>
                      <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-600" onClick={() => setImagePreview(null)}>Remove</Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Form Fields */}
              <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-2xl lg:rounded-3xl ring-1 ring-slate-100 dark:ring-slate-800/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input value={profileSettings.name} onChange={e => setProfileSettings(p => ({ ...p, name: e.target.value }))} className="pl-10 h-10 bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 rounded-xl font-medium" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input value={profileSettings.email} disabled className="pl-10 h-10 bg-slate-100/50 dark:bg-slate-800/20 border-transparent rounded-xl text-slate-400 cursor-not-allowed" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Company</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input value={profileSettings.company} onChange={e => setProfileSettings(p => ({ ...p, company: e.target.value }))} className="pl-10 h-10 bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 rounded-xl font-medium" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input value={profileSettings.phone} onChange={e => setProfileSettings(p => ({ ...p, phone: e.target.value }))} className="pl-10 h-10 bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 rounded-xl font-medium" />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bio / Signature</Label>
                    <Textarea value={profileSettings.bio} onChange={e => setProfileSettings(p => ({ ...p, bio: e.target.value }))} className="h-32 bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 rounded-2xl p-4 font-medium resize-none" placeholder="Write a few lines about yourself..." />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Push & Email Notifications</h2>
                <p className="text-sm text-slate-500">Control how you stay updated with platform events.</p>
              </div>

              <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800/50">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-1 pr-4">
                      <p className="font-bold text-slate-900 dark:text-white">New Lead Assignment</p>
                      <p className="text-xs text-slate-500 leading-relaxed">Instantly notify when a lead is assigned to your account by the distributor.</p>
                    </div>
                    <Switch defaultChecked className="data-[state=checked]:bg-indigo-600" />
                  </div>
                  <div className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-1 pr-4">
                      <p className="font-bold text-slate-900 dark:text-white">Daily Performance Digest</p>
                      <p className="text-xs text-slate-500 leading-relaxed">Summary of your daily calls, conversion rates and top lead rankings at 9:00 AM.</p>
                    </div>
                    <Switch className="data-[state=checked]:bg-indigo-600" />
                  </div>
                  <div className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-1 pr-4">
                      <p className="font-bold text-slate-900 dark:text-white">Account Security Alerts</p>
                      <p className="text-xs text-slate-500 leading-relaxed">Notify when a new device logins or security settings are modified.</p>
                    </div>
                    <Switch defaultChecked className="data-[state=checked]:bg-indigo-600" />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Security & Privacy</h2>
                <p className="text-sm text-slate-500">Manage your password and platform access control.</p>
              </div>

              <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-8 rounded-3xl ring-1 ring-slate-100 dark:ring-slate-800/50">
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
                        <Lock className="h-5 w-5 text-indigo-500" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">Password Authentication</p>
                        <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider pt-0.5">Last updated 3 months ago</p>
                      </div>
                    </div>
                    <Button variant="outline" className="h-9 px-6 rounded-xl font-bold border-slate-200 dark:border-slate-800">Change</Button>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
                        <Shield className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">Two-Factor Authentication</p>
                        <p className="text-[11px] text-slate-500">Currently disabled. We recommend enabling for extra security.</p>
                      </div>
                    </div>
                    <Button className="h-9 px-6 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 shadow-sm">Enable Now</Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
