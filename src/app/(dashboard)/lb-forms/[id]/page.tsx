'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Type, AlignLeft, Hash, Mail, Phone, Calendar, 
  CheckSquare, List, CircleDot, GripVertical, X, Plus, 
  Settings, Loader2, ArrowLeft, Download, Table as TableIcon
} from 'lucide-react'
import { toast } from 'sonner'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import Link from 'next/link'
import { API_BASE_URL } from '@/lib/api'

type FieldType = 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'date' | 'checkbox' | 'radio' | 'select'

interface FormField {
  id: string
  type: FieldType
  label: string
  required: boolean
  options?: string[]
  placeholder?: string
}


const FIELD_TYPES: { type: FieldType, icon: any, label: string }[] = [
  { type: 'text', icon: Type, label: 'Short Text' },
  { type: 'textarea', icon: AlignLeft, label: 'Long Text' },
  { type: 'email', icon: Mail, label: 'Email' },
  { type: 'phone', icon: Phone, label: 'Phone' },
  { type: 'number', icon: Hash, label: 'Number' },
  { type: 'date', icon: Calendar, label: 'Date' },
  { type: 'select', icon: List, label: 'Dropdown' },
  { type: 'radio', icon: CircleDot, label: 'Single Choice' },
  { type: 'checkbox', icon: CheckSquare, label: 'Multiple Choice' },
]

