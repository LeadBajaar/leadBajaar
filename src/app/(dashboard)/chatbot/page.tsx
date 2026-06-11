'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { ChatbotFlow, chatbotService } from '@/services/chatbot'
import { PlusCircle, Edit2, Copy, Trash, Zap, ZapOff, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { RoleGuard } from '@/components/RoleGuard'
import { cn } from '@/lib/utils'

export default function ChatbotPage() {
  const router = useRouter()
  const [flows, setFlows] = useState<ChatbotFlow[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)
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
    <RoleGuard allowedRoles={['Super Admin', 'Admin', 'Manager']} allowedPlans={['pro', 'enterprise']}>
      <div className="h-full overflow-y-auto bg-[var(--crm-bg)]">
        <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[var(--crm-text-primary)]">Chatbot Flows</h1>
              <p className="text-sm text-[var(--crm-text-secondary)] mt-1">Design and manage automated conversation flows</p>
            </div>
            <Button 
              onClick={() => router.push('/chatbot/builder/new')}
              className="bg-[var(--crm-blue)] text-white hover:opacity-90 rounded-[var(--r-md)] shadow-sm font-semibold h-10 px-5"
            >
              <PlusCircle className="w-4 h-4 mr-2" /> 
              Create Flow
            </Button>
          </div>

          {/* Content area */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--crm-blue)]" />
            </div>
          ) : (
            <>
              {flows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-[var(--crm-surface-1)] border border-[var(--crm-border)] rounded-[var(--r-xl)] shadow-sm">
                  <div className="h-16 w-16 mb-4 rounded-full bg-[var(--crm-surface-2)] flex items-center justify-center text-[var(--crm-text-tertiary)]">
                    <Zap className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--crm-text-primary)]">No flows created yet</h3>
                  <p className="text-sm text-[var(--crm-text-secondary)] mb-6 text-center max-w-sm mt-1">Automate your inbound conversations by building your first chatbot flow.</p>
                  <Button 
                    onClick={() => router.push('/chatbot/builder/new')}
                    className="bg-[var(--crm-blue)] text-white hover:opacity-90 rounded-[var(--r-md)]"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" /> Create First Flow
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {flows.map((flow) => (
                    <div
                      key={flow.id}
                      className={cn(
                        'flex flex-col bg-[var(--crm-surface-1)] border border-[var(--crm-border)] rounded-[var(--r-xl)] shadow-sm transition-all duration-200 overflow-hidden hover:border-[var(--crm-border-hover)]',
                        !flow.is_active && 'opacity-70 grayscale-[0.2]'
                      )}
                    >
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-bold text-[var(--crm-text-primary)] truncate">{flow.name}</h3>
                            <p className="text-xs text-[var(--crm-text-secondary)] line-clamp-2 mt-1">{flow.description || 'No description provided.'}</p>
                          </div>
                          <Badge className="shrink-0 bg-[var(--crm-surface-2)] text-[var(--crm-text-secondary)] border-[var(--crm-border)] hover:bg-[var(--crm-surface-2)] font-semibold text-[10px] uppercase tracking-wider">
                            {flow.trigger}
                          </Badge>
                        </div>

                        <div className="space-y-2.5 mt-auto pt-4 text-xs font-medium text-[var(--crm-text-secondary)]">
                          <div className="flex items-center justify-between">
                            <span>Last Updated</span>
                            <span className="text-[var(--crm-text-primary)]">{new Date(flow.updatedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Total Nodes</span>
                            <span className="text-[var(--crm-text-primary)]">{flow.nodes?.length || 0}</span>
                          </div>
                        </div>

                        {/* Status Toggle */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--crm-border)]">
                          <div className="flex items-center gap-1.5">
                            {flow.is_active
                              ? <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                              : <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                            }
                            <span className={cn(
                              'font-bold text-[11px] uppercase tracking-wider',
                              flow.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--crm-text-tertiary)]'
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
                      <div className="flex border-t border-[var(--crm-border)] bg-[var(--crm-surface-2)]/50 divide-x divide-[var(--crm-border)]">
                        <button
                          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-surface-2)] transition-colors"
                          onClick={() => router.push(`/chatbot/builder/${flow.id}`)}
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-surface-2)] transition-colors"
                          onClick={() => handleDuplicate(flow.id)}
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </button>
                        <button
                          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
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
      </div>
    </RoleGuard>
  )
}
