'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getLead, Lead } from '@/lib/api'
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

export default function LeadDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
        <Button onClick={() => router.back()} variant="ghost" className="mt-2 text-sm text-indigo-600">
          <ChevronLeft className="mr-1 h-4 w-4" /> Go back
        </Button>
      </div>
    )
  }

  const temp = (temperatureConfig as any)[lead.status] || temperatureConfig.Cold;
  const stage = (defaultStages as any)[lead.stage] || { color: 'bg-slate-100 text-slate-600', icon: User };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 overflow-hidden relative">
      {/* Subtle Header */}
      <div className="relative z-20 shrink-0 px-4 py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
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
            <h1 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Lead Profile</h1>
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-none truncate max-w-[150px]">{lead.name}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-400 hover:text-indigo-600">
            <Edit2 className="h-4.5 w-4.5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-400 hover:text-rose-500">
            <Trash2 className="h-4.5 w-4.5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 relative z-10 no-scrollbar">
        {/* Profile Card - Enhanced Minimal */}
        <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-5 mb-6">
            <div className={cn("flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl font-black text-2xl uppercase border border-white dark:border-slate-700 shadow-sm transition-all hover:scale-105", temp.color)}>
              <temp.icon className="h-8 w-8" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1.5 truncate">{lead.name}</h2>
              <div className="flex flex-wrap gap-2 items-center">
                <Badge variant="secondary" className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border-none", stage.color)}>
                  {lead.stage}
                </Badge>
                <div className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", temp.color)}>
                   {lead.status}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1.5 flex items-center gap-1.5">
                <Wallet className="h-3 w-3" /> Deal Value
              </p>
              <div className="flex items-center gap-1 text-xl font-black text-slate-900 dark:text-white">
                <IndianRupee className="h-4 w-4 text-emerald-500/80" />
                {lead.deal_value || 0}
              </div>
            </div>
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1.5 flex items-center gap-1.5">
                <CheckCircle className="h-3 w-3" /> Paid Amount
              </p>
              <div className="flex items-center gap-1 text-xl font-black text-emerald-600 dark:text-emerald-400">
                <IndianRupee className="h-4 w-4 opacity-60" />
                {lead.paid_amount || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Details */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Contact Details</h3>
              <Globe className="h-4 w-4 text-slate-200" />
            </div>
            
            <div className="space-y-5">
              <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.open(`tel:${lead.phone}`, '_self')}>
                <div className="h-11 w-11 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 transition-all group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:scale-110">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-0.5">Personal Phone</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{lead.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.open(`mailto:${lead.email}`, '_blank')}>
                <div className="h-11 w-11 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 transition-all group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:scale-110">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-0.5">Email Address</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{lead.email || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-0.5">Organization</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{lead.company || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Background Info */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Background</h3>
              <Briefcase className="h-4 w-4 text-slate-200" />
            </div>
            
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-0.5">Professional Role</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{lead.profession || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-0.5">Current City</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{lead.city || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-0.5">Acquisition Date</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{format(new Date(lead.created_at), 'PPP')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {lead.notes && (
          <div className="bg-slate-50/50 dark:bg-slate-900/10 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <MessageSquare className="h-16 w-16" />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 px-1">Internal Notes</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line relative z-10 italic font-medium">
              "{lead.notes}"
            </p>
          </div>
        )}

        {/* Footer info */}
        <div className="flex items-center justify-center gap-4 pt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 dark:text-slate-700">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            Updated {format(new Date(lead.updated_at), 'MMM dd, p')}
          </div>
        </div>

        <div className="h-28" />
      </div>

      {/* Floating Action Bar - Ultra Clean */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 p-2.5 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl shadow-slate-200/50 dark:shadow-none w-[calc(100%-2.5rem)] max-w-sm border-t-2 border-t-slate-50/50">
        <Button 
          className="flex-1 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[1.5rem] font-black text-base gap-3 transition-all active:scale-95 shadow-lg shadow-emerald-500/25"
          onClick={() => {
            const phone = lead.phone.replace(/\D/g, '');
            window.open(`https://wa.me/${phone}`, '_blank');
          }}
        >
          <MessageSquare className="h-5 w-5 fill-white/20" />
          WhatsApp
        </Button>
        <Button 
          variant="outline"
          className="h-14 w-14 border-slate-100 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 rounded-[1.5rem] hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all active:scale-95 flex items-center justify-center"
          onClick={() => window.open(`tel:${lead.phone}`, '_self')}
        >
          <Phone className="h-5 w-5" />
        </Button>
      </div>
    </div>
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
