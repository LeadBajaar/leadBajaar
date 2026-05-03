"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Gauge,
  UserCheck,
  MessageCircle,
  Bot,
  CalendarCheck2,
  Plug2,
  TrendingUp,
  Settings2,
  LogOut,
  Code2,
  Shield,
  Activity,
  Mail,
  Zap,
  Briefcase,
  MoreHorizontal,
  X,
  CornerUpLeft,
} from 'lucide-react'
import { logout } from '@/lib/api'
import { clearSession, setSession } from '@/lib/auth'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useUser, UserRole, UserType } from '@/contexts/UserContext'

// ── Types ────────────────────────────────────────────────────
type NavItemDef = {
  name: string
  desc: string
  href: string
  icon: React.ElementType
  color: string
  roles: UserRole[]
  types?: UserType[]
  plans?: string[]
}

type NavSection = {
  label: string
  items: NavItemDef[]
}

// ── Pinned sidebar items (always visible, no scroll) ─────────
// Only the 4 most-used core items live here
const pinnedNav: NavItemDef[] = [
  { name: 'Dashboard',    desc: 'Overview & key metrics',           href: '/dashboard',    icon: Gauge,          color: '#6366F1', roles: ['Super Admin', 'Admin', 'Manager', 'Agent'] },
  { name: 'Leads',        desc: 'Track and convert leads',          href: '/leads',        icon: UserCheck,      color: '#10B981', roles: ['Super Admin', 'Admin', 'Manager', 'Agent'] },
  { name: 'Live Chat',    desc: 'Real-time customer messaging',     href: '/live-chat',    icon: MessageCircle,  color: '#3B82F6', roles: ['Super Admin', 'Admin', 'Manager', 'Agent'] },
  { name: 'Chatbot',      desc: 'Automate conversations with AI',   href: '/chatbot',      icon: Bot,            color: '#8B5CF6', roles: ['Super Admin', 'Admin', 'Manager'], types: ['agency', 'super_admin', 'individual'], plans: ['pro', 'enterprise'] },
  { name: 'Meetings',     desc: 'Schedule & track appointments',    href: '/meetings',     icon: CalendarCheck2, color: '#F59E0B', roles: ['Super Admin', 'Admin', 'Manager', 'Agent'] },
  { name: 'Integrations', desc: 'Connect your favourite tools',     href: '/integrations', icon: Plug2,          color: '#EC4899', roles: ['Super Admin', 'Admin'], types: ['agency', 'super_admin', 'individual'], plans: ['pro', 'enterprise'] },
]

// ── Flyout-only items (not shown in narrow sidebar) ──────────
const flyoutNav: NavSection[] = [
  {
    label: 'Clients & Growth',
    items: [
      { name: 'Clients',   desc: 'Manage your client portfolio', href: '/agency',    icon: Briefcase,  color: '#6366F1', roles: ['Super Admin', 'Admin'], types: ['agency', 'super_admin'] },
      { name: 'Analytics', desc: 'Deep-dive into performance',   href: '/analytics', icon: TrendingUp, color: '#14B8A6', roles: ['Super Admin', 'Admin', 'Manager'], types: ['agency', 'super_admin', 'individual'], plans: ['pro', 'enterprise'] },
    ],
  },
  {
    label: 'Automation',
    items: [
      { name: 'Automations', desc: 'Build powerful workflows', href: '/automations', icon: Zap, color: '#6366F1', roles: ['Super Admin', 'Admin'], types: ['agency', 'super_admin', 'individual'], plans: ['pro', 'enterprise'] },
    ],
  },
  {
    label: 'Platform Control',
    items: [
      { name: 'Admin',        desc: 'System-level controls',           href: '/admin',         icon: Shield,       color: '#EF4444', roles: ['Super Admin'],                            types: ['super_admin'] },
      { name: 'Emails',       desc: 'Monitor transactional emails',    href: '/admin/emails',  icon: Mail,         color: '#6366F1', roles: ['Super Admin'],                            types: ['super_admin'] },
      { name: 'Error Logs',   desc: 'View platform error logs',        href: '/admin/errors',  icon: Activity,     color: '#F43F5E', roles: ['Super Admin'],                            types: ['super_admin'] },
      { name: 'Dev Hub',      desc: 'API keys & developer tools',      href: '/developer',     icon: Code2,        color: '#10B981', roles: ['Super Admin', 'Admin'] },
    ],
  },
  {
    label: 'Account',
    items: [
      { name: 'Settings', desc: 'Preferences and configuration', href: '/settings', icon: Settings2, color: '#94A3B8', roles: ['Super Admin', 'Admin', 'Manager', 'Agent'] },
    ],
  },
]