export default function EditLBFormPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form Metadata
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [active, setActive] = useState(true)
  const [autoCreateLead, setAutoCreateLead] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState('')
  const [fields, setFields] = useState<FormField[]>([])
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null)

  useEffect(() => {
    fetchFormData()
  }, [id])

  const fetchFormData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/lb-forms/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        cache: 'no-store'
      })
      if (!response.ok) throw new Error('Failed to load form')
      const data = await response.json()
      
      setTitle(data.title)
      setDescription(data.description || '')
      setActive(data.active)
      setAutoCreateLead(data.auto_create_lead)
      setRedirectUrl(data.redirect_url || '')
      setFields(data.fields || [])
    } catch (error) {
      console.error(error)
      toast.error('Failed to load form')
    } finally {
      setIsLoading(false)
    }
  }



  const addField = (type: FieldType) => {
    const defaultLabel = FIELD_TYPES.find(f => f.type === type)?.label || 'New Field'
    const newField: FormField = {
      id: 'field_' + Date.now() + Math.random().toString(36).substr(2, 5),
      type,
      label: defaultLabel,
      required: false,
      placeholder: '',
      ...( ['select', 'radio', 'checkbox'].includes(type) ? { options: ['Option 1', 'Option 2'] } : {} )
    }
    setFields([...fields, newField])
    setActiveFieldId(newField.id)
  }

  const removeField = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFields(fields.filter(f => f.id !== id))
    if (activeFieldId === id) setActiveFieldId(null)
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const items = Array.from(fields)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    setFields(items)
  }

  const handleUpdate = async () => {
    if (!title.trim()) {
      toast.error('Form title is required')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/lb-forms/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          title,
          description,
          fields,
          active,
          auto_create_lead: autoCreateLead,
          redirect_url: redirectUrl || null,
        })
      })

      if (!response.ok) throw new Error('Failed to update form')

      toast.success('Form updated successfully')
    } catch (error) {
      console.error('Update error:', error)
      toast.error('An error occurred while updating the form')
    } finally {
      setIsSubmitting(false)
    }
  }



  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-[var(--crm-primary)]" />
    </div>
  }

  const activeField = fields.find(f => f.id === activeFieldId)

  return (
    <div className="absolute inset-0 flex flex-col bg-[var(--crm-bg)] overflow-hidden z-20">
      {/* ── Top Bar ────────────────────────────────────────────────────────────── */}
      <div className="shrink-0 h-[52px] border-b border-[var(--crm-border)] bg-[var(--crm-surface-1)] flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-3">
          <Link href="/lb-forms">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] rounded-[6px]">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="font-semibold text-[13px] text-[var(--crm-text-primary)] flex items-center gap-2">
            {title || 'Edit Form'} 
            <span className="text-[10px] text-[var(--crm-text-tertiary)] font-mono bg-[var(--crm-surface-2)] px-1.5 py-0.5 rounded border border-[var(--crm-border)]">ID: {id}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleUpdate} 
            disabled={isSubmitting}
            className="bg-[var(--crm-primary)] hover:opacity-90 text-white h-7 px-4 text-[12px] font-medium rounded-full shadow-sm"
          >
            {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save Changes'}
          </Button>
        </div>
      </div>
      
      {/* ── Builder Tab ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
          {/* Left Pane - Elements Panel */}
          <div className="hidden md:flex w-[260px] bg-[var(--crm-surface-1)] border-r border-[var(--crm-border)] flex-col overflow-hidden z-10 shadow-sm relative">
            <div className="p-3 font-semibold text-[13px] text-[var(--crm-text-primary)] border-b border-[var(--crm-border)] flex items-center gap-2">
              <Plus className="h-3.5 w-3.5" /> Add Fields
            </div>
            <div className="p-3 overflow-y-auto space-y-2 flex-1">
              <div className="text-[10px] font-semibold text-[var(--crm-text-tertiary)] uppercase tracking-wider mb-2 px-1">Basic Fields</div>
              <div className="grid grid-cols-2 gap-2">
                {FIELD_TYPES.map((ft) => (
                  <button
                    key={ft.type}
                    onClick={() => addField(ft.type)}
                    className="flex flex-col items-center justify-center p-2.5 gap-1.5 bg-[var(--crm-surface-2)] border border-[var(--crm-border)] rounded-[8px] hover:border-[var(--crm-primary)]/50 hover:bg-[var(--crm-surface-3)] transition-colors text-[var(--crm-text-primary)] shadow-sm"
                  >
                    <ft.icon className="h-4 w-4 text-[var(--crm-text-secondary)]" />
                    <span className="text-[11px] font-medium text-center">{ft.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Center Pane - Canvas */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[var(--crm-bg)]">
            <div className="max-w-xl mx-auto space-y-6">
              
              {/* Form Headers directly on canvas (no bulky card) */}
              <div className="space-y-2 px-1">
                <Input 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="Enter form title..."
                  className="text-2xl font-bold h-auto bg-transparent border-none px-0 shadow-none focus-visible:ring-0 text-[var(--crm-text-primary)] tracking-tight placeholder:text-[var(--crm-text-tertiary)]"
                />
                <Textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder="Describe what this form is for..."
                  className="resize-none bg-transparent border-none px-0 shadow-none focus-visible:ring-0 text-[14px] text-[var(--crm-text-secondary)] placeholder:text-[var(--crm-text-tertiary)] min-h-[40px] p-0 leading-relaxed"
                  rows={2}
                />
              </div>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="form-canvas">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3 pb-24">
                      {fields.map((field, index) => (
                        <Draggable key={field.id} draggableId={field.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              onClick={() => setActiveFieldId(field.id)}
                              className={`relative bg-[var(--crm-surface-1)] border rounded-[10px] overflow-hidden cursor-pointer transition-all ${
                                activeFieldId === field.id 
                                  ? 'border-[var(--crm-primary)] shadow-md ring-1 ring-[var(--crm-primary)]/20' 
                                  : 'border-[var(--crm-border)] shadow-sm hover:border-[var(--crm-primary)]/50 hover:bg-[var(--crm-surface-2)]'
                              } ${snapshot.isDragging ? 'shadow-xl z-50 ring-1 ring-[var(--crm-border)]' : ''}`}
                            >
                              <div className="flex">
                                <div 
                                  {...provided.dragHandleProps} 
                                  className="w-8 bg-[var(--crm-surface-2)]/50 border-r border-[var(--crm-border)] flex items-center justify-center text-[var(--crm-text-tertiary)] hover:bg-[var(--crm-surface-3)] transition-colors"
                                >
                                  <GripVertical className="h-4 w-4" />
                                </div>
                                <div className="flex-1 p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <Label className="font-semibold text-[13px] text-[var(--crm-text-primary)] cursor-pointer">
                                      {field.label} {field.required && <span className="text-[var(--crm-red)] ml-0.5">*</span>}
                                    </Label>
                                    <button
                                      onClick={(e) => removeField(field.id, e)}
                                      className="text-[var(--crm-text-tertiary)] hover:text-[var(--crm-red)] transition-colors p-1 rounded-md hover:bg-[var(--crm-surface-2)]"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                  {field.type === 'textarea' ? (
                                    <Textarea disabled placeholder={field.placeholder || 'Long text answer'} rows={2} className="bg-[var(--crm-surface-2)] opacity-60 border-[var(--crm-border)] text-[13px] min-h-[60px]" />
                                  ) : field.type === 'select' ? (
                                    <Input disabled placeholder={field.placeholder || 'Select an option...'} className="bg-[var(--crm-surface-2)] opacity-60 border-[var(--crm-border)] h-9 text-[13px]" />
                                  ) : field.type === 'radio' || field.type === 'checkbox' ? (
                                    <div className="space-y-2.5">
                                      {field.options?.map((opt, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                          <div className={`h-3.5 w-3.5 border border-[var(--crm-border)] ${field.type === 'radio' ? 'rounded-full' : 'rounded-[4px]'} bg-[var(--crm-surface-2)] opacity-80`} />
                                          <span className="text-[13px] text-[var(--crm-text-secondary)]">{opt}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <Input disabled placeholder={field.placeholder || 'Short answer'} className="bg-[var(--crm-surface-2)] opacity-60 border-[var(--crm-border)] h-9 text-[13px]" />
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>

          {/* Right Pane - Configuration */}
          <div className="w-[280px] bg-[var(--crm-surface-1)] border-l border-[var(--crm-border)] flex flex-col overflow-y-auto shadow-sm relative z-10">
            {activeField ? (
              <>
                <div className="p-3 font-semibold text-[13px] text-[var(--crm-text-primary)] border-b border-[var(--crm-border)] flex items-center justify-between gap-2 bg-[var(--crm-surface-2)]">
                  <div className="flex items-center gap-1.5">
                    <Settings className="h-3.5 w-3.5 text-[var(--crm-text-secondary)]" /> Field Settings
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-[var(--crm-text-tertiary)] hover:text-[var(--crm-text-primary)] rounded-md"
                    onClick={() => setActiveFieldId(null)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="p-4 space-y-5">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-semibold text-[var(--crm-text-secondary)] uppercase tracking-wider">Field Label</Label>
                    <Input 
                      value={activeField.label} 
                      onChange={(e) => updateField(activeField.id, { label: e.target.value })} 
                      className="h-8 text-[12px] bg-[var(--crm-surface-2)] border-[var(--crm-border)]"
                    />
                  </div>
                  {!['radio', 'checkbox'].includes(activeField.type) && (
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-semibold text-[var(--crm-text-secondary)] uppercase tracking-wider">Placeholder</Label>
                      <Input 
                        value={activeField.placeholder || ''} 
                        onChange={(e) => updateField(activeField.id, { placeholder: e.target.value })} 
                        placeholder="Optional placeholder..."
                        className="h-8 text-[12px] bg-[var(--crm-surface-2)] border-[var(--crm-border)]"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between p-2.5 bg-[var(--crm-surface-2)] rounded-[8px] border border-[var(--crm-border)] shadow-sm">
                    <div className="space-y-0.5">
                      <Label className="text-[12px] font-medium">Required</Label>
                      <p className="text-[10px] text-[var(--crm-text-tertiary)]">Make mandatory</p>
                    </div>
                    <Switch 
                      checked={activeField.required} 
                      onCheckedChange={(checked) => updateField(activeField.id, { required: checked })} 
                    />
                  </div>
                  {['select', 'radio', 'checkbox'].includes(activeField.type) && (
                    <div className="space-y-3 pt-3 border-t border-[var(--crm-border)]">
                      <Label className="text-[10px] font-semibold text-[var(--crm-text-secondary)] uppercase tracking-wider">Options</Label>
                      <div className="space-y-2">
                        {activeField.options?.map((opt, idx) => (
                          <div key={idx} className="flex gap-1.5 items-center">
                            <Input 
                              value={opt} 
                              onChange={(e) => {
                                const newOpts = [...(activeField.options || [])];
                                newOpts[idx] = e.target.value;
                                updateField(activeField.id, { options: newOpts });
                              }} 
                              className="h-7 text-[12px] bg-[var(--crm-surface-2)] border-[var(--crm-border)] px-2"
                            />
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-[var(--crm-red)] hover:bg-[var(--crm-red-soft)] shrink-0 rounded-md" onClick={() => {
                                const newOpts = activeField.options?.filter((_, i) => i !== idx) || [];
                                updateField(activeField.id, { options: newOpts });
                              }}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full h-7 text-[11px] border-dashed text-[var(--crm-text-secondary)]" onClick={() => {
                            const newOpts = [...(activeField.options || []), `Option ${(activeField.options?.length || 0) + 1}`];
                            updateField(activeField.id, { options: newOpts });
                          }}>
                          <Plus className="h-3 w-3 mr-1" /> Add Option
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="p-3 font-semibold text-[13px] text-[var(--crm-text-primary)] border-b border-[var(--crm-border)] flex items-center gap-1.5 bg-[var(--crm-surface-2)]">
                  <Settings className="h-3.5 w-3.5 text-[var(--crm-text-secondary)]" /> Form Settings
                </div>
                <div className="p-4 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 pr-4">
                      <Label className="text-[12px] font-medium">Active Status</Label>
                      <p className="text-[10px] text-[var(--crm-text-tertiary)]">Allow submissions</p>
                    </div>
                    <Switch checked={active} onCheckedChange={setActive} />
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-[var(--crm-border)]">
                    <div className="space-y-0.5 pr-4">
                      <Label className="text-[12px] font-medium">Auto Lead Creation</Label>
                      <p className="text-[10px] text-[var(--crm-text-tertiary)]">Create a CRM lead</p>
                    </div>
                    <Switch checked={autoCreateLead} onCheckedChange={setAutoCreateLead} />
                  </div>
                  <div className="space-y-1.5 pt-4 border-t border-[var(--crm-border)]">
                    <Label className="text-[12px] font-medium">Redirect URL <span className="text-[var(--crm-text-tertiary)] font-normal text-[10px]">(Optional)</span></Label>
                    <p className="text-[10px] text-[var(--crm-text-tertiary)]">Send users here after submit</p>
                    <Input 
                      value={redirectUrl} 
                      onChange={e => setRedirectUrl(e.target.value)} 
                      placeholder="https://yourwebsite.com/thank-you"
                      className="h-8 text-[12px] bg-[var(--crm-surface-2)] border-[var(--crm-border)]"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
    </div>
  )
}
