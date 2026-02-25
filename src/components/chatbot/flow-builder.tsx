'use client'

import { useState, useCallback, useRef, useEffect, memo, useMemo } from 'react'
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, Connection, Edge, NodeTypes, ReactFlowInstance, OnNodesChange, OnEdgesChange, applyNodeChanges, applyEdgeChanges } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChatbotNode, ChatbotEdge, MessageNodeData, TriggerConfig, NodeData, FlowNodeData, FunctionNodeData, BaseNodeData } from '@/types/nodes'
import { Paperclip, Smile, X, PlusCircle, Tag, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

import MessageNode from '@/components/reactflow/MessageNode'
import InputNode from '@/components/reactflow/InputNode'
import ConditionNode from '@/components/reactflow/ConditionNode'
import ApiNode from '@/components/reactflow/ApiNode'
import FunctionNode from '@/components/reactflow/FunctionNode'
import FlowNode from '@/components/reactflow/FlowNode'
import { ChatbotFlow, chatbotService } from '@/services/chatbot'
import { useToast } from '@/components/ui/use-toast'
import { integrationApi } from '@/lib/api'

interface CTAUrlButton {
  display_text: string;
  url: string;
}

interface CTAUrlMessage {
  header?: string;
  body: string;
  footer?: string;
  button: CTAUrlButton;
}

const nodeTypes: NodeTypes = {
  message: MessageNode,
  input: InputNode,
  condition: ConditionNode,
  api: ApiNode,
  function: FunctionNode,
  flow: FlowNode,
}

const TRIGGER_TYPES = {
  'message': 'Message Keywords',
  'exact_match': 'Exact Match',
  'button': 'Button Click',
  'api': 'API Webhook',
  'schedule': 'Schedule/Cron',
  'event': 'System Event',
  'regex': 'Regex Pattern',
  'intent': 'AI Intent'
} as const

const PREDEFINED_FUNCTIONS = {
  'save_name': {
    label: 'Save Name',
    description: 'Save user name to database',
    code: `
      // Save user name to database
      async function saveName(message) {
        try {
          const name = message.trim();
          await saveUserData({ name });
          return 'Name saved successfully!';
        } catch (error) {
          console.error('Error saving name:', error);
          return 'Failed to save name.';
        }
      }
    `
  },
  'save_email': {
    label: 'Save Email',
    description: 'Save user email to database',
    code: `
      // Save user email to database
      async function saveEmail(message) {
        try {
          const email = message.trim().toLowerCase();
          if (!email.match(/^\\S+@\\S+\\.\\S+$/)) return 'Invalid email format.';
          await saveUserData({ email });
          return 'Email saved successfully!';
        } catch (error) {
          console.error('Error saving email:', error);
          return 'Failed to save email.';
        }
      }
    `
  },
  'save_phone': {
    label: 'Save Phone',
    description: 'Save user phone number to database',
    code: `
      // Save user phone to database
      async function savePhone(message) {
        try {
          const phone = message.trim();
          await saveUserData({ phone });
          return 'Phone number saved successfully!';
        } catch (error) {
          console.error('Error saving phone:', error);
          return 'Failed to save phone number.';
        }
      }
    `
  },
  'custom': {
    label: 'Custom Function',
    description: 'Write your own custom function',
    code: ''
  }
} as const;

const initialNodes: ChatbotNode[] = [
  {
    id: 'flow-1',
    type: 'flow',
    position: { x: 0, y: 0 },
    data: {
      label: 'Welcome Flow',
      content: 'Main welcome flow for new users',
      trigger: 'message',
    } as FlowNodeData
  },
  {
    id: '1',
    type: 'message',
    position: { x: 0, y: 100 },
    data: {
      label: 'Welcome Message',
      content: 'Welcome! How can I help you today?',
      messageType: 'text',
      buttons: [
        { id: 'btn1', text: 'Pricing Info', action: 'show_pricing' },
        { id: 'btn2', text: 'Get Support', action: 'get_support' }
      ]
    } as MessageNodeData
  },
]

const initialEdges: ChatbotEdge[] = [
  { id: 'e1-2', source: 'flow-1', target: '1' },
]

const isMessageNode = (node: ChatbotNode): node is ChatbotNode & { data: MessageNodeData } => {
  return node.type === 'message';
}

interface FlowBuilderProps {
  flowId: string | null
  isNew?: boolean
  onSave?: (flow: ChatbotFlow) => void
}

interface TemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  text?: string;
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  example?: {
    header_handle: string[];
  };
  buttons?: Array<{
    type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'COPY_CODE';
    text: string;
    url?: string;
    phone_number?: string;
    code?: string;
  }>;
}

