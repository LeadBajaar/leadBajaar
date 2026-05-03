'use client';

import React, { useCallback, useState, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  MarkerType,
  Node,
  Panel,
  BackgroundVariant,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import axios from 'axios';
import { useSearchParams, useRouter } from 'next/navigation';
import { WHATSAPP_BASE_URL } from '@/lib/api';
import { toast } from 'sonner';
import { 
  Plus, 
  Save, 
  ArrowLeft, 
  Zap, 
  Database, 
  Settings2, 
  MessageCircle, 
  Shuffle,
  ChevronRight,
  Activity,
  Trash2,
  Upload,
  Loader2
} from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FlowNodeData {
  id?: number;
  name: string;
  trigger_keyword: string;
  match_type: string;
  reply_message: string;
  required_state: string;
  next_state: string | null;
  priority: number;
  media_url?: string;
  media_type?: string;
}

// --- Custom Node Components ---

const MessageNode = ({ data }: { data: FlowNodeData }) => {
  const getMediaIcon = (type: string | undefined) => {
    switch (type) {
      case 'image': return <Activity className="w-3 h-3 text-emerald-400" />;
      case 'video': return <Activity className="w-3 h-3 text-rose-400" />;
      case 'audio': return <Activity className="w-3 h-3 text-amber-400" />;
      case 'document': return <Database className="w-3 h-3 text-blue-400" />;
      default: return null;
    }
  };

  const isRoot = data.required_state === 'START';

  return (
    <div className="relative group">
      {/* Handles for State Connectivity */}
      <Handle type="target" position={Position.Top} className={`w-2 h-2 border-2 border-slate-900 ${isRoot ? 'hidden' : 'bg-indigo-500'}`} />
      
      {/* Node Glow Effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 ${isRoot ? 'from-emerald-500 to-teal-500' : 'from-indigo-500 to-purple-600'}`}></div>
      
      <div className={`relative px-4 py-3 bg-slate-900 border rounded-xl min-w-[220px] shadow-2xl ${isRoot ? 'border-emerald-500/50' : 'border-slate-800'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-lg ${isRoot ? 'bg-emerald-500/10' : 'bg-indigo-500/10'}`}>
              {isRoot ? <Zap className="w-4 h-4 text-emerald-400" /> : <MessageCircle className="w-4 h-4 text-indigo-400" />}
            </div>
            <span className={`text-[10px] uppercase font-black tracking-widest ${isRoot ? 'text-emerald-500' : 'text-slate-500'}`}>
              {isRoot ? 'Entry Trigger' : 'Sequence Step'}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            {getMediaIcon(data.media_type)}
            <Badge variant="outline" className={`text-[9px] bg-slate-950 border-slate-800 ${isRoot ? 'text-emerald-300' : 'text-indigo-300'}`}>
              {data.name || 'No Name'}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-100 flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 animate-pulse" />
            {data.trigger_keyword === '*' ? 'Any Message' : data.trigger_keyword}
          </div>
          
          <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
            <p className="text-[10px] leading-relaxed text-slate-400 line-clamp-3">
              "{data.reply_message}"
            </p>
          </div>
          
          <div className="flex items-center space-x-1 pt-1 justify-between">
             <div className="flex items-center space-x-1">
               <div className={`text-[8px] px-1.5 py-0.5 rounded border ${isRoot ? 'bg-emerald-900/30 text-emerald-300 border-emerald-500/20' : 'bg-indigo-900/30 text-indigo-300 border-indigo-500/20'}`}>
                 {data.required_state}
               </div>
               <ChevronRight className="w-2 h-2 text-slate-600" />
               <div className="text-[8px] px-1.5 py-0.5 bg-purple-900/30 text-purple-300 rounded border border-purple-500/20">
                 {data.next_state || 'END'}
               </div>
             </div>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-purple-500 border-2 border-slate-900" />
    </div>
  );
};

const nodeTypes = {
  messageNode: MessageNode,
};

// --- Main Builder Page ---

export default function FlowBuilderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get('userId');

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingFlow, setEditingFlow] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    trigger_keyword: '',
    match_type: 'contains',
    reply_message: '',
    required_state: 'START',
    next_state: '',
    priority: 0,
    media_url: '',
    media_type: 'none'
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Initialize nodes from DB
  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${WHATSAPP_BASE_URL}/chatbot/flows/${userId}`);
      const flows = res.data.flows || [];
      
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      // Logic: Position nodes in a grid or layout
      flows.forEach((flow: any, index: number) => {
        const x = (index % 4) * 280;
        const y = Math.floor(index / 4) * 240;

        newNodes.push({
          id: flow.id.toString(),
          type: 'messageNode',
          position: { x, y },
          data: { ...flow },
        });

        // If this flow connects to another by state, draw an edge
        flows.forEach((otherFlow: any) => {
          if (flow.next_state === otherFlow.required_state && flow.next_state && flow.next_state !== 'START') {
            newEdges.push({
              id: `e-${flow.id}-${otherFlow.id}`,
              source: flow.id.toString(),
              target: otherFlow.id.toString(),
              animated: true,
              style: { stroke: '#6366f1', strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
            });
          }
        });
      });

      setNodes(newNodes);
      setEdges(newEdges);
    } catch (err) {
      toast.error('Failed to load flow graph');
    } finally {
      setLoading(false);
    }
  };

  const onConnect = useCallback(
    async (params: Connection) => {
      // Find source and target nodes
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);
      
      if (sourceNode && targetNode && userId) {
        // Generate a unique state ID if target doesn't have a specific required_state
        // or just use target's current required_state
        const sourceData = sourceNode.data as any as FlowNodeData;
        const targetData = targetNode.data as any as FlowNodeData;

        const sharedState = targetData.required_state !== 'START' 
          ? targetData.required_state 
          : `state_${targetNode.id}_${Math.random().toString(36).substr(2, 4)}`;

        try {
          // Update Source's next_state to match target's required_state
          await axios.put(`${WHATSAPP_BASE_URL}/chatbot/flows/${sourceNode.id}`, {
            ...sourceData,
            next_state: sharedState,
            user_id: userId
          });

          // Update Target's required_state
          await axios.put(`${WHATSAPP_BASE_URL}/chatbot/flows/${targetNode.id}`, {
            ...targetData,
            required_state: sharedState,
            user_id: userId
          });

          toast.success('Nodes connected and states synced');
          setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }, eds));
          fetchData(); // Refresh to show new state labels
        } catch (err) {
          toast.error('Failed to connect nodes');
        }
      }
    },
    [nodes, userId, setEdges]
  );

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    const data = node.data as any as FlowNodeData;
    setEditingFlow(data);
    setFormData({
      name: data.name,
      trigger_keyword: data.trigger_keyword,
      match_type: data.match_type,
      reply_message: data.reply_message,
      required_state: data.required_state,
      next_state: data.next_state || '',
      priority: data.priority,
      media_url: data.media_url || '',
      media_type: data.media_type || 'none'
    });
    setIsDialogOpen(true);
  };

  const onAddNode = (type: 'root' | 'step') => {
    setEditingFlow(null);
    setFormData({
      name: type === 'root' ? 'New Flow' : 'Follow up Step',
      trigger_keyword: '',
      match_type: 'contains',
      reply_message: '',
      required_state: type === 'root' ? 'START' : `AWAITING_STATE_${Math.random().toString(36).substr(2, 4)}`,
      next_state: '',
      priority: 0,
      media_url: '',
      media_type: 'none'
    });
    setIsDialogOpen(true);
  };


  const handleDeleteFlow = async () => {
    if (!editingFlow || !userId) return;
    
    try {
      await axios.delete(`${WHATSAPP_BASE_URL}/chatbot/flows/${editingFlow.id}`, {
        params: { user_id: userId }
      });
      toast.success('Flow deleted');
      setIsDeleteConfirmOpen(false);
      setIsDialogOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to delete flow');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    try {
      setIsUploading(true);
      const uploadData = new FormData();
      uploadData.append('image', file); // The API endpoint expects 'image' field for R2 upload
      
      const res = await api.post('/storage/r2/upload-image', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setFormData({ ...formData, media_url: res.data.url });
        toast.success('Media uploaded successfully');
      } else {
        toast.error(res.data.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Failed to upload media to Cloudflare');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveFlow = async () => {
    if (!userId) return;
    try {
      if (editingFlow) {
        // Update existing
        await axios.put(`${WHATSAPP_BASE_URL}/chatbot/flows/${editingFlow.id}`, {
          ...formData,
          user_id: userId
        });
        toast.success('Flow updated');
      } else {
        // Create new
        await axios.post(`${WHATSAPP_BASE_URL}/chatbot/flows`, {
          ...formData,
          user_id: userId
        });
        toast.success('Flow created');
      }
      setIsDialogOpen(false);
      fetchData(); // Refresh canvas
    } catch (err) {
      toast.error('Failed to save flow');
    }
  };

  const saveLayout = () => {
    toast.success('Flow layout cached. Persistent position saving coming in next sync.');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#0B0F1A]">
      {/* Builder Toolbar */}
      <div className="h-16 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl px-6 flex items-center justify-between z-10">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl hover:bg-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center">
              Visual Flow Builder <Badge className="ml-2 bg-indigo-500/20 text-indigo-400 border-none">Pro</Badge>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">User ID: {userId}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Activity className="w-3.5 h-3.5 text-emerald-500 mr-2" />
            <span className="text-xs font-semibold text-slate-300">Live Sync Active</span>
          </div>
          <Button onClick={saveLayout} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 shadow-indigo-500/20 shadow-lg rounded-xl h-9">
            <Save className="w-4 h-4 mr-2" /> Save Changes
          </Button>
        </div>
      </div>

      {/* Main Builder Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          colorMode="dark"
        >
          <Background color="#1E293B" variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls className="bg-slate-900 border-slate-800 fill-slate-400" />
          <MiniMap 
            className="bg-slate-900 border-slate-800" 
            nodeColor="#312e81"
            maskColor="rgba(0, 0, 0, 0.4)"
          />
          
          <Panel position="top-right" className="space-y-2">
            <Card className="p-3 bg-slate-900/80 border-slate-800 backdrop-blur-lg w-64 shadow-2xl">
              <h3 className="text-xs font-bold text-indigo-400 mb-3 flex items-center uppercase tracking-tighter">
                <Shuffle className="w-3.5 h-3.5 mr-2" /> Canvas Tools
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10 text-emerald-500"
                  onClick={() => onAddNode('root')}
                >
                  <Zap className="w-6 h-6 mb-2" />
                  <span className="text-[10px] font-bold">Entry Flow</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col bg-indigo-500/5 border-indigo-500/20 hover:bg-indigo-500/10 text-indigo-500"
                  onClick={() => onAddNode('step')}
                >
                  <MessageCircle className="w-6 h-6 mb-2" />
                  <span className="text-[10px] font-bold">Message Node</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col bg-slate-950 border-slate-800 hover:bg-slate-800">
                  <Database className="w-6 h-6 mb-2 text-emerald-500" />
                  <span className="text-[10px]">History</span>
                </Button>
              </div>
            </Card>
            
            <Card className="p-3 bg-slate-900/80 border-slate-800 backdrop-blur-lg w-64 shadow-2xl">
              <h3 className="text-xs font-bold text-indigo-400 mb-2 uppercase tracking-tighter">Instructions</h3>
              <ul className="text-[10px] space-y-1.5 text-slate-400">
                <li className="flex items-center">
                  <div className="w-1 h-1 bg-indigo-500 rounded-full mr-2" /> Drag nodes to repoistion
                </li>
                <li className="flex items-center">
                  <div className="w-1 h-1 bg-indigo-500 rounded-full mr-2" /> Connect nodes to link states
                </li>
                <li className="flex items-center">
                  <div className="w-1 h-1 bg-indigo-500 rounded-full mr-2" /> Click node to edit details
                </li>
              </ul>
            </Card>
          </Panel>
        </ReactFlow>
      </div>

      {/* Flow Editor Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center">
              {formData.required_state === 'START' ? (
                <div className="p-1.5 bg-emerald-500/10 rounded-lg mr-2">
                  <Zap className="w-5 h-5 text-emerald-500" />
                </div>
              ) : (
                <div className="p-1.5 bg-indigo-500/10 rounded-lg mr-2">
                  <MessageCircle className="w-5 h-5 text-indigo-500" />
                </div>
              )}
              {formData.required_state === 'START' ? 'New Entry Trigger' : 'Sequence Step Settings'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {formData.required_state === 'START' 
                ? 'Configure how this conversation flow starts (e.g. via a keyword).' 
                : 'Configure the reply for this specific step in the sequence.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {formData.required_state === 'START' && (
              <div className="grid gap-2">
                <Label htmlFor="name">Flow Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-950 border-slate-800"
                  placeholder="e.g. Handle Pricing Query"
                />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="trigger">
                  {formData.required_state === 'START' ? 'Global Trigger Keyword' : 'Response Match / Key'}
                </Label>
                <Input
                  id="trigger"
                  value={formData.trigger_keyword}
                  onChange={(e) => setFormData({ ...formData, trigger_keyword: e.target.value })}
                  className="bg-slate-950 border-slate-800"
                  placeholder={formData.required_state === 'START' ? 'e.g. hello' : 'e.g. 1 or * (Any)'}
                />
                {formData.required_state !== 'START' && (
                  <p className="text-[10px] text-slate-500">Leave empty or use * to trigger on any message in this state.</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label>Match Type</Label>
                <Select 
                  value={formData.match_type} 
                  onValueChange={(v) => setFormData({ ...formData, match_type: v })}
                >
                  <SelectTrigger className="bg-slate-950 border-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="exact">Exact</SelectItem>
                    <SelectItem value="starts_with">Starts With</SelectItem>
                    <SelectItem value="wildcard">Wildcard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Media Type</Label>
                <Select 
                  value={formData.media_type} 
                  onValueChange={(v) => setFormData({ ...formData, media_type: v })}
                >
                  <SelectTrigger className="bg-slate-950 border-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    <SelectItem value="none">None (Text Only)</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="audio">Audio/Voice</SelectItem>
                    <SelectItem value="document">Document (PDF)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mediaUrl">Media URL / Upload</Label>
                <div className="flex gap-2">
                  <Input
                    id="mediaUrl"
                    value={formData.media_url}
                    onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                    className="bg-slate-950 border-slate-800 flex-1"
                    placeholder="https://..."
                    disabled={formData.media_type === 'none'}
                  />
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept={formData.media_type === 'image' ? 'image/*' : formData.media_type === 'video' ? 'video/*' : '*'}
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="bg-slate-950 border-slate-800 hover:bg-slate-800 shrink-0"
                    disabled={formData.media_type === 'none' || isUploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reply">Bot Reply Message / Caption</Label>
              <Textarea
                id="reply"
                value={formData.reply_message}
                onChange={(e) => setFormData({ ...formData, reply_message: e.target.value })}
                className="bg-slate-950 border-slate-800 min-h-[80px]"
                placeholder="Hi! Our pricing starts from $10..."
              />
            </div>
          </div>
          
          <DialogFooter className="flex justify-between items-center sm:justify-between">
            {editingFlow && (
              <Button 
                variant="destructive" 
                size="icon" 
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <div className="flex space-x-2">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="hover:bg-slate-800">
                Cancel
              </Button>
              <Button onClick={handleSaveFlow} className="bg-indigo-600 hover:bg-indigo-700">
                {editingFlow ? 'Update Node' : 'Save Node'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[400px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mb-4 border border-rose-500/20">
              <Trash2 className="w-6 h-6 text-rose-500" />
            </div>
            <DialogTitle className="text-center text-xl font-bold">Delete Flow Node?</DialogTitle>
            <DialogDescription className="text-center text-slate-400">
              This action cannot be undone. Any visual connections leading to or from this node will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2">
            <Button 
              variant="ghost" 
              onClick={() => setIsDeleteConfirmOpen(false)} 
              className="flex-1 hover:bg-slate-800"
            >
              No, Keep it
            </Button>
            <Button 
              onClick={handleDeleteFlow}
              className="flex-1 bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-500/20"
            >
              Yes, Delete Node
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
