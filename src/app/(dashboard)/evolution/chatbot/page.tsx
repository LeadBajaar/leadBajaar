'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ChatbotFlow, chatbotService } from '@/services/chatbot'
import {
  PlusCircle,
  Edit2,
  Copy,
  Trash,
  Zap,
  Loader2,
  Workflow,
  MessageSquare,
  GitFork,
  Search,
  CheckCircle2,
  PauseCircle,
  Sparkles,
  Clock,
  LayoutTemplate,
  Check,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { RoleGuard } from '@/components/RoleGuard'
import { cn } from '@/lib/utils'
import { TemplateSelectionModal } from '@/components/chatbot/TemplateSelectionModal'

export default function EvolutionChatbotPage() {
  const router = useRouter()
  const [flows, setFlows] = useState<ChatbotFlow[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast } = useToast()

  const loadFlows = async () => {
    try {
      setLoading(true)
      const data = await chatbotService.getFlows('evolution')
      setFlows(data)
    } catch {
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
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete flow',
        variant: 'destructive',
      })
    } finally {
      setDeleteTarget(null)
    }
  }

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
      toast({
        title: 'Copied!',
        description: 'Flow ID copied to clipboard.',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to copy Flow ID',
        variant: 'destructive',
      })
    }
  }
  
  const handleEdit = (id: string) => {
    setEditingId(id)
    router.push(`/evolution/chatbot/builder/${id}`)
    setTimeout(() => setEditingId(null), 2000)
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
          ? `"${flow.name}" is now responding to incoming messages.`
          : `"${flow.name}" has been paused.`,
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update flow status',
        variant: 'destructive',
      })
    } finally {
      setTogglingId(null)
    }
  }

  // Summary Metrics
  const activeCount = useMemo(() => flows.filter(f => f.is_active).length, [flows])
  const inactiveCount = useMemo(() => flows.filter(f => !f.is_active).length, [flows])
  const totalNodesCount = useMemo(() => flows.reduce((acc, f) => acc + (f.nodes?.length || 0), 0), [flows])

  // Filtered flows
  const filteredFlows = useMemo(() => {
    return flows.filter(flow => {
      const matchesSearch =
        flow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (flow.description && flow.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (flow.trigger && flow.trigger.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesStatus =
        activeFilter === 'all' ||
        (activeFilter === 'active' && flow.is_active) ||
        (activeFilter === 'inactive' && !flow.is_active)

      return matchesSearch && matchesStatus
    })
  }, [flows, searchQuery, activeFilter])

  const formatUpdatedDate = (dateStr?: string) => {
    if (!dateStr) return 'Recently'
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return 'Recently'
    }
  }

  return (
    <RoleGuard allowedFeatures={['chatbot']}>
      <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full pb-12 px-2 sm:px-4">
        
        {/* Page Header */}
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-['Satoshi'] tracking-tight">
                Evolution Chatbots
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Design automated conversation flows and funnel sequences.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => setIsTemplateModalOpen(true)}
              className="flex-1 md:flex-none h-10 px-4 text-xs font-semibold rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <LayoutTemplate className="w-3.5 h-3.5 mr-2 text-crm-btn-primary dark:text-indigo-400" />
              Templates
            </Button>
            <Button
              onClick={() => setIsTemplateModalOpen(true)}
              className="flex-1 md:flex-none bg-crm-btn-primary hover:bg-crm-btn-primary-hover text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 h-10 px-5 rounded-xl text-xs font-bold shadow-sm shadow-[#1e2d6b]/20 transition-all cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Flow
            </Button>
          </div>
        </div>



        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-2 border-b border-slate-200/80 dark:border-slate-800 pb-4">
          {/* Status Tabs */}
          <div role="tablist" aria-label="Filter flows by status" className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
            {/* TODO: Segment Control */}
            <Button variant="ghost"
              role="tab"
              aria-selected={activeFilter === 'all'}
              aria-controls="filter-panel"
              onClick={() => setActiveFilter('all')}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap p-0 h-auto w-auto hover:bg-transparent',
                activeFilter === 'all'
                  ? 'bg-crm-btn-primary text-white dark:bg-indigo-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              All Flows ({flows.length})
            </Button>
            {/* TODO: Segment Control */}
            <Button variant="ghost"
              role="tab"
              aria-selected={activeFilter === 'active'}
              aria-controls="filter-panel"
              onClick={() => setActiveFilter('active')}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap p-0 h-auto w-auto hover:bg-transparent',
                activeFilter === 'active'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              Active ({activeCount})
            </Button>
            {/* TODO: Segment Control */}
            <Button variant="ghost"
              role="tab"
              aria-selected={activeFilter === 'inactive'}
              aria-controls="filter-panel"
              onClick={() => setActiveFilter('inactive')}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap p-0 h-auto w-auto hover:bg-transparent',
                activeFilter === 'inactive'
                  ? 'bg-slate-800 text-white dark:bg-slate-700 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              Paused ({inactiveCount})
            </Button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by flow or trigger keyword..."
              className="pl-9 h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-[#1e2d6b] dark:focus-visible:ring-indigo-500"
            />
          </div>
        </div>

        {/* Content area */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-[350px]">
            <Loader2 className="w-8 h-8 animate-spin text-crm-btn-primary dark:text-indigo-400 mb-3" />
            <p className="text-xs text-slate-400 font-medium">Loading automation flows...</p>
          </div>
        ) : (
          <>
            {flows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="h-16 w-16 mb-4 flex items-center justify-center text-slate-500">
                  <Workflow className="h-8 w-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-['Satoshi']">
                  No chatbot flows created yet
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mt-1.5 mb-6 leading-relaxed">
                  Automate inbound conversations, qualify leads, and provide 24/7 instant support on Evolution API WhatsApp.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button
                    onClick={() => setIsTemplateModalOpen(true)}
                    className="bg-crm-btn-primary hover:bg-crm-btn-primary-hover text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-lg h-10 px-5 text-xs font-semibold shadow-sm transition-all"
                  >
                    <LayoutTemplate className="w-4 h-4 mr-2" /> Start from Template
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/evolution/chatbot/builder/new')}
                    className="rounded-lg h-10 px-4 text-xs font-semibold border-slate-200 dark:border-slate-800"
                  >
                    Start Blank Flow
                  </Button>
                </div>
              </div>
            ) : filteredFlows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <Search className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No matching flows found</h4>
                <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or status filter.</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
                  className="mt-3 text-xs font-semibold text-crm-btn-primary dark:text-indigo-400"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
                {filteredFlows.map((flow) => (
                  <div
                    key={flow.id}
                    className={cn(
                      'flex flex-col bg-white dark:bg-[#10182D] border border-slate-200/80 dark:border-slate-800 rounded-xl transition-all duration-300 group hover:border-slate-300 dark:hover:border-slate-700',
                      !flow.is_active && 'bg-slate-50 dark:bg-[#0f172a]'
                    )}
                  >
                    {/* Card Body */}
                    <div className="p-5 flex-1 flex flex-col">
                      
                      {/* Top Row: Icon + Title + Switch */}
                      <div className="flex items-start justify-between gap-3 mb-3.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn(
                            'h-10 w-10 shrink-0 rounded-lg flex items-center justify-center border transition-colors',
                            flow.is_active
                              ? 'bg-crm-btn-primary dark:bg-indigo-600 border-crm-btn-primary text-white'
                              : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                          )}>
                            <Workflow className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="m-0">
                              <Button variant="ghost"
                                onClick={() => router.push(`/evolution/chatbot/builder/${flow.id}`)}
                                className="text-base font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:text-crm-btn-primary dark:hover:text-indigo-400 transition-colors font-satoshi text-left w-full block h-auto p-0 hover:bg-transparent"
                                aria-label={`Edit flow: ${flow.name}`}
                              >
                                {flow.name}
                              </Button>
                            </h3>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mt-0.5">
                              <Clock className="w-3 h-3" />
                              <span>{formatUpdatedDate(flow.updatedAt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Switch */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Switch
                            checked={flow.is_active}
                            disabled={togglingId === flow.id}
                            onCheckedChange={() => handleToggle(flow)}
                            aria-label={`Toggle ${flow.name}`}
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                        {flow.description || 'Automated multi-step WhatsApp conversation funnel.'}
                      </p>

                      {/* Chips row */}
                      <div className="flex flex-wrap items-center gap-2 mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/80">
                        <Badge
                          variant="outline"
                          className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-lg flex items-center gap-1"
                        >
                          <span className="text-slate-400 font-normal">Trigger:</span> {flow.trigger}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 text-[10.5px] font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1"
                        >
                          <GitFork className="h-3 w-3 text-crm-btn-primary dark:text-indigo-400" />
                          <span>{flow.nodes?.length || 0} Steps</span>
                        </Badge>
                        <span className={cn(
                          'ml-auto inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider',
                          flow.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                        )}>
                          <span className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            flow.is_active ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]' : 'bg-slate-300 dark:bg-slate-600'
                          )} />
                          {flow.is_active ? 'Active' : 'Paused'}
                        </span>
                      </div>
                    </div>

                    {/* Actions Strip */}
                    <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={editingId === flow.id}
                        onClick={() => handleEdit(flow.id)}
                        className="flex-1 h-8 text-xs font-bold rounded-lg border-slate-200 dark:border-slate-700 hover:border-crm-btn-primary dark:hover:border-indigo-500/30 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                      >
                        {editingId === flow.id ? (
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <Edit2 className="w-3.5 h-3.5 mr-1.5 text-crm-btn-primary dark:text-indigo-400" />
                        )}
                        Edit Canvas
                      </Button>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={copiedId === flow.id}
                          onClick={() => handleCopyId(flow.id)}
                          title="Copy Flow ID"
                          className={cn(
                            "h-8 w-8 rounded-lg transition-colors",
                            copiedId === flow.id 
                              ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" 
                              : "text-slate-500 hover:text-crm-btn-primary hover:bg-slate-100 dark:hover:bg-slate-800"
                          )}
                        >
                          {copiedId === flow.id ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget({ id: flow.id, name: flow.name })}
                          aria-label={`Delete flow: ${flow.name}`}
                          className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </Button>
                      </div>
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
            router.push('/evolution/chatbot/builder/new')
          } else {
            router.push(`/evolution/chatbot/builder/new?template=${template.id}`)
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open: boolean) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete flow?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-900 dark:text-white">
                &ldquo;{deleteTarget?.name}&rdquo;
              </span>?
              {' '}This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </RoleGuard>
  )
}
