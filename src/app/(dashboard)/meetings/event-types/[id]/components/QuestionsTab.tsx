import React, { useState, useRef } from 'react'
import { TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableQuestion } from './SortableQuestion'
import { Question } from '@/types/events'

import { QuestionSummary } from './QuestionSummary'
import { QuestionEditor } from './QuestionEditor'

interface Props {
  eventType: any
  setEventType: (value: any) => void
  addQuestion: () => void
  updateQuestion: (index: number, field: string, value: any) => void
  removeQuestion: (index: number) => void
  handleQuestionDragEnd: (event: any) => void
  sensors: any
}

export const QuestionsTab = ({ 
  eventType, 
  setEventType,
  addQuestion, 
  updateQuestion, 
  removeQuestion,
  handleQuestionDragEnd,
  sensors 
}: Props) => {
  const [editingIndex, setEditingIndex] = useState<number | 'new' | null>(null)
  const [draftQuestion, setDraftQuestion] = useState<Question | null>(null)
  const endOfListRef = useRef<HTMLDivElement>(null)

  const handleStartAdd = () => {
    setDraftQuestion({
      id: Date.now().toString(),
      question: '',
      type: 'text',
      required: false,
      description: '',
      placeholder: ''
    } as Question)
    setEditingIndex('new')
  }

  const handleStartEdit = (index: number) => {
    setDraftQuestion({ ...eventType.questions[index] })
    setEditingIndex(index)
  }

  const handleUpdateDraft = (field: keyof Question | Partial<Question>, value?: any) => {
    setDraftQuestion(prev => {
      if (!prev) return null;
      if (typeof field === 'string') {
        return { ...prev, [field]: value };
      }
      return { ...prev, ...field };
    });
  }

  const handleSave = () => {
    if (!draftQuestion) return

    if (editingIndex === 'new') {
      setEventType({
        ...eventType,
        questions: [...eventType.questions, draftQuestion]
      })
      setTimeout(() => {
        endOfListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }, 100)
    } else if (typeof editingIndex === 'number') {
      const updatedQuestions = [...eventType.questions]
      updatedQuestions[editingIndex] = draftQuestion
      setEventType({
        ...eventType,
        questions: updatedQuestions
      })
    }

    setEditingIndex(null)
    setDraftQuestion(null)
  }

  const handleCancel = () => {
    setEditingIndex(null)
    setDraftQuestion(null)
  }

  return (
    <TabsContent value="questions" className="mt-0 outline-none">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-[var(--crm-text-primary)] uppercase tracking-wider mb-0.5">Booking Questions</h3>
            <p className="text-[11px] text-[var(--crm-text-secondary)] font-medium tracking-tight">Gather information from your invitees before meetings.</p>
          </div>
          {editingIndex === null && (
            <Button 
              onClick={handleStartAdd}
              variant="outline"
              className="h-9 px-4 gap-2 transition-all shadow-sm shrink-0"
            >
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          )}
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleQuestionDragEnd}
          >
            <SortableContext
              items={eventType.questions.map((q: any) => q.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {eventType.questions.map((question: Question, index: number) => (
                  <QuestionSummary
                    key={question.id}
                    question={question}
                    index={index}
                    onEdit={handleStartEdit}
                    onRemove={removeQuestion}
                  />
                ))}
              </div>

              {eventType.questions.length === 0 && editingIndex === null && (
                <div className="flex flex-col items-center justify-center py-8 bg-[var(--crm-surface-1)] border border-[var(--crm-border)] rounded-xl">
                  <p className="text-sm font-bold text-[var(--crm-text-primary)] uppercase tracking-widest mb-1">No Booking Questions</p>
                  <p className="text-[11px] text-[var(--crm-text-secondary)] font-medium mb-4">Add your first question to collect data.</p>
                  <Button 
                    onClick={handleStartAdd}
                    variant="outline"
                    className="gap-2 h-9 text-xs"
                  >
                    <Plus className="h-3 w-3" /> Initialize Questions
                  </Button>
                </div>
              )}
            </SortableContext>
          </DndContext>
        </div>
        
        <div ref={endOfListRef} className="h-1" />

        <Dialog open={editingIndex !== null} onOpenChange={(open) => !open && handleCancel()}>
          <DialogContent className="max-w-4xl p-0 border-0 bg-transparent shadow-none [&>button]:hidden">
            <DialogTitle className="sr-only">Edit Question</DialogTitle>
            {draftQuestion && (
              <QuestionEditor
                question={draftQuestion}
                updateQuestion={handleUpdateDraft}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TabsContent>
  )
}
 