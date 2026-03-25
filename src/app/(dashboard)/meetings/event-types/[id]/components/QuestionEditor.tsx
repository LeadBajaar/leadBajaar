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
  updateQuestion: (field: keyof Question, value: any) => void
  onSave: () => void
  onCancel: () => void
}

const labelStyle = "text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block"
const inputBase = "text-sm bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all rounded-lg outline-none"
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

  const handleAddOption = () => {
    const currentOptions = question.options || []
    updateQuestion('options', [...currentOptions, ''])
  }

  const handleUpdateOption = (index: number, value: string) => {
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
              <div key={i} className="flex items-center space-x-2.5 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className={cn(
                  "h-4 w-4 rounded-full border border-slate-300 dark:border-slate-700",
                  question.type === 'checkbox' ? 'rounded-sm' : 'rounded-full'
                )} />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{option || `Option ${i + 1}`}</span>
              </div>
            )) : (
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center py-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-lg">No options defined</p>
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-xl overflow-hidden shadow-lg animate-in fade-in zoom-in-95 duration-200 z-50">
      <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
        
        {/* Editor (Left Column) */}
        <div className="lg:w-3/5 p-5 sm:p-6 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h4 className="text-xs font-black uppercase tracking-[0.1em] text-slate-900 dark:text-white">Question Configuration</h4>
            <div className="flex items-center gap-2">
              <Switch
                id="required-editor"
                checked={question.required}
                onCheckedChange={(checked) => updateQuestion('required', checked)}
                className="scale-75 data-[state=checked]:bg-indigo-600"
              />
              <Label htmlFor="required-editor" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer select-none">Required</Label>
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
                  className={inputStyle}
                />
              </div>
              <div className="space-y-1.5">
                <Label className={labelStyle}>Answer Type</Label>
                <Select
                  value={question.type}
                  onValueChange={(value: Question['type']) => updateQuestion('type', value)}
                >
                  <SelectTrigger className={inputStyle}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {questionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 shrink-0">{type.icon}</span>
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
                    className="h-6 px-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-bold text-[9px] uppercase tracking-widest gap-1 rounded-md transition-all"
                  >
                    <Plus className="h-3 w-3" />
                    Add Option
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                  {(question.options || []).map((option, idx) => (
                    <div key={idx} className="flex items-center gap-2 group animate-in slide-in-from-left-1 duration-200">
                      <Input
                        value={option}
                        onChange={(e) => handleUpdateOption(idx, e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        className={cn(inputStyle, "flex-1")}
                        autoFocus={idx === (question.options?.length || 0) - 1 && option === ''}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveOption(idx)}
                        className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  
                  {(!question.options || question.options.length === 0) && (
                    <div 
                      onClick={handleAddOption}
                      className="group cursor-pointer py-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center bg-slate-50/50 hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-200 transition-all"
                    >
                      <Plus className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 mb-1" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-500">Add first option</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-9 px-4 text-slate-500 hover:text-slate-700 font-bold text-[10px] uppercase tracking-widest rounded-lg gap-2"
            >
              Cancel
            </Button>
            <Button
              onClick={onSave}
              className="h-9 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-widest rounded-lg gap-2 shadow-sm"
              disabled={!question.question.trim()}
            >
              <Save className="h-3.5 w-3.5" />
              Store Question
            </Button>
          </div>
        </div>

        {/* Live Preview (Right Column) */}
        <div className="lg:w-2/5 p-5 sm:p-6 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 w-1 rounded-full bg-indigo-400" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500/80">Live Preview</h4>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500/10" />
            <div className="space-y-4">
              <div>
                <Label className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight mb-1">
                  {question.question || 'Untitled Question'}
                  {question.required && <span className="text-red-500 ml-1 font-black">*</span>}
                </Label>
                {question.description && (
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed font-sans tracking-tight mt-1">{question.description}</p>
                )}
              </div>
              
              <div className="mt-2">
                {renderPreviewInput()}
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex items-center gap-2.5 p-3 bg-white/40 dark:bg-slate-800/30 rounded-lg border border-slate-100/50 dark:border-slate-800/50">
            <div className="h-7 w-7 bg-indigo-50 dark:bg-indigo-900/40 rounded-full flex items-center justify-center shrink-0">
              <Info className="h-3.5 w-3.5 text-indigo-500" />
            </div>
            <p className="text-[10px] text-slate-500 font-medium leading-tight">
              Questions will be displayed to invitees during the booking process.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
