'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, AlertTriangle, Plus } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Question } from '@/types/events'

const ANSWER_TYPES: { value: Question['type']; label: string }[] = [
  { value: 'text', label: 'One Line' },
  { value: 'textarea', label: 'Multiple Lines' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'email', label: 'Email' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'date', label: 'Date' },
  { value: 'time', label: 'Time' },
]

const HAS_OPTIONS = new Set(['radio', 'checkbox', 'dropdown'])

const FieldError = () => (
  <p className="flex items-center gap-1.5 text-xs text-red-600 mt-1">
    <AlertTriangle className="h-3 w-3 shrink-0" />
    This field is required
  </p>
)

interface InviteeQuestionCardProps {
  question: Question
  index: number
  displayIndex?: number
  updateQuestion: (index: number, field: string, value: any) => void
  removeQuestion: (index: number) => void
}

export const InviteeQuestionCard = ({ question, index, displayIndex, updateQuestion, removeQuestion }: InviteeQuestionCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question.id })
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 0 }

  const [draggingOption, setDraggingOption] = useState<number | null>(null)

  const options = question.options || []
  const questionEmpty = question.question.trim() === ''

  const updateOption = (optionIndex: number, value: string) => {
    const next = [...options]
    next[optionIndex] = value
    updateQuestion(index, 'options', next)
  }
  const addOption = () => updateQuestion(index, 'options', [...options, ''])
  const removeOption = (optionIndex: number) => updateQuestion(index, 'options', options.filter((_, i) => i !== optionIndex))

  const reorderOptions = (from: number, to: number) => {
    if (from === to) return
    const next = [...options]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    updateQuestion(index, 'options', next)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'border border-[var(--crm-border)] rounded-lg p-3.5 bg-[var(--crm-surface-1)]',
        isDragging && 'opacity-60 shadow-lg'
      )}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-[var(--crm-text-secondary)] touch-none"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-[var(--crm-text-primary)]">Question {(displayIndex ?? index) + 1}</span>
        </div>
        {!question.isLocked && (
          <button type="button" onClick={() => removeQuestion(index)} className="text-[var(--crm-text-secondary)] hover:text-red-500">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <textarea
        value={question.question}
        onChange={(e) => updateQuestion(index, 'question', e.target.value)}
        disabled={question.isLocked}
        placeholder="Type your question"
        rows={2}
        className={cn(
          'w-full text-sm bg-[var(--crm-surface-1)] border rounded-md px-3 py-2 resize-none focus:outline-none disabled:opacity-60',
          questionEmpty ? 'border-red-400 focus:border-red-500' : 'border-[var(--crm-border)] focus:border-[var(--crm-accent)]'
        )}
      />
      {questionEmpty && <FieldError />}

      <label className="flex items-center gap-2 mt-2.5 mb-3 text-sm text-[var(--crm-text-primary)] cursor-pointer">
        <input
          type="checkbox"
          checked={question.required}
          disabled={question.isLocked}
          onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
          className="h-3.5 w-3.5 rounded border-[var(--crm-border)] accent-[var(--crm-accent)]"
        />
        Required
      </label>

      <p className="text-sm text-[var(--crm-text-primary)] mb-1.5">Answer Type</p>
      <Select value={question.type} onValueChange={(v) => updateQuestion(index, 'type', v)} disabled={question.isLocked}>
        <SelectTrigger className="h-9 text-sm bg-[var(--crm-surface-2)] border-[var(--crm-border)] rounded-md mb-3.5">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {ANSWER_TYPES.map(t => (
            <SelectItem key={t.value} value={t.value} className="text-sm">{t.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {HAS_OPTIONS.has(question.type) && (
        <div className="mb-3.5">
          <div className="space-y-2 mb-2">
            {options.map((option, optionIndex) => {
              const optionEmpty = option.trim() === ''
              return (
                <div
                  key={optionIndex}
                  draggable
                  onDragStart={() => setDraggingOption(optionIndex)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => { if (draggingOption !== null) reorderOptions(draggingOption, optionIndex); setDraggingOption(null) }}
                  onDragEnd={() => setDraggingOption(null)}
                  className={cn('flex items-start gap-2', draggingOption === optionIndex && 'opacity-50')}
                >
                  <span className="text-[var(--crm-text-secondary)] cursor-grab active:cursor-grabbing mt-2.5 shrink-0">
                    <GripVertical className="h-4 w-4" />
                  </span>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(optionIndex, e.target.value)}
                      placeholder={`Option ${optionIndex + 1}`}
                      className={cn(
                        'w-full h-9 text-sm bg-[var(--crm-surface-1)] border rounded-md px-3 focus:outline-none',
                        optionEmpty ? 'border-red-400 focus:border-red-500' : 'border-[var(--crm-border)] focus:border-[var(--crm-accent)]'
                      )}
                    />
                    {optionEmpty && <FieldError />}
                  </div>
                  <button type="button" onClick={() => removeOption(optionIndex)} className="text-[var(--crm-text-secondary)] hover:text-red-500 mt-1.5 shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )
            })}
          </div>

          <button type="button" onClick={addOption} className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--crm-accent)] mb-3">
            <Plus className="h-3.5 w-3.5" /> Add another
          </button>

          {question.type !== 'dropdown' && (
            <label className="flex items-center gap-2 mb-1 text-sm text-[var(--crm-text-primary)] cursor-pointer">
              <input
                type="checkbox"
                checked={question.allowOther || false}
                onChange={(e) => updateQuestion(index, 'allowOther', e.target.checked)}
                className="h-3.5 w-3.5 rounded border-[var(--crm-border)] accent-[var(--crm-accent)]"
              />
              Include &quot;other&quot; option
            </label>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--crm-text-primary)]">Status</p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--crm-text-secondary)]">{question.active === false ? 'Off' : 'On'}</span>
          <Switch
            checked={question.active !== false}
            onCheckedChange={(checked) => updateQuestion(index, 'active', checked)}
            className="data-[state=checked]:bg-[var(--crm-accent)]"
          />
        </div>
      </div>
    </div>
  )
}
