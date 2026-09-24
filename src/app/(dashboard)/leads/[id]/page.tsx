'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getLead, updateLead, deleteLead, teamApi } from '@/lib/api'
import { Lead, temperatureConfig, defaultStages, sourceConfig } from '../types'
import { 
  ChevronLeft, 
  Phone, 
  MessageSquare, 
  Edit2, 
  Trash2, 
  User, 
  Globe, 
  Mail, 
  Building2, 
  IndianRupee,
  Briefcase,
  MapPin,
  Calendar,
  Wallet,
  AlertCircle,
  Copy,
  Check,
  Flame,
  ThermometerSun,
  Snowflake
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { RoleGuard } from '@/components/RoleGuard'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getAgentColor } from '@/utils/agentColors'
import { useTheme } from 'next-themes'
import { EditLeadDialog } from '../components/dialogs/EditLeadDialog'
import { DeleteConfirmationDialog } from '../components/dialogs/DeleteConfirmationDialog'
import { toTelHref, toWhatsAppPhone } from '@/lib/phone'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export default function LeadDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [isAssigning, setIsAssigning] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [showEditLead, setShowEditLead] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false })
  const [copiedField, setCopiedField] = useState<string | null>(null)
  
  const { theme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark' || theme === 'dark'

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const data = await getLead(Number(id))
        setLead(data)
      } catch (error) {
        console.error('Failed to fetch lead:', error)
        toast.error("Failed to load lead details")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) fetchLead()
  }, [id])

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const members = await teamApi.getMembers()
        setTeamMembers(members)
      } catch (e) {
        console.error('Failed to fetch team members:', (e as any)?.message || e)
      }
    }
    fetchTeam()
  }, [])

  const handleAssignAgent = async (agentId: string) => {
    if (!lead) return
    try {
      setIsAssigning(true)
      const updateData = agentId === 'unassigned' ? { user_id: null } : { user_id: parseInt(agentId) }
      await updateLead(lead.id, updateData)
      toast.success("Lead assigned successfully")
      const data = await getLead(lead.id)
      setLead(data)
    } catch (error) {
      console.error('Failed to assign lead:', error)
      toast.error("Failed to assign representative")
    } finally {
      setIsAssigning(false)
    }
  }

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead)
    setShowEditLead(true)
  }

  const handleUpdateSubmit = async (updatedData: Lead | null) => {
    if (!updatedData) return
    try {
      setIsUpdating(true)
      const { id, ...data } = updatedData
      await updateLead(id, data as any)
      toast.success('Lead updated successfully')
      
      const freshLead = await getLead(id)
      setLead(freshLead)
      setEditingLead(null)
      setShowEditLead(false)
    } catch (error) {
      toast.error('Failed to update lead')
    } finally {
      setIsUpdating(false)
    }
  }

  const confirmDelete = async () => {
    if (!lead) return
    try {
      await deleteLead(lead.id)
      toast.success("Lead deleted successfully")
      router.push('/leads')
    } catch (error) {
      toast.error('Failed to delete lead')
    } finally {
      setDeleteConfirmation({ isOpen: false })
    }
  }

  const handleCall = () => {
    if (!lead?.phone) return;
    const a = document.createElement('a');
    a.href = toTelHref(lead.phone);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    toast.success(`Copied ${fieldName} to clipboard`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-6 w-36 rounded-md" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>

        <div className="flex gap-4 items-center py-4 border-b border-slate-100 dark:border-slate-800">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-48 rounded-md" />
            <Skeleton className="h-4 w-32 rounded-md" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-5 mb-4 text-slate-700 dark:text-slate-200">
          <User className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white mb-1">Lead not found</h2>
        <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mb-4 max-w-sm">The lead you are looking for might have been deleted or does not exist.</p>
        <Button onClick={() => router.push('/leads')} variant="default" className="rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white">
          <ChevronLeft className="mr-1.5 h-4 w-4" /> Back to Leads
        </Button>
      </div>
    )
  }

  const stage = (defaultStages as any)[lead.stage] || { color: 'bg-slate-600 text-white', icon: User };
  const sourceItem = (sourceConfig as any)[lead.source];
  const SourceIcon = sourceItem?.icon || Globe;

  return (
    <RoleGuard allowedFeatures={['leads']}>
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden font-sans">
        
        {/* Clean Top Navigation Bar */}
        <div className="shrink-0 px-5 sm:px-8 py-3.5 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/leads')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-xs h-auto w-auto"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Leads</span>
            </Button>
            <div className="hidden sm:flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Lead ID</span>
              <span className="text-xs font-bold font-heading text-slate-800 dark:text-slate-200 bg-slate-200/70 dark:bg-slate-800 px-2 py-0.5 rounded-md">#{lead.id}</span>
            </div>
          </div>

          {/* Desktop Solid Actions Toolbar */}
          <div className="flex items-center gap-2">
            <TooltipProvider>
              {lead.phone && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="default"
                        onClick={() => window.open(`https://wa.me/${toWhatsAppPhone(lead.phone)}`, '_blank')} 
                        className="h-8 px-3.5 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all hover:scale-[1.02] w-auto"
                      >
                        <i className="ti ti-brand-whatsapp text-[14px]" />
                        <span className="hidden md:inline">WhatsApp</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="text-[10px] font-medium">Send WhatsApp Message</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="default"
                        onClick={handleCall} 
                        className="h-8 px-3.5 flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all hover:scale-[1.02] w-auto"
                      >
                        <i className="ti ti-phone text-[14px]" />
                        <span className="hidden md:inline">Call</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="text-[10px] font-medium">Call Lead</TooltipContent>
                  </Tooltip>
                </>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="default"
                    onClick={() => handleEdit(lead)} 
                    className="h-8 px-3.5 flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all hover:scale-[1.02] w-auto"
                  >
                    <i className="ti ti-edit text-[14px]" />
                    <span className="hidden md:inline">Edit</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="text-[10px] font-medium">Edit Lead Profile</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="destructive"
                    onClick={() => setDeleteConfirmation({ isOpen: true })} 
                    className="h-8 px-3.5 flex items-center justify-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-all hover:scale-[1.02] w-auto"
                  >
                    <i className="ti ti-trash text-[14px]" />
                    <span className="hidden md:inline">Delete</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="text-[10px] font-medium">Delete Lead</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 space-y-7 custom-scrollbar">
          
          {/* Seamless Header (Unboxed Profile Banner) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-start gap-4 sm:gap-5">
              {/* Profile Avatar Circle */}
              <div className="flex h-16 w-16 sm:h-18 sm:w-18 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-bold font-heading text-2xl sm:text-3xl shadow-sm">
                {lead.name ? lead.name.charAt(0).toUpperCase() : 'L'}
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
                    {lead.name}
                  </h1>
                  {lead.is_incomplete && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500 text-white shadow-xs">
                      <AlertCircle className="h-3 w-3" />
                      Missing Phone
                    </span>
                  )}
                </div>

                <p className="text-sm font-normal text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                  {lead.company && (
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      {lead.company}
                    </span>
                  )}
                  {lead.profession && (
                    <span className="flex items-center gap-1.5 before:content-['•'] before:mr-1 before:text-slate-300 text-slate-600 dark:text-slate-300">
                      <Briefcase className="h-4 w-4 text-slate-400" />
                      {lead.profession}
                    </span>
                  )}
                  {lead.city && (
                    <span className="flex items-center gap-1.5 before:content-['•'] before:mr-1 before:text-slate-300 text-slate-600 dark:text-slate-300">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      {lead.city}
                    </span>
                  )}
                </p>

                {/* Badges Row */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Badge className={cn("border-none rounded-full px-3 py-0.5 font-semibold text-white text-[11px] shadow-xs", stage.color)}>
                    <i className="ti ti-tag mr-1 text-[11px]" />
                    {lead.stage}
                  </Badge>

                  {lead.status && (
                    <Badge className={cn("border-none rounded-full px-3 py-0.5 font-semibold text-white text-[11px] shadow-xs", (temperatureConfig as any)[lead.status]?.color || 'bg-slate-600')}>
                      {lead.status === 'Hot' && <Flame className="h-3 w-3 mr-1" />}
                      {lead.status === 'Warm' && <ThermometerSun className="h-3 w-3 mr-1" />}
                      {lead.status === 'Cold' && <Snowflake className="h-3 w-3 mr-1" />}
                      {lead.status}
                    </Badge>
                  )}

                  {lead.source && (
                    <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-white dark:bg-slate-700 shadow-xs">
                      <SourceIcon className="h-3 w-3 text-white" />
                      <span>{lead.source}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Unified Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-slate-800 bg-slate-50/70 dark:bg-slate-850/70 rounded-xl border border-slate-200/80 dark:border-slate-800 p-2 overflow-hidden">
            {/* Deal Value */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">Deal Value</span>
                <div className="flex items-center gap-1 text-2xl font-bold font-heading text-slate-900 dark:text-white tabular-nums">
                  <span className="text-base font-medium text-slate-400">₹</span>
                  <span>{Number(lead.deal_value || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <IndianRupee className="h-5 w-5" />
              </div>
            </div>

            {/* Paid Amount */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">Paid Amount</span>
                <div className="flex items-center gap-1 text-2xl font-bold font-heading text-emerald-600 dark:text-emerald-400 tabular-nums">
                  <span className="text-base font-medium text-emerald-600/70">₹</span>
                  <span>{Number(lead.paid_amount || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Wallet className="h-5 w-5" />
              </div>
            </div>

            {/* Representative Assignment */}
            <div className="p-4 flex flex-col justify-center">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">Assigned Agent</span>
              <Select 
                value={lead.user_id?.toString() || lead.agent?.id?.toString() || 'unassigned'} 
                onValueChange={handleAssignAgent}
                disabled={isAssigning}
              >
                <SelectTrigger className="h-9 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg px-3 font-medium focus:ring-2 focus:ring-indigo-500 w-full shadow-xs">
                  <div className="flex items-center gap-2 truncate">
                    {lead.agent ? (
                      <div 
                        className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 shadow-xs"
                        style={{ backgroundColor: getAgentColor(lead.agent.id).bg }}
                      >
                        {lead.agent.name.split(' ').filter(Boolean).map((n: string) => n[0].toUpperCase()).join('')}
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-slate-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <User className="h-3 w-3" />
                      </div>
                    )}
                    <span className="truncate font-medium">{lead.agent?.name || 'Unassigned'}</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700">
                  <SelectItem value="unassigned" className="text-slate-800 dark:text-slate-200 font-medium text-xs rounded-lg cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-slate-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <User className="h-3 w-3" />
                      </div>
                      <span>Unassigned</span>
                    </div>
                  </SelectItem>
                  {teamMembers.map((member) => {
                    const agentColors = getAgentColor(member.id);
                    return (
                      <SelectItem key={member.id} value={member.id.toString()} className="rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer">
                        <div className="flex items-center gap-2.5">
                          <div 
                            className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 shadow-xs"
                            style={{ backgroundColor: agentColors.bg }}
                          >
                            {member.name.split(' ').filter(Boolean).map((n: string) => n[0].toUpperCase()).join('')}
                          </div>
                          <span>{member.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Two Seamless Main Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
            
            {/* Left Column: Contact & Demographics */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold font-heading uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  Contact & Demographics
                </h3>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {/* Phone */}
                  <div className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Phone className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Phone Number</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100 tabular-nums">
                          {lead.phone || 'No phone number'}
                        </span>
                      </div>
                    </div>
                    {lead.phone && (
                      <Button 
                        variant="ghost" size="icon"
                        onClick={() => copyToClipboard(lead.phone, 'Phone')} 
                        className="h-7 w-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all p-0"
                      >
                        {copiedField === 'Phone' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    )}
                  </div>

                  {/* Email */}
                  <div className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Mail className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Email Address</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate block">
                          {lead.email || 'No email address'}
                        </span>
                      </div>
                    </div>
                    {lead.email && (
                      <Button 
                        variant="ghost" size="icon"
                        onClick={() => copyToClipboard(lead.email, 'Email')} 
                        className="h-7 w-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all p-0"
                      >
                        {copiedField === 'Email' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    )}
                  </div>

                  {/* Company */}
                  <div className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Building2 className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Company / Organization</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {lead.company || 'Not specified'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Profession */}
                  <div className="py-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Briefcase className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Profession / Role</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{lead.profession || 'Not specified'}</span>
                    </div>
                  </div>

                  {/* City */}
                  <div className="py-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <MapPin className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">City / Location</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{lead.city || 'Not specified'}</span>
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="py-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Calendar className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Created Date</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100 tabular-nums">
                        {lead.created_at ? format(new Date(lead.created_at), 'PPP | hh:mm a') : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Unified Notes & System Info */}
            <div className="space-y-7">
              {/* Internal Notes */}
              <div>
                <h3 className="text-xs font-bold font-heading uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
                  <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  Internal Notes & Custom Data
                </h3>

                <div>
                  {lead.notes ? (
                    (() => {
                      try {
                        const parsed = JSON.parse(lead.notes);
                        if (typeof parsed === 'object' && parsed !== null) {
                          return (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {Object.entries(parsed).map(([key, value]) => (
                                <div key={key} className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-100 dark:border-slate-800">
                                  <span className="text-[10.5px] uppercase font-semibold tracking-wider text-slate-400 block mb-0.5">{key}</span>
                                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          );
                        }
                      } catch (e) {}
                      
                      return (
                        <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-normal">
                            "{lead.notes}"
                          </p>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="py-6 text-slate-400">
                      <p className="text-xs font-normal text-slate-500">No notes recorded for this lead yet.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* System Metadata */}
              <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800">
                <h3 className="text-xs font-bold font-heading uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3">System Information</h3>
                
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-slate-500 dark:text-slate-400 font-normal">Lead ID</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 tabular-nums">#{lead.id}</span>
                  </div>

                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-slate-500 dark:text-slate-400 font-normal">Last Updated</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 tabular-nums">
                      {lead.updated_at ? format(new Date(lead.updated_at), 'PPP p') : 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-slate-500 dark:text-slate-400 font-normal">System Status</span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                      Active Lead
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="h-12" />
        </div>

        {/* Mobile Floating Action Bar */}
        <div className="sm:hidden fixed bottom-4 left-4 right-4 z-40 flex items-center gap-2">
          {lead.phone && (
            <>
              <Button 
                variant="default"
                onClick={() => window.open(`https://wa.me/${toWhatsAppPhone(lead.phone)}`, '_blank')} 
                className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <i className="ti ti-brand-whatsapp text-lg" />
                <span>WhatsApp</span>
              </Button>

              <Button 
                variant="default"
                onClick={handleCall} 
                className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <i className="ti ti-phone text-lg" />
                <span>Call</span>
              </Button>
            </>
          )}
        </div>

        {/* Dialogs */}
        <EditLeadDialog
          isOpen={showEditLead}
          onOpenChange={setShowEditLead}
          lead={editingLead as any}
          setLead={setEditingLead as any}
          stages={defaultStages}
          isUpdating={isUpdating}
          onUpdate={handleUpdateSubmit as any}
          onCancel={() => setShowEditLead(false)}
        />

        <DeleteConfirmationDialog
          isOpen={deleteConfirmation.isOpen}
          onOpenChange={(isOpen: boolean) => setDeleteConfirmation({ isOpen })}
          leadName={lead.name}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirmation({ isOpen: false })}
        />
      </div>
    </RoleGuard>
  )
}
