'use client'

import { useState, useCallback, useEffect, memo } from 'react'
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, Connection, NodeTypes, applyNodeChanges, applyEdgeChanges, OnNodesChange, OnEdgesChange } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ChatbotNode, ChatbotEdge, MessageNodeData, FlowNodeData, ConditionNodeData } from '@/types/nodes'
import { PlusCircle, ArrowLeft, Loader2, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { ChatbotFlow, chatbotService } from '@/services/chatbot'

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
    position: { x: 250, y: 50 },
    data: {
      label: 'Evolution Welcome Flow',
      content: 'Triggered when a keyword matches',
      trigger: 'message',
    } as FlowNodeData
  },
  {
    id: '1',
    type: 'message',
    position: { x: 250, y: 150 },
    data: {
      label: 'Welcome Message',
      content: 'Welcome! How can I help you today?\n\n1. Pricing Info\n2. Get Support',
      messageType: 'text',
    } as MessageNodeData
  },
]

const initialEdges: ChatbotEdge[] = [
  { id: 'e1-2', source: 'flow-1', target: '1' },
]

interface Props {
  flowId: string | null
  isNew?: boolean
  onSave?: (flow: ChatbotFlow) => void
}

const NodeProperties = memo(({ node, onChange, onDelete }: {
  node: ChatbotNode,
  onChange: (data: Partial<ChatbotNode['data']>) => void,
  onDelete: (id: string) => void
}) => {
  if (node.type === 'message') {
    const data = node.data as MessageNodeData
    return (
      <div className="space-y-4">
        <div>
          <Label className="text-xs">Message Text</Label>
          <Textarea 
            value={data.content || ''} 
            onChange={(e) => onChange({ ...data, content: e.target.value })}
            placeholder="Type your message here..."
            className="h-32 text-sm mt-1"
          />
        </div>
        <div className="pt-4 border-t mt-4">
          <Button variant="destructive" size="sm" className="w-full text-xs" onClick={() => onDelete(node.id)}>
            <Trash2 className="h-4 w-4 mr-2" /> Delete Message Node
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="text-sm text-gray-500 italic py-4 text-center">
      Select a message node to edit its properties.
    </div>
  )
})
NodeProperties.displayName = 'NodeProperties'

export default function EvolutionFlowBuilder({ flowId, isNew, onSave }: Props) {
  const [nodes, setNodes] = useNodesState(initialNodes)
  const [edges, setEdges] = useEdgesState(initialEdges)
  const [flowName, setFlowName] = useState('New Evolution Flow')
  const [flowTrigger, setFlowTrigger] = useState('hello')
  const [flowDescription, setFlowDescription] = useState('')
  const [selectedNode, setSelectedNode] = useState<ChatbotNode | null>(null)
  const [isLoading, setIsLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const loadFlow = useCallback(async (id: string) => {
    try {
      setIsLoading(true)
      const data = await chatbotService.getFlow(id)
      setFlowName(data.name || 'Untitled Flow')
      setFlowDescription(data.description || '')
      setFlowTrigger(data.trigger || 'message')
      
      if (data.nodes && data.nodes.length > 0) {
        setNodes(data.nodes)
        setEdges(data.edges || [])
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load flow', variant: 'destructive' })
      router.push('/evolution/chatbot')
    } finally {
      setIsLoading(false)
    }
  }, [router, setNodes, setEdges, toast])

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
  }, [])

  const addNode = (type: string) => {
    const newNode: ChatbotNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 250, y: 250 },
      data: type === 'message' 
        ? { label: 'New Message', content: 'Type here...', messageType: 'text' }
        : type === 'condition'
        ? { label: 'Condition', content: '', condition: '== 1', trueTarget: '', falseTarget: '' }
        : { label: 'New Node', content: '' }
    }
    setNodes((nds) => [...nds, newNode])
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const payload = {
        id: isNew ? undefined : flowId!,
        name: flowName,
        description: flowDescription,
        trigger: flowTrigger,
        channel_type: 'evolution',
        nodes: nodes,
        edges: edges,
        is_active: true
      }
      const saved = await chatbotService.saveFlow(payload)
      toast({ title: 'Success', description: 'Evolution Flow saved successfully' })
      if (onSave) onSave(saved)
    } catch {
      toast({ title: 'Error', description: 'Failed to save flow', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="flex h-[calc(100vh-4rem)] items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-[var(--crm-blue)]" /></div>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-[var(--crm-surface-1)] shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/evolution/chatbot')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Input 
              value={flowName} 
              onChange={(e) => setFlowName(e.target.value)}
              className="w-[200px] font-semibold h-8"
              placeholder="Flow Name"
            />
            <Input 
              value={flowTrigger} 
              onChange={(e) => setFlowTrigger(e.target.value)}
              className="w-[150px] h-8 text-sm text-gray-500"
              placeholder="Trigger Keyword"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isSaving} className="bg-[var(--crm-blue)] text-white hover:bg-[var(--crm-blue-hover)]">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Flow
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 bg-gray-50/50 dark:bg-black/20">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChangeHandler}
            onEdgesChange={onEdgesChangeHandler}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            onPaneClick={() => setSelectedNode(null)}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        {/* Sidebar */}
        <div className="w-[300px] flex flex-col border-l bg-[var(--crm-surface-1)] shrink-0">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-sm">Add Nodes</h3>
            <div className="flex flex-col gap-2 mt-2">
              <Button variant="outline" size="sm" className="justify-start w-full" onClick={() => addNode('message')}>
                <PlusCircle className="h-4 w-4 mr-2" /> Text Message
              </Button>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            {selectedNode ? (
              <Card>
                <CardHeader className="py-3 px-4 bg-muted/50">
                  <CardTitle className="text-sm">{selectedNode.data?.label || selectedNode.type}</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <NodeProperties 
                    node={selectedNode} 
                    onChange={(data) => {
                      setNodes(nds => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, ...data } } as ChatbotNode : n))
                      setSelectedNode(prev => prev ? { ...prev, data: { ...prev.data, ...data } } as ChatbotNode : null)
                    }}
                    onDelete={(id) => {
                      setNodes(nds => nds.filter(n => n.id !== id))
                      setEdges(eds => eds.filter(e => e.source !== id && e.target !== id))
                      setSelectedNode(null)
                    }}
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="text-sm text-center text-gray-500 py-8">
                Click a node on the canvas to configure it
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
