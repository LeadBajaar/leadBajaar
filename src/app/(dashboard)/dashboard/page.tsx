'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import {
  Mail, Phone, Calendar, Building2,
  Users, CalendarCheck2, TrendingUp, Target,
  ArrowUpRight, ArrowDownRight, Zap,
  Clock, CheckCircle2, XCircle, Smartphone, QrCode, Star, Bell, MessageSquare, DownloadCloud, Shield, Lock,
  Minimize2, Maximize2, ChevronDown, ChevronUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog'
import { Overview } from '@/components/overview'
import { getDashboardStats } from '@/lib/api'
import { cn } from '@/lib/utils'
import * as LucideIcons from 'lucide-react'
import { useUser } from '@/contexts/UserContext'

// ── Types ─────────────────────────────────────────────────────
interface DashboardData {
  stats: any[]
  monthly_overview: any[]
  pipeline: any[]
  recent_activity: any[]
}

const demoDashboardData: DashboardData = {
  stats: [
    { label: 'Total Leads', value: '1,284', key: 'leads', trend: 'up', change: '+12%' },
    { label: 'Meetings Set', value: '42', key: 'meetings', trend: 'up', change: '+8%' },
    { label: 'Conversion Rate', value: '18.5%', key: 'conversion', trend: 'up', change: '+2.4%' },
    { label: 'Avg Response', value: '4m 12s', key: 'response', trend: 'down', change: '-15%' },
  ],
  monthly_overview: [
    { name: 'Jan', value: 400, meetings: 120 },
    { name: 'Feb', value: 520, meetings: 156 },
    { name: 'Mar', value: 480, meetings: 142 },
    { name: 'Apr', value: 610, meetings: 184 },
    { name: 'May', value: 590, meetings: 172 },
    { name: 'Jun', value: 720, meetings: 210 },
    { name: 'Jul', value: 840, meetings: 245 },
    { name: 'Aug', value: 950, meetings: 280 },
  ],
  pipeline: [
    { stage: 'New Leads', count: 450, pct: 100, color: 'bg-blue-500' },
    { stage: 'Qualified', count: 280, pct: 62, color: 'bg-indigo-500' },
    { stage: 'Negotiating', count: 120, pct: 26, color: 'bg-violet-500' },
    { stage: 'Closing', count: 42, pct: 9, color: 'bg-emerald-500' },
  ],
  recent_activity: [
    { label: 'Sarah Connor', sub: 'Scheduled a viewing for Hubli Residency', time: '2m ago', icon_name: 'CalendarCheck2', color: 'text-emerald-500' },
    { label: 'New Meta Lead', sub: 'Came through "Premium Villas" campaign', time: '15m ago', icon_name: 'Target', color: 'text-indigo-500' },
    { label: 'Vikram Singh', sub: 'Replied via WhatsApp integration', time: '1h ago', icon_name: 'MessageCircle', color: 'text-blue-500' },
    { label: 'Email Opened', sub: 'Amit Shah viewed "Pricing Catalog"', time: '3h ago', icon_name: 'Mail', color: 'text-slate-500' },
  ]
}

// ─────────────────────────────────────────────────────────────
// Skeleton components
// ─────────────────────────────────────────────────────────────
function StatCardSkeleton() {
  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  )
}

// Fixed heights to avoid SSR/client Math.random() hydration mismatch
const SKELETON_BAR_HEIGHTS = [55, 72, 40, 85, 62, 90, 48, 78, 65, 88, 70, 95]