interface MessageTemplate {
  id: number;
  name: string;
  category: string;
  language: string;
  status: string;
  components: TemplateComponent[];
}

const NodeProperties = memo(({ node, onChange }: {
  node: ChatbotNode & { data: MessageNodeData },
  onChange: (data: MessageNodeData) => void
}) => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadTemplates = async () => {
      if (node.type === 'message') {
        setIsLoadingTemplates(true);
        try {
          const response = await integrationApi.getWhatsAppAccounts();
          if (response.accounts && response.accounts.length > 0) {
            setTemplates(response.accounts[0].templates || []);
          }
        } catch (error) {
          console.error('Failed to load templates:', error);
          toast({
            title: "Error",
            description: "Failed to load WhatsApp templates",
            variant: "destructive",
          });
        } finally {
          setIsLoadingTemplates(false);
        }
      }
    };
    loadTemplates();
  }, [node.type]);

  if (node.type !== 'message') return null;

  return (
    <div className="space-y-4">
      {isLoadingTemplates ? (
        <div>Loading templates...</div>
      ) : (
        <>
          <div>
            <Label className="text-xs">Select Template</Label>
            <Select
              value={node.data.templateId?.toString()}
              onValueChange={(value) => {
                const template = templates.find(t => t.id.toString() === value);
                if (template) {
                  onChange({
                    ...node.data,
                    templateId: template.id,
                    content: template.components.find((c: any) => c.type === 'BODY')?.text || '',
                    templateComponents: template.components,
                    buttons: template.components
                      .find((c: any) => c.type === 'BUTTONS')
                      ?.buttons?.map((b: any, i: number) => ({
                        id: `btn${i}`,
                        text: b.text,
                        action: b.type.toLowerCase()
                      })) || []
                  });
                }
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id.toString()}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {node.data.templateComponents && (
            <div className="space-y-4">
              {node.data.templateComponents.map((component: any, index: number) => (
                <div key={index} className="border p-3 rounded-md">
                  <Label className="text-xs">{component.type}</Label>
                  {component.text && (
                    <Textarea
                      value={component.text}
                      readOnly
                      className="mt-2 h-20 text-xs"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
});

type TriggerType = keyof typeof TRIGGER_TYPES;

export default function FlowBuilder({ flowId, isNew = false, onSave }: FlowBuilderProps) {
  const router = useRouter()
  const [nodes, setNodes] = useState<ChatbotNode[]>(isNew ? initialNodes : [])
  const [edges, setEdges] = useState<ChatbotEdge[]>(isNew ? initialEdges : [])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  const selectedNode = useMemo(() =>
    nodes.find(node => node.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  )

  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<ChatbotNode, ChatbotEdge> | null>(null)
  const [loading, setLoading] = useState(!isNew)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const [flowName, setFlowName] = useState('')
  const [flowDescription, setFlowDescription] = useState('')
  const [flowTrigger, setFlowTrigger] = useState<TriggerConfig>({
    type: 'message',
    value: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const loadedRef = useRef(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const onNodesChange = useCallback<OnNodesChange<ChatbotNode>>(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  )

  const onEdgesChange = useCallback<OnEdgesChange<ChatbotEdge>>(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  )

  const loadFlow = useCallback(async () => {
    if (isNew || loadedRef.current) return
    loadedRef.current = true

    try {
      setLoading(true)
      setError(null)
      const flow = await chatbotService.getFlow(flowId!)

      setNodes(flow.nodes || [])
      setEdges(flow.edges || [])
      setFlowName(flow.name || '')
      setFlowDescription(flow.description || '')

      const [triggerType, triggerValue] = (flow.trigger || '').includes(':')
        ? flow.trigger.split(':')
        : ['message', flow.trigger]

      setFlowTrigger({
        type: (triggerType as TriggerType) || 'message',
        value: triggerValue || ''
      })
    } catch (err) {
      console.error('Error loading flow:', err)
      setError(err instanceof Error ? err.message : 'Failed to load flow')
      toast({
        title: 'Error',
        description: 'Failed to load flow',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [flowId, isNew])

  useEffect(() => {
    if (!isNew && flowId) {
      loadFlow()
    }
  }, [flowId, isNew, loadFlow])

  const saveFlow = async () => {
    try {
      setIsSaving(true)
      const flowData = {
        id: flowId || undefined,
        name: flowName || 'Untitled Flow',
        description: flowDescription || '',
        trigger: flowTrigger.type === 'message' ? flowTrigger.value :
          `${flowTrigger.type}:${flowTrigger.value}`,
        nodes,
        edges,
      }

      const savedFlow = await chatbotService.saveFlow(flowData)

      const [triggerType, triggerValue] = (savedFlow.trigger || '').includes(':')
        ? savedFlow.trigger.split(':')
        : ['message', savedFlow.trigger]

      setFlowName(savedFlow.name || '')
      setFlowDescription(savedFlow.description || '')
      setFlowTrigger({
        type: (triggerType as TriggerType) || 'message',
        value: triggerValue || ''
      })
      setNodes(savedFlow.nodes || [])
      setEdges(savedFlow.edges || [])

      toast({
        title: 'Success',
        description: 'Flow saved successfully',
      })

      if (isNew) {
        router.replace(`/chatbot/builder/${savedFlow.id}`)
      }

      onSave?.(savedFlow)
      return savedFlow
    } catch (err) {
      console.error('Save error:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save flow',
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsSaving(false)
    }
  }

  // selection is now handled via useMemo and selectedNodeId

  const onConnect = useCallback(
    (params: Connection) => {
      const targetNode = nodes.find(n => n.id === params.target)
      if (targetNode?.type === 'message') {
        setEdges((eds) => addEdge(params, eds))
        return
      }

      const hasIncomingConnection = edges.some(
        edge => edge.target === params.target
      )

      if (!hasIncomingConnection) {
        setEdges((eds) => addEdge(params, eds))
      }
    },
    [nodes, edges]
  )

  const onNodeClick = useCallback((event: React.MouseEvent, node: ChatbotNode) => {
    event.preventDefault()
    setSelectedNodeId(node.id)
  }, [])

  const updateNodeData = useCallback((id: string, newData: Partial<NodeData>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          const updatedData = {
            ...node.data,
            ...newData,
          } as NodeData;

          return {
            ...node,
            data: updatedData
          }
        }
        return node
      })
    )
  }, [setNodes])

  const handleNodeDataChange = useCallback((data: MessageNodeData) => {
    if (selectedNodeId) {
      updateNodeData(selectedNodeId, data);
    }
  }, [selectedNodeId, updateNodeData]);

  const addNode = useCallback((type: string) => {
    if (reactFlowInstance) {
      const { x, y, zoom } = reactFlowInstance.getViewport()
      const centerX = -x / zoom + (reactFlowWrapper.current?.clientWidth || 0) / (2 * zoom)
      const centerY = -y / zoom + (reactFlowWrapper.current?.clientHeight || 0) / (2 * zoom)

      const newNode: ChatbotNode = {
        id: `${type}-${Date.now()}`,
        type,
        position: {
          x: centerX - 100,
          y: centerY - 50
        },
        data: {
          label: `New ${type}`,
          content: '',
          ...(type === 'flow' ? { trigger: 'message' } : {})
        } as any,
      }
      setNodes((nds) => [...nds, newNode])
    }
  }, [setNodes, reactFlowInstance])

  if (!isMounted) {
    return (
      <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 items-center justify-center">
        <div className="text-center animate-in fade-in zoom-in duration-500">
          <div className="relative h-16 w-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800 opacity-20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Initializing builder...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 sm:p-4 border-b shrink-0 bg-white dark:bg-slate-900 z-50">
        <Button variant="ghost" size="sm" onClick={() => router.push('/chatbot')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 overflow-hidden">
          <div className="flex-1 min-w-0">
            <Input
              value={flowName || ''}
              onChange={(e) => setFlowName(e.target.value)}
              placeholder="Flow Name"
              className="text-base sm:text-lg font-semibold h-9 sm:h-auto"
            />
            <Input
              value={flowDescription || ''}
              onChange={(e) => setFlowDescription(e.target.value)}
              placeholder="Description"
              className="mt-1 text-xs sm:text-sm h-8 sm:h-auto"
            />
          </div>
          <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-[250px] lg:w-[300px]">
            <Select
              value={flowTrigger?.type || 'message'}
              onValueChange={(value) => setFlowTrigger(prev => ({
                ...prev,
                type: value as keyof typeof TRIGGER_TYPES
              }))}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Trigger type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TRIGGER_TYPES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={flowTrigger?.value}
              onChange={(e) => setFlowTrigger({
                type: (flowTrigger?.type as TriggerType) || 'message',
                value: e.target.value
              })}
              placeholder={getTriggerPlaceholder(flowTrigger?.type as TriggerType)}
              className="h-9 text-xs"
            />
          </div>
        </div>
        <Button onClick={saveFlow} disabled={isSaving} className="w-full sm:w-auto mt-2 sm:mt-0 shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700">
          {isSaving ? 'Saving...' : 'Save Flow'}
        </Button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
            <p className="mt-2">Loading flow...</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col lg:flex-row overflow-hidden relative">
          <div className="flex-1 h-full touch-none" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              onInit={setReactFlowInstance}
              fitView
              deleteKeyCode="Delete"
              multiSelectionKeyCode="Control"
              preventScrolling={true}
            >
              <Controls />
              <MiniMap />
              <Background gap={12} size={1} />
            </ReactFlow>
          </div>

          <div className={cn(
            "w-full lg:w-[350px] border-t lg:border-t-0 lg:border-l bg-slate-50 dark:bg-slate-900/50 backdrop-blur-md overflow-hidden flex flex-col shrink-0 transition-all duration-300",
            selectedNode ? "h-1/2 lg:h-full" : "h-0 lg:h-full lg:opacity-50"
          )}>
            <div className="p-4 flex flex-col h-full overflow-hidden">
              <Card className="flex-1 flex flex-col overflow-hidden border-none shadow-none bg-transparent">
                <CardHeader className="p-0 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base uppercase tracking-wider text-slate-500 font-bold">Properties</CardTitle>
                    {selectedNode && (
                      <Button variant="ghost" size="sm" onClick={() => setSelectedNodeId(null)} className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0 overflow-y-auto custom-scrollbar pr-2 flex-1">
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 mb-6">
                    <Button onClick={() => addNode('flow')} variant="outline" size="sm" className="justify-start"><Tag className="w-4 h-4 mr-2 text-indigo-500" /> Flow</Button>
                    <Button onClick={() => addNode('message')} variant="outline" size="sm" className="justify-start"><PlusCircle className="w-4 h-4 mr-2 text-emerald-500" /> Message</Button>
                    <Button onClick={() => addNode('input')} variant="outline" size="sm" className="justify-start"><PlusCircle className="w-4 h-4 mr-2 text-violet-500" /> Input</Button>
                    <Button onClick={() => addNode('condition')} variant="outline" size="sm" className="justify-start"><PlusCircle className="w-4 h-4 mr-2 text-amber-500" /> Condition</Button>
                    <Button onClick={() => addNode('api')} variant="outline" size="sm" className="justify-start"><PlusCircle className="w-4 h-4 mr-2 text-blue-500" /> API</Button>
                    <Button onClick={() => addNode('function')} variant="outline" size="sm" className="justify-start"><PlusCircle className="w-4 h-4 mr-2 text-rose-500" /> Function</Button>
                  </div>

                  {selectedNode && (
                    <div className="space-y-4 border-t pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-indigo-500" />
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase">Editing {selectedNode.type} Node</h3>
                      </div>

                      {selectedNode.type === 'message' && (
                        <>
                          <div>
                            <Label className="text-xs">Message Type</Label>
                            <Select
                              value={(selectedNode.data as MessageNodeData).messageType || 'text'}
                              onValueChange={(value) => updateNodeData(selectedNode.id, {
                                ...(selectedNode.data as MessageNodeData),
                                messageType: value as any,
                                content: '',
                                templateId: undefined,
                                templateComponents: undefined,
                                ctaUrl: value === 'cta_url' ? {
                                  body: '',
                                  button: {
                                    display_text: '',
                                    url: ''
                                  }
                                } : undefined
                              })}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text Message</SelectItem>
                                <SelectItem value="template">WhatsApp Template</SelectItem>
                                <SelectItem value="cta_url">CTA URL Button</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {(selectedNode.data as MessageNodeData).messageType === 'cta_url' ? (
                            <div className="space-y-4 bg-white dark:bg-slate-800 p-3 rounded-lg border">
                              <div>
                                <Label className="text-[10px] uppercase font-bold text-slate-400">Header</Label>
                                <Input
                                  value={(selectedNode.data as MessageNodeData).ctaUrl?.header || ''}
                                  onChange={(e) => updateNodeData(selectedNode.id, {
                                    ctaUrl: {
                                      ...(selectedNode.data as MessageNodeData).ctaUrl!,
                                      header: e.target.value
                                    }
                                  })}
                                  placeholder="Header text"
                                  className="h-8 text-xs"
                                />
                              </div>
                              <div>
                                <Label className="text-[10px] uppercase font-bold text-slate-400">Body</Label>
                                <Textarea
                                  value={(selectedNode.data as MessageNodeData).ctaUrl?.body || ''}
                                  onChange={(e) => updateNodeData(selectedNode.id, {
                                    ctaUrl: {
                                      ...(selectedNode.data as MessageNodeData).ctaUrl!,
                                      body: e.target.value
                                    }
                                  } as any)}
                                  placeholder="Message body"
                                  className="min-h-[60px] text-xs"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-[10px] uppercase font-bold text-slate-400">Button Text</Label>
                                  <Input
                                    value={(selectedNode.data as MessageNodeData).ctaUrl?.button?.display_text || ''}
                                    onChange={(e) => updateNodeData(selectedNode.id, {
                                      ctaUrl: {
                                        ...(selectedNode.data as MessageNodeData).ctaUrl!,
                                        button: {
                                          ...(selectedNode.data as MessageNodeData).ctaUrl?.button!,
                                          display_text: e.target.value
                                        }
                                      } as any
                                    })}
                                    className="h-8 text-xs"
                                  />
                                </div>
                                <div>
                                  <Label className="text-[10px] uppercase font-bold text-slate-400">URL</Label>
                                  <Input
                                    value={(selectedNode.data as MessageNodeData).ctaUrl?.button?.url || ''}
                                    onChange={(e) => updateNodeData(selectedNode.id, {
                                      ctaUrl: {
                                        ...(selectedNode.data as MessageNodeData).ctaUrl!,
                                        button: {
                                          ...(selectedNode.data as MessageNodeData).ctaUrl?.button!,
                                          url: e.target.value
                                        }
                                      } as any
                                    })}
                                    className="h-8 text-xs"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (selectedNode.data as MessageNodeData).messageType === 'template' ? (
                            <NodeProperties
                              node={selectedNode as any}
                              onChange={handleNodeDataChange}
                            />
                          ) : (
                            <div>
                              <Label className="text-xs">Message Text</Label>
                              <Textarea
                                value={(selectedNode.data as MessageNodeData).content}
                                onChange={(e) => updateNodeData(selectedNode.id, { content: e.target.value })}
                                className="min-h-[100px] text-sm"
                              />
                            </div>
                          )}
                        </>
                      )}

                      <div>
                        <Label className="text-xs">Label</Label>
                        <Input
                          value={(selectedNode.data as BaseNodeData).label}
                          onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>

                      {selectedNode.type === 'flow' && (
                        <div>
                          <Label className="text-xs">Trigger</Label>
                          <Select
                            value={(selectedNode.data as BaseNodeData).trigger}
                            onValueChange={(value) => updateNodeData(selectedNode.id, { trigger: value })}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select trigger" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(TRIGGER_TYPES).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {isMessageNode(selectedNode) && (
                        <div>
                          <Label className="text-xs">Buttons</Label>
                          {selectedNode.data.buttons?.map((button, index) => (
                            <div key={button.id} className="flex flex-col gap-2 mt-2 border rounded-lg p-2 bg-slate-100 dark:bg-slate-800/50">
                              <Input
                                value={button.text}
                                onChange={(e) => {
                                  const buttons = [...(selectedNode.data.buttons || [])];
                                  buttons[index] = { ...button, text: e.target.value };
                                  updateNodeData(selectedNode.id, { buttons });
                                }}
                                placeholder="Button text"
                                className="h-8 text-xs"
                              />
                              <Input
                                value={button.action}
                                onChange={(e) => {
                                  const buttons = [...(selectedNode.data.buttons || [])];
                                  buttons[index] = { ...button, action: e.target.value };
                                  updateNodeData(selectedNode.id, { buttons });
                                }}
                                placeholder="Action"
                                className="h-8 text-xs"
                              />
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  const buttons = selectedNode.data.buttons?.filter(b => b.id !== button.id) || [];
                                  updateNodeData(selectedNode.id, { buttons });
                                }}
                                className="h-7 text-[10px]"
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 w-full h-8 text-xs"
                            onClick={() => {
                              const buttons = [...(selectedNode.data.buttons || []), { id: `btn${Date.now()}`, text: 'New Button' }];
                              updateNodeData(selectedNode.id, { buttons });
                            }}
                          >
                            Add Button
                          </Button>
                        </div>
                      )}

                      {selectedNode.type === 'function' && (
                        <div className="space-y-4">
                          <div>
                            <Label className="text-xs">Function Type</Label>
                            <Select
                              value={(selectedNode.data as FunctionNodeData).functionType || 'custom'}
                              onValueChange={(value) => {
                                const functionData = PREDEFINED_FUNCTIONS[value as keyof typeof PREDEFINED_FUNCTIONS];
                                updateNodeData(selectedNode.id, {
                                  functionType: value as any,
                                  label: functionData.label,
                                  description: functionData.description,
                                  functionBody: value === 'custom' ? (selectedNode.data as FunctionNodeData).functionBody : functionData.code
                                });
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Type" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(PREDEFINED_FUNCTIONS).map(([value, { label }]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {(selectedNode.data as FunctionNodeData).functionType === 'custom' && (
                            <div>
                              <Label className="text-xs">Body</Label>
                              <Textarea
                                value={(selectedNode.data as FunctionNodeData).functionBody || ''}
                                onChange={(e) => updateNodeData(selectedNode.id, { functionBody: e.target.value })}
                                className="min-h-[150px] font-mono text-[10px]"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function getTriggerPlaceholder(triggerType?: TriggerType): string {
  switch (triggerType) {
    case 'message': return 'Keywords (comma separated)'
    case 'exact_match': return 'Exact message'
    case 'button': return 'Button ID'
    case 'api': return 'Webhook endpoint'
    case 'schedule': return 'Cron expression'
    case 'event': return 'Event name'
    case 'regex': return 'Regex pattern'
    case 'intent': return 'AI intent'
    default: return 'Value'
  }
}