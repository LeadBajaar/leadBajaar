'use client'

import { useState, useCallback, useEffect, memo, useMemo, useRef } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
  applyNodeChanges,
  applyEdgeChanges,
  OnNodesChange,
  OnEdgesChange,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ChatbotNode, ChatbotEdge, MessageNodeData, FlowNodeData, ConditionNodeData } from '@/types/nodes'
import {
  PlusCircle,
  ArrowLeft,
  Loader2,
  Trash2,
  LayoutTemplate,
  Save,
  MessageSquare,
  Sparkles,
  GitBranch,
  Smartphone,
  Eye,
  Sliders,
  Zap,
  Info,
  Check,
  PanelRight,
  Upload,
  X,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { ChatbotFlow, chatbotService } from '@/services/chatbot'
import { TemplateSelectionModal, ChatbotTemplate } from '@/components/chatbot/TemplateSelectionModal'
import { cn } from '@/lib/utils'
import api from '@/lib/api/client'

import MessageNode from '@/components/reactflow/MessageNode'
import ConditionNode from '@/components/reactflow/ConditionNode'
import FlowNode from '@/components/reactflow/FlowNode'

const nodeTypes: NodeTypes = {
  message: MessageNode,
  condition: ConditionNode,
  flow: FlowNode,
}

const initialNodes: ChatbotNode[] = [
  {
    id: 'flow-1',
    type: 'flow',
    position: { x: 280, y: 50 },
    data: {
      label: 'Evolution Welcome Flow',
      content: 'Triggered when a keyword matches',
      trigger: 'hello',
    } as FlowNodeData,
  },
  {
    id: '1',
    type: 'message',
    position: { x: 280, y: 180 },
    data: {
      label: 'Welcome Message',
      content: '[Hi|Hello] {{name}}! How can we assist you today?\n\n1. Pricing & Plans\n2. Talk with Support',
      messageType: 'text',
    } as MessageNodeData,
  },
]

const initialEdges: ChatbotEdge[] = [
  { id: 'e1-2', source: 'flow-1', target: '1' },
]

interface Props {
  flowId: string | null
  isNew?: boolean
  mode?: 'user' | 'template'
  onSave?: (flow: any) => void | Promise<void>
}

const NodeProperties = memo(({
  node,
  onChange,
  onDelete,
}: {
  node: ChatbotNode
  onChange: (data: Partial<ChatbotNode['data']>) => void
  onDelete: (id: string) => void
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'preview'>('config')
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  if (node.type === 'message') {
    const data = node.data as MessageNodeData
    const content = data.content || ''

    const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      try {
        setIsUploadingMedia(true)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'whatsapp-chat')

        let detectedType: 'image' | 'video' | 'audio' | 'document' = 'document'
        if (file.type.startsWith('image/')) detectedType = 'image'
        else if (file.type.startsWith('video/')) detectedType = 'video'
        else if (file.type.startsWith('audio/')) detectedType = 'audio'

        const res = await api.post('/storage/r2/upload-media', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        if (res.data?.success && res.data?.url) {
          onChange({
            ...data,
            media_url: res.data.url,
            media_type: res.data.media_type || detectedType,
          })
          toast({
            title: 'Uploaded to R2',
            description: `Successfully uploaded ${file.name}`,
          })
        } else {
          toast({
            title: 'Upload Failed',
            description: res.data?.message || 'Failed to upload media to R2',
            variant: 'destructive',
          })
        }
      } catch (err: any) {
        console.error('R2 Upload error:', err)
        toast({
          title: 'Upload Error',
          description: err?.response?.data?.message || err.message || 'Failed to upload media to R2',
          variant: 'destructive',
        })
      } finally {
        setIsUploadingMedia(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }

    const insertVariable = (token: string) => {
      onChange({ ...data, content: content ? `${content} ${token}` : token })
    }

    // Parse preview with dummy contact name
    const simulatedPreview = content
      ? content
          .replace(/\[(.*?)\]/g, (_, opts) => opts.split('|')[0] || '')
          .replace(/{{name}}/g, 'Alex')
      : 'Hello Alex! How can we assist you today?'

    return (
      <div className="flex flex-col h-full space-y-4">
        {/* Node Tabs */}
        <div role="tablist" aria-label="Node editor panels" className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
          <button /* TODO: Segment Control */
            role="tab"
            aria-selected={activeTab === 'config'}
            aria-controls="node-panel-config"
            onClick={() => setActiveTab('config')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer',
              activeTab === 'config'
                ? 'bg-white dark:bg-[#10182D] text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Config</span>
          </button>
          <button /* TODO: Segment Control */
            role="tab"
            aria-selected={activeTab === 'preview'}
            aria-controls="node-panel-preview"
            onClick={() => setActiveTab('preview')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer',
              activeTab === 'preview'
                ? 'bg-white dark:bg-[#10182D] text-crm-btn-primary dark:text-indigo-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>WhatsApp Preview</span>
          </button>
        </div>

        {activeTab === 'config' ? (
          <div className="space-y-4 flex-1">
            <div>
              <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Step Title
              </Label>
              <Input
                value={data.label || ''}
                onChange={(e) => onChange({ ...data, label: e.target.value })}
                placeholder="e.g. Welcome Greeting"
                className="mt-1 h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Media Attachment (Optional)
                </Label>
                {data.media_url && (
                  <button
                    type="button"
                    onClick={() => onChange({ ...data, media_url: undefined })}
                    className="text-[10px] font-semibold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Remove Media
                  </button>
                )}
              </div>

              <div className="flex gap-2 items-center">
                <Input
                  value={data.media_url || ''}
                  onChange={(e) => onChange({ ...data, media_url: e.target.value })}
                  placeholder="https://... or upload to R2"
                  className="h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex-1"
                />

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleMediaUpload}
                  accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploadingMedia}
                  onClick={() => fileInputRef.current?.click()}
                  className="h-9 px-2.5 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold gap-1.5 shrink-0 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs"
                  title="Upload to Cloudflare R2"
                >
                  {isUploadingMedia ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-crm-btn-primary dark:text-indigo-400" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                  )}
                  <span>{isUploadingMedia ? 'Uploading...' : 'Upload'}</span>
                </Button>

                <div className="w-24 shrink-0">
                  <select
                    value={data.media_type || 'image'}
                    onChange={(e) => onChange({ ...data, media_type: e.target.value as any })}
                    className="h-9 w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 outline-none font-medium text-slate-700 dark:text-slate-300"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                    <option value="document">Document</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Message Copy
                </Label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {content.length} chars
                </span>
              </div>
              <Textarea
                value={content}
                onChange={(e) => onChange({ ...data, content: e.target.value })}
                placeholder="Type the message sent to the WhatsApp user..."
                className="h-36 text-xs leading-relaxed rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 custom-scrollbar resize-none"
              />
            </div>

            {/* Helper Tokens */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Insert Helpers
              </span>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => insertVariable('{{name}}')}
                  className="px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10.5px] font-mono font-bold hover:bg-slate-100 transition-colors h-auto w-auto"
                >
                  + &#123;&#123;name&#125;&#125;
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => insertVariable('[Hi|Hello|Hey]')}
                  className="px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10.5px] font-mono font-bold hover:bg-slate-100 transition-colors h-auto w-auto"
                >
                  + Spintax
                </Button>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 space-y-1 mt-2">
              <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>Message Tips</span>
              </div>
              <p className="leading-snug">
                Use numbers (e.g. 1, 2) in your text to prompt the user for the next response in your flow.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800 mt-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(node.id)}
                className="w-full text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900/40 h-9 rounded-xl"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Message Step
              </Button>
            </div>
          </div>
        ) : (
          /* Live WhatsApp Bubble Preview */
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Recipient View Simulator</span>
            </div>

            <div className="p-4 rounded-lg bg-[#E5DDD5] dark:bg-[#0B141A] border border-slate-300 dark:border-slate-800 shadow-inner flex flex-col justify-end min-h-[220px]">
              <div className="max-w-[90%] bg-white dark:bg-[#202C33] text-slate-800 dark:text-slate-100 p-3 rounded-lg rounded-tl-sm shadow-sm text-xs whitespace-pre-wrap leading-relaxed space-y-1">
                {data.media_url && (
                  <div className="mb-2 w-full rounded-md overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                    {data.media_type === 'video' ? (
                      <video src={data.media_url} controls className="w-full h-auto max-h-[160px] object-cover" />
                    ) : data.media_type === 'audio' ? (
                      <audio src={data.media_url} controls className="w-full h-8" />
                    ) : data.media_type === 'document' ? (
                      <a href={data.media_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 w-full justify-center">
                        <span className="font-medium underline text-xs text-blue-500">Download Document</span>
                      </a>
                    ) : (
                      <img src={data.media_url} alt="Media message" className="w-full h-auto max-h-[160px] object-cover" loading="lazy" />
                    )}
                  </div>
                )}
                {simulatedPreview && <p>{simulatedPreview}</p>}
                <div className="text-[9px] text-slate-400 dark:text-slate-500 text-right flex items-center justify-end gap-1 font-mono">
                  <span>10:45 AM</span>
                  <Check className="w-3 h-3 text-blue-500" />
                </div>
              </div>
            </div>

            <p className="text-[10.5px] text-slate-400 italic text-center">
              Spintax and &#123;&#123;name&#125;&#125; variables are evaluated live when sent by Evolution engine.
            </p>
          </div>
        )}
      </div>
    )
  }

  if (node.type === 'flow') {
    const data = node.data as FlowNodeData
    return (
      <div className="space-y-4">
        <div>
          <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Flow Trigger Keyword
          </Label>
          <Input
            value={data.trigger || ''}
            onChange={(e) => onChange({ ...data, trigger: e.target.value })}
            placeholder="e.g. hello, quote, or *"
            className="mt-1 h-9 text-xs rounded-xl font-mono font-bold bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Type an exact keyword or <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px] font-bold">*</code> for all inbound messages.
          </p>
        </div>

        <div>
          <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Flow Notes
          </Label>
          <Textarea
            value={data.content || ''}
            onChange={(e) => onChange({ ...data, content: e.target.value })}
            placeholder="Description for this trigger..."
            className="mt-1 h-24 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 resize-none"
          />
        </div>
      </div>
    )
  }

  if (node.type === 'condition') {
    const data = node.data as ConditionNodeData
    return (
      <div className="space-y-4">
        <div>
          <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Condition Label
          </Label>
          <Input
            value={data.label || ''}
            onChange={(e) => onChange({ ...data, label: e.target.value })}
            placeholder="e.g. Check Service Choice"
            className="mt-1 h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          />
        </div>

        <div>
          <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Matching Expression / Keyword
          </Label>
          <Input
            value={data.condition || ''}
            onChange={(e) => onChange({ ...data, condition: e.target.value })}
            placeholder="e.g. 1 or yes"
            className="mt-1 h-9 text-xs font-mono font-bold rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          />
        </div>

        <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800 mt-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(node.id)}
            className="w-full text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900/40 h-9 rounded-xl"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Branch Node
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="text-xs text-slate-400 italic py-8 text-center">
      Click on any node in the canvas to configure its content and logic.
    </div>
  )
})
NodeProperties.displayName = 'NodeProperties'

export default function EvolutionFlowBuilder({ flowId, isNew, mode = 'user', onSave }: Props) {
  const searchParams = useSearchParams()
  const templateParam = searchParams?.get('template')

  const [nodes, setNodes] = useNodesState(initialNodes)
  const [edges, setEdges] = useEdgesState(initialEdges)
  const [flowName, setFlowName] = useState('New Evolution Flow')
  const [flowTrigger, setFlowTrigger] = useState('hello')
  const [flowDescription, setFlowDescription] = useState('')
  const [selectedNode, setSelectedNode] = useState<ChatbotNode | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<ChatbotEdge | null>(null)
  const [isLoading, setIsLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Hydrate template if specified in URL query params on new flow creation
  useEffect(() => {
    if (isNew && templateParam) {
      chatbotService.getEvolutionTemplateById(templateParam).then((template) => {
        if (template) {
          setNodes(template.nodes || [])
          setEdges(template.edges || [])
          setFlowName(template.name)
          setFlowTrigger(template.trigger)
          setFlowDescription(template.description)
        }
      })
    }
  }, [isNew, templateParam, setNodes, setEdges])

  const handleApplyTemplate = (template: ChatbotTemplate) => {
    setNodes(template.nodes)
    setEdges(template.edges)
    setFlowName(template.name)
    setFlowTrigger(template.trigger)
    setFlowDescription(template.description)
    setIsTemplateModalOpen(false)
    toast({
      title: 'Template Applied',
      description: `"${template.name}" template has been loaded onto your canvas.`,
    })
  }

  const loadFlow = useCallback(async (id: string) => {
    try {
      setIsLoading(true)
      let data: any;
      if (mode === 'template') {
        data = await chatbotService.getEvolutionTemplateById(id)
      } else {
        data = await chatbotService.getFlow(id)
      }
      
      setFlowName(data.name || (mode === 'template' ? 'Untitled Template' : 'Untitled Flow'))
      setFlowDescription(data.description || '')
      setFlowTrigger(data.trigger || (mode === 'template' ? '' : 'message'))

      if (data.nodes && data.nodes.length > 0) {
        setNodes(data.nodes)
        setEdges(data.edges || [])
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load flow data', variant: 'destructive' })
      if (mode !== 'template') router.push('/evolution/chatbot')
    } finally {
      setIsLoading(false)
    }
  }, [router, setNodes, setEdges, toast, mode])

  useEffect(() => {
    if (flowId && !isNew) {
      loadFlow(flowId)
    }
  }, [flowId, isNew, loadFlow])

  const onNodesChangeHandler: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds) as ChatbotNode[]),
    [setNodes]
  )
  const onEdgesChangeHandler: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds) as ChatbotEdge[]),
    [setEdges]
  )
  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  )

  const onNodeClick = useCallback((_: React.MouseEvent, node: ChatbotNode) => {
    setSelectedNode(node)
    setSelectedEdge(null)
  }, [])

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: ChatbotEdge) => {
    setSelectedEdge(edge)
    setSelectedNode(null)
  }, [])

  const addNode = (type: string) => {
    const newNode: ChatbotNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 300, y: 200 + nodes.length * 50 },
      data:
        type === 'message'
          ? ({ label: 'New Message', content: 'Type your message...', messageType: 'text' } as MessageNodeData)
          : type === 'condition'
          ? ({ label: 'Branch Condition', condition: '1' } as ConditionNodeData)
          : ({ label: 'New Step', content: '' } as FlowNodeData),
    }
    setNodes((nds) => [...nds, newNode])
    setSelectedNode(newNode)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      if (mode === 'template') {
        const payload = {
          name: flowName,
          description: flowDescription,
          trigger: flowTrigger,
          nodes: nodes,
          edges: edges,
        }
        if (onSave) {
          await onSave(payload)
        }
      } else {
        const payload = {
          id: isNew ? undefined : flowId!,
          name: flowName,
          description: flowDescription,
          trigger: flowTrigger,
          channel_type: 'evolution',
          nodes: nodes,
          edges: edges,
          is_active: true,
        }
        const saved = await chatbotService.saveFlow(payload)
        toast({ title: 'Success', description: 'Evolution Flow saved successfully' })
        if (onSave) onSave(saved)
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to save flow', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 dark:bg-[var(--crm-bg)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin h-8 w-8 text-crm-btn-primary dark:text-indigo-400" />
          <p className="text-xs font-semibold text-slate-500">Loading flow canvas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-[var(--crm-bg)] overflow-hidden">
      
      {/* Top Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-4 py-3 bg-white dark:bg-[#10182D] border-b border-slate-200 dark:border-slate-800 shrink-0 gap-3 z-20">
        
        {/* Left: Back + Flow Title & Trigger */}
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(mode === 'template' ? '/admin/chatbot-templates' : '/evolution/chatbot')}
            className="h-9 w-9 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white shrink-0 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1 min-w-0">
            <Input
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              className="w-[180px] sm:w-[240px] font-bold text-sm h-9 rounded-md bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700 focus:bg-white dark:focus:bg-slate-900 px-3 focus-visible:ring-1 focus-visible:ring-crm-btn-primary transition-all"
              placeholder="Flow Name"
            />
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 text-xs shrink-0 transition-colors hover:border-slate-300 dark:hover:border-slate-700">
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Trigger:</span>
              <Input
                value={flowTrigger}
                onChange={(e) => setFlowTrigger(e.target.value)}
                className="w-[120px] h-6 text-[11px] font-mono font-bold border-transparent hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-950 px-2 rounded-sm focus-visible:ring-1 focus-visible:ring-crm-btn-primary transition-all"
                placeholder="keyword"
              />
            </div>
          </div>
        </div>

        {/* Right: Quick Tools + Templates + Save */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTemplateModalOpen(true)}
            className="h-9 px-3 text-xs font-bold rounded-md border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850"
          >
            <LayoutTemplate className="h-3.5 w-3.5 mr-1.5 text-crm-btn-primary dark:text-indigo-400" />
            <span>Templates</span>
          </Button>

          {/* Mobile sidebar toggle — only visible below md breakpoint */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden h-9 w-9 rounded-xl border-slate-200 dark:border-slate-800"
            aria-label="Open node properties"
          >
            <PanelRight className="h-4 w-4 text-slate-500" />
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-crm-btn-primary hover:bg-crm-btn-primary-hover text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-md h-9 px-4 text-xs font-bold transition-all cursor-pointer active:scale-95"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
            Save Flow
          </Button>
        </div>
      </div>

      {/* Main Flow Canvas & Drawer */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* ReactFlow Visual Canvas */}
        <div className="flex-1 h-full relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChangeHandler}
            onEdgesChange={onEdgesChangeHandler}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            nodeTypes={nodeTypes}
            onPaneClick={() => {
              setSelectedNode(null)
              setSelectedEdge(null)
            }}
            fitView
            fitViewOptions={{ padding: 0.3, minZoom: 0.5, maxZoom: 1.2 }}
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: '#1e2d6b', strokeWidth: 2 },
            }}
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#94A3B8" className="opacity-40" />
            <Controls className="!bg-white dark:!bg-[#10182D] !border !border-slate-200 dark:!border-slate-800 !rounded-xl !shadow-sm overflow-hidden" />
            <MiniMap
              className="!bg-white dark:!bg-[#10182D] !border !border-slate-200 dark:!border-slate-800 !rounded-2xl overflow-hidden !shadow-sm"
              nodeColor={() => '#1e2d6b'}
            />
          </ReactFlow>
        </div>

        {/* Right Properties Inspector Sidebar — desktop only */}
        <div className="hidden md:flex w-[320px] sm:w-[350px] flex-col border-l border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#10182D] shrink-0 z-10">
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#1e2d6b]/10 dark:bg-indigo-500/15 flex items-center justify-center text-crm-btn-primary dark:text-indigo-400">
                <Sliders className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                {selectedNode ? selectedNode.data?.label || selectedNode.type : selectedEdge ? 'Connection Properties' : 'Canvas Properties'}
              </h3>
            </div>
            {selectedNode ? (
              <Badge variant="outline" className="text-[10px] font-mono capitalize">
                {selectedNode.type}
              </Badge>
            ) : selectedEdge ? (
              <Badge variant="outline" className="text-[10px] font-mono capitalize">
                Edge
              </Badge>
            ) : null}
          </div>

          {/* Drawer Content */}
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
            {selectedNode ? (
              <NodeProperties
                node={selectedNode}
                onChange={(data) => {
                  setNodes((nds) =>
                    nds.map((n) =>
                      n.id === selectedNode.id ? ({ ...n, data: { ...n.data, ...data } } as ChatbotNode) : n
                    )
                  )
                  setSelectedNode((prev) => (prev ? ({ ...prev, data: { ...prev.data, ...data } } as ChatbotNode) : null))
                }}
                onDelete={(id) => {
                  setNodes((nds) => nds.filter((n) => n.id !== id))
                  setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id))
                  setSelectedNode(null)
                }}
              />
            ) : selectedEdge ? (
              <div className="flex flex-col h-full space-y-4">
                <div className="flex flex-col items-center text-center py-8 px-4 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500">
                    <GitBranch className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Connection Selected</h4>
                    <p className="text-xs text-slate-500">
                      This line connects two steps in your flow.
                    </p>
                  </div>
                </div>
                <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEdges((eds) => eds.filter((e) => e.id !== selectedEdge.id))
                      setSelectedEdge(null)
                    }}
                    className="w-full text-xs font-bold text-rose-600 hover:bg-rose-50 hover:border-rose-200 dark:hover:bg-rose-950/30 rounded-md"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Delete Connection
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4 space-y-3 text-slate-400">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">No Node Selected</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Click any node on the canvas to edit message copy, preview WhatsApp bubbles, or add a new step below.
                  </p>
                </div>
                <Button
                  onClick={() => addNode('message')}
                  className="mt-4 bg-crm-btn-primary hover:bg-crm-btn-primary-hover text-white rounded-md h-9 px-4 text-xs font-bold transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                  + Message Step
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sidebar Drawer */}
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetContent side="right" className="w-[320px] sm:w-[350px] p-0 flex flex-col bg-white dark:bg-[#10182D] border-l border-slate-200/80 dark:border-slate-800">
            <SheetHeader className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#1e2d6b]/10 dark:bg-indigo-500/15 flex items-center justify-center text-crm-btn-primary dark:text-indigo-400">
                  <Sliders className="w-3.5 h-3.5" />
                </div>
                <SheetTitle className="text-xs uppercase tracking-wider font-bold">
                  {selectedNode ? selectedNode.data?.label || selectedNode.type : selectedEdge ? 'Connection Properties' : 'Canvas Properties'}
                </SheetTitle>
              </div>
              {selectedNode && (
                <Badge variant="outline" className="text-[10px] font-mono capitalize">
                  {selectedNode.type}
                </Badge>
              )}
            </SheetHeader>
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
              {selectedNode ? (
                <NodeProperties
                  node={selectedNode}
                  onChange={(data) => {
                    setNodes((nds) =>
                      nds.map((n) =>
                        n.id === selectedNode.id ? ({ ...n, data: { ...n.data, ...data } } as ChatbotNode) : n
                      )
                    )
                    setSelectedNode((prev) => (prev ? ({ ...prev, data: { ...prev.data, ...data } } as ChatbotNode) : null))
                  }}
                  onDelete={(id) => {
                    setNodes((nds) => nds.filter((n) => n.id !== id))
                    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id))
                    setSelectedNode(null)
                    setIsSidebarOpen(false)
                  }}
                />
              ) : selectedEdge ? (
                <div className="flex flex-col h-full space-y-4 px-4 py-6">
                  <div className="flex flex-col items-center text-center py-8 space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500">
                      <GitBranch className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Connection Selected</h4>
                      <p className="text-xs text-slate-500">
                        This line connects two steps in your flow.
                      </p>
                    </div>
                  </div>
                  <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEdges((eds) => eds.filter((e) => e.id !== selectedEdge.id))
                        setSelectedEdge(null)
                        setIsSidebarOpen(false)
                      }}
                      className="w-full text-xs font-bold text-rose-600 hover:bg-rose-50 hover:border-rose-200 dark:hover:bg-rose-950/30 rounded-md"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-2" />
                      Delete Connection
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4 space-y-3 text-slate-400">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">No Node Selected</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Tap any node on the canvas to edit its properties or add a new step.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      addNode('message')
                      setIsSidebarOpen(false)
                    }}
                    className="mt-4 bg-crm-btn-primary hover:bg-crm-btn-primary-hover text-white rounded-md h-9 px-4 text-xs font-bold transition-all"
                  >
                    <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                    + Message Step
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

      </div>

      {/* In-Builder Template Selection Modal */}
      <TemplateSelectionModal
        isOpen={isTemplateModalOpen}
        onOpenChange={setIsTemplateModalOpen}
        onSelectTemplate={handleApplyTemplate}
      />
    </div>
  )
}
