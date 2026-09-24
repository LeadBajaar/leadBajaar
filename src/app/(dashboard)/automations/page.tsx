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
  ArrowRight, Settings2, Sparkles, Filter
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
  DialogTrigger,
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
import { PageHeader } from "@/components/page-header/PageHeader"

// ─── Types ───────────────────────────────────────────────────────────────────

interface AutomationStep {
  id?: number;
  order: number;
  delay_hours: number;
  action_type: 'send_email' | 'send_whatsapp' | 'update_stage' | 'wait';
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

  return (
    <RoleGuard allowedTypes={['agency', 'super_admin', 'individual']} allowedFeatures={['automations']}>
      <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full pb-10 font-sans">
      {/* Header */}
      <PageHeader
        title="Workflow Automations"
        description="Manage automated drip sequences, instant follow-up triggers, and multi-channel messages"
        icon={<Zap className="h-6 w-6 text-[#FE4548]" />}
        actions={
          <div className="flex items-center gap-2">
            {/* TODO: Migrate raw button to shared <Button> component later (complex styling) */}
            <button 
              onClick={handleCreateNew}
              className="px-4 py-2 bg-[#FE4548] hover:bg-[#FF6E54] text-white font-semibold text-xs rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create Sequence</span>
            </button>
          </div>
        }
      />

      {/* Quick KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm">
        <div className="flex items-center gap-3 p-2">
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-600 text-white shadow-xs shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Active Sequences</span>
            <span className="text-xl font-bold font-heading text-slate-900 dark:text-white tabular-nums">
              {sequences.filter(s => s.is_active).length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2">
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs shrink-0">
            <Play className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Enrollments</span>
            <span className="text-xl font-bold font-heading text-slate-900 dark:text-white tabular-nums">
              {sequences.reduce((acc, s) => acc + (s.enrollments_count || 0), 0)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <Tabs defaultValue="sequences" className="w-full space-y-4">
          <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl h-auto flex flex-row border border-slate-200 dark:border-slate-700 w-full sm:w-fit shrink-0">
            <TabsTrigger 
              value="sequences" 
              className="flex-1 sm:flex-none rounded-lg px-5 py-1.5 text-xs font-semibold font-heading data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-xs transition-all"
            >
              Drip Sequences
            </TabsTrigger>
            <TabsTrigger 
              value="global" 
              className="flex-1 sm:flex-none rounded-lg px-5 py-1.5 text-xs font-semibold font-heading data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-xs transition-all"
            >
              Global Triggers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sequences" className="space-y-4 m-0">
            <div className="space-y-4">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse h-24 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-2xl" />
                ))
              ) : sequences.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
                  <Zap className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <h3 className="text-sm font-semibold font-heading text-slate-900 dark:text-white">No active sequences</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">Create a sequence to automate follow-up messages across email and WhatsApp.</p>
                  <Button onClick={handleCreateNew} size="sm" className="h-8 text-xs font-semibold bg-[#FE4548] text-white">Create Sequence</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {sequences.map(sequence => (
                    <div 
                      key={sequence.id} 
                      className="border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-2xl overflow-hidden hover:border-indigo-400/50 dark:hover:border-indigo-500/50 transition-colors"
                    >
                      <div className="p-5 flex items-start justify-between">
                        <div className="space-y-1.5 flex-1 min-w-0 pr-3">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white truncate">
                              {sequence.name}
                            </h3>
                            <Badge className={cn("border-none text-[10.5px] font-semibold px-2 py-0.5 rounded-full text-white shadow-xs", sequence.is_active ? "bg-emerald-600" : "bg-slate-500")}>
                              {sequence.is_active ? 'Active' : 'Paused'}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 font-normal">{sequence.description || 'No description provided.'}</p>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-200 dark:border-slate-800 p-1">
                            <DropdownMenuItem className="text-xs cursor-pointer font-medium rounded-lg" onClick={() => {
                              setCurrentSequence(sequence);
                              setNewSteps(sequence.steps || []);
                              setIsDialogOpen(true);
                            }}>
                              <Settings2 className="mr-2 h-3.5 w-3.5 text-slate-400" /> Edit Sequence
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs cursor-pointer font-medium rounded-lg" onClick={() => toggleStatus(sequence.id)}>
                              {sequence.is_active ? <Pause className="mr-2 h-3.5 w-3.5 text-amber-500" /> : <Play className="mr-2 h-3.5 w-3.5 text-emerald-500" />}
                              {sequence.is_active ? 'Pause Sequence' : 'Resume Sequence'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="bg-slate-50/60 dark:bg-slate-850/60 px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trigger</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Filter className="h-3 w-3 text-blue-600" />
                              <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                                {sequence.trigger_type.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Enrollments</span>
                            <span className="text-xs font-semibold font-heading text-slate-900 dark:text-white mt-0.5 tabular-nums">{sequence.enrollments_count || 0}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Step Flow</span>
                            <div className="flex -space-x-1 mt-0.5">
                              {sequence.steps?.slice(0, 4).map((step, idx) => (
                                <div key={idx} className="h-5 w-5 rounded-full border border-white dark:border-slate-900 bg-white dark:bg-slate-800 flex items-center justify-center shadow-xs">
                                  {step.action_type === 'send_email' ? <Mail className="h-2.5 w-2.5 text-blue-600" /> : step.action_type === 'send_whatsapp' ? <MessageSquare className="h-2.5 w-2.5 text-emerald-600" /> : <Settings2 className="h-2.5 w-2.5 text-purple-600" />}
                                </div>
                              ))}
                              {(sequence.steps?.length || 0) > 4 && (
                                <div className="h-5 w-5 rounded-full border border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-700 dark:text-slate-200">
                                  +{(sequence.steps?.length || 0) - 4}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="global" className="flex-1 m-0 outline-none">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
              <GlobalAutomationsSettings />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-[var(--crm-surface-1)] p-0 overflow-hidden border-none rounded-[2rem] shadow-2xl">
          <div className="p-8 max-h-[90vh] overflow-y-auto">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                {currentSequence?.id ? 'Edit Sequence' : 'Visual Sequence Builder'}
                <Sparkles className="h-5 w-5 text-primary" />
              </DialogTitle>
              <DialogDescription>
                Design an automated flow that converts leads into customers.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold ml-1">Sequence Name</Label>
                  <Input 
                    placeholder="e.g., Free Trial Welcome Series" 
                    className="h-12 rounded-xl bg-[var(--crm-surface-2)] border-none ring-1 ring-slate-200"
                    value={currentSequence?.name || ''}
                    onChange={e => setCurrentSequence({ ...currentSequence, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold ml-1">Trigger Event</Label>
                  <Select 
                    value={currentSequence?.trigger_type} 
                    onValueChange={(v: any) => setCurrentSequence({ ...currentSequence, trigger_type: v })}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-[var(--crm-surface-2)] border-none ring-1 ring-slate-200">
                      <SelectValue placeholder="When should this start?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead_created">New Lead Created</SelectItem>
                      <SelectItem value="stage_changed">Stage Moved To...</SelectItem>
                      <SelectItem value="manual">Manual Enroll Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {currentSequence?.trigger_type === 'stage_changed' && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <Label className="text-sm font-bold ml-1">Target Stage</Label>
                   <Select 
                    value={currentSequence?.trigger_value} 
                    onValueChange={(v: any) => setCurrentSequence({ ...currentSequence, trigger_value: v })}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-[var(--crm-surface-2)] border-none ring-1 ring-slate-200">
                      <SelectValue placeholder="Which stage?" />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator className="bg-[var(--crm-surface-3)]" />

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold flex items-center gap-2">
                    Sequence Steps
                    <Badge variant="outline" className="rounded-full bg-[var(--crm-surface-2)]">{newSteps.length}</Badge>
                  </h4>
                  <Button variant="ghost" className="text-[var(--crm-accent)] font-bold hover:bg-[var(--crm-accent-soft)]" onClick={addStep}>
                    <Plus className="h-4 w-4 mr-1" /> Add Action Item
                  </Button>
                </div>

                <div className="space-y-4 relative">
                   {/* Vertical line connector */}
                   <div className="absolute left-[20px] top-6 bottom-6 w-0.5 bg-[var(--crm-surface-3)] z-0" />

                   {newSteps.map((step, idx) => (
                      <div key={idx} className="relative z-10 flex gap-6 items-start animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                        <div className="h-10 w-10 rounded-full bg-[var(--crm-surface-1)] shadow-sm ring-1 ring-slate-200 flex items-center justify-center font-bold text-[var(--crm-text-secondary)] text-sm flex-shrink-0 mt-2">
                          {idx + 1}
                        </div>
                        
                        <Card className="flex-1 border-none shadow-none ring-1 ring-slate-200 rounded-2xl overflow-hidden">
                          <div className="p-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                            <div className="sm:col-span-3 space-y-1.5">
                              <Label className="text-[10px] font-bold text-[var(--crm-text-secondary)] uppercase tracking-widest ml-1">Delay (hrs)</Label>
                              <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--crm-text-secondary)]" />
                                <Input 
                                  type="number" 
                                  className="h-10 pl-9 rounded-xl bg-[var(--crm-surface-1)] border-none ring-1 ring-slate-100 focus:ring-[var(--crm-accent)]" 
                                  value={step.delay_hours}
                                  onChange={e => updateStep(idx, 'delay_hours', parseInt(e.target.value))}
                                />
                              </div>
                            </div>

                            <div className="sm:col-span-4 space-y-1.5">
                              <Label className="text-[10px] font-bold text-[var(--crm-text-secondary)] uppercase tracking-widest ml-1">Action Type</Label>
                              <Select value={step.action_type} onValueChange={(v: any) => updateStep(idx, 'action_type', v)}>
                                <SelectTrigger className="h-10 rounded-xl bg-[var(--crm-surface-1)] border-none ring-1 ring-slate-100 focus:ring-[var(--crm-accent)]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="send_email">📧 Send Email</SelectItem>
                                  <SelectItem value="send_whatsapp">💬 Send WhatsApp</SelectItem>
                                  <SelectItem value="update_stage">🔄 Move Stage</SelectItem>
                                  <SelectItem value="wait">⌛ Just Wait</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="sm:col-span-4 space-y-1.5">
                              {step.action_type === 'send_email' && (
                                <>
                                  <Label className="text-[10px] font-bold text-[var(--crm-text-secondary)] uppercase tracking-widest ml-1">Email Template</Label>
                                  <Select value={step.template_id?.toString()} onValueChange={(v) => updateStep(idx, 'template_id', parseInt(v))}>
                                    <SelectTrigger className="h-10 rounded-xl bg-[var(--crm-surface-1)] border-none ring-1 ring-slate-100 focus:ring-[var(--crm-accent)]">
                                      <SelectValue placeholder="Choose Template" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {emailTemplates.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </>
                              )}
                              {step.action_type === 'update_stage' && (
                                <>
                                  <Label className="text-[10px] font-bold text-[var(--crm-text-secondary)] uppercase tracking-widest ml-1">Target Stage</Label>
                                  <Select value={step.action_value} onValueChange={(v) => updateStep(idx, 'action_value', v)}>
                                    <SelectTrigger className="h-10 rounded-xl bg-[var(--crm-surface-1)] border-none ring-1 ring-slate-100 focus:ring-[var(--crm-accent)]">
                                      <SelectValue placeholder="Choose Stage" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {stages.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </>
                              )}
                              {step.action_type === 'wait' && <div className="h-10 flex items-center text-xs text-[var(--crm-text-secondary)] italic">No action at this step</div>}
                              {step.action_type === 'send_whatsapp' && (
                                <div className="space-y-2">
                                  <Label className="text-[10px] font-bold text-[var(--crm-text-secondary)] uppercase tracking-widest ml-1">WA Provider</Label>
                                  <Select
                                    value={step.whatsapp_provider || 'personal'}
                                    onValueChange={(v: any) => updateStep(idx, 'whatsapp_provider', v)}
                                  >
                                    <SelectTrigger className="h-10 rounded-xl bg-[var(--crm-surface-1)] border-none ring-1 ring-slate-100">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="personal">📱 Personal WA</SelectItem>
                                      <SelectItem value="cloud_api">☁️ Cloud API</SelectItem>
                                      <SelectItem value="evolution">⚡ Evolution WA</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>

                            <div className="sm:col-span-1 pb-1">
                               <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-[var(--crm-text-secondary)] hover:text-red-500 hover:bg-red-50 rounded-lg"
                                onClick={() => removeStep(idx)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* WhatsApp provider-specific detail row */}
                          {step.action_type === 'send_whatsapp' && (
                            <div className="px-4 pb-4">
                              {(step.whatsapp_provider === 'personal' || step.whatsapp_provider === 'cloud_api' || !step.whatsapp_provider) && (
                                <div className="space-y-1.5">
                                  <Label className="text-[10px] font-bold text-[var(--crm-text-secondary)] uppercase tracking-widest ml-1">Template Name</Label>
                                  <Input
                                    placeholder="e.g., welcome_message"
                                    className="h-10 rounded-xl bg-[var(--crm-surface-1)] border-none ring-1 ring-slate-100 focus:ring-[var(--crm-accent)]"
                                    value={step.whatsapp_template_name || ''}
                                    onChange={e => updateStep(idx, 'whatsapp_template_name', e.target.value)}
                                  />
                                </div>
                              )}
                              {step.whatsapp_provider === 'evolution' && (
                                <div className="space-y-1.5">
                                  <Label className="text-[10px] font-bold text-[var(--crm-text-secondary)] uppercase tracking-widest ml-1">
                                    Message <span className="normal-case text-primary">(sent via your linked Evolution device)</span>
                                  </Label>
                                  <textarea
                                    rows={3}
                                    placeholder="Type the WhatsApp message to send..."
                                    className="w-full resize-none rounded-xl bg-[var(--crm-surface-1)] border-none ring-1 ring-slate-100 focus:ring-[var(--crm-accent)] px-3 py-2 text-sm"
                                    value={step.whatsapp_message || ''}
                                    onChange={e => updateStep(idx, 'whatsapp_message', e.target.value)}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </Card>
                      </div>
                   ))}
                </div>
              </div>
            </div>

            <DialogFooter className="mt-8 sm:mt-12 sticky bottom-0 bg-[var(--crm-surface-1)] pt-4 border-t border-[var(--crm-border)] gap-3 sm:gap-2">
              <Button variant="ghost" className="rounded-xl h-11 font-bold w-full sm:w-auto hover:bg-[var(--crm-surface-2)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)]" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button className="rounded-xl h-11 px-8 font-bold bg-[var(--crm-accent)] hover:opacity-90 shadow-lg shadow-indigo-100 w-full sm:w-auto text-white border-none" onClick={saveSequence}>
                <ArrowRight className="h-5 w-5 mr-1.5" /> Launch Sequence
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </RoleGuard>
  )
}
