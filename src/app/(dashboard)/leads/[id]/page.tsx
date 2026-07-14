'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getLead, Lead, updateLead, teamApi } from '@/lib/api'
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
  Clock,
  IndianRupee,
  Briefcase,
  MapPin,
  Calendar,
  Wallet
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { temperatureConfig, defaultStages } from '../types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { RoleGuard } from '@/components/RoleGuard'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getAgentColor } from '@/utils/agentColors'
import { useTheme } from 'next-themes'

export default function LeadDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [isAssigning, setIsAssigning] = useState(false)
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
        console.error('Failed to fetch team members:', e)
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

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-950">
        <div className="p-4 flex items-center gap-4 border-b border-slate-100 dark:border-slate-800">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-5 w-24 rounded-lg" />
        </div>
        <div className="flex-1 p-5 space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white dark:bg-slate-950">
        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 mb-4 border border-slate-100 dark:border-slate-800">
          <User className="h-10 w-10 text-slate-300" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Lead not found</h2>
        <Button onClick={() => router.back()} variant="ghost" className="mt-2 text-sm text-primary">
          <ChevronLeft className="mr-1 h-4 w-4" /> Go back
        </Button>
      </div>
    )
  }

  const temp = (temperatureConfig as any)[lead.status] || temperatureConfig.Cold;
  const stage = (defaultStages as any)[lead.stage] || { color: 'bg-slate-100 text-slate-600', icon: User };

  return (
    <RoleGuard allowedFeatures={['leads']}>
      <div className="flex flex-col absolute inset-0 sm:relative sm:inset-auto sm:h-full bg-[var(--crm-bg)] overflow-hidden z-10">
      {/* Subtle Header */}
      <div className="relative z-20 shrink-0 px-4 py-3 flex items-center justify-between border-b border-[var(--crm-border)] bg-[var(--crm-bg)]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="rounded-xl h-10 w-10 hover:bg-slate-50 dark:hover:bg-slate-900"
          >
            <ChevronLeft className="h-6 w-6 text-slate-500" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-[10px] font-bold uppercase tracking-widest text-[var(--crm-text-secondary)] mb-0.5">Lead Profile</h1>
            <p className="text-sm font-bold text-[var(--crm-text-primary)] leading-none truncate max-w-[150px]">{lead.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-[var(--crm-text-secondary)] hover:text-primary rounded-[var(--r-lg)] transition-all">
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-[var(--crm-text-secondary)] hover:text-rose-500 rounded-[var(--r-lg)] transition-all">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto relative z-10 no-scrollbar pb-32">
        {/* Profile Header Area - Edge to Edge */}
        <div className="px-5 pt-6 pb-8 border-b border-[var(--crm-border)] bg-[var(--crm-bg)]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-black text-[var(--crm-text-primary)] mb-3 truncate tracking-tight">{lead.name}</h2>
              <div className="flex flex-wrap gap-2.5 items-center">
                <Badge variant="secondary" className={cn("px-3 py-1 rounded-[var(--r-pill)] text-[11px] font-bold uppercase tracking-wider border-none shadow-none", stage.color)}>
                  {lead.stage}
                </Badge>
                <div className={cn("inline-flex items-center px-3 py-1 rounded-[var(--r-pill)] text-[11px] font-bold uppercase tracking-wider", temp.color)}>
                   {lead.status}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Info Grid */}
        <div className="p-0 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-0 sm:gap-6">
          {/* Quick Stats Section */}
          <div className="bg-[var(--crm-surface-1)] sm:rounded-[var(--r-2xl)] border-b sm:border border-[var(--crm-border)]">
            <div className="px-5 py-4 border-b border-[var(--crm-border)]">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--crm-text-secondary)]">Overview</h3>
            </div>
            <div className="divide-y divide-[var(--crm-border)]">
              <div className="p-4 flex items-center justify-between hover:bg-[var(--crm-surface-2)] transition-colors">
                <div className="flex items-center gap-3 text-[var(--crm-text-secondary)]">
                  <Wallet className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Deal Value</span>
                </div>
                <div className="flex items-center gap-1 text-lg font-black text-[var(--crm-text-primary)]">
                  <IndianRupee className="h-4 w-4 text-emerald-500/80" />
                  {lead.deal_value || 0}
                </div>
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-[var(--crm-surface-2)] transition-colors">
                <div className="flex items-center gap-3 text-[var(--crm-text-secondary)]">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Paid Amount</span>
                </div>
                <div className="flex items-center gap-1 text-lg font-black text-emerald-600 dark:text-emerald-400">
                  <IndianRupee className="h-4 w-4 opacity-60" />
                  {lead.paid_amount || 0}
                </div>
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-[var(--crm-surface-2)] transition-colors">
                <div className="flex items-center gap-3 text-[var(--crm-text-secondary)]">
                  <User className="h-4 w-4 text-purple-500" />
                  <span className="text-xs font-bold uppercase tracking-wider">Representative</span>
                </div>
                <div className="w-[160px]">
                  <Select 
                    value={lead.user_id?.toString() || lead.agent?.id?.toString() || 'unassigned'} 
                    onValueChange={handleAssignAgent}
                    disabled={isAssigning}
                  >
                    <SelectTrigger className="h-8 text-xs border-[var(--crm-border)] bg-[var(--crm-surface-1)] rounded-[var(--r-lg)] px-2.5 font-bold focus:ring-1 focus:ring-indigo-500 w-full">
                      <SelectValue placeholder="Assign" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-[var(--crm-border)]">
                      <SelectItem value="unassigned" className="text-[var(--crm-text-secondary)] font-bold text-xs rounded-lg">
                        Unassigned
                      </SelectItem>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id.toString()} className="rounded-lg text-xs">
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[9px] font-black"
                              style={{ backgroundColor: getAgentColor(member.id).bg }}
                            >
                              {member.name.split(' ').filter(Boolean).map((n: string) => n[0].toUpperCase()).join('')}
                            </div>
                            <span className="font-bold">{member.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-[var(--crm-surface-1)] sm:rounded-[var(--r-2xl)] border-b sm:border border-[var(--crm-border)]">
            <div className="px-5 py-4 border-b border-[var(--crm-border)] flex items-center justify-between">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--crm-text-secondary)]">Contact Details</h3>
              <Globe className="h-4 w-4 text-[var(--crm-text-secondary)] opacity-50" />
            </div>
            
            <div className="divide-y divide-[var(--crm-border)]">
              <div className="p-4 flex items-center gap-3 group cursor-pointer hover:bg-[var(--crm-surface-2)] transition-colors" onClick={() => window.open(`tel:${lead.phone}`, '_self')}>
                <Phone className="h-5 w-5 text-[var(--crm-text-secondary)] group-hover:text-primary transition-all shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-[var(--crm-text-secondary)] font-bold uppercase tracking-tight mb-0.5">Personal Phone</p>
                  <p className="text-sm font-bold text-[var(--crm-text-primary)]">{lead.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="p-4 flex items-center gap-3 group cursor-pointer hover:bg-[var(--crm-surface-2)] transition-colors" onClick={() => window.open(`mailto:${lead.email}`, '_blank')}>
                <Mail className="h-5 w-5 text-[var(--crm-text-secondary)] group-hover:text-primary transition-all shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-[var(--crm-text-secondary)] font-bold uppercase tracking-tight mb-0.5">Email Address</p>
                  <p className="text-sm font-bold text-[var(--crm-text-primary)] truncate">{lead.email || 'N/A'}</p>
                </div>
              </div>

              <div className="p-4 flex items-center gap-3 hover:bg-[var(--crm-surface-2)] transition-colors">
                <Building2 className="h-5 w-5 text-[var(--crm-text-secondary)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-[var(--crm-text-secondary)] font-bold uppercase tracking-tight mb-0.5">Organization</p>
                  <p className="text-sm font-bold text-[var(--crm-text-primary)]">{lead.company || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Background Info */}
          <div className="bg-[var(--crm-surface-1)] sm:rounded-[var(--r-2xl)] border-b sm:border border-[var(--crm-border)]">
            <div className="px-5 py-4 border-b border-[var(--crm-border)] flex items-center justify-between">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--crm-text-secondary)]">Background</h3>
              <Briefcase className="h-4 w-4 text-[var(--crm-text-secondary)] opacity-50" />
            </div>
            
            <div className="divide-y divide-[var(--crm-border)]">
              <div className="p-4 flex items-center gap-3 hover:bg-[var(--crm-surface-2)] transition-colors">
                <Briefcase className="h-5 w-5 text-[var(--crm-text-secondary)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-[var(--crm-text-secondary)] font-bold uppercase tracking-tight mb-0.5">Professional Role</p>
                  <p className="text-sm font-bold text-[var(--crm-text-primary)]">{lead.profession || 'N/A'}</p>
                </div>
              </div>

              <div className="p-4 flex items-center gap-3 hover:bg-[var(--crm-surface-2)] transition-colors">
                <MapPin className="h-5 w-5 text-[var(--crm-text-secondary)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-[var(--crm-text-secondary)] font-bold uppercase tracking-tight mb-0.5">Current City</p>
                  <p className="text-sm font-bold text-[var(--crm-text-primary)]">{lead.city || 'N/A'}</p>
                </div>
              </div>

              <div className="p-4 flex items-center gap-3 hover:bg-[var(--crm-surface-2)] transition-colors">
                <Calendar className="h-5 w-5 text-[var(--crm-text-secondary)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-[var(--crm-text-secondary)] font-bold uppercase tracking-tight mb-0.5">Acquisition Date</p>
                  <p className="text-sm font-bold text-[var(--crm-text-primary)]">{format(new Date(lead.created_at), 'PPP')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {lead.notes && (
          <div className="bg-[var(--crm-surface-1)] sm:rounded-[var(--r-2xl)] border-b sm:border border-[var(--crm-border)] mt-0 sm:mt-6">
            <div className="px-5 py-4 border-b border-[var(--crm-border)] flex items-center justify-between">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--crm-text-secondary)]">Internal Notes</h3>
              <MessageSquare className="h-4 w-4 text-[var(--crm-text-secondary)] opacity-50" />
            </div>
            <div className="p-6">
              {(() => {
                try {
                  const parsed = JSON.parse(lead.notes);
                  if (typeof parsed === 'object' && parsed !== null) {
                    return (
                      <div className="flex flex-col gap-3">
                        {Object.entries(parsed).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--crm-text-secondary)] block mb-1">{key}</span>
                            <span className="text-sm font-medium text-[var(--crm-text-primary)]">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                } catch (e) {}
                
                return (
                  <p className="text-sm text-[var(--crm-text-secondary)] leading-relaxed whitespace-pre-line italic font-medium">
                    "{lead.notes}"
                  </p>
                );
              })()}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="flex items-center justify-center gap-4 pt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--crm-text-secondary)] opacity-50">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            Updated {format(new Date(lead.updated_at), 'MMM dd, p')}
          </div>
        </div>

        <div className="h-28" />
      </div>

      {/* Floating Action Bar - Ultra Clean */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-5 pb-6 pt-4 bg-gradient-to-t from-[var(--crm-bg)] via-[var(--crm-bg)] to-transparent pointer-events-none">
        <div className="flex items-center justify-center gap-4 w-full max-w-sm mx-auto pointer-events-auto">
          <Button 
            className="h-14 w-14 p-0 text-white rounded-full flex items-center justify-center transition-all active:scale-95 shrink-0 border-none"
            style={{ backgroundColor: '#25D366', boxShadow: '0 10px 15px -3px rgba(37, 211, 102, 0.3)' }}
            onClick={() => {
              const phone = lead.phone.replace(/\D/g, '');
              window.open(`https://wa.me/${phone}`, '_blank');
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </Button>
          <Button 
            variant="outline"
            className="h-14 w-14 p-0 border-[var(--crm-border)] text-[var(--crm-text-primary)] rounded-full hover:bg-[var(--crm-surface-2)] transition-all active:scale-95 flex items-center justify-center bg-[var(--crm-surface-1)] shadow-lg shadow-slate-200/20 shrink-0"
            onClick={() => window.open(`tel:${lead.phone}`, '_self')}
          >
            <Phone className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
    </RoleGuard>
  )
}

function CheckCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