function ChartSkeleton() {
  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-56 mt-1" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 h-[300px] pt-4">
          {SKELETON_BAR_HEIGHTS.map((h, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-t-md"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ProfileSkeleton() {
  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-36" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-3 w-48" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ActivitySkeleton() {
  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-36" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────
export default function DashboardPage() {
  const { user, isLoading: userLoading } = useUser()
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [todayLabel, setTodayLabel] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [isBannerMinimized, setIsBannerMinimized] = useState(false)

  useEffect(() => {
    setTodayLabel(format(new Date(), 'EEEE, d MMM yyyy'))
  }, [])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsData = await getDashboardStats()
        // If data is empty or brand new, use high-fidelity demo data to show potential
        if (!statsData || !statsData.stats || statsData.stats.length === 0 || statsData.stats.every((s: any) => s.value == 0)) {
          setData(demoDashboardData)
          setIsDemo(true)
        } else {
          setData(statsData)
          setIsDemo(false)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
        setData(demoDashboardData) // Fallback to demo on error for preview
        setIsDemo(true)
      } finally {
        setIsLoading(false)
      }
    }

    if (!userLoading) {
      if (user) {
        fetchDashboardData()
      } else {
        setIsLoading(false)
      }
    }
  }, [userLoading, user])

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : '?'

  const getStatIcon = (key: string) => {
    switch (key) {
      case 'leads': return { icon: Users, color: 'text-indigo-600', iconBg: 'bg-indigo-100 dark:bg-indigo-900/40' };
      case 'meetings': return { icon: CalendarCheck2, color: 'text-emerald-600', iconBg: 'bg-emerald-100 dark:bg-emerald-900/40' };
      case 'conversion': return { icon: Target, color: 'text-violet-600', iconBg: 'bg-violet-100 dark:bg-violet-900/40' };
      case 'response': return { icon: Zap, color: 'text-amber-600', iconBg: 'bg-amber-100 dark:bg-amber-900/20' };
      default: return { icon: Zap, color: 'text-slate-600', iconBg: 'bg-slate-100' };
    }
  }

  const getLucideIcon = (name: string) => {
    const Icon = (LucideIcons as any)[name] || LucideIcons.Zap;
    return Icon;
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 h-full overflow-auto">

      {/* ── Welcome banner ─────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          {isLoading ? (
            <>
              <Skeleton className="h-7 w-52 mb-1.5" />
              <Skeleton className="h-4 w-72" />
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Good evening, {user?.name?.split(' ')[0] ?? 'there'} 👋
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Here's what's happening with your leads today.
              </p>
            </>
          )}
        </div>
        {todayLabel && (
          <Badge
            variant="outline"
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium border-indigo-200 text-indigo-700 dark:border-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5"
          >
            <Clock className="h-3 w-3" />
            {todayLabel}
          </Badge>
        )}
        {isDemo && !isLoading && (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 ml-2">
            Demo Preview Mode
          </Badge>
        )}
      </div>

      {/* ── Download Android App ─────────────────────────── */}
      <section
        className={cn(
          "rounded-3xl relative flex transition-all duration-500 ease-in-out border border-slate-200 shadow-sm overflow-hidden",
          isBannerMinimized 
            ? "flex-row items-center justify-between px-6 py-4 min-h-[80px]" 
            : "flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 px-10 py-16 lg:py-8 min-h-[450px]"
        )}
        style={{ 
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        }}
      >
        {/* Minimize/Maximize Toggle - Highlighted Style */}
        <button
          onClick={() => setIsBannerMinimized(!isBannerMinimized)}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white border border-indigo-100 text-indigo-600 shadow-md hover:shadow-lg hover:scale-110 hover:bg-indigo-50 transition-all duration-200"
          title={isBannerMinimized ? "Expand Dashboard Tool" : "Compact View"}
        >
          {isBannerMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
        </button>

        {/* --- Background SaaS Decorations --- */}
        {!isBannerMinimized && (
          <>
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#6366f1" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[120px] pointer-events-none opacity-60" />
            <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] pointer-events-none opacity-60" />
          </>
        )}

        {/* ── Left Content (Full or Minimized) ── */}
        <div className={cn(
          "relative z-10 flex transition-all duration-500",
          isBannerMinimized ? "flex-row items-center gap-8" : "flex-col justify-center gap-6 max-w-sm lg:max-w-xl text-center lg:text-left"
        )}>
          {/* Feature Badges - Only in full mode */}
          {!isBannerMinimized && (
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              {[
                { icon: Bell, label: 'Instant Alerts' },
                { icon: MessageSquare, label: 'Live Chat' },
                { icon: TrendingUp, label: 'Real-time Stats' },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white rounded-full text-indigo-600 text-[11px] font-semibold tracking-wide border border-indigo-50 shadow-sm"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label.toUpperCase()}
                </span>
              ))}
            </div>
          )}

          {/* Headline - Modern SaaS Typography */}
          <div className={cn("space-y-3", isBannerMinimized && "space-y-0")}>
            <h2 className={cn(
              "text-slate-900 tracking-tight transition-all",
              isBannerMinimized ? "text-base font-semibold" : "text-4xl lg:text-5xl font-bold leading-[1.15]"
            )}>
              {isBannerMinimized ? (
                <>LeadBajaar for <span className="text-blue-600">Mobile</span></>
              ) : (
                <>Your entire CRM, <span className="text-blue-600">everywhere you go</span></>
              )}
            </h2>
            {!isBannerMinimized && (
              <p className="text-base lg:text-lg text-slate-500 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                Manage your leads, set meetings, and track performance with the same power as your desktop — but in your pocket.
              </p>
            )}
          </div>

          {/* CTA Buttons */}
          <div className={cn(
            "flex flex-wrap items-center gap-4 transition-all",
            !isBannerMinimized && "justify-center lg:justify-start pt-2"
          )}>
            <a
              href="/downloads/Leadbajaar.apk"
              download="Leadbajaar.apk"
              className={cn(
                "inline-flex items-center gap-3 bg-blue-600 text-white rounded-xl font-semibold transition-all shadow-md shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95",
                isBannerMinimized ? "px-5 py-2.5 text-sm" : "px-8 py-4 text-base"
              )}
            >
              <Smartphone className={isBannerMinimized ? "w-4 h-4" : "w-5 h-5"} />
              Download APK
            </a>
            <button 
              onClick={() => setShowQRModal(true)}
              className={cn(
                "inline-flex items-center gap-3 bg-white text-slate-700 rounded-xl font-semibold transition-all border border-slate-200 shadow-sm hover:bg-slate-50 hover:-translate-y-0.5 active:scale-95",
                isBannerMinimized ? "px-5 py-2.5 text-sm" : "px-8 py-4 text-base"
              )}
            >
              <QrCode className={isBannerMinimized ? "w-4 h-4" : "w-5 h-5"} />
              Scan QR
            </button>
          </div>

          {/* Trust line - Hide in minimized mode */}
          {!isBannerMinimized && (
            <div className="flex items-center justify-center lg:justify-start gap-2.5 text-slate-400 text-sm font-medium pt-2">
              <Shield className="w-5 h-5 text-emerald-500 shrink-0 opacity-80" />
              Secure, fast, and already linked to your workspace.
            </div>
          )}
        </div>

        {/* ── Right: Phone Mockup - Hide in minimized mode ── */}
        {!isBannerMinimized && (
          <div className="relative flex items-center justify-center w-[300px] lg:w-[400px] h-[380px] lg:h-[450px]">
            {/* Background rings - Darkened for visibility */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] pointer-events-none">
              <div className="absolute inset-0 border border-slate-200 rounded-full" />
              <div className="absolute inset-[10%] border border-indigo-100 rounded-full" />
              <div className="absolute inset-[20%] border border-indigo-50/50 rounded-full" />
            </div>
            
            {/* Phone image */}
            <div className="relative z-10 w-full h-full p-4 lg:p-8 flex items-center justify-center">
              <img
                src="/android-mockup.png"
                alt="LeadBajaar Mobile App"
                className="h-full w-auto object-contain transition-transform duration-500 hover:scale-[1.02]"
                style={{
                  filter: 'drop-shadow(0px 20px 40px rgba(0,0,0,0.1))',
                }}
              />
            </div>
          </div>
        )}
      </section>

      {/* ── QR Code Modal ────────────────────────────────── */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan to Download</DialogTitle>
            <DialogDescription>
              Scan this QR code with your mobile camera to download the LeadBajaar APK directly to your phone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            {/* Using a high-quality QR generator API with Loader */}
            <div className="relative bg-white p-4 rounded-xl shadow-sm border border-slate-200 overflow-hidden min-w-[200px] min-h-[200px] flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900 animate-pulse">
                <svg 
                  viewBox="0 0 797 386" 
                  className="w-16 h-8 text-slate-200 dark:text-slate-700 animate-bounce"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M0 0 C13.86 0 27.72 0 42 0 C43.1188264 42.73916837 42.95348176 85.41416771 42.62664449 128.16140664 C42.53964399 139.58359964 42.46367748 151.00586675 42.38688183 162.42813206 C42.26654733 180.28549127 42.1321858 198.14271545 42 216 C92.82 216 143.64 216 196 216 C196 215.34 196 214.68 196 214 C199.82320557 212.57741188 202.91281305 211.75957724 207 212 C207 211.34 207 210.68 207 210 C207.99 210 208.98 210 210 210 C210 209.34 210 208.68 210 208 C210.66 208 211.32 208 212 208 C212 207.34 212 206.68 212 206 C212.66 206 213.32 206 214 206 C214 205.34 214 204.68 214 204 C214.66 204 215.32 204 216 204 C216.12375 203.443125 216.2475 202.88625 216.375 202.3125 C217 200 217 200 217.9375 197.78125 C219.1452642 194.61974958 219.89106338 191.49021479 220.625 188.1875 C220.88539063 187.02605469 221.14578125 185.86460937 221.4140625 184.66796875 C221.70410156 183.34732422 221.70410156 183.34732422 222 182 C221.34 182 220.68 182 220 182 C219.855625 180.7625 219.71125 179.525 219.5625 178.25 C219.21311498 175.43495501 218.79620634 172.7298503 218 170 C217.34 170 216.68 170 216 170 C216 168.68 216 167.36 216 166 C215.34 166 214.68 166 214 166 C214 165.34 214 164.68 214 164 C213.34 164 212.68 164 212 164 C212 163.34 212 162.68 212 162 C211.01 162 210.02 162 209 162 C208.67 160.68 208.34 159.36 208 158 C206.68 158 205.36 158 204 158 C204 157.34 204 156.68 204 156 C202.989375 155.855625 201.97875 155.71125 200.9375 155.5625 C197.29166667 155.04166667 193.64583333 154.52083333 190 154 C190 153.34 190 152.68 190 152 C188.02 152 186.04 152 184 152 C184 146.06 184 140.12 184 134 C185.65 134 187.3 134 189 134 C189 133.34 189 132.68 189 132 C190.32 132 191.64 132 193 132 C193 131.34 193 130.68 193 130 C193.99 130 194.98 130 196 130 C196 129.34 196 128.68 196 128 C196.66 128 197.32 128 198 128 C198 127.34 198 126.68 198 126 C198.66 126 199.32 126 200 126 C200 125.34 200 124.68 200 124 C200.66 124 201.32 124 202 124 C202 123.34 202 122.68 202 122 C202.66 122 203.32 122 204 122 C204.185625 120.5459375 204.185625 120.5459375 204.375 119.0625 C204.58125 118.051875 204.7875 117.04125 205 116 C205.66 115.67 206.32 115.34 207 115 C207.40729228 112.67843403 207.74438677 110.3431213 208 108 C208.66 108 209.32 108 210 108 C210 106.68 210 105.36 210 104 C210.66 104 211.32 104 212 104 C211.88157356 99.23095576 211.75731313 94.46211233 211.62768555 89.69335938 C211.58442069 88.07165643 211.54273972 86.44991042 211.50268555 84.828125 C211.44477786 82.49465973 211.38114302 80.16140957 211.31640625 77.828125 C211.29133751 76.74352997 211.29133751 76.74352997 211.26576233 75.63702393 C211.16797351 72.30109444 211.0154335 69.19445984 210 66 C209.34 66 208.68 66 208 66 C207.67 64.02 207.34 62.04 207 60 C206.01 60 205.02 60 204 60 C204 58.68 204 57.36 204 56 C202.68 55.34 201.36 54.68 200 54 C200 53.34 200 52.68 200 52 C199.01 52 198.02 52 197 52 C197 51.34 197 50.68 197 50 C195.68 50 194.36 50 193 50 C193 49.34 193 48.68 193 48 C191.35 48 189.7 48 188 48 C188 47.34 188 46.68 188 46 C186.60974609 46.01740234 186.60974609 46.01740234 185.19140625 46.03515625 C183.99386719 46.04417969 182.79632813 46.05320313 181.5625 46.0625 C180.36753906 46.07410156 179.17257813 46.08570313 177.94140625 46.09765625 C175 46 175 46 174 45 C172.31198015 44.90646837 170.62004793 44.88255209 168.92944336 44.88647461 C167.84839828 44.88655014 166.76735321 44.88662567 165.65354919 44.88670349 C164.4775264 44.89186478 163.3015036 44.89702606 162.08984375 44.90234375 C160.89267227 44.9037587 159.69550079 44.90517365 158.46205139 44.90663147 C154.62050934 44.91225021 150.77902457 44.92480589 146.9375 44.9375 C144.34049563 44.94251259 141.74349035 44.94707591 139.14648438 44.95117188 C132.76430321 44.96222573 126.3821557 44.97898208 120 45 C120.00253784 45.81676208 120.00507568 46.63352417 120.00769043 47.47503662 C120.00966431 48.55029602 120.01163818 49.62555542 120.01367188 50.73339844 C120.01620972 51.79766052 120.01874756 52.86192261 120.0213623 53.95843506 C119.99476976 57.7446818 119.76663092 61.47272857 119.5 65.25 C118.93278619 73.93354513 118.93714905 82.59281321 119.03710938 91.29199219 C119.04548828 92.27973633 119.05386719 93.26748047 119.0625 94.28515625 C119.07410156 95.17082275 119.08570313 96.05648926 119.09765625 96.96899414 C119 99 119 99 118 100 C106.12 100 94.24 100 82 100 C82 67 82 34 82 0 C115.66 0 149.32 0 184 0 C184 0.66 184 1.32 184 2 C184.64066406 1.97679688 185.28132812 1.95359375 185.94140625 1.9296875 C191.40987096 1.81559137 195.83098277 2.20208096 201 4 C201 4.66 201 5.32 201 6 C201.9075 5.938125 202.815 5.87625 203.75 5.8125 C207.47109901 6.02717879 208.1990193 6.70828851 211 9 C213.29838837 10.10681609 215.63245709 11.0438769 218 12 C218 12.66 218 13.32 218 14 C219.32 14 220.64 14 222 14 C222 14.66 222 15.32 222 16 C222.66 16 223.32 16 224 16 C224 16.66 224 17.32 224 18 C224.99 18 225.98 18 227 18 C227.33 19.32 227.66 20.64 228 22 C229.32 22 230.64 22 232 22 C232 23.32 232 24.64 232 26 C233.32 26.33 234.64 26.66 236 27 C236 27.99 236 28.98 236 30 C236.66 30 237.32 30 238 30 C240.125 31.75 240.125 31.75 242 34 C242 35.32 242 36.64 242 38 C242.66 38 243.32 38 244 38 C244 39.32 244 40.64 244 42 C244.66 42 245.32 42 246 42 C247.60355101 45.50776784 248.22036864 48.14354879 248 52 C248.66 52 249.32 52 250 52 C252.3638935 60.11415823 252.30484189 68.1357944 252.26074219 76.51049805 C252.25003993 78.9284787 252.26067135 81.34571406 252.2734375 83.76367188 C252.28476896 95.5024617 251.29321991 105.3564391 246 116 C245.62101563 116.77214844 245.24203125 117.54429687 244.8515625 118.33984375 C243.9134258 120.23275078 242.95846354 122.11730376 242 124 C241.34 124 240.68 124 240 124 C239.855625 124.61875 239.71125 125.2375 239.5625 125.875 C239 128 239 128 238 130 C237.34 130 236.68 130 236 130 C235.67 131.98 235.34 133.96 235 136 C235.99 136 236.98 136 238 136 C238 136.66 238 137.32 238 138 C238.556875 138.226875 239.11375 138.45375 239.6875 138.6875 C243.81927486 141.03256141 246.71351304 144.61123948 249.6875 148.25 C251.7042322 151.01742194 251.7042322 151.01742194 254 152 C254.6328125 153.84765625 254.6328125 153.84765625 255.125 156.0625 C255.29257812 156.79597656 255.46015625 157.52945313 255.6328125 158.28515625 C255.75398437 158.85105469 255.87515625 159.41695312 256 160 C256.66 160 257.32 160 258 160 C258 162.64 258 165.28 258 168 C258.66 168 259.32 168 260 168 C260 169.98 260 171.96 260 174 C260.66 174 261.32 174 262 174 C262.05823729 178.5416125 262.09367675 183.0831284 262.125 187.625 C262.14175781 188.91019531 262.15851563 190.19539062 262.17578125 191.51953125 C262.18222656 192.76347656 262.18867188 194.00742187 262.1953125 195.2890625 C262.20578613 196.43068848 262.21625977 197.57231445 262.22705078 198.74853516 C261.99052625 202.13566817 261.2095701 204.84005042 260 208 C259.34 208 258.68 208 258 208 C258 210.64 258 213.28 258 216 C257.34 216 256.68 216 256 216 C255.7834375 216.86625 255.7834375 216.86625 255.5625 217.75 C255.04166667 219.83333333 254.52083333 221.91666667 254 224 C253.34 224 252.68 224 252 224 C252 224.66 252 225.32 252 226 C251.34 226 250.68 226 250 226 C250 227.32 250 228.64 250 230 C249.34 230 248.68 230 248 230 C248 230.66 248 231.32 248 232 C247.34 232 246.68 232 246 232 C245.67 233.32 245.34 234.64 245 236 C244.01 236 243.02 236 242 236 C241.67 237.32 241.34 238.64 241 240 C240.01 240 239.02 240 238 240 C238 240.66 238 241.32 238 242 C235 244 235 244 232 244 C232 244.66 232 245.32 232 246 C231.34 246 230.68 246 230 246 C230 246.66 230 247.32 230 248 C227.36 248.66 224.72 249.32 222 250 C222 250.66 222 251.32 222 252 C219.36 252 216.72 252 214 252 C214 252.66 214 253.32 214 254 C212.68 254 211.36 254 210 254 C210 254.66 210 255.32 210 256 C140.7 256 71.4 256 0 256 C0 171.52 0 87.04 0 0 Z " />
                </svg>
              </div>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/downloads/Leadbajaar.apk` : 'https://app.leadbajaar.com/downloads/Leadbajaar.apk')}`} 
                alt="Download QR Code"
                className="relative z-10 w-[200px] h-[200px]"
                onLoad={(e) => {
                  const target = e.currentTarget;
                  const parent = target.parentElement;
                  if (parent) {
                    const loader = parent.querySelector('.absolute');
                    if (loader) loader.classList.add('hidden');
                  }
                }}
              />
            </div>
            <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-60">
              leadbajaar_v2.apk
            </p>
          </div>
        </DialogContent>
      </Dialog>



      {/* ── Stat cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading || !data
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : data.stats.map((s) => {
            const { icon: Icon, color, iconBg } = getStatIcon(s.key);
            return (
              <Card
                key={s.label}
                className={cn(
                  'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800',
                  'hover:shadow-card-md transition-all duration-200 hover:-translate-y-0.5',
                )}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {s.label}
                    </span>
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', iconBg)}>
                      <Icon className={cn('h-5 w-5', color)} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                    {s.value}
                  </div>
                  <div className={cn(
                    'flex items-center gap-1 text-xs font-medium',
                    s.trend === 'up' ? 'text-emerald-600' : 'text-red-500'
                  )}>
                    {s.trend === 'up'
                      ? <ArrowUpRight className="h-3.5 w-3.5" />
                      : <ArrowDownRight className="h-3.5 w-3.5" />}
                    {s.change} from last month
                  </div>
                </CardContent>
              </Card>
            )
          })
        }
      </div>

      {/* ── Chart + Profile row ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">

        {/* Chart */}
        {isLoading ? (
          <div className="lg:col-span-4"><ChartSkeleton /></div>
        ) : (
          <Card className="lg:col-span-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">
                    Meeting & Lead Overview
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs mt-0.5">
                    Monthly performance for current year
                  </CardDescription>
                </div>
                {/* Legend */}
                <div className="hidden sm:flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500" />Leads
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />Meetings
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pr-4 pt-2">
              <Overview data={data?.monthly_overview} />
            </CardContent>
          </Card>
        )}

        {/* Right column: Profile + Activity */}
        <div className="lg:col-span-3 flex flex-col gap-4">

          {/* Account card */}
          {isLoading ? <ProfileSkeleton /> : user && (
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">
                  Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Avatar + name */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 rounded-2xl border-2 border-indigo-100 dark:border-indigo-900">
                    <AvatarImage src={(user as any).avatar || ''} />
                    <AvatarFallback className="rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold text-base">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                    <Badge variant="secondary" className="text-[10px] mt-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-0">
                      {user.role}
                    </Badge>
                  </div>
                </div>

                {/* Info rows */}
                <div className="space-y-2.5 pt-1">
                  {[
                    { key: 'email', icon: Mail, text: user.email },
                    { key: 'phone', icon: Phone, text: (user as any).phone || 'Not provided' },
                    { key: 'company', icon: Building2, text: user.company?.name || 'Not provided' },
                    { key: 'member', icon: Calendar, text: `Member since ${format(new Date((user as any).created_at || new Date()), 'MMMM yyyy')}` },
                  ].map(({ key, icon: Icon, text }) => (
                    <div key={key} className="flex items-center gap-3 text-sm">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                        <Icon className="h-3.5 w-3.5 text-slate-500" />
                      </div>
                      <span className="text-slate-600 dark:text-slate-400 truncate">{text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ── Pipeline + Activity row ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Pipeline */}
        {isLoading ? (
          <ActivitySkeleton />
        ) : (
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">
                Lead Pipeline
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Current funnel breakdown
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data && data.pipeline.map((p) => (
                <div key={p.stage} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{p.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 dark:text-slate-400 text-xs">{p.count}</span>
                      <span className="text-slate-400 text-xs w-8 text-right">{p.pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-700', p.color)}
                      style={{ width: `${p.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        {isLoading ? (
          <ActivitySkeleton />
        ) : (
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">
                Recent Activity
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Latest events in your pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {data && data.recent_activity.map((item, i) => {
                  const Icon = getLucideIcon(item.icon_name);
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-xl px-2 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                        'bg-slate-100 dark:bg-slate-800',
                      )}>
                        <Icon className={cn('h-4 w-4', item.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-none">
                          {item.label}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{item.sub}</p>
                      </div>
                      <span className="text-xs text-slate-400 shrink-0 mt-0.5">{item.time}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  )
}