// ── Sidebar shell ────────────────────────────────────────────
interface SidebarProps {
  mobileOpen?: boolean
  setMobileOpen?: (open: boolean) => void
}

export function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const router  = useRouter()
  const pathname = usePathname()
  const { user, hasRole, hasType, hasPlan } = useUser()

  const [moreOpen, setMoreOpen] = useState(false)
  const [isAdminImpersonating, setIsAdminImpersonating] = useState(false)
  const [loadingHref, setLoadingHref] = useState<string | null>(null)
  const moreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if we have an admin token in storage (meaning we are impersonating)
    setIsAdminImpersonating(!!localStorage.getItem('admin_token'))
  }, [])

  // Clear loading state when pathname changes (navigation finished)
  useEffect(() => {
    setLoadingHref(null)
  }, [pathname])

  // Derive which flyout item is currently active
  const flyoutAllItems = flyoutNav.flatMap(s => s.items)
  const activeFlyoutItem = flyoutAllItems.find(
    item => pathname === item.href || pathname.startsWith(`${item.href}/`)
  )
  const isFlyoutActive = !!activeFlyoutItem

  // Close flyout on outside click / Escape
  useEffect(() => {
    if (!moreOpen) return
    const onKey   = (e: KeyboardEvent) => { if (e.key === 'Escape') setMoreOpen(false) }
    const onClick  = (e: MouseEvent)   => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [moreOpen])

  const handleLogout = async () => {
    try {
      await logout()
      clearSession()
      localStorage.removeItem('admin_token')
      router.push('/signin')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  const handleReturnToAdmin = () => {
    const adminToken = localStorage.getItem('admin_token')
    if (adminToken) {
      setSession(adminToken)
      localStorage.removeItem('admin_token')
      // Redirect back to admin portal or dashboard
      window.location.href = '/dashboard'
    }
  }

  const canSee = (item: NavItemDef) => {
    const roleMatch  = hasRole(item.roles)
    const typeMatch  = !item.types || hasType(item.types)
    const planMatch  = !item.plans || hasPlan(item.plans) || hasType(['agency', 'super_admin'])
    return roleMatch && typeMatch && planMatch
  }

  const visiblePinned  = pinnedNav.filter(canSee)
  const visibleFlyout  = flyoutNav
    .map(s => ({ ...s, items: s.items.filter(canSee) }))
    .filter(s => s.items.length > 0)

  return (
    <TooltipProvider delayDuration={0}>
      <div ref={moreRef} className="fixed top-4 left-4 bottom-4 z-[100] flex items-stretch pointer-events-none">

        {/* ────────────────────────────────────────────────────
            Narrow icon sidebar
        ──────────────────────────────────────────────────── */}
        <aside
          className={cn(
            "flex flex-col w-[280px] lg:w-[76px] lg:min-w-[76px] lg:max-w-[76px] shrink-0 pointer-events-auto",
            "bg-slate-950/95 backdrop-blur-md border border-slate-800/60 rounded-xl shadow-2xl",
            "transition-transform duration-300 ease-in-out overflow-hidden",
            mobileOpen ? "translate-x-0" : "-translate-x-[calc(100%+2rem)] lg:translate-x-0"
          )}
        >
          {/* Logo & Close Button */}
          <div className="flex h-16 shrink-0 items-center justify-between px-5 lg:justify-center border-b border-slate-800/40">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20 border border-white/10">
              <span className="text-[11px] font-black text-white tracking-tighter">LB</span>
            </div>
            
            <button 
              onClick={() => setMobileOpen?.(false)}
              className="lg:hidden h-9 w-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Pinned nav */}
          <nav className="flex-1 flex flex-col items-center lg:justify-center gap-1.5 px-3 py-4 overflow-y-auto no-scrollbar">
            {visiblePinned.map(item => (
              <PinnedNavItem 
                key={item.href} 
                item={item} 
                setMobileOpen={setMobileOpen}
                loadingHref={loadingHref}
                setLoadingHref={setLoadingHref}
              />
            ))}
          </nav>

          {/* Bottom actions */}
          <div className="shrink-0 flex flex-col items-center gap-1 pb-3 pt-2 px-2 w-full overflow-hidden border-t border-slate-800/40 bg-slate-900/40 rounded-b-xl">

            {/* Return to Admin (Impersonation mode) */}
            {isAdminImpersonating && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleReturnToAdmin}
                    className="group flex flex-row lg:flex-col items-center lg:justify-center gap-3 lg:gap-1 w-full lg:w-[60px] px-4 lg:px-0 py-3 lg:py-2.5 rounded-xl text-amber-500 bg-amber-500/10 border border-amber-500/20 transition-all duration-200 shadow-lg shadow-amber-500/10 hover:bg-amber-500/20"
                  >
                    <CornerUpLeft className="h-[18px] w-[18px] shrink-0" />
                    <span className="text-[11px] lg:text-[8px] font-bold uppercase tracking-wide lg:tracking-tight leading-none truncate flex-1 lg:flex-none lg:text-center w-full lg:px-1">
                      Return
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-slate-900 border-slate-800 text-white text-[10px] font-black uppercase tracking-widest">
                  Return to Admin
                </TooltipContent>
              </Tooltip>
            )}

            {/* Active flyout item */}
            {isFlyoutActive && activeFlyoutItem && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={activeFlyoutItem.href}
                      className="flex flex-row lg:flex-col items-center lg:justify-center gap-3 lg:gap-1 w-full lg:w-[60px] px-4 lg:px-0 py-3 lg:py-2.5 rounded-xl transition-all duration-200 text-white bg-white/10 border border-white/10 shadow-[0_0_12px_rgba(99,102,241,0.15)]"
                    >
                      <activeFlyoutItem.icon
                        className="h-[18px] w-[18px] shrink-0 scale-110"
                        style={{ color: activeFlyoutItem.color }}
                      />
                      <span className="text-[11px] lg:text-[8px] font-bold uppercase tracking-wide lg:tracking-tight leading-none opacity-100 truncate flex-1 lg:flex-none lg:text-center w-full lg:px-1">
                        {activeFlyoutItem.name}
                      </span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-slate-900 border-slate-800 text-white text-[10px] font-black uppercase tracking-widest">
                    {activeFlyoutItem.name}
                  </TooltipContent>
                </Tooltip>
                <div className="w-8 h-px bg-slate-800/50 hidden lg:block" />
              </>
            )}

            {/* More Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setMoreOpen(v => !v)}
                  className={cn(
                    "group flex flex-row lg:flex-col items-center lg:justify-center gap-3 lg:gap-1",
                    "w-full lg:w-[60px] px-4 lg:px-0 py-3 lg:py-2.5 rounded-xl transition-all duration-200",
                    moreOpen
                      ? "text-indigo-400 bg-indigo-500/10 border border-indigo-500/20"
                      : "text-slate-500 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                  )}
                >
                  <MoreHorizontal className="h-[18px] w-[18px] shrink-0" />
                  <span className="text-[11px] lg:text-[8px] font-bold uppercase tracking-wide lg:tracking-tight leading-none opacity-60 group-hover:opacity-100 transition-opacity truncate flex-1 lg:flex-none lg:text-center w-full lg:px-1">
                    More
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-slate-900 border-slate-800 text-white text-[10px] font-black uppercase tracking-widest">
                More options
              </TooltipContent>
            </Tooltip>

            {/* Logout */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className="group flex flex-row lg:flex-col items-center lg:justify-center gap-3 lg:gap-1 w-full lg:w-[60px] px-4 lg:px-0 py-3 lg:py-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 border border-transparent"
                >
                  <LogOut className="h-[18px] w-[18px] shrink-0" />
                  <span className="text-[11px] lg:text-[8px] font-bold uppercase tracking-wide lg:tracking-tight leading-none opacity-50 group-hover:opacity-100 transition-opacity truncate flex-1 lg:flex-none lg:text-center w-full lg:px-1">
                    Exit
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-slate-900 border-slate-800 text-white text-[10px] font-black uppercase tracking-widest">
                Logout
              </TooltipContent>
            </Tooltip>

            {/* User Profile */}
            <div
              onClick={() => router.push('/settings')}
              className="mt-1 w-full lg:w-auto px-4 lg:px-0"
            >
              <div className="flex items-center gap-3 lg:block">
                <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white text-[11px] font-black border border-slate-600 shadow-lg cursor-pointer hover:border-indigo-500 transition-colors">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="lg:hidden">
                  <p className="text-[12px] font-bold text-white leading-none">{user?.name || 'User'}</p>
                  <p className="text-[10px] text-slate-500 mt-1">View Settings</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ────────────────────────────────────────────────────
            Flyout panel (slides in to the right of sidebar)
        ──────────────────────────────────────────────────── */}
        <div
          className={cn(
            "absolute left-[84px] top-0 bottom-0 w-[248px] rounded-xl pointer-events-auto",
            "bg-slate-950/95 backdrop-blur-md border border-slate-800/60 shadow-2xl",
            "flex flex-col overflow-hidden",
            "transition-all duration-300 ease-out origin-left",
            moreOpen
              ? "opacity-100 scale-x-100 translate-x-0 pointer-events-auto"
              : "opacity-0 scale-x-95 -translate-x-2 pointer-events-none"
          )}
        >
          {/* Flyout header */}
          <div className="flex items-center justify-between px-4 h-16 shrink-0 border-b border-slate-800/40">
            <div>
              <p className="text-[11px] font-black text-white uppercase tracking-widest">More</p>
              <p className="text-[10px] text-slate-500 mt-0.5">All features</p>
            </div>
            <button
              onClick={() => setMoreOpen(false)}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Flyout nav list */}
          <div className="flex-1 overflow-y-auto">
            <div className="py-3 px-2 flex flex-col gap-0.5">
              {visibleFlyout.map((section, sIdx) => (
                <div key={section.label}>
                  <p className={cn(
                    "px-3 text-[9px] font-black uppercase tracking-[0.15em] text-slate-600",
                    sIdx === 0 ? "pt-1 pb-2" : "pt-4 pb-2"
                  )}>
                    {section.label}
                  </p>
                  {section.items.map(item => (
                    <FlyoutNavItem
                      key={item.href}
                      item={item}
                      onClose={() => { setMoreOpen(false); setMobileOpen?.(false) }}
                      loadingHref={loadingHref}
                      setLoadingHref={setLoadingHref}
                    />
                  ))}
                </div>
              ))}

              {/* Logout — always at the bottom */}
              <div className="mt-4 pt-4 border-t border-slate-800/40">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all group"
                >
                  <div className="h-8 w-8 shrink-0 rounded-lg bg-slate-800/60 flex items-center justify-center">
                    <LogOut className="h-4 w-4 text-red-400" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[12px] font-semibold leading-none text-slate-300 group-hover:text-red-400 transition-colors">Logout</p>
                    <p className="text-[10px] text-slate-500 mt-1 leading-none truncate">Sign out of your account</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* User footer */}
          <div className="shrink-0 border-t border-slate-800/40 px-4 py-3 flex items-center gap-3 bg-slate-900/40">
            <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[11px] font-black shadow">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-white truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email || ''}</p>
            </div>
          </div>
        </div>

      </div>
    </TooltipProvider>
  )
}

