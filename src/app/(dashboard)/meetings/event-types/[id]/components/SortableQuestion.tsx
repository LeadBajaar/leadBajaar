import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, CheckCircle2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
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
  index: number
  updateQuestion: (index: number, field: keyof Question, value: any) => void
  removeQuestion: (index: number) => void
}

const labelStyle = "text-[11px] font-bold uppercase tracking-wider text-[var(--crm-text-secondary)] mb-1 block"
const inputStyle = "h-10 text-sm bg-[var(--crm-surface-2)] border-[var(--crm-border)] focus:bg-[var(--crm-surface-1)] transition-all rounded-lg no-scrollbar"

export const SortableQuestion = ({ question, index, updateQuestion, removeQuestion }: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0
  }

  const questionTypes = [
    { value: 'text', label: 'Short Text' },
    { value: 'textarea', label: 'Long Text' },
    { value: 'radio', label: 'Radio Buttons' },
    { value: 'checkbox', label: 'Checkboxes' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'date', label: 'Date' },
    { value: 'time', label: 'Time' },
    { value: 'phone', label: 'Phone Number' },
    { value: 'email', label: 'Email' }
  ]

  const renderPreview = () => {
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
            className={cn(inputStyle, "min-h-[60px] py-2")}
          />
        )
      case 'radio':
      case 'checkbox':
        return (
          <div className="space-y-2 mt-1">
            {question.options?.map((option, i) => (
              <div key={i} className="flex items-center space-x-2.5 bg-[var(--crm-surface-2)] p-2 rounded-lg border border-[var(--crm-border)]">
                <div className={cn(
                  "h-3.5 w-3.5 rounded-full border border-slate-300 ",
                  question.type === 'checkbox' ? 'rounded-sm' : 'rounded-full'
                )} />
                <span className="text-xs font-medium text-[var(--crm-text-primary)]">{option}</span>
              </div>
            ))}
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

  const handleOptionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    const options = text
      .replace(/\r\n/g, '\n')
      .split('\n')
      .filter(line => line.trim() !== '')
    updateQuestion(index, 'options', options)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const textarea = e.currentTarget
      const cursorPosition = textarea.selectionStart ?? 0
      const currentValue = textarea.value
      
      const newValue = 
        currentValue.slice(0, cursorPosition) + 
        '\n' + 
        currentValue.slice(cursorPosition)
      
      textarea.value = newValue
      
      const options = newValue.split(/\r?\n/).filter(line => line.trim() !== '')
      updateQuestion(index, 'options', options)
      
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = cursorPosition + 1
      })
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-[var(--crm-surface-1)]  border border-[var(--crm-border)]  rounded-xl shadow-sm transition-all duration-200 group relative",
        isDragging && "opacity-50 scale-[0.98] shadow-lg border-[var(--crm-accent)]"
      )}
    >
      <div className="flex items-start gap-3 p-4 sm:p-5">
        <div 
          {...attributes} 
          {...listeners} 
          className="mt-0.5 cursor-grab active:cursor-grabbing p-1 rounded-lg hover:bg-[var(--crm-surface-3)] transition-colors text-[var(--crm-text-secondary)] group-hover:text-[var(--crm-text-secondary)]"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        <div className="flex-1 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className={labelStyle}>Question Text <span className="text-red-500">*</span></Label>
              <Input
                value={question.question}
                onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                placeholder="Enter your question"
                className={inputStyle}
              />
            </div>
            <div className="space-y-1">
              <Label className={labelStyle}>Answer Type</Label>
              <Select
                value={question.type}
                onValueChange={(value: Question['type']) => updateQuestion(index, 'type', value)}
              >
                <SelectTrigger className={inputStyle}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {questionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className={labelStyle}>Help Text (Optional)</Label>
            <Input
              value={question.description || ''}
              onChange={(e) => updateQuestion(index, 'description', e.target.value)}
              placeholder="e.g., Please include your country code"
              className={inputStyle}
            />
          </div>

          {(question.type === 'radio' || question.type === 'checkbox' || question.type === 'dropdown') && (
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-4">
                <Label className={labelStyle}>Options</Label>
                <span className="text-[9px] font-bold text-[var(--crm-text-secondary)] uppercase tracking-widest bg-[var(--crm-surface-2)] px-1.5 py-0.5 rounded-full border border-[var(--crm-border)]">
                  New line for each
                </span>
              </div>
              <Textarea
                placeholder={`Option 1\nOption 2`}
                value={question.options?.join('\n') || ''}
                onChange={handleOptionsChange}
                onKeyDown={handleKeyDown}
                className={cn(inputStyle, "min-h-[80px] py-2 leading-relaxed")}
              />
            </div>
          )}

          <div className="flex items-center gap-4 pt-1">
            <div className="flex items-center gap-2.5 bg-[var(--crm-surface-2)] px-3 py-1 rounded-lg border border-[var(--crm-border)] transition-colors">
              <Switch
                id={`required-${question.id}`}
                checked={question.required}
                onCheckedChange={(checked) => updateQuestion(index, 'required', checked)}
                className="scale-90 data-[state=checked]:bg-[var(--crm-accent)]"
              />
              <Label htmlFor={`required-${question.id}`} className="text-[10px] font-bold text-[var(--crm-text-secondary)] uppercase tracking-wider cursor-pointer select-none">Required</Label>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeQuestion(index)}
              className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50 font-bold text-[10px] uppercase tracking-widest gap-1.5 rounded-lg transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </Button>
          </div>

          {/* Preview section */}
          <div className="mt-4 pt-4 border-t border-[var(--crm-border)]">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1 w-1 rounded-full bg-[var(--crm-accent-soft)]0" />
              <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/80">Preview</Label>
            </div>
            <div className="p-4 bg-[var(--crm-surface-2)] rounded-xl border border-[var(--crm-border)]">
              <p className="text-[13px] font-bold text-[var(--crm-text-primary)] mb-0.5">
                {question.question || 'New Question'}
                {question.required && <span className="text-red-500 ml-1 font-black">*</span>}
              </p>
              {question.description && (
                <p className="text-[11px] text-[var(--crm-text-secondary)] font-medium mb-3 leading-tight font-sans tracking-tight">{question.description}</p>
              )}
              <div className="relative">
                {renderPreview()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}