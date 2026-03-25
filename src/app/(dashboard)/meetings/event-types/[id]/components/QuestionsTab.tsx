import React, { useState } from 'react'
import { TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'
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

  const handleUpdateDraft = (field: keyof Question, value: any) => {
    if (draftQuestion) {
      setDraftQuestion({ ...draftQuestion, [field]: value })
    }
  }

  const handleSave = () => {
    if (!draftQuestion) return

    if (editingIndex === 'new') {
      setEventType({
        ...eventType,
        questions: [...eventType.questions, draftQuestion]
      })
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
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-0.5">Booking Questions</h3>
            <p className="text-[11px] text-slate-500 font-medium tracking-tight">Gather information from your invitees before meetings.</p>
          </div>
          {editingIndex === null && (
            <Button 
              onClick={handleStartAdd}
              className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs gap-2 transition-all shadow-md shrink-0 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          )}
        </div>

        {/* Editor Area */}
        {editingIndex !== null && draftQuestion && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
            <QuestionEditor
              question={draftQuestion}
              updateQuestion={handleUpdateDraft}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        )}

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
                <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl overflow-hidden py-10 transition-all hover:bg-slate-100/50">
                  <CardContent className="flex flex-col items-center justify-center text-center p-0">
                    <div className="h-16 w-16 rounded-3xl bg-white dark:bg-slate-800 flex items-center justify-center mb-5 shadow-sm border border-slate-100 dark:border-slate-700">
                      <Plus className="h-8 w-8 text-indigo-500" />
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-1.5 leading-none">Questions Needed</p>
                    <p className="text-[11px] text-slate-400 font-medium max-w-[240px] mb-8 uppercase tracking-widest">Add your first booking question to start collecting data.</p>
                    <Button 
                      onClick={handleStartAdd}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-8 text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-200/50"
                    >
                      Initialize Questions
                    </Button>
                  </CardContent>
                </Card>
              )}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </TabsContent>
  )
}
 