// ── Pinned sidebar NavItem ────────────────────────────────────
function PinnedNavItem({ 
  item, 
  setMobileOpen,
  loadingHref,
  setLoadingHref 
}: { 
  item: NavItemDef; 
  setMobileOpen?: (open: boolean) => void;
  loadingHref: string | null;
  setLoadingHref: (href: string | null) => void;
}) {
  const pathname = usePathname()
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
  const isLoading = loadingHref === item.href

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={item.href}
          onClick={() => {
            if (!isActive) setLoadingHref(item.href)
            setMobileOpen?.(false)
          }}
          className={cn(
            "relative flex flex-row lg:flex-col items-center lg:justify-center gap-3 lg:gap-1",
            "w-full lg:w-[60px] px-4 lg:px-0 py-3 lg:py-2.5 rounded-xl transition-all duration-200 group",
            isActive
              ? "text-white bg-white/10 border border-white/10 shadow-[0_0_12px_rgba(99,102,241,0.15)]"
              : "text-slate-500 hover:text-slate-200 hover:bg-white/5 border border-transparent"
          )}
        >
          {/* Loading Border Animation */}
          {isLoading && (
            <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none z-0">
              <div 
                className="absolute inset-[-100%] animate-[spin_3s_linear_infinite]"
                style={{ 
                  background: `conic-gradient(from 0deg, transparent 0%, ${item.color} 50%, transparent 100%)` 
                }}
              />
              <div className="absolute inset-[1px] rounded-[11px] bg-slate-950/90 backdrop-blur-sm" />
            </div>
          )}

          {/* Icon */}
          <div className="relative z-10">
            <item.icon
              className={cn(
                "h-[18px] w-[18px] shrink-0 transition-all duration-200",
                isActive ? "scale-110" : "group-hover:scale-105"
              )}
              style={isActive || isLoading ? { color: item.color } : {}}
            />
          </div>

          {/* Label */}
          <span
            className={cn(
              "text-[11px] lg:text-[8px] font-bold uppercase tracking-wide lg:tracking-tight leading-none truncate flex-1 lg:flex-none lg:text-center w-full lg:px-1",
              "transition-opacity duration-200",
              isActive ? "opacity-100" : "opacity-40 group-hover:opacity-100"
            )}
          >
            {item.name}
          </span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-slate-900 border-slate-800 text-white text-[10px] font-black uppercase tracking-widest">
        {item.name}
      </TooltipContent>
    </Tooltip>
  )
}

