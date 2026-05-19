'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Rocket, Clock, CheckCircle2, AlertCircle, Play, Pause, Plus, Loader2, Calendar, Layout, Search, Upload, FileText, Trash2, ArrowLeft, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WHATSAPP_BASE_URL } from '@/lib/api';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useWhatsApp } from '@/contexts/WhatsAppContext';

interface Campaign {
  id: number;
  name: string;
  message: string;
  status: string;
  total_contacts: number;
  sent_count: number;
  failed_count: number;
  min_delay: number;
  max_delay: number;
  created_at: string;
  media_url?: string;
  media_type?: string;
}

interface Group {
  id: number;
  name: string;
  contact_count: number;
}

interface WhatsAppBotCampaignsProps {
  userId: string;
}

export function WhatsAppBotCampaigns({ userId }: WhatsAppBotCampaignsProps) {
  const { sessions } = useWhatsApp();
  const isSessionActive = sessions.includes(userId);
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [recipientsLoading, setRecipientsLoading] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [resumeLimit, setResumeLimit] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Resume Preview State
  const [isResumePreviewOpen, setIsResumePreviewOpen] = useState(false);
  const [resumeCampaignTarget, setResumeCampaignTarget] = useState<Campaign | null>(null);
  const [previewMessage, setPreviewMessage] = useState('');
  const [previewMediaUrl, setPreviewMediaUrl] = useState('');
  const [previewMediaType, setPreviewMediaType] = useState('image');
  const [previewMediaUploading, setPreviewMediaUploading] = useState(false);
  const [previewMediaMissing, setPreviewMediaMissing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  // Pagination Logic
  const filteredRecipients = recipients.filter(r => 
    r.phone.includes(recipientSearch) || 
    (r.error_message && r.error_message.toLowerCase().includes(recipientSearch.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredRecipients.length / pageSize);
  const paginatedRecipients = filteredRecipients.slice(
    (currentPage - 1) * pageSize, 
    currentPage * pageSize
  );
  
  // New Campaign State
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [groupId, setGroupId] = useState<string>('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [isLaunching, setIsLaunching] = useState(false);
  const [mediaUploading, setMediaUploading] = useState(false);

  useEffect(() => {
    fetchCampaigns();
    fetchGroups();
  }, [userId]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${WHATSAPP_BASE_URL}/campaigns/campaigns/${userId}`);
      setCampaigns(res.data || []);
    } catch (err) {
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await axios.get(`${WHATSAPP_BASE_URL}/campaigns/groups/${userId}`);
      setGroups(res.data || []);
    } catch (err) {}
  };

  const fetchRecipients = async (campaignId: number) => {
    try {
      setRecipientsLoading(true);
      const res = await axios.get(`${WHATSAPP_BASE_URL}/campaigns/campaigns/${campaignId}/recipients`);
      setRecipients(res.data || []);
    } catch (err) {
      toast.error('Failed to fetch recipients');
    } finally {
      setRecipientsLoading(false);
    }
  };

  const handleLaunchCampaign = async () => {
    if (!name || (!message && !mediaUrl) || !groupId) {
      toast.error('Please fill name, group and either a message or media');
      return;
    }
    try {
      setIsLaunching(true);
      await axios.post(`${WHATSAPP_BASE_URL}/campaigns/campaigns`, {
        userId,
        name,
        message,
        groupId: parseInt(groupId),
        mediaUrl,
        mediaType
      });
      toast.success('Campaign launched successfully!');
      setIsCreateModalOpen(false);
      resetForm();
      fetchCampaigns();
    } catch (err) {
      toast.error('Failed to launch campaign');
    } finally {
      setIsLaunching(false);
    }
  };

  const resetForm = () => {
    setName('');
    setMessage('');
    setGroupId('');
    setMediaUrl('');
    setMediaType('image');
  };

  const deleteCampaign = async (campaignId: number) => {
    if (!confirm('Are you sure you want to delete this campaign? All history and recipient logs will be lost.')) return;
    try {
      await axios.delete(`${WHATSAPP_BASE_URL}/campaigns/campaigns/${campaignId}`);
      toast.success('Campaign deleted successfully');
      setIsViewDetailsOpen(false);
      fetchCampaigns();
    } catch (err) {
      toast.error('Failed to delete campaign');
    }
  };

  const handlePauseCampaign = async (campaignId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setIsProcessingAction(true);
      await axios.post(`${WHATSAPP_BASE_URL}/campaigns/campaigns/${campaignId}/stop`);
      toast.success('Campaign paused');
      fetchCampaigns();
      if (selectedCampaign?.id === campaignId) {
        setSelectedCampaign(prev => prev ? {...prev, status: 'paused'} : null);
      }
    } catch (err) {
      toast.error('Failed to pause campaign');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleResumeCampaign = async (campaignId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setIsProcessingAction(true);
      const res = await axios.post(`${WHATSAPP_BASE_URL}/campaigns/campaigns/${campaignId}/resume`, {
        limit: resumeLimit ? parseInt(resumeLimit) : undefined
      });
      toast.success(res.data.message || 'Campaign resumed');
      fetchCampaigns();
      if (selectedCampaign?.id === campaignId) {
        setSelectedCampaign(prev => prev ? {...prev, status: 'running'} : null);
        fetchRecipients(campaignId);
      }
      setResumeLimit('');
    } catch (err) {
      toast.error('Failed to resume campaign');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Check if preview media file is active or missing on the server
  useEffect(() => {
    if (resumeCampaignTarget && previewMediaUrl) {
      setPreviewMediaMissing(false);
      
      const checkUrl = previewMediaUrl;

      // Do a quick HEAD check to see if the file is reachable (returns 200)
      axios.head(checkUrl)
        .then((res) => {
          if (res.status === 404) {
            setPreviewMediaMissing(true);
          }
        })
        .catch((err) => {
          // If HEAD request fails with 404 (Axios throws error for non-2xx status)
          if (err.response && err.response.status === 404) {
            setPreviewMediaMissing(true);
          }
        });
    } else {
      setPreviewMediaMissing(false);
    }
  }, [resumeCampaignTarget, previewMediaUrl]);

  const openResumePreview = (campaign: Campaign, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setResumeCampaignTarget(campaign);
    setPreviewMessage(campaign.message);
    setPreviewMediaUrl(campaign.media_url || '');
    setPreviewMediaType(campaign.media_type || 'image');
    setPreviewMediaMissing(false);
    setIsResumePreviewOpen(true);
  };

  const handleConfirmResume = async () => {
    if (!resumeCampaignTarget) return;
    try {
      setIsProcessingAction(true);
      
      // 1. Update the campaign message & media in backend
      await axios.put(`${WHATSAPP_BASE_URL}/campaigns/campaigns/${resumeCampaignTarget.id}`, {
        message: previewMessage,
        mediaUrl: previewMediaUrl,
        mediaType: previewMediaType
      });
      
      // 2. Call the resume endpoint
      const res = await axios.post(`${WHATSAPP_BASE_URL}/campaigns/campaigns/${resumeCampaignTarget.id}/resume`, {
        limit: resumeLimit ? parseInt(resumeLimit) : undefined
      });
      
      toast.success(res.data.message || 'Campaign updated & resumed');
      setIsResumePreviewOpen(false);
      setResumeCampaignTarget(null);
      setResumeLimit('');
      
      // 3. Refresh campaigns list
      fetchCampaigns();
      
      // 4. If selectedCampaign is active, update its details as well
      if (selectedCampaign?.id === resumeCampaignTarget.id) {
        setSelectedCampaign(prev => prev ? {
          ...prev, 
          status: 'running',
          message: previewMessage,
          media_url: previewMediaUrl,
          media_type: previewMediaType
        } : null);
        fetchRecipients(resumeCampaignTarget.id);
      }
    } catch (err) {
      toast.error('Failed to update and resume campaign');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running': return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 font-black">RUNNING</Badge>;
      case 'completed': return <Badge className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 px-3 font-black">COMPLETED</Badge>;
      case 'failed': return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 px-3 font-black">FAILED</Badge>;
      default: return <Badge className="bg-slate-500/10 text-slate-500 border-slate-500/20 px-3 font-black uppercase">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Broadcast Campaigns</h3>
          <p className="text-xs text-slate-500 font-medium">Staggered messaging with smart anti-ban delays.</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isSessionActive}
              title={!isSessionActive ? "Reconnect WhatsApp to launch campaigns" : ""}
            >
              <Plus className="mr-2 h-4 w-4" /> New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-black text-xl">Create Broadcast Campaign</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Campaign Name</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Summer Promo 2024" className="rounded-xl h-11 font-medium" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Target Group</Label>
                  <Select onValueChange={setGroupId} value={groupId}>
                    <SelectTrigger className="rounded-xl h-11 font-medium">
                      <SelectValue placeholder="Select a contact group" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                      {groups.map(g => (
                        <SelectItem key={g.id} value={g.id.toString()}>{g.name} ({g.contact_count} contacts)</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Media Attachment (Optional)</Label>
                  <div className="flex flex-col gap-2">
                    {mediaUrl ? (
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">File ready for broadcast</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => { setMediaUrl(''); setMediaType('image'); }} className="h-7 w-7 text-rose-500 hover:bg-rose-50 rounded-lg">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : mediaUploading ? (
                      <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-2xl bg-indigo-50/20 dark:bg-indigo-900/10">
                        <Loader2 className="h-6 w-6 text-indigo-500 animate-spin mb-2" />
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Uploading...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20">
                        <Upload className="h-6 w-6 text-slate-300 mb-2" />
                        <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-tighter">Max 10MB (Img/Vid/PDF)</p>
                        <Input 
                          type="file" 
                          className="hidden" 
                          id="media-upload" 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 10 * 1024 * 1024) {
                              toast.error('File size exceeds 10MB limit');
                              return;
                            }
                            try {
                              setMediaUploading(true);
                              const formData = new FormData();
                              formData.append('file', file);
                              const res = await axios.post(`${WHATSAPP_BASE_URL}/campaigns/upload`, formData);
                              
                              // Fix: Remove /api from the end of the URL to get the root for static files
                              const rootUrl = WHATSAPP_BASE_URL.replace(/\/api$/, '');
                              setMediaUrl(`${rootUrl}${res.data.url}`);
                              
                              setMediaType(res.data.type === 'application' ? 'document' : res.data.type);
                              toast.success('Media uploaded successfully');
                            } catch (err) {
                              toast.error('Media upload failed');
                            } finally {
                              setMediaUploading(false);
                            }
                          }}
                        />
                        <Button size="sm" variant="outline" className="rounded-xl font-bold h-8 text-[10px]" onClick={() => document.getElementById('media-upload')?.click()}>
                          Choose File
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Rocket className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
                    <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Anti-Ban Safety Advisor</p>
                  </div>
                  
                  {message && /https?:\/\//i.test(message) && mediaUrl ? (
                    <div className="flex items-start gap-1.5 p-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-lg">
                      <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <p className="text-[9px] text-rose-700 dark:text-rose-400 font-bold leading-normal">
                        ⚠️ DANGER: Media + Link combination detected. Outbox safety workers will automatically block cold campaigns using this combination to protect your sender number. Please remove either the link or the media attachment.
                      </p>
                    </div>
                  ) : message && !(/\{([^\}]+?)\}/.test(message) || /\[([^\]]+?)\]/.test(message)) ? (
                    <div className="flex items-start gap-1.5 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-lg">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[9px] text-amber-700 dark:text-amber-400 font-medium leading-normal">
                        💡 RECOMMENDATION: Write message variations using Spintax format, e.g. <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">{"{Hi|Hello|Hey}"}</code>. This prevents Meta's fingerprinting algorithms from blocking your identical outbound layouts.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-start gap-1.5 p-2 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-lg">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-[9px] text-emerald-700 dark:text-emerald-400 font-medium leading-normal">
                        🛡️ AI PROTECTIONS ACTIVE: Safe human typing delays, random delay jitter, sleep cycles, and daily contact limits are active.
                      </p>
                    </div>
                  )}
                  <p className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-right">
                    Pacing Engine v2.0 Live
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2 h-full flex flex-col">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Broadcast Message</Label>
                    <Badge variant="outline" className="text-[10px] bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 border-none px-2 font-bold">SPINTAX SUPPORTED</Badge>
                  </div>
                  <textarea 
                    value={message} 
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Hello {name}, check out our new offer! {Good luck|Cheers}"
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none min-h-[180px]"
                  />
                  <p className="text-[10px] text-slate-400 mt-2 font-medium italic">Use {'{opt1|opt2}'} for dynamic variations.</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button 
                onClick={handleLaunchCampaign} 
                disabled={isLaunching || !name || (!message && !mediaUrl) || !groupId} 
                className="flex-1 bg-indigo-600 h-12 font-black rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLaunching ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Launching...</>
                ) : (
                  <><Rocket className="mr-2 h-4 w-4" /> Launch Staggered Campaign</>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!isSessionActive && (
        <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
          <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
            This WhatsApp session is disconnected. You must reconnect it from the top-right button to launch or resume campaigns.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <Rocket className="h-12 w-12 text-slate-200 mb-4" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No campaigns found</p>
          <p className="text-xs text-slate-400 mt-2">Launch your first broadcast campaign with anti-ban protection.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map(campaign => (
            <Card key={campaign.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden rounded-2xl group hover:border-indigo-200 dark:hover:border-indigo-800 transition-all">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center">
                  <div className="flex-1 p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-black text-slate-900 dark:text-white truncate">{campaign.name}</h4>
                      {getStatusBadge(campaign.status)}
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" /> {format(new Date(campaign.created_at), 'MMM dd, HH:mm')}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" /> Delay: {campaign.min_delay}-{campaign.max_delay}s
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 mt-4">
                      <p className="flex-1 text-sm text-slate-600 dark:text-slate-400 font-medium line-clamp-1 italic bg-slate-50 dark:bg-slate-950/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                        "{campaign.message}"
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="rounded-lg h-9 font-black text-[10px] uppercase tracking-wider border-slate-200 dark:border-slate-800 shrink-0"
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          fetchRecipients(campaign.id);
                          setIsViewDetailsOpen(true);
                        }}
                      >
                        <Search className="mr-2 h-3 w-3" /> View Report
                      </Button>
                      
                      {campaign.status === 'running' && (
                        <Button 
                          size="sm" variant="outline" className="rounded-lg h-9 text-rose-500 border-rose-200 hover:bg-rose-50"
                          onClick={(e) => handlePauseCampaign(campaign.id, e)}
                          disabled={isProcessingAction}
                        >
                          <Pause className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      
                      {campaign.status === 'paused' && (
                        <Button 
                          size="sm" variant="outline" className="rounded-lg h-9 text-emerald-500 border-emerald-200 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={(e) => openResumePreview(campaign, e)}
                          disabled={isProcessingAction || !isSessionActive}
                          title={!isSessionActive ? "Reconnect WhatsApp to resume" : "Resume Campaign"}
                        >
                          <Play className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="md:w-72 bg-slate-50/50 dark:bg-slate-950/20 border-l border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-center gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        <span>Progress</span>
                        <span>{Math.round((campaign.sent_count / (campaign.total_contacts || 1)) * 100)}%</span>
                      </div>
                      <Progress value={(campaign.sent_count / (campaign.total_contacts || 1)) * 100} className="h-2 bg-slate-200 dark:bg-slate-800" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-inner ring-1 ring-slate-100 dark:ring-slate-800">
                        <p className="text-xl font-black text-indigo-600">{campaign.sent_count}</p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Sent</p>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-inner ring-1 ring-slate-100 dark:ring-slate-800">
                        <p className="text-xl font-black text-rose-500">{campaign.failed_count}</p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Failed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent 
          onInteractOutside={(e) => e.preventDefault()} 
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl"
        >
          <div className="p-6 pb-2 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl sticky top-0 z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
                  <Rocket className="h-5 w-5 text-indigo-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Campaign Report</span>
                  <DialogHeader className="p-0">
                    <DialogTitle className="font-black text-xl text-slate-900 dark:text-white">{selectedCampaign?.name}</DialogTitle>
                  </DialogHeader>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                  onClick={() => selectedCampaign && deleteCampaign(selectedCampaign.id)}
                  title="Delete Campaign"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setIsViewDetailsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 mb-4">
               <Badge variant="outline" className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-black text-[10px] py-1 px-3">
                  {recipients.length} TOTAL RECIPIENTS
                </Badge>
                <div className="flex flex-1 items-center gap-3">
                  {selectedCampaign && getStatusBadge(selectedCampaign.status)}
                  
                  {selectedCampaign?.status === 'running' && (
                    <Button 
                      size="sm" className="h-8 px-3 rounded-lg text-xs font-black bg-rose-500 hover:bg-rose-600 text-white shadow-sm"
                      onClick={() => handlePauseCampaign(selectedCampaign.id)}
                      disabled={isProcessingAction}
                    >
                      <Pause className="mr-1.5 h-3 w-3" /> Pause
                    </Button>
                  )}
                  
                  {selectedCampaign?.status === 'paused' && (
                    <div className="flex items-center gap-2">
                      <Input 
                        placeholder="Limit (e.g. 50)"
                        type="number"
                        min="1"
                        value={resumeLimit}
                        onChange={(e) => setResumeLimit(e.target.value)}
                        className="w-32 h-8 text-xs font-bold rounded-lg border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-900/10 focus-visible:ring-emerald-500"
                      />
                      <Button 
                        size="sm" className="h-8 px-3 rounded-lg text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => openResumePreview(selectedCampaign)}
                        disabled={isProcessingAction || !isSessionActive}
                        title={!isSessionActive ? "Reconnect WhatsApp to resume" : ""}
                      >
                        <Play className="mr-1.5 h-3 w-3" /> Resume
                      </Button>
                    </div>
                  )}
                </div>
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search phone or error..." 
                  value={recipientSearch}
                  onChange={e => {
                    setRecipientSearch(e.target.value);
                    setCurrentPage(1); // Reset to page 1 on search
                  }}
                  className="pl-10 h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl font-medium text-sm"
                />
              </div>
              
              {/* Pagination Controls */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 rounded-lg" 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="px-3 flex flex-col items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-0.5">Page</span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {currentPage} <span className="text-slate-400">/</span> {totalPages || 1}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 rounded-lg" 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0 bg-slate-50/30 dark:bg-slate-950/20 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              <div className="space-y-2">
                {recipientsLoading ? (
                  <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest animate-pulse">Analyzing Broadcast Data...</p>
                  </div>
                ) : paginatedRecipients.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <Search className="h-12 w-12 text-slate-200 mb-4" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No matching recipients</p>
                    <p className="text-xs text-slate-400 mt-2">Try a different phone number or filter.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {paginatedRecipients.map((r, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/50 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-8 w-8 rounded-lg flex items-center justify-center font-black text-[10px]",
                            r.status === 'sent' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 
                            r.status === 'failed' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10' : 'bg-slate-50 text-slate-600 dark:bg-slate-800'
                          )}>
                            {r.phone.substring(0, 2)}
                          </div>
                          <div className="flex flex-col">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">+{r.phone}</p>
                            {r.error_message && (
                              <p className="text-[9px] font-bold text-rose-500 truncate max-w-[200px] sm:max-w-[400px]">
                                {r.error_message}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <div className="hidden sm:flex flex-col items-end">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sent At</span>
                             <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                               {r.sent_at ? format(new Date(r.sent_at), 'HH:mm:ss') : '--:--:--'}
                             </span>
                          </div>
                          <Badge className={cn(
                            "text-[9px] font-black tracking-widest px-3 min-w-[80px] justify-center",
                            r.status === 'sent' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                            r.status === 'failed' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                          )}>
                            {r.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resume Campaign Preview & Re-upload Dialog */}
      <Dialog open={isResumePreviewOpen} onOpenChange={setIsResumePreviewOpen}>
        <DialogContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-black text-xl flex items-center gap-2">
              <Play className="h-5 w-5 text-indigo-500 fill-indigo-500" />
              Resume Campaign Preview
            </DialogTitle>
          </DialogHeader>

          {resumeCampaignTarget && (
            <div className="space-y-6 py-4">
              {/* Campaign Info */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Campaign Name</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{resumeCampaignTarget.name}</p>
              </div>

              {/* Message Content Preview/Edit */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Edit / Review Message</Label>
                <textarea 
                  value={previewMessage}
                  onChange={(e) => setPreviewMessage(e.target.value)}
                  className="w-full h-32 p-3 text-sm font-medium bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Type message content here..."
                />
              </div>

              {/* Media Attachment Review / Re-upload */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Campaign Media Attachment</Label>
                
                {previewMediaUrl ? (
                  <div className="space-y-4">
                    {/* Media File Card */}
                    <div className={cn(
                      "flex items-center justify-between p-3 rounded-xl border transition-all",
                      previewMediaMissing 
                        ? "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/40" 
                        : "bg-slate-50 border-indigo-100 text-slate-700 dark:bg-slate-900 dark:border-indigo-900/30"
                    )}>
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className={cn("h-4 w-4 shrink-0", previewMediaMissing ? "text-rose-500" : "text-indigo-500")} />
                        <span className="text-xs font-bold truncate">
                          {previewMediaMissing 
                            ? "⚠️ Attached Media File is missing from the server!" 
                            : `Attachment Loaded (${previewMediaType})`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => { setPreviewMediaUrl(''); setPreviewMediaType('image'); }} 
                          className="h-7 w-7 text-rose-500 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Preview Area (If not missing and is image) */}
                    {!previewMediaMissing && previewMediaType === 'image' && (
                      <div className="flex justify-center p-2 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50">
                        <img 
                          src={previewMediaUrl} 
                          alt="Campaign Preview" 
                          className="max-h-32 object-contain rounded-lg"
                        />
                      </div>
                    )}

                    {/* Re-upload Option Button if Missing */}
                    {previewMediaMissing && (
                      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-rose-300 dark:border-rose-800 rounded-2xl bg-rose-50/20 dark:bg-rose-900/5">
                        <Upload className="h-6 w-6 text-rose-400 mb-2" />
                        <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-3">Re-upload media to replace the missing file</p>
                        <Input 
                          type="file" 
                          className="hidden" 
                          id="preview-media-upload" 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 10 * 1024 * 1024) {
                              toast.error('File size exceeds 10MB limit');
                              return;
                            }
                            try {
                              setPreviewMediaUploading(true);
                              const formData = new FormData();
                              formData.append('file', file);
                              const res = await axios.post(`${WHATSAPP_BASE_URL}/campaigns/upload`, formData);
                              
                              const rootUrl = WHATSAPP_BASE_URL.replace(/\/api$/, '');
                              setPreviewMediaUrl(`${rootUrl}${res.data.url}`);
                              setPreviewMediaType(res.data.type === 'application' ? 'document' : res.data.type);
                              setPreviewMediaMissing(false);
                              toast.success('Media re-uploaded successfully');
                            } catch (err) {
                              toast.error('Media upload failed');
                            } finally {
                              setPreviewMediaUploading(false);
                            }
                          }}
                        />
                        <Button 
                          size="sm" 
                          className="rounded-xl font-bold bg-rose-500 hover:bg-rose-600 text-white h-8 text-[10px]" 
                          disabled={previewMediaUploading}
                          onClick={() => document.getElementById('preview-media-upload')?.click()}
                        >
                          {previewMediaUploading ? (
                            <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Uploading...</>
                          ) : "Choose & Re-upload Media"}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : previewMediaUploading ? (
                  <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-2xl bg-indigo-50/20 dark:bg-indigo-900/10">
                    <Loader2 className="h-6 w-6 text-indigo-500 animate-spin mb-2" />
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest animate-pulse">Uploading...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20">
                    <Upload className="h-6 w-6 text-slate-300 mb-2" />
                    <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-tighter">Max 10MB (Img/Vid/PDF)</p>
                    <Input 
                      type="file" 
                      className="hidden" 
                      id="preview-media-upload-new" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 10 * 1024 * 1024) {
                          toast.error('File size exceeds 10MB limit');
                          return;
                        }
                        try {
                          setPreviewMediaUploading(true);
                          const formData = new FormData();
                          formData.append('file', file);
                          const res = await axios.post(`${WHATSAPP_BASE_URL}/campaigns/upload`, formData);
                          
                          const rootUrl = WHATSAPP_BASE_URL.replace(/\/api$/, '');
                          setPreviewMediaUrl(`${rootUrl}${res.data.url}`);
                          setPreviewMediaType(res.data.type === 'application' ? 'document' : res.data.type);
                          setPreviewMediaMissing(false);
                          toast.success('Media attached successfully');
                        } catch (err) {
                          toast.error('Media upload failed');
                        } finally {
                          setPreviewMediaUploading(false);
                        }
                      }}
                    />
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="rounded-xl font-bold h-8 text-[10px]" 
                      onClick={() => document.getElementById('preview-media-upload-new')?.click()}
                    >
                      Attach Media File
                    </Button>
                  </div>
                )}
              </div>

              {/* Dynamic Warning for running campaign when media is missing */}
              {previewMediaMissing && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-2xl flex items-start gap-2.5">
                  <AlertCircle className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-rose-700 dark:text-rose-400 font-bold leading-relaxed">
                    CRITICAL: The attached media is missing. Sending will fail. You must re-upload a media file or remove the attachment before you can resume.
                  </p>
                </div>
              )}
              {/* Deliverability & Anti-Ban Safety Assistant Card */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <Rocket className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
                  <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Anti-Ban Safety Advisor</p>
                </div>
                
                {previewMessage && /https?:\/\//i.test(previewMessage) && previewMediaUrl ? (
                  <div className="flex items-start gap-1.5 p-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-lg">
                    <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-[9px] text-rose-700 dark:text-rose-400 font-bold leading-normal">
                      ⚠️ DANGER: Media + Link combination detected. Outbox safety workers will automatically block cold campaigns using this combination to protect your sender number. Please remove either the link or the media attachment.
                    </p>
                  </div>
                ) : previewMessage && !(/\{([^\}]+?)\}/.test(previewMessage) || /\[([^\]]+?)\]/.test(previewMessage)) ? (
                  <div className="flex items-start gap-1.5 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-lg">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[9px] text-amber-700 dark:text-amber-400 font-medium leading-normal">
                      💡 RECOMMENDATION: Write message variations using Spintax format, e.g. <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">{"{Hi|Hello|Hey}"}</code>. This prevents Meta's fingerprinting algorithms from blocking your identical outbound layouts.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-start gap-1.5 p-2 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-lg">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-[9px] text-emerald-700 dark:text-emerald-400 font-medium leading-normal">
                      🛡️ AI PROTECTIONS ACTIVE: Safe human typing delays, random delay jitter, sleep cycles, and daily contact limits are active.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsResumePreviewOpen(false)}
                  className="rounded-xl h-11 font-bold text-xs uppercase tracking-wider"
                  disabled={isProcessingAction}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmResume}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-11 font-black text-xs uppercase tracking-widest px-6 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  disabled={isProcessingAction || previewMediaUploading || previewMediaMissing}
                >
                  {isProcessingAction ? (
                    <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Resuming...</>
                  ) : "Confirm & Resume"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
