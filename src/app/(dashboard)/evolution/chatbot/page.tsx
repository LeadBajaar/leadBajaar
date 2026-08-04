'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ChatbotFlow, chatbotService } from '@/services/chatbot'
import { PlusCircle, Edit2, Copy, Trash, Zap, Loader2, Workflow, MessageSquare, GitFork } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { RoleGuard } from '@/components/RoleGuard'
import { cn } from '@/lib/utils'

export default function EvolutionChatbotPage() {
  const router = useRouter()
  const [flows, setFlows] = useState<ChatbotFlow[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const { toast } = useToast()

  const loadFlows = async () => {
    try {
      setLoading(true)
      const data = await chatbotService.getFlows('evolution')
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
          ? `"${flow.name}" is now active.`
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--crm-border)] pb-6 mb-2">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-[12px] bg-[var(--crm-accent)]/10 flex items-center justify-center shrink-0">
                <Workflow className="h-6 w-6 text-[var(--crm-accent)]" />
              </div>
              <div>
                <h1 className="text-[20px] font-bold text-[var(--crm-text-primary)]">Evolution Chatbots</h1>
                <p className="text-[13px] text-[var(--crm-text-secondary)] mt-0.5">Build and manage automated conversation flows for Evolution API.</p>
              </div>
            </div>
            <Button 
              onClick={() => router.push('/evolution/chatbot/builder/new')}
              className="w-full sm:w-auto bg-[var(--crm-accent)] text-white hover:opacity-90 rounded-[var(--r-md)] shadow-sm font-semibold h-10 px-5 transition-all active:scale-95 shrink-0"
            >
              <PlusCircle className="w-4 h-4 mr-2" /> 
              Create Flow
            </Button>
          </div>

          {/* Content area */}
          {loading ? (
            <div className="flex justify-center items-center h-[400px]">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--crm-accent)]" />
            </div>
          ) : (
            <>
              {flows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-[var(--crm-surface-1)] border border-[var(--crm-border)] rounded-[var(--r-xl)] shadow-sm">
                  <div className="h-20 w-20 mb-5 rounded-full bg-[var(--crm-surface-2)] flex items-center justify-center text-[var(--crm-text-tertiary)] border border-[var(--crm-border)] border-dashed">
                    <Zap className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--crm-text-primary)]">No flows created yet</h3>
                  <p className="text-[14px] text-[var(--crm-text-secondary)] mb-8 text-center max-w-md mt-2 leading-relaxed">
                    Automate your inbound conversations, qualify leads, and provide instant support on Evolution API by building your first flow.
                  </p>
                  <Button 
                    onClick={() => router.push('/evolution/chatbot/builder/new')}
                    className="bg-[var(--crm-accent)] text-white hover:opacity-90 rounded-[var(--r-md)] h-11 px-6 shadow-md"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" /> Build Your First Flow
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {flows.map((flow) => (
                    <div
                      key={flow.id}
                      className={cn(
                        'flex flex-col bg-[var(--crm-surface-1)] border border-[var(--crm-border)] rounded-[var(--r-xl)] shadow-sm transition-all duration-300 overflow-hidden group hover:shadow-md hover:border-[var(--crm-border-hover)]',
                        !flow.is_active && 'opacity-75 grayscale-[0.3]'
                      )}
                    >
                      <div className="p-5 flex-1 flex flex-col relative">
                        <div className="flex gap-4 items-start mb-4">
                          <div className="h-10 w-10 shrink-0 rounded-full bg-[var(--crm-surface-2)] border border-[var(--crm-border)] flex items-center justify-center group-hover:bg-[var(--crm-surface-3)] transition-colors">
                            <MessageSquare className="h-4 w-4 text-[var(--crm-text-secondary)]" />
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <h3 className="text-[15px] font-bold text-[var(--crm-text-primary)] truncate" title={flow.name}>{flow.name}</h3>
                            <p className="text-[12px] text-[var(--crm-text-secondary)] line-clamp-2 mt-1 leading-snug">
                              {flow.description || 'No description provided.'}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-5">
                           <Badge className="bg-[var(--crm-surface-2)] text-[var(--crm-text-secondary)] border-[var(--crm-border)] font-semibold text-[10px] uppercase tracking-wider px-2 py-0.5">
                             {flow.trigger}
                           </Badge>
                           <Badge className="bg-[var(--crm-surface-2)] text-[var(--crm-text-secondary)] border-[var(--crm-border)] font-semibold text-[10px] uppercase tracking-wider px-2 py-0.5 flex items-center gap-1">
                             <GitFork className="h-3 w-3" /> {flow.nodes?.length || 0} Nodes
                           </Badge>
                        </div>

                        {/* Status Toggle */}
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--crm-border)]">
                          <div className="flex items-center gap-2">
                            {flow.is_active
                              ? <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                              : <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                            }
                            <span className={cn(
                              'font-bold text-[11px] uppercase tracking-wider',
                              flow.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--crm-text-tertiary)]'
                            )}>
                              {togglingId === flow.id ? 'Updating...' : flow.is_active ? 'Active' : 'Inactive'}
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
                      <div className="flex border-t border-[var(--crm-border)] bg-[var(--crm-surface-2)]/50 divide-x divide-[var(--crm-border)]">
                        <button
                          className="flex-1 flex items-center justify-center gap-1.5 py-3.5 text-[12px] font-semibold text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-surface-2)] transition-colors"
                          onClick={() => router.push(`/evolution/chatbot/builder/${flow.id}`)}
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          className="flex-1 flex items-center justify-center gap-1.5 py-3.5 text-[12px] font-semibold text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-surface-2)] transition-colors"
                          onClick={() => handleDuplicate(flow.id)}
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </button>
                        <button
                          className="flex-1 flex items-center justify-center gap-1.5 py-3.5 text-[12px] font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                          onClick={() => handleDelete(flow.id)}
                        >
                          <Trash className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
      </div>
    </RoleGuard>
  )
}