// ── Flyout panel NavItem ──────────────────────────────────────
function FlyoutNavItem({ 
  item, 
  onClose,
  loadingHref,
  setLoadingHref
}: { 
  item: NavItemDef; 
  onClose: () => void;
  loadingHref: string | null;
  setLoadingHref: (href: string | null) => void;
}) {
  const pathname = usePathname()
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
  const isLoading = loadingHref === item.href

  return (
    <Link
      href={item.href}
      onClick={() => {
        if (!isActive) setLoadingHref(item.href)
        onClose()
      }}
      className={cn(
        "relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200 group overflow-hidden",
        isActive ? "bg-white/8" : ""
      )}
      style={isActive ? {
        background: `linear-gradient(135deg, ${item.color}18 0%, ${item.color}08 100%)`,
      } : {}}
    >
      {/* Loading Border Animation */}
      {isLoading && (
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none z-0">
          <div 
            className="absolute inset-[-100%] animate-[spin_3s_linear_infinite]"
            style={{ 
              background: `conic-gradient(from 0deg, transparent 0%, ${item.color} 50%, transparent 100%)` 
            }}
          />
          <div className="absolute inset-[1px] rounded-[11px] bg-slate-950/90 backdrop-blur-sm" />
        </div>
      )}
      {/* Hover bg (inactive only) */}
      {!isActive && (
        <span className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-200 rounded-xl" />
      )}

      {/* Icon box */}
      <div
        className="h-8 w-8 shrink-0 rounded-lg flex items-center justify-center transition-all duration-200"
        style={{
          backgroundColor: isActive ? `${item.color}22` : 'rgba(30,41,59,0.6)',
        }}
      >
        <item.icon
          className="h-4 w-4 shrink-0 transition-all duration-200 group-hover:scale-110"
          style={{ color: isActive ? item.color : '#64748B' }}
        />
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className={cn(
          "text-[12px] font-semibold leading-none truncate transition-colors duration-200",
          isActive ? "text-white" : "text-slate-300 group-hover:text-white"
        )}>
          {item.name}
        </p>
        <p className="text-[10px] text-slate-500 mt-1 leading-none truncate group-hover:text-slate-400 transition-colors">
          {item.desc}
        </p>
      </div>

      {/* Active indicator dot */}
      {isActive && (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
      )}
    </Link>
  )
}
