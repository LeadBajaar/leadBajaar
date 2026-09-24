'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Video, Loader2 } from 'lucide-react'
import { tutorialApi } from '@/lib/api'
import { useUser } from '@/contexts/UserContext'
import { toast } from 'sonner'
import { PageHeader } from "@/components/page-header/PageHeader"

type Tutorial = {
  id: number
  title: string
  embed_code: string
  order: number
}

export default function TutorialsPage() {
  const { hasRole } = useUser()
  const isAdmin = hasRole(['Super Admin', 'Admin'])
  
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null)
  const [tutorialToDelete, setTutorialToDelete] = useState<Tutorial | null>(null)
  
  const [title, setTitle] = useState('')
  const [embedCode, setEmbedCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchTutorials = async () => {
    setIsLoading(true)
    try {
      const data = await tutorialApi.getTutorials()
      setTutorials(data)
    } catch (error) {
      toast.error('Failed to load tutorials')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTutorials()
  }, [])

  const handleOpenDialog = (tutorial?: Tutorial) => {
    if (tutorial) {
      setEditingTutorial(tutorial)
      setTitle(tutorial.title)
      setEmbedCode(tutorial.embed_code)
    } else {
      setEditingTutorial(null)
      setTitle('')
      setEmbedCode('')
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!title.trim() || !embedCode.trim()) {
      toast.error('Title and embed code are required')
      return
    }

    setIsSubmitting(true)
    try {
      if (editingTutorial) {
        await tutorialApi.updateTutorial(editingTutorial.id, { title, embed_code: embedCode })
        toast.success('Tutorial updated successfully')
      } else {
        await tutorialApi.createTutorial({ title, embed_code: embedCode, order: tutorials.length })
        toast.success('Tutorial added successfully')
      }
      setIsDialogOpen(false)
      fetchTutorials()
    } catch (error) {
      toast.error('Failed to save tutorial')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = (tutorial: Tutorial) => {
    setTutorialToDelete(tutorial)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!tutorialToDelete) return
    
    try {
      await tutorialApi.deleteTutorial(tutorialToDelete.id)
      toast.success('Tutorial deleted successfully')
      fetchTutorials()
    } catch (error) {
      toast.error('Failed to delete tutorial')
    } finally {
      setIsDeleteDialogOpen(false)
      setTutorialToDelete(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--lb-navy)]" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <PageHeader
        title="Tutorials & Training"
        description="Watch video tutorials to master the platform."
        icon={<Video className="h-6 w-6 text-[var(--lb-navy)]" />}
        actions={
          isAdmin && (
            <Button onClick={() => handleOpenDialog()} className="bg-[var(--lb-navy)] hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" /> Add Tutorial
            </Button>
          )
        }
      />

      {tutorials.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-xl border-slate-200 dark:border-slate-800">
          <Video className="h-10 w-10 text-slate-400 mb-2" />
          <p className="text-slate-500 font-medium">No tutorials available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
          {tutorials.map((tutorial) => (
            <Card key={tutorial.id} className="overflow-hidden flex flex-col shadow-sm border-slate-200 dark:border-slate-800">
              <div 
                className="w-full aspect-video bg-black flex items-center justify-center [&>iframe]:w-full [&>iframe]:h-full"
                dangerouslySetInnerHTML={{ __html: tutorial.embed_code }}
              />
              <CardContent className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-4 flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2">{tutorial.title}</h3>
                  {isAdmin && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(tutorial)}>
                        <Edit className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteClick(tutorial)}>
                        <Trash2 className="h-4 w-4 text-slate-500" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingTutorial ? 'Edit Tutorial' : 'Add Tutorial'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g. How to connect WhatsApp"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Video Embed Code (HTML)</label>
              <Textarea 
                value={embedCode} 
                onChange={(e) => setEmbedCode(e.target.value)} 
                placeholder='<iframe src="https://www.youtube.com/embed/..." ...></iframe>'
                className="min-h-[120px] font-mono text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSubmitting} className="bg-[var(--lb-navy)] text-white hover:opacity-90">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Tutorial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Tutorial</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-500">
              Are you sure you want to delete "{tutorialToDelete?.title}"? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete Tutorial</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
