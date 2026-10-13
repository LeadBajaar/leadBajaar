'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Zap, Plus, Mail, MessageSquare, Clock, 
  Trash2, Play, Pause, ChevronRight, 
  AlertCircle, CheckCircle2, MoreVertical,
  ArrowRight, Settings2, Sparkles, Filter,
  Layers, Users, Activity, ExternalLink,
  ChevronDown
} from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GlobalAutomationsSettings from "@/components/automations/GlobalAutomationsSettings"
import { RoleGuard } from '@/components/RoleGuard'

// ─── Types ───────────────────────────────────────────────────────────────────

interface AutomationStep {
  id?: number;
  order: number;
  delay_hours: number;
  action_type: 'send_email' | 'send_whatsapp' | 'send_payperwa' | 'update_stage' | 'wait';
  template_id?: number;
  whatsapp_template_name?: string;
  whatsapp_provider?: 'personal' | 'cloud_api' | 'evolution';
  whatsapp_message?: string;
  action_value?: string;
}

interface AutomationSequence {
  id: number;
  name: string;
  description?: string;
  trigger_type: 'lead_created' | 'stage_changed' | 'manual';
  trigger_value?: string;
  is_active: boolean;
  steps_count: number;
  enrollments_count: number;
  steps?: AutomationStep[];
  created_at: string;
}

interface EmailTemplate {
  id: number;
  name: string;
}

