import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Edit2, CheckCircle2, Save, X, Plus, AlertCircle, Phone, Mail, Calendar, Clock, AlignLeft, Type, CheckSquare, ArrowDownCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Question } from '@/types/events'

interface Props {
  question: Question
  index: number
  onEdit: (index: number) => void
  onRemove: (index: number) => void
}

export const QuestionSummary = ({ question, index, onEdit, onRemove }: Props) => {
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type className="h-3 w-3" />
      case 'textarea': return <AlignLeft className="h-3 w-3" />
      case 'phone': return <Phone className="h-3 w-3" />
      case 'email': return <Mail className="h-3 w-3" />
      case 'radio': return <CheckCircle2 className="h-3 w-3" />
      case 'checkbox': return <CheckSquare className="h-3 w-3" />
      case 'dropdown': return <ArrowDownCircle className="h-3 w-3" />
      case 'date': return <Calendar className="h-3 w-3" />
      case 'time': return <Clock className="h-3 w-3" />
      default: return <Type className="h-3 w-3" />
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-[var(--crm-surface-1)]  border border-[var(--crm-border)]  rounded-xl shadow-sm transition-all duration-200 group flex items-center gap-4 p-3 pr-4",
        isDragging && "opacity-50 scale-[0.98] shadow-lg border-[var(--crm-accent)]"
      )}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg hover:bg-[var(--crm-surface-3)] transition-colors text-[var(--crm-text-secondary)]"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-bold text-[var(--crm-text-primary)] truncate max-w-[300px]">
            {question.question || 'Untitled Question'}
          </span>
          {question.required && <span className="text-red-500 text-[10px] font-black">*</span>}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[9px] font-bold text-[var(--crm-text-secondary)] uppercase tracking-widest bg-[var(--crm-surface-2)] px-1.5 py-0.5 rounded-md border border-[var(--crm-border)]">
            {getTypeIcon(question.type)}
            {question.type}
          </div>
          {question.description && (
            <span className="text-[9px] text-[var(--crm-text-secondary)] font-medium truncate">• {question.description}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(index)}
          className="h-8 w-8 text-[var(--crm-text-secondary)] hover:text-[var(--crm-accent)] hover:bg-[var(--crm-accent-soft)] rounded-lg transition-all"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
        {!question.isLocked && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            className="h-8 w-8 text-[var(--crm-text-secondary)] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}
