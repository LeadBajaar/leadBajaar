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
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--crm-text-primary)]">Evolution Chatbots</h1>
            <p className="text-[var(--crm-text-secondary)] mt-1">
              Build and manage automated conversation flows for Evolution API.
            </p>
          </div>
          <Button onClick={() => router.push('/evolution/chatbot/builder/new')} className="gap-2 bg-[var(--crm-blue)] hover:bg-[var(--crm-blue-hover)] text-white shadow-lg hover:shadow-xl hover:shadow-[var(--crm-blue)]/20 transition-all">
            <PlusCircle className="h-4 w-4" />
            Create Flow
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--crm-blue)]" />
          </div>
        ) : flows.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-20 text-center border-dashed border-2 bg-gradient-to-b from-[var(--crm-bg)] to-[var(--crm-surface-1)]">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6 ring-8 ring-blue-500/10">
              <Zap className="h-10 w-10 text-[var(--crm-blue)]" />
            </div>
            <h3 className="text-2xl font-bold text-[var(--crm-text-primary)] mb-2">No flows created yet</h3>
            <p className="text-[var(--crm-text-secondary)] max-w-sm mb-8">
              Create your first chatbot flow to automate conversations on Evolution API.
            </p>
            <Button onClick={() => router.push('/evolution/chatbot/builder/new')} size="lg" className="gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
              <PlusCircle className="h-5 w-5" />
              Build Your First Flow
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flows.map(flow => (
              <Card key={flow.id} className={cn(
                "group hover:shadow-xl hover:border-[var(--crm-blue)]/50 transition-all duration-300 overflow-hidden relative",
                !flow.is_active && "opacity-75 hover:opacity-100"
              )}>
                {/* Active Indicator Strip */}
                <div className={cn(
                  "absolute top-0 left-0 w-full h-1 transition-colors duration-300",
                  flow.is_active ? "bg-gradient-to-r from-emerald-500 to-emerald-400" : "bg-zinc-300 dark:bg-zinc-700"
                )} />
                
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-xl leading-tight group-hover:text-[var(--crm-blue)] transition-colors line-clamp-1">
                        {flow.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {flow.description || 'No description provided'}
                      </CardDescription>
                    </div>
                    <Badge variant={flow.is_active ? "default" : "secondary"} className={cn(
                      "shrink-0",
                      flow.is_active ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20" : ""
                    )}>
                      {flow.is_active ? 'Active' : 'Draft'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pb-6">
                  <div className="flex flex-wrap gap-2 text-sm text-[var(--crm-text-secondary)] bg-[var(--crm-surface-1)] p-3 rounded-lg border border-[var(--crm-border)]/50">
                    <div className="flex items-center gap-1.5 w-full">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span className="font-medium text-[var(--crm-text-primary)]">Trigger:</span>
                      <span className="truncate">{flow.trigger}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between gap-2 pt-4 border-t bg-[var(--crm-surface-1)]/50">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={flow.is_active}
                      onCheckedChange={() => handleToggle(flow)}
                      disabled={togglingId === flow.id}
                      className={cn(
                        "data-[state=checked]:bg-emerald-500",
                        togglingId === flow.id && "opacity-50"
                      )}
                    />
                    <span className="text-sm font-medium text-[var(--crm-text-secondary)]">
                      {togglingId === flow.id ? 'Updating...' : flow.is_active ? 'On' : 'Off'}
                    </span>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => router.push(`/evolution/chatbot/builder/${flow.id}`)}
                      className="hover:text-[var(--crm-blue)] hover:bg-[var(--crm-blue)]/10"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDuplicate(flow.id)}
                      className="hover:text-emerald-500 hover:bg-emerald-500/10"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(flow.id)}
                      className="hover:text-red-500 hover:bg-red-500/10"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  )
}
