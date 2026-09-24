'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ChatbotFlow, chatbotService } from '@/services/chatbot'
import { PlusCircle, Edit2, Copy, Trash, Zap, Loader2, Workflow, MessageSquare, Calendar, GitFork } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { RoleGuard } from '@/components/RoleGuard'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/page-header/PageHeader'

import { TemplateSelectionModal } from '@/components/chatbot/TemplateSelectionModal'
import { ChatbotTemplate } from '@/constants/chatbot-templates'

export default function ChatbotPage() {
  const router = useRouter()
  const [flows, setFlows] = useState<ChatbotFlow[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const { toast } = useToast()

  const loadFlows = async () => {
    try {
      setLoading(true)
      const data = await chatbotService.getFlows()
      setFlows(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load chatbot flows',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFlows()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await chatbotService.deleteFlow(id)
      toast({
        title: 'Success',
        description: 'Flow deleted successfully',
      })
      loadFlows()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete flow',
        variant: 'destructive',
      })
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      await chatbotService.duplicateFlow(id)
      toast({
        title: 'Success',
        description: 'Flow duplicated successfully',
      })
      loadFlows()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate flow',
        variant: 'destructive',
      })
    }
  }

  const handleToggle = async (flow: ChatbotFlow) => {
    setTogglingId(flow.id)
    try {
      const result = await chatbotService.toggleFlow(flow.id)
      setFlows(prev =>
        prev.map(f => (f.id === flow.id ? { ...f, is_active: result.is_active } : f))
      )
      toast({
        title: result.is_active ? 'Flow Activated' : 'Flow Deactivated',
        description: result.is_active
          ? `"${flow.name}" will now send welcome messages.`
          : `"${flow.name}" has been paused.`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update flow status',
        variant: 'destructive',
      })
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <RoleGuard allowedFeatures={['chatbot']}>
      <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full pb-10">
          
          {/* Page Header */}
          <PageHeader
            title="Chatbot Flows"
            description="Automate conversations and build interactive funnels."
            icon={<Workflow className="h-5 w-5 text-[#1e2d6b] dark:text-indigo-400" />}
            actions={
              <Button 
                variant="default"
                onClick={() => setIsTemplateModalOpen(true)}
                className="w-full sm:w-auto bg-[#1e2d6b] hover:bg-[#162152] text-white text-[12.5px] font-extrabold rounded-full shadow-sm shadow-[#1e2d6b]/20 transition-all h-10 px-5 flex items-center justify-center gap-2 shrink-0 h-auto w-auto"
              >
                <PlusCircle className="w-4 h-4" /> 
                Create Flow
              </Button>
            }
          />

          {/* Content area */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full skeleton shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 w-3/4 skeleton" />
                      <div className="h-3 w-1/2 skeleton" />
                    </div>
                  </div>
                  <div className="h-12 w-full skeleton rounded-lg" />
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="h-4 w-16 skeleton" />
                    <div className="h-6 w-12 skeleton rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {flows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                  <div className="h-20 w-20 mb-5 rounded-full bg-rose-500/5 flex items-center justify-center text-[#FE4548] border border-rose-500/15 border-dashed">
                    <Zap className="h-8 w-8 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">No flows created yet</h3>
                  <p className="text-[14px] text-slate-500 dark:text-slate-450 mb-8 text-center max-w-md mt-2 leading-relaxed font-medium">
                    Automate your inbound conversations, qualify leads, and provide instant support by building your first chatbot flow.
                  </p>
                  <Button 
                    variant="default"
                    onClick={() => router.push('/chatbot/builder/new')}
                    className="bg-gradient-to-r from-[#FE4548] to-[#FF6E54] hover:from-[#FF6E54] hover:to-[#FE4548] text-white text-[13px] font-extrabold rounded-full h-11 px-6 shadow-md shadow-rose-500/25 transition-all border border-[#FE4548]/10 flex items-center justify-center gap-2 h-auto w-auto"
                  >
                    <PlusCircle className="w-4 h-4" /> Create First Flow
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {flows.map((flow) => (
                    <div
                      key={flow.id}
                      className={cn(
                        'flex flex-col bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-300 overflow-hidden group hover:shadow-md hover:border-slate-350 dark:hover:border-slate-700',
                        !flow.is_active && 'opacity-90'
                      )}
                    >
                      <div className="p-5 flex-1 flex flex-col relative">
                        <div className="flex gap-4 items-start mb-4">
                          <div className="h-10 w-10 shrink-0 rounded-full bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 flex items-center justify-center group-hover:bg-slate-100 dark:group-hover:bg-slate-750 transition-colors">
                            <MessageSquare className="h-4 w-4 text-[#FE4548]" />
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100 truncate" title={flow.name}>{flow.name}</h3>
                            <p className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-snug font-medium">
                              {flow.description || 'No description provided.'}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-5">
                           <Badge className="bg-slate-100 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-350 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
                             {flow.trigger}
                           </Badge>
                           <Badge className="bg-slate-100 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-350 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                             <GitFork className="h-3 w-3" /> {flow.nodes?.length || 0} Nodes
                           </Badge>
                        </div>

                        {/* Status Toggle */}
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-150/80 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            {flow.is_active
                              ? <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                              : <div className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-650" />
                            }
                            <span className={cn(
                              'font-extrabold text-[11px] uppercase tracking-wider',
                              flow.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-450 dark:text-slate-500'
                            )}>
                              {flow.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <Switch
                            checked={flow.is_active}
                            disabled={togglingId === flow.id}
                            onCheckedChange={() => handleToggle(flow)}
                            aria-label={`Toggle ${flow.name}`}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 divide-x divide-slate-200 dark:divide-slate-800">
                        <Button
                          variant="ghost"
                          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[12px] font-bold text-slate-750 dark:text-slate-300 hover:text-indigo-650 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all rounded-none h-auto"
                          onClick={() => router.push(`/chatbot/builder/${flow.id}`)}
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[12px] font-bold text-slate-750 dark:text-slate-300 hover:text-emerald-650 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all rounded-none h-auto"
                          onClick={() => handleDuplicate(flow.id)}
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </Button>
                        <Button
                          variant="ghost"
                          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[12px] font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all rounded-none h-auto"
                          onClick={() => handleDelete(flow.id)}
                        >
                          <Trash className="w-3.5 h-3.5" /> Delete
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Pre-built Template Selection Modal */}
      <TemplateSelectionModal
        isOpen={isTemplateModalOpen}
        onOpenChange={setIsTemplateModalOpen}
        onSelectTemplate={(template) => {
          setIsTemplateModalOpen(false)
          if (template.id === 'blank') {
            router.push('/chatbot/builder/new')
          } else {
            router.push(`/chatbot/builder/new?template=${template.id}`)
          }
        }}
      />
    </RoleGuard>
  )
}