export default function AutomationsPage() {
  const [sequences, setSequences] = useState<AutomationSequence[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSequence, setCurrentSequence] = useState<Partial<AutomationSequence> | null>(null);
  const [newSteps, setNewSteps] = useState<AutomationStep[]>([
    { order: 0, delay_hours: 0, action_type: 'send_email' }
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [seqRes, tempRes, stageRes] = await Promise.all([
        api.get('/automations'),
        api.get('/email/templates'),
        api.get('/stages')
      ]);
      setSequences(seqRes.data);
      setEmailTemplates(tempRes.data);
      setStages(stageRes.data);
    } catch (error) {
      toast.error('Failed to load automation data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setCurrentSequence({
      name: '',
      trigger_type: 'lead_created',
      is_active: true
    });
    setNewSteps([{ order: 0, delay_hours: 0, action_type: 'send_email' }]);
    setIsDialogOpen(true);
  };

  const addStep = () => {
    setNewSteps([...newSteps, { 
      order: newSteps.length, 
      delay_hours: 24, 
      action_type: 'send_email' 
    }]);
  };

  const updateStep = (index: number, field: keyof AutomationStep, value: any) => {
    const updated = [...newSteps];
    updated[index] = { ...updated[index], [field]: value };
    setNewSteps(updated);
  };

  const removeStep = (index: number) => {
    if (newSteps.length === 1) return;
    setNewSteps(newSteps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i })));
  };

  const saveSequence = async () => {
    if (!currentSequence?.name) return toast.error('Name is required');
    if (newSteps.some(s => s.action_type === 'send_email' && !s.template_id)) {
      return toast.error('Please select an email template for all email steps');
    }

    try {
      const payload = {
        ...currentSequence,
        steps: newSteps
      };
      
      if (currentSequence.id) {
        await api.put(`/automations/${currentSequence.id}`, payload);
        toast.success('Sequence updated successfully');
      } else {
        await api.post('/automations', payload);
        toast.success('New sequence created');
      }
      
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to save sequence');
    }
  };

  const toggleStatus = async (id: number) => {
    try {
      await api.post(`/automations/${id}/toggle`);
      setSequences(sequences.map(s => s.id === id ? { ...s, is_active: !s.is_active } : s));
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const activeSequencesCount = sequences.filter(s => s.is_active).length;
  const totalEnrollments = sequences.reduce((acc, s) => acc + (s.enrollments_count || 0), 0);
  const totalSteps = sequences.reduce((acc, s) => acc + (s.steps?.length || s.steps_count || 0), 0);

  return (
    <RoleGuard allowedTypes={['agency', 'super_admin', 'individual']} allowedFeatures={['automations']}>
      <div className="flex flex-col gap-6 px-1 sm:px-2 pb-12 pt-2 overflow-x-hidden font-sans">
        
        {/* ── Top Hero Banner (aligned with Dashboard & Email Marketing) ───────── */}
        <div className="relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between min-h-[220px] p-6 md:p-8 bg-gradient-to-br from-[#EBF3FF] via-[#EAE9FC] to-[#F1F3FE] dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 rounded-2xl border border-gray-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] select-none">
          
          {/* Background glow elements */}
          <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none opacity-50">
            <div className="absolute -bottom-32 -right-10 w-96 h-96 bg-[#E0E2F8] dark:bg-indigo-900/20 rounded-full blur-3xl opacity-60" />
            <div className="absolute top-10 right-32 w-64 h-64 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl opacity-40" />
          </div>

          {/* Hero Left Content */}
          <div className="flex-1 flex flex-col justify-center relative z-10 w-full md:max-w-[62%]">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/80 dark:bg-slate-800 text-[#2A3ED6] dark:text-indigo-400 border border-blue-200/50 shadow-2xs">
                Omnichannel Automation Engine
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-[12px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Triggers Active
              </span>
            </div>

            <h1 className="text-[26px] md:text-[32px] font-black text-slate-900 dark:text-white satoshi-heading mb-2 tracking-tight leading-[1.15]">
              Workflow Automations & Drips
            </h1>

            <p className="text-[13px] md:text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed font-semibold max-w-[540px] mb-5">
              Automate follow-ups across Email, WhatsApp, and CRM stage moves. Engage new leads instantly 24/7 without manual intervention.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={handleCreateNew}
                className="bg-gradient-to-r from-[#2A3ED6] to-[#4054E6] hover:opacity-95 text-white text-[13px] font-extrabold h-[42px] px-5 rounded-xl flex items-center gap-2 shadow-md shadow-blue-600/10 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <Plus className="h-4 w-4" />
                <span>Create Sequence</span>
              </Button>

              <div className="flex items-center gap-2 px-3.5 py-2 bg-white/90 dark:bg-slate-800/90 rounded-xl border border-gray-200/80 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs">
                <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                <span>Active Triggers: <strong>{activeSequencesCount} Sequences</strong></span>
              </div>
            </div>
          </div>

          {/* Hero Right Card: Automation Telemetry */}
          <div className="mt-6 md:mt-0 relative z-10 w-full md:w-auto md:min-w-[270px] bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-gray-200/80 dark:border-slate-700 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Engine Stats</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold border uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200">
                Operational
              </span>
            </div>

            <div className="space-y-2.5 text-[12.5px]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Active Sequences</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  {activeSequencesCount} of {sequences.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Total Enrollments</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  {totalEnrollments} leads
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Execution Steps</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  {totalSteps} actions
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Tabs & Content ────────────────────────────────────────────── */}
        <div className="flex-1">
          <Tabs defaultValue="sequences" className="w-full space-y-6">
            
            {/* Non-overflowing responsive pill tabbar */}
            <div className="w-full overflow-x-auto pb-1 scrollbar-none">
              <TabsList className="h-auto w-auto min-w-full sm:min-w-0 inline-flex items-center justify-start gap-1.5 p-1.5 bg-slate-100/90 dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                <TabsTrigger 
                  value="sequences" 
                  className="rounded-xl px-4 py-2 text-xs font-bold font-heading shrink-0 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Zap className="h-3.5 w-3.5 text-[#2A3ED6]" />
                  <span>Drip Sequences</span>
                  <Badge className="ml-1 text-[10px] font-extrabold px-1.5 py-0 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-none">
                    {sequences.length}
                  </Badge>
                </TabsTrigger>

                <TabsTrigger 
                  value="global" 
                  className="rounded-xl px-4 py-2 text-xs font-bold font-heading shrink-0 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Settings2 className="h-3.5 w-3.5 text-slate-500" />
                  <span>Global Triggers & Settings</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: SEQUENCES */}
            <TabsContent value="sequences" className="space-y-6 m-0">
              
              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200/80 dark:border-slate-800 shadow-2xs">
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white satoshi-heading">
                    Multi-Channel Drip Sequences
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Configure automated timing, conditions, and actions triggered when leads enter or progress through your funnel.
                  </p>
                </div>

                <Button
                  onClick={handleCreateNew}
                  className="bg-gradient-to-r from-[#2A3ED6] to-[#4054E6] hover:opacity-95 text-white text-xs font-extrabold h-10 px-5 rounded-xl flex items-center gap-2 shadow-md shadow-blue-600/10"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Sequence</span>
                </Button>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="animate-pulse h-40 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-2xl" />
                  ))}
                </div>
              ) : sequences.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-8 space-y-4">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                    <Zap className="h-7 w-7" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">No active sequences yet</h3>
                    <p className="text-xs text-slate-500">Create your first automated follow-up sequence across Email, WhatsApp, or pipeline movements.</p>
                  </div>
                  <Button 
                    onClick={handleCreateNew} 
                    className="bg-[#2A3ED6] hover:bg-[#2031B0] text-white text-xs font-bold rounded-xl h-10 px-6"
                  >
                    Create Sequence
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {sequences.map(sequence => (
                    <div 
                      key={sequence.id} 
                      className="border border-gray-200/80 dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900 rounded-2xl overflow-hidden hover:border-gray-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
                    >
                      <div className="p-5 flex items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-[15px] font-black text-slate-900 dark:text-white satoshi-heading truncate">
                              {sequence.name}
                            </h3>
                            <Badge className={cn(
                              "border-none text-[10px] font-extrabold px-2.5 py-0.5 rounded-full capitalize", 
                              sequence.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600"
                            )}>
                              {sequence.is_active ? 'Active' : 'Paused'}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 font-medium">
                            {sequence.description || 'Automated multi-step communication flow.'}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleStatus(sequence.id)}
                            className="h-8 px-2.5 rounded-xl border-gray-200/80 text-xs font-bold"
                          >
                            {sequence.is_active ? (
                              <><Pause className="h-3 w-3 mr-1 text-amber-500" /> Pause</>
                            ) : (
                              <><Play className="h-3 w-3 mr-1 text-emerald-600" /> Activate</>
                            )}
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl border-gray-200 dark:border-slate-800 p-1">
                              <DropdownMenuItem 
                                className="text-xs cursor-pointer font-bold rounded-lg" 
                                onClick={() => {
                                  setCurrentSequence(sequence);
                                  setNewSteps(sequence.steps || []);
                                  setIsDialogOpen(true);
                                }}
                              >
                                <Settings2 className="mr-2 h-3.5 w-3.5 text-blue-600" /> Edit Flow Steps
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-xs cursor-pointer font-bold rounded-lg" 
                                onClick={() => toggleStatus(sequence.id)}
                              >
                                {sequence.is_active ? <Pause className="mr-2 h-3.5 w-3.5 text-amber-500" /> : <Play className="mr-2 h-3.5 w-3.5 text-emerald-500" />}
                                {sequence.is_active ? 'Pause Sequence' : 'Resume Sequence'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      {/* Flow Bar */}
                      <div className="bg-[#F8FAFC] dark:bg-slate-800/50 px-5 py-3.5 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-6">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trigger</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Filter className="h-3 w-3 text-blue-600" />
                              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 capitalize">
                                {sequence.trigger_type.replace(/_/g, ' ')}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enrollments</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
                              {sequence.enrollments_count || 0}
                            </span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Step Pipeline</span>
                            <div className="flex items-center gap-1.5 mt-1">
                              {sequence.steps?.slice(0, 4).map((step, idx) => (
                                <div key={idx} className="h-6 w-6 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center shadow-2xs" title={step.action_type}>
                                  {step.action_type === 'send_email' ? (
                                    <Mail className="h-3 w-3 text-blue-600" />
                                  ) : (step.action_type === 'send_whatsapp' || step.action_type === 'send_payperwa') ? (
                                    <MessageSquare className="h-3 w-3 text-emerald-600" />
                                  ) : (
                                    <Settings2 className="h-3 w-3 text-purple-600" />
                                  )}
                                </div>
                              ))}
                              {(sequence.steps?.length || 0) > 4 && (
                                <span className="text-[10px] font-bold text-slate-400">
                                  +{(sequence.steps?.length || 0) - 4} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCurrentSequence(sequence);
                            setNewSteps(sequence.steps || []);
                            setIsDialogOpen(true);
                          }}
                          className="h-8 px-2 text-xs font-bold text-[#2A3ED6] hover:bg-blue-50"
                        >
                          Configure Steps <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TAB 2: GLOBAL SETTINGS */}
            <TabsContent value="global" className="flex-1 m-0 outline-none">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-800 p-6 shadow-2xs">
                <GlobalAutomationsSettings />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* ── Sequence Builder Dialog ────────────────────────────────────────── */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl w-full max-h-[92vh] overflow-y-auto rounded-2xl p-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-2xl">
            <DialogHeader className="space-y-1 text-left pb-4 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#2A3ED6] border border-blue-100 dark:border-blue-900/50">
                  <Zap className="h-5 w-5" />
                </span>
                <div>
                  <DialogTitle className="text-xl font-black text-slate-900 dark:text-white satoshi-heading">
                    {currentSequence?.id ? 'Edit Sequence' : 'Visual Sequence Builder'}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 font-medium">
                    Design an automated follow-up flow across Email, WhatsApp, and CRM stages.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 pt-3">
              {/* Basic Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Sequence Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input 
                    placeholder="e.g., Free Trial Welcome Series" 
                    className="h-10 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 text-xs font-semibold"
                    value={currentSequence?.name || ''}
                    onChange={e => setCurrentSequence({ ...currentSequence, name: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Trigger Event <span className="text-rose-500">*</span>
                  </Label>
                  <Select 
                    value={currentSequence?.trigger_type} 
                    onValueChange={(v: any) => setCurrentSequence({ ...currentSequence, trigger_type: v })}
                  >
                    <SelectTrigger className="h-10 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 text-xs font-semibold">
                      <SelectValue placeholder="When should this start?" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="lead_created" className="text-xs font-semibold">🎯 New Lead Created</SelectItem>
                      <SelectItem value="stage_changed" className="text-xs font-semibold">🔄 Stage Moved To...</SelectItem>
                      <SelectItem value="manual" className="text-xs font-semibold">👤 Manual Enroll Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {currentSequence?.trigger_type === 'stage_changed' && (
                <div className="space-y-1.5 p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 animate-in slide-in-from-top-2 duration-300">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">Target Stage</Label>
                  <Select 
                    value={currentSequence?.trigger_value} 
                    onValueChange={(v: any) => setCurrentSequence({ ...currentSequence, trigger_value: v })}
                  >
                    <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-xs font-semibold">
                      <SelectValue placeholder="Which stage?" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {stages.map(s => <SelectItem key={s.id} value={s.name} className="text-xs">{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Steps Section */}
              <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      Sequence Execution Steps
                      <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-none text-[10px]">
                        {newSteps.length} step(s)
                      </Badge>
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">Steps execute in order with specified delays.</p>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-9 px-3 rounded-xl border-blue-200 text-[#2A3ED6] hover:bg-blue-50 text-xs font-bold flex items-center gap-1.5" 
                    onClick={addStep}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Action Item
                  </Button>
                </div>

                <div className="space-y-4 relative">
                  {/* Vertical line connector */}
                  <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-slate-700 z-0" />

                  {newSteps.map((step, idx) => (
                    <div key={idx} className="relative z-10 flex gap-4 items-start animate-in slide-in-from-left-2 duration-300">
                      <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-2xs flex items-center justify-center font-black text-slate-700 dark:text-slate-200 text-xs shrink-0 mt-1">
                        {idx + 1}
                      </div>
                      
                      <div className="flex-1 bg-white dark:bg-slate-800/80 border border-gray-200/80 dark:border-slate-700/80 rounded-2xl p-4 shadow-2xs space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                          <div className="sm:col-span-3 space-y-1">
                            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Delay (Hours)</Label>
                            <div className="relative">
                              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                              <Input 
                                type="number" 
                                className="h-9 pl-9 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border-gray-200 text-xs font-semibold" 
                                value={step.delay_hours}
                                onChange={e => updateStep(idx, 'delay_hours', parseInt(e.target.value) || 0)}
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-4 space-y-1">
                            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Action Type</Label>
                            <Select value={step.action_type} onValueChange={(v: any) => updateStep(idx, 'action_type', v)}>
                              <SelectTrigger className="h-9 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border-gray-200 text-xs font-semibold">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="send_email" className="text-xs">📧 Send Email</SelectItem>
                                <SelectItem value="send_whatsapp" className="text-xs">💬 Send WhatsApp</SelectItem>
                                <SelectItem value="send_payperwa" className="text-xs">🚀 Send PayPerWA</SelectItem>
                                <SelectItem value="update_stage" className="text-xs">🔄 Move Stage</SelectItem>
                                <SelectItem value="wait" className="text-xs">⌛ Just Wait</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="sm:col-span-4 space-y-1">
                            {step.action_type === 'send_email' && (
                              <>
                                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Template</Label>
                                <Select value={step.template_id?.toString()} onValueChange={(v) => updateStep(idx, 'template_id', parseInt(v))}>
                                  <SelectTrigger className="h-9 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border-gray-200 text-xs font-semibold">
                                    <SelectValue placeholder="Choose Template" />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-xl">
                                    {emailTemplates.map(t => <SelectItem key={t.id} value={t.id.toString()} className="text-xs">{t.name}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </>
                            )}

                            {step.action_type === 'update_stage' && (
                              <>
                                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Stage</Label>
                                <Select value={step.action_value} onValueChange={(v) => updateStep(idx, 'action_value', v)}>
                                  <SelectTrigger className="h-9 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border-gray-200 text-xs font-semibold">
                                    <SelectValue placeholder="Choose Stage" />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-xl">
                                    {stages.map(s => <SelectItem key={s.id} value={s.name} className="text-xs">{s.name}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </>
                            )}

                            {step.action_type === 'wait' && <div className="h-9 flex items-center text-xs text-slate-400 italic">No action at this step</div>}

                            {step.action_type === 'send_whatsapp' && (
                              <div className="space-y-1">
                                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">WA Provider</Label>
                                <Select
                                  value={step.whatsapp_provider || 'personal'}
                                  onValueChange={(v: any) => updateStep(idx, 'whatsapp_provider', v)}
                                >
                                  <SelectTrigger className="h-9 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border-gray-200 text-xs font-semibold">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-xl">
                                    <SelectItem value="personal" className="text-xs">📱 Personal WA</SelectItem>
                                    <SelectItem value="cloud_api" className="text-xs">☁️ Cloud API</SelectItem>
                                    <SelectItem value="evolution" className="text-xs">⚡ Evolution WA</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>

                          <div className="sm:col-span-1 pb-0.5">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                              onClick={() => removeStep(idx)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* WhatsApp Provider specific row */}
                        {step.action_type === 'send_whatsapp' && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                            {(step.whatsapp_provider === 'personal' || step.whatsapp_provider === 'cloud_api' || !step.whatsapp_provider) && (
                              <div className="space-y-1">
                                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Template Name</Label>
                                <Input
                                  placeholder="e.g., welcome_message"
                                  className="h-9 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border-gray-200 text-xs font-semibold"
                                  value={step.whatsapp_template_name || ''}
                                  onChange={e => updateStep(idx, 'whatsapp_template_name', e.target.value)}
                                />
                              </div>
                            )}
                            {step.whatsapp_provider === 'evolution' && (
                              <div className="space-y-1">
                                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                  Message <span className="normal-case text-blue-600">(sent via linked Evolution device)</span>
                                </Label>
                                <textarea
                                  rows={2}
                                  placeholder="Type the WhatsApp message to send..."
                                  className="w-full resize-none rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-3 py-2 text-xs"
                                  value={step.whatsapp_message || ''}
                                  onChange={e => updateStep(idx, 'whatsapp_message', e.target.value)}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* PayPerWA specific row */}
                        {step.action_type === 'send_payperwa' && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PayPerWA Template Name</Label>
                            <Input
                              placeholder="e.g., promotional_offer"
                              className="h-9 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border-gray-200 text-xs font-semibold"
                              value={step.whatsapp_template_name || ''}
                              onChange={e => updateStep(idx, 'whatsapp_template_name', e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 flex flex-row items-center justify-between gap-3 sm:justify-between">
              <Button 
                variant="ghost" 
                className="rounded-xl h-10 font-bold text-xs text-slate-500 hover:text-slate-900" 
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="rounded-xl h-10 px-6 font-extrabold text-xs bg-gradient-to-r from-[#2A3ED6] to-[#4054E6] hover:opacity-95 text-white shadow-md shadow-blue-600/10 flex items-center gap-2" 
                onClick={saveSequence}
              >
                <ArrowRight className="h-4 w-4" /> Launch Sequence
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  )
}
