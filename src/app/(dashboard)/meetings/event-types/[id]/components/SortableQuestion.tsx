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

const labelStyle = "text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 block"
const inputStyle = "h-10 text-sm bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-lg no-scrollbar"

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
              <div key={i} className="flex items-center space-x-2.5 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className={cn(
                  "h-3.5 w-3.5 rounded-full border border-slate-300 dark:border-slate-700",
                  question.type === 'checkbox' ? 'rounded-sm' : 'rounded-full'
                )} />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{option}</span>
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
        "bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-xl shadow-sm transition-all duration-200 group relative",
        isDragging && "opacity-50 scale-[0.98] shadow-lg border-indigo-500"
      )}
    >
      <div className="flex items-start gap-3 p-4 sm:p-5">
        <div 
          {...attributes} 
          {...listeners} 
          className="mt-0.5 cursor-grab active:cursor-grabbing p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
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
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded-full border border-slate-100 dark:border-slate-800">
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
            <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/50 px-3 py-1 rounded-lg border border-slate-100 dark:border-slate-800 transition-colors">
              <Switch
                id={`required-${question.id}`}
                checked={question.required}
                onCheckedChange={(checked) => updateQuestion(index, 'required', checked)}
                className="scale-90 data-[state=checked]:bg-indigo-600"
              />
              <Label htmlFor={`required-${question.id}`} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer select-none">Required</Label>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeQuestion(index)}
              className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold text-[10px] uppercase tracking-widest gap-1.5 rounded-lg transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </Button>
          </div>

          {/* Preview section */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1 w-1 rounded-full bg-indigo-500" />
              <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500/80">Preview</Label>
            </div>
            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
              <p className="text-[13px] font-bold text-slate-900 dark:text-white mb-0.5">
                {question.question || 'New Question'}
                {question.required && <span className="text-red-500 ml-1 font-black">*</span>}
              </p>
              {question.description && (
                <p className="text-[11px] text-slate-500 font-medium mb-3 leading-tight font-sans tracking-tight">{question.description}</p>
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