import React, { useState } from 'react'
import { CheckCircle2, Save, X, Trash2, Info, Type, AlignLeft, Phone, Mail, CheckSquare, ArrowDownCircle, Calendar, Clock, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Question } from '@/types/events'

interface Props {
  question: Question
  updateQuestion: (field: keyof Question | Partial<Question>, value?: any) => void
  onSave: () => void
  onCancel: () => void
}

const labelStyle = "text-[11px] font-bold uppercase tracking-wider text-[var(--crm-text-secondary)] mb-1.5 block"
const inputBase = "text-sm bg-[var(--crm-surface-2)]  border-[var(--crm-border)]  focus:bg-[var(--crm-surface-1)] focus:border-[var(--crm-accent)] focus:ring-0 transition-all rounded-lg outline-none text-[var(--crm-text-primary)] "
const inputStyle = cn(inputBase, "h-10")

export const QuestionEditor = ({ question, updateQuestion, onSave, onCancel }: Props) => {
  const questionTypes = [
    { value: 'text', label: 'Short Text', icon: <Type className="h-4 w-4" /> },
    { value: 'textarea', label: 'Long Text', icon: <AlignLeft className="h-4 w-4" /> },
    { value: 'phone', label: 'Phone Number', icon: <Phone className="h-4 w-4" /> },
    { value: 'email', label: 'Email', icon: <Mail className="h-4 w-4" /> },
    { value: 'radio', label: 'Radio Buttons', icon: <CheckCircle2 className="h-4 w-4" /> },
    { value: 'checkbox', label: 'Checkboxes', icon: <CheckSquare className="h-4 w-4" /> },
    { value: 'dropdown', label: 'Dropdown', icon: <ArrowDownCircle className="h-4 w-4" /> },
    { value: 'date', label: 'Date', icon: <Calendar className="h-4 w-4" /> },
    { value: 'time', label: 'Time', icon: <Clock className="h-4 w-4" /> }
  ]

  const [optionErrors, setOptionErrors] = useState<number[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveClick = async () => {
    if (['radio', 'checkbox', 'dropdown'].includes(question.type)) {
      const options = question.options || []
      const errors: number[] = []
      options.forEach((opt, idx) => {
        if (!opt.trim()) errors.push(idx)
      })
      
      if (errors.length > 0) {
        setOptionErrors(errors)
        return
      }
    }
    
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 600))
    onSave()
  }

  const handleAddOption = () => {
    const currentOptions = question.options || []
    updateQuestion('options', [...currentOptions, ''])
  }

  const handleUpdateOption = (index: number, value: string) => {
    if (optionErrors.includes(index)) {
      setOptionErrors(optionErrors.filter(i => i !== index))
    }
    const currentOptions = [...(question.options || [])]
    currentOptions[index] = value
    updateQuestion('options', currentOptions)
  }

  const handleRemoveOption = (index: number) => {
    const currentOptions = (question.options || []).filter((_, i) => i !== index)
    updateQuestion('options', currentOptions)
  }

  const renderPreviewInput = () => {
    switch (question.type) {
      case 'text':
      case 'phone':
      case 'email':
        return (
          <Input 
            type={question.type === 'phone' ? 'tel' : question.type}
            placeholder={question.placeholder || `Enter your ${question.type}`}
            disabled
            className={inputStyle}
          />
        )
      case 'textarea':
        return (
          <Textarea
            placeholder={question.placeholder || 'Enter your answer'}
            disabled
            className={cn(inputBase, "min-h-[80px] py-2 no-scrollbar")}
          />
        )
      case 'radio':
      case 'checkbox':
        return (
          <div className="space-y-2 mt-2">
            {question.options?.length ? question.options.map((option, i) => (
              <div key={i} className="flex items-center space-x-2.5 bg-[var(--crm-surface-2)] p-2.5 rounded-lg border border-[var(--crm-border)]">
                <div className={cn(
                  "h-4 w-4 rounded-full border border-slate-300 ",
                  question.type === 'checkbox' ? 'rounded-sm' : 'rounded-full'
                )} />
                <span className="text-xs font-semibold text-[var(--crm-text-primary)]">{option || `Option ${i + 1}`}</span>
              </div>
            )) : (
              <p className="text-[10px] text-[var(--crm-text-secondary)] font-bold uppercase tracking-widest text-center py-4 border-2 border-dashed border-[var(--crm-border)] rounded-lg">No options defined</p>
            )}
          </div>
        )
      case 'dropdown':
        return (
          <Select disabled>
            <SelectTrigger className={inputStyle}>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option, i) => (
                <SelectItem key={i} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case 'date':
      case 'time':
        return <Input type={question.type} disabled className={inputStyle} />
      default:
        return null
    }
  }

  return (
    <div className="bg-[var(--crm-surface-1)] border border-[var(--crm-border)] rounded-xl overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-200 z-50">
      <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[var(--crm-border)]">

        {/* Editor (Left Column) */}
        <div className="flex-1 p-5 sm:p-6 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-[var(--crm-text-secondary)]">Question Configuration</h4>
            <div className="flex items-center gap-2">
              <Switch
                id="required-editor"
                checked={question.required}
                onCheckedChange={(checked) => updateQuestion('required', checked)}
                disabled={question.isLocked}
                className="scale-75 data-[state=checked]:bg-[var(--crm-accent)]"
              />
              <Label htmlFor="required-editor" className={cn(
                "text-[10px] font-bold text-[var(--crm-text-secondary)] uppercase tracking-widest cursor-pointer select-none",
                question.isLocked && "opacity-50 cursor-default"
              )}>Required</Label>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className={labelStyle}>Question Text <span className="text-red-500">*</span></Label>
                <Input
                  value={question.question}
                  onChange={(e) => updateQuestion('question', e.target.value)}
                  placeholder="e.g., What is your phone number?"
                  disabled={question.isLocked}
                  className={inputStyle}
                />
              </div>
              <div className="space-y-1.5">
                <Label className={labelStyle}>Answer Type</Label>
                <Select
                  value={question.type}
                  onValueChange={(value: Question['type']) => {
                    const updates: Partial<Question> = { type: value }
                    if (['radio', 'checkbox', 'dropdown'].includes(value)) {
                      if (!question.options || question.options.length === 0) {
                        updates.options = ['Option 1', 'Option 2']
                      }
                    }
                    updateQuestion(updates)
                  }}
                  disabled={question.isLocked}
                >
                  <SelectTrigger className={inputStyle}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {questionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--crm-text-secondary)] shrink-0">{type.icon}</span>
                          <span className="text-xs font-bold uppercase tracking-widest">{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className={labelStyle}>Help Text (Optional)</Label>
              <Input
                value={question.description || ''}
                onChange={(e) => updateQuestion('description', e.target.value)}
                placeholder="This will appear below the question to guide the invitee."
                className={inputStyle}
              />
            </div>

            {(question.type === 'radio' || question.type === 'checkbox' || question.type === 'dropdown') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <Label className={labelStyle}>Options</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleAddOption}
                    className="h-6 px-2 text-[var(--crm-accent)] hover:opacity-90 hover:bg-[var(--crm-accent-soft)] font-bold text-[9px] uppercase tracking-widest gap-1 rounded-md transition-all"
                  >
                    <Plus className="h-3 w-3" />
                    Add Option
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                  {(question.options || []).map((option, idx) => (
                    <div key={idx} className="flex flex-col gap-1 w-full animate-in slide-in-from-left-1 duration-200">
                      <div className="flex items-center gap-2 group w-full">
                        <Input
                          value={option}
                          onChange={(e) => handleUpdateOption(idx, e.target.value)}
                          placeholder={`Option ${idx + 1}`}
                          className={cn(inputStyle, "flex-1", optionErrors.includes(idx) && "border-red-500 focus:border-red-500 ring-1 ring-red-500/20")}
                          autoFocus={idx === (question.options?.length || 0) - 1 && option === ''}
                        />
                        <button
                          onClick={() => handleRemoveOption(idx)}
                          className="text-[var(--crm-text-secondary)] hover:text-red-500 transition-colors p-2 shrink-0"
                          title="Remove option"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      {optionErrors.includes(idx) && (
                        <p className="text-[10px] text-red-500 font-bold ml-1">Option cannot be empty</p>
                      )}
                    </div>
                  ))}
                  
                  {(!question.options || question.options.length === 0) && (
                    <div 
                      onClick={handleAddOption}
                      className="group cursor-pointer py-4 border-2 border-dashed border-[var(--crm-border)] rounded-xl flex flex-col items-center justify-center bg-[var(--crm-surface-2)] hover:bg-[var(--crm-surface-1)] hover:border-primary/20 transition-all"
                    >
                      <Plus className="h-4 w-4 text-[var(--crm-text-secondary)] group-hover:text-primary mb-1" />
                      <span className="text-[10px] font-bold text-[var(--crm-text-secondary)] uppercase tracking-widest group-hover:text-primary">Add first option</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--crm-border)]">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-9 px-4 text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] font-bold text-[10px] uppercase tracking-widest rounded-lg gap-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveClick}
              className="h-9 px-5 bg-[var(--crm-accent)] hover:opacity-90 text-white font-bold text-[10px] uppercase tracking-widest rounded-lg gap-2 shadow-sm transition-all"
              disabled={!question.question.trim() || isSaving}
            >
              {isSaving ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Store Question
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Live Preview (Right Column) */}
        <div className="hidden md:flex w-[320px] shrink-0 p-6 bg-[var(--crm-surface-2)] flex-col">
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-[var(--crm-text-secondary)] mb-4">Live Preview</h4>

          <div className="bg-[var(--crm-surface-1)] border border-[var(--crm-border)] shadow-sm rounded-xl p-5">
            <div className="space-y-4">
              <div>
                <Label className="text-[13px] font-bold text-[var(--crm-text-primary)] leading-tight mb-1">
                  {question.question || 'Untitled Question'}
                  {question.required && <span className="text-red-500 ml-1 font-black">*</span>}
                </Label>
                {question.description && (
                  <p className="text-[11px] text-[var(--crm-text-secondary)] font-medium leading-relaxed mt-1">{question.description}</p>
                )}
              </div>
              
              <div className="mt-2">
                {renderPreviewInput()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
