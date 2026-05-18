'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { integrationApi, companyApi } from '@/lib/api'

export default function GlobalAutomationsSettings() {
  const { toast } = useToast()
  const [welcomeSettings, setWelcomeSettings] = useState({
    whatsapp_welcome_enabled: false,
    whatsapp_welcome_message: '',
    whatsapp_mode: 'cloud',
    whatsapp_welcome_template_id: '',
    whatsapp_meeting_enabled: false,
    whatsapp_meeting_message: '',
    whatsapp_meeting_mode: 'cloud',
    whatsapp_meeting_template_id: ''
  })
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [templates, setTemplates] = useState<any[]>([])
  
  useEffect(() => {
    fetchAccountsAndTemplates()
    fetchWelcomeSettings()
  }, [])

  const fetchAccountsAndTemplates = async () => {
    try {
      const response = await integrationApi.getWhatsAppAccounts()
      if (response.accounts && response.accounts.length > 0) {
        setTemplates(response.accounts[0].templates || [])
      }
    } catch (error) {
      console.error('Failed to fetch WhatsApp accounts', error)
    }
  }

  const fetchWelcomeSettings = async () => {
    try {
      const settings = await companyApi.getSettings()
      setWelcomeSettings({
        whatsapp_welcome_enabled: settings.whatsapp_welcome_enabled || false,
        whatsapp_welcome_message: settings.whatsapp_welcome_message || '',
        whatsapp_mode: settings.whatsapp_mode || 'cloud',
        whatsapp_welcome_template_id: settings.whatsapp_welcome_template_id || '',
        whatsapp_meeting_enabled: settings.whatsapp_meeting_enabled || false,
        whatsapp_meeting_message: settings.whatsapp_meeting_message || '',
        whatsapp_meeting_mode: settings.whatsapp_meeting_mode || 'cloud',
        whatsapp_meeting_template_id: settings.whatsapp_meeting_template_id || ''
      })
    } catch (error) {
      console.error('Failed to fetch welcome settings', error)
    }
  }

  const saveWelcomeSettings = async () => {
    try {
      setIsSavingSettings(true)
      await companyApi.updateSettings(welcomeSettings)
      toast({
        title: "Success",
        description: "Automation settings saved successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setIsSavingSettings(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md hover:shadow-indigo-500/5 group">
        <div className="space-y-1">
          <Label className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Welcome Message Automation</Label>
          <p className="text-sm text-slate-500 leading-relaxed max-w-md">Automatically trigger a personalized WhatsApp message immediately when a new lead enters your pipeline.</p>
        </div>
        <Switch
          checked={welcomeSettings.whatsapp_welcome_enabled}
          onCheckedChange={(checked) => setWelcomeSettings(prev => ({ ...prev, whatsapp_welcome_enabled: checked }))}
          className="data-[state=checked]:bg-indigo-600 shadow-sm"
        />
      </div>

      {welcomeSettings.whatsapp_welcome_enabled && (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-500 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-500/10 bg-white dark:bg-slate-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Integration Provider</Label>
              <Select 
                value={welcomeSettings.whatsapp_mode} 
                onValueChange={(val: any) => setWelcomeSettings(prev => ({ ...prev, whatsapp_mode: val }))}
              >
                <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all">
                  <SelectValue placeholder="Select Provider" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                  <SelectItem value="cloud" className="focus:bg-indigo-50 dark:focus:bg-indigo-500/10 rounded-lg py-3">
                    <div className="flex flex-col">
                      <span className="font-bold">WhatsApp Cloud API</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Official Meta Business API (Reliable)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="personal" className="focus:bg-indigo-50 dark:focus:bg-indigo-500/10 rounded-lg py-3">
                    <div className="flex flex-col">
                      <span className="font-bold">Personal WhatsApp Bot</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Your connected WhatsApp account</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100/50 dark:border-indigo-500/10">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                <AlertCircle className="h-5 w-5 text-indigo-500" />
              </div>
              <p className="text-xs text-indigo-900/70 dark:text-indigo-300 leading-relaxed font-medium">
                {welcomeSettings.whatsapp_mode === 'cloud' 
                  ? 'This mode uses your official Meta Business Account. Ensure you have an active WhatsApp integration configured.' 
                  : 'This mode uses your personal WhatsApp. Ensure your device is connected via QR code in the WhatsApp Bot page.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                {welcomeSettings.whatsapp_mode === 'cloud' ? 'Select Template' : 'Message Content'}
              </Label>
              <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20 text-[10px] font-bold py-0.5">
                Tip: Use {"{{name}}"} for personalization
              </Badge>
            </div>
            {welcomeSettings.whatsapp_mode === 'cloud' ? (
              <Select 
                value={welcomeSettings.whatsapp_welcome_template_id?.toString()} 
                onValueChange={(val: any) => setWelcomeSettings(prev => ({ ...prev, whatsapp_welcome_template_id: val }))}
              >
                <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-none ring-1 ring-slate-200 dark:ring-slate-700">
                  <SelectValue placeholder="Select a WhatsApp Template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.length > 0 ? (
                    templates.map((template) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No templates available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            ) : (
              <div className="relative group">
                <Textarea
                  placeholder="Hi {{name}}, thank you for reaching out! We will contact you soon."
                  className="min-h-[160px] rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none p-6 font-medium text-slate-700 dark:text-slate-200"
                  value={welcomeSettings.whatsapp_welcome_message}
                  onChange={(e) => setWelcomeSettings(prev => ({ ...prev, whatsapp_welcome_message: e.target.value }))}
                />
                <div className="absolute bottom-4 right-4 text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {welcomeSettings.whatsapp_welcome_message.length} characters
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button 
              onClick={saveWelcomeSettings} 
              disabled={isSavingSettings}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-10 h-12 rounded-xl shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2"
            >
              {isSavingSettings ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Save Welcome Config</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Meeting Automation Block */}
      <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md hover:shadow-emerald-500/5 group mt-8">
        <div className="space-y-1">
          <Label className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Meeting Confirmation Automation</Label>
          <p className="text-sm text-slate-500 leading-relaxed max-w-md">Automatically trigger a WhatsApp message immediately when a lead books a meeting.</p>
        </div>
        <Switch
          checked={welcomeSettings.whatsapp_meeting_enabled}
          onCheckedChange={(checked) => setWelcomeSettings(prev => ({ ...prev, whatsapp_meeting_enabled: checked }))}
          className="data-[state=checked]:bg-emerald-600 shadow-sm"
        />
      </div>

      {welcomeSettings.whatsapp_meeting_enabled && (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-500 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-500/10 bg-white dark:bg-slate-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Integration Provider</Label>
              <Select 
                value={welcomeSettings.whatsapp_meeting_mode} 
                onValueChange={(val: any) => setWelcomeSettings(prev => ({ ...prev, whatsapp_meeting_mode: val }))}
              >
                <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium transition-all">
                  <SelectValue placeholder="Select Provider" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                  <SelectItem value="cloud" className="focus:bg-emerald-50 dark:focus:bg-emerald-500/10 rounded-lg py-3">
                    <div className="flex flex-col">
                      <span className="font-bold">WhatsApp Cloud API</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Official Meta Business API (Reliable)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="personal" className="focus:bg-emerald-50 dark:focus:bg-emerald-500/10 rounded-lg py-3">
                    <div className="flex flex-col">
                      <span className="font-bold">Personal WhatsApp Bot</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Your connected WhatsApp account</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100/50 dark:border-emerald-500/10">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                <AlertCircle className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-xs text-emerald-900/70 dark:text-emerald-300 leading-relaxed font-medium">
                {welcomeSettings.whatsapp_meeting_mode === 'cloud' 
                  ? 'This mode uses your official Meta Business Account. Ensure you have an active WhatsApp integration configured.' 
                  : 'This mode uses your personal WhatsApp. Ensure your device is connected via QR code in the WhatsApp Bot page.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                {welcomeSettings.whatsapp_meeting_mode === 'cloud' ? 'Select Template' : 'Message Content'}
              </Label>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 text-[10px] font-bold py-0.5">
                Tip: Use {"{{name}}"} and {"{{time}}"} for personalization
              </Badge>
            </div>
            {welcomeSettings.whatsapp_meeting_mode === 'cloud' ? (
              <Select 
                value={welcomeSettings.whatsapp_meeting_template_id?.toString()} 
                onValueChange={(val: any) => setWelcomeSettings(prev => ({ ...prev, whatsapp_meeting_template_id: val }))}
              >
                <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-none ring-1 ring-slate-200 dark:ring-slate-700">
                  <SelectValue placeholder="Select a WhatsApp Template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.length > 0 ? (
                    templates.map((template) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No templates available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            ) : (
              <div className="relative group">
                <Textarea
                  placeholder="Hi {{name}}, your meeting is confirmed for {{time}}."
                  className="min-h-[160px] rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none p-6 font-medium text-slate-700 dark:text-slate-200"
                  value={welcomeSettings.whatsapp_meeting_message}
                  onChange={(e) => setWelcomeSettings(prev => ({ ...prev, whatsapp_meeting_message: e.target.value }))}
                />
                <div className="absolute bottom-4 right-4 text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {welcomeSettings.whatsapp_meeting_message.length} characters
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button 
              onClick={saveWelcomeSettings} 
              disabled={isSavingSettings}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-10 h-12 rounded-xl shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2"
            >
              {isSavingSettings ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Save Meeting Config</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
