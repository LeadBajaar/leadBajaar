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

// ─── Types ───────────────────────────────────────────────────────────────────

interface AutomationStep {
  id?: number;
  order: number;
  delay_hours: number;
  action_type: 'send_email' | 'send_whatsapp' | 'update_stage' | 'wait';
  template_id?: number;
  whatsapp_template_name?: string;
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
    <div className="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
              <Zap className="h-6 w-6" />
            </div>
            Email & WhatsApp Automations
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Build multi-step omnichannel drip sequences to nurture leads.</p>
        </div>
        <Button 
          onClick={handleCreateNew}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 dark:shadow-none px-6 rounded-2xl h-12 font-bold"
        >
          <Plus className="mr-2 h-5 w-5" /> Create Sequence
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm dark:bg-slate-900 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Active Sequences</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {sequences.filter(s => s.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm dark:bg-slate-900 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
                <Play className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Enrollments</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {sequences.reduce((acc, s) => acc + (s.enrollments_count || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm dark:bg-slate-900 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Clicks/Conversions</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">Active CAPI Loop</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse h-48 bg-slate-100 dark:bg-slate-800 border-none" />
          ))
        ) : sequences.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No sequences yet</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">Create your first automated drip campaign to follow up with leads automatically.</p>
            <Button onClick={handleCreateNew} variant="outline" className="mt-8 rounded-xl px-8 h-12">Create your first automation</Button>
          </div>
        ) : (
          sequences.map(sequence => (
            <Card 
              key={sequence.id} 
              className="border-none shadow-sm dark:bg-slate-900 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800 group hover:ring-indigo-500 transition-all duration-300"
            >
              <CardHeader className="p-6 pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                        {sequence.name}
                      </h3>
                      <Badge className={sequence.is_active ? "bg-emerald-500/10 text-emerald-600 border-emerald-100 dark:border-emerald-500/20" : "bg-slate-100 text-slate-500 border-slate-200"}>
                        {sequence.is_active ? 'Active' : 'Paused'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-1">{sequence.description || 'No description provided.'}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border-slate-200 dark:border-slate-800">
                      <DropdownMenuItem className="p-3 cursor-pointer" onClick={() => {
                        setCurrentSequence(sequence);
                        setNewSteps(sequence.steps || []);
                        setIsDialogOpen(true);
                      }}>
                        <Settings2 className="mr-2 h-4 w-4" /> Edit Sequence
                      </DropdownMenuItem>
                      <DropdownMenuItem className="p-3 cursor-pointer" onClick={() => toggleStatus(sequence.id)}>
                        {sequence.is_active ? <Pause className="mr-2 h-4 w-4 text-amber-500" /> : <Play className="mr-2 h-4 w-4 text-emerald-500" />}
                        {sequence.is_active ? 'Pause Sequence' : 'Resume Sequence'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-3 space-y-4">
                <div className="grid grid-cols-2 gap-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl px-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enrollments</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{sequence.enrollments_count || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Steps</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{sequence.steps?.length || 0} stages</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <Filter className="h-3 w-3" /> Trigger: <span className="text-indigo-500">{sequence.trigger_type.replace('_', ' ')}</span>
                  {sequence.trigger_value && <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 ml-1 text-slate-700 dark:text-white">{sequence.trigger_value}</span>}
                </div>

                <div className="flex -space-x-2 pt-2">
                   {sequence.steps?.map((step, idx) => (
                      <div key={idx} className="h-10 w-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 ring-1 ring-slate-100 flex-shrink-0">
                        {step.action_type === 'send_email' ? <Mail className="h-4 w-4" /> : step.action_type === 'send_whatsapp' ? <MessageSquare className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}
                      </div>
                   ))}
                   <div className="h-10 px-3 rounded-full border-2 border-white dark:border-slate-900 bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-[10px] font-bold text-indigo-600 ring-1 ring-indigo-100 ml-2">
                     + {sequence.steps?.length || 0} ACTIONS
                   </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-950 p-0 overflow-hidden border-none rounded-[2rem] shadow-2xl">
          <div className="p-8 max-h-[90vh] overflow-y-auto">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                {currentSequence?.id ? 'Edit Sequence' : 'Visual Sequence Builder'}
                <Sparkles className="h-5 w-5 text-indigo-500" />
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
                    className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-none ring-1 ring-slate-200 dark:ring-slate-800"
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
                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-none ring-1 ring-slate-200 dark:ring-slate-800">
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
                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-none ring-1 ring-slate-200 dark:ring-slate-800">
                      <SelectValue placeholder="Which stage?" />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator className="bg-slate-100 dark:bg-slate-800" />

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold flex items-center gap-2">
                    Sequence Steps
                    <Badge variant="outline" className="rounded-full bg-slate-50 dark:bg-slate-900">{newSteps.length}</Badge>
                  </h4>
                  <Button variant="ghost" className="text-indigo-600 font-bold hover:bg-indigo-50" onClick={addStep}>
                    <Plus className="h-4 w-4 mr-1" /> Add Action Item
                  </Button>
                </div>

                <div className="space-y-4 relative">
                   {/* Vertical line connector */}
                   <div className="absolute left-[20px] top-6 bottom-6 w-0.5 bg-slate-100 dark:bg-slate-800 z-0" />

                   {newSteps.map((step, idx) => (
                      <div key={idx} className="relative z-10 flex gap-6 items-start animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                        <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 flex items-center justify-center font-bold text-slate-400 text-sm flex-shrink-0 mt-2">
                          {idx + 1}
                        </div>
                        
                        <Card className="flex-1 border-none shadow-none ring-1 ring-slate-200 dark:ring-slate-800 dark:bg-slate-900/50 rounded-2xl overflow-hidden">
                          <div className="p-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                            <div className="sm:col-span-3 space-y-1.5">
                              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Delay (hrs)</Label>
                              <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input 
                                  type="number" 
                                  className="h-10 pl-9 rounded-xl bg-white dark:bg-slate-950 border-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-indigo-500" 
                                  value={step.delay_hours}
                                  onChange={e => updateStep(idx, 'delay_hours', parseInt(e.target.value))}
                                />
                              </div>
                            </div>

                            <div className="sm:col-span-4 space-y-1.5">
                              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Action Type</Label>
                              <Select value={step.action_type} onValueChange={(v: any) => updateStep(idx, 'action_type', v)}>
                                <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-slate-950 border-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-indigo-500">
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
                                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Template</Label>
                                  <Select value={step.template_id?.toString()} onValueChange={(v) => updateStep(idx, 'template_id', parseInt(v))}>
                                    <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-slate-950 border-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-indigo-500">
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
                                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Target Stage</Label>
                                  <Select value={step.action_value} onValueChange={(v) => updateStep(idx, 'action_value', v)}>
                                    <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-slate-950 border-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-indigo-500">
                                      <SelectValue placeholder="Choose Stage" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {stages.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </>
                              )}
                              {step.action_type === 'wait' && <div className="h-10 flex items-center text-xs text-slate-400 italic">No action at this step</div>}
                              {step.action_type === 'send_whatsapp' && <Input placeholder="Template Name" className="h-10 rounded-xl" />}
                            </div>

                            <div className="sm:col-span-1 pb-1">
                               <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                onClick={() => removeStep(idx)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </div>
                   ))}
                </div>
              </div>
            </div>

            <DialogFooter className="mt-12 sticky bottom-0 bg-white dark:bg-slate-950 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" className="rounded-xl h-12 px-6 font-bold" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button className="rounded-xl h-12 px-8 font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100" onClick={saveSequence}>
                <ArrowRight className="h-5 w-5 mr-1.5" /> Launch Sequence
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
