"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
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
  ChevronLeft,
  ChevronRight,
  Bell,
} from 'lucide-react'
import { logout } from '@/lib/api'
import { clearSession } from '@/lib/auth'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// ── Nav config ───────────────────────────────────────────────
const mainNav = [
  {
    label: 'Core',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: Gauge, color: '#6366F1' },
      { name: 'Leads', href: '/leads', icon: UserCheck, color: '#10B981' },
      { name: 'Live Chat', href: '/live-chat', icon: MessageCircle, color: '#3B82F6' },
      { name: 'Chatbot', href: '/chatbot', icon: Bot, color: '#8B5CF6' },
    ]
  },
  {
    label: 'Productivity',
    items: [
      { name: 'Meetings', href: '/meetings', icon: CalendarCheck2, color: '#F59E0B' },
      { name: 'Integrations', href: '/integrations', icon: Plug2, color: '#EC4899' },
      { name: 'Analytics', href: '/analytics', icon: TrendingUp, color: '#14B8A6' },
    ]
  },
]

const bottomNav = [
  { name: 'Settings', href: '/settings', icon: Settings2, color: '#94A3B8' },
]

// ── Sidebar shell ────────────────────────────────────────────
interface SidebarProps {
  mobileOpen?: boolean
  setMobileOpen?: (open: boolean) => void
}

export function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      clearSession()
      router.push('/signin')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          // Base — NO overflow-hidden so the toggle button peeks out
          'fixed inset-y-0 left-0 z-[100] flex flex-col h-full shrink-0',
          'lg:relative lg:z-0',
          // Dark sidebar background
          'bg-slate-900 dark:bg-slate-950',
          // Border
          'border-r border-slate-800 dark:border-slate-800',
          // Width & Visibility
          'transition-all duration-300 ease-in-out',
          'w-[260px]', // Mobile width
          mobileOpen
            ? 'translate-x-0 opacity-100 visible'
            : '-translate-x-full opacity-0 invisible lg:translate-x-0 lg:opacity-100 lg:visible',
          collapsed ? 'lg:w-[68px]' : 'lg:w-[220px]',
        )}
      >
        {/* Subtle top gradient glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-indigo-600/10 to-transparent" />

        {/* Collapse toggle — floats over the sidebar/content boundary */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className={cn(
            'absolute -right-3.5 top-[70px] z-[60] hidden lg:flex',
            'h-7 w-7 items-center justify-center rounded-full',
            // Visible against BOTH dark sidebar and light page
            'bg-slate-700 hover:bg-indigo-600',
            'text-slate-200 hover:text-white',
            // Double-ring: inner dark border + outer glow
            'border-2 border-slate-900',
            'ring-1 ring-slate-600 hover:ring-indigo-500',
            'shadow-md transition-all duration-150',
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <ChevronRight className="h-3.5 w-3.5" />
            : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>


        {/* ── Logo ────────────────────────────────────────── */}
        <div className={cn(
          'flex h-[58px] shrink-0 items-center border-b border-slate-800/80 px-4',
          'transition-all duration-300 overflow-hidden',
          collapsed ? 'justify-center' : 'gap-3',
        )}>
          {/* Logo mark — always shows LB */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 select-none">
            <span className="text-xs font-black text-white tracking-tight">LB</span>
          </div>

          {!collapsed && (
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold text-white tracking-tight whitespace-nowrap">
                LeadBajaar
              </span>
              <span className="text-[10px] text-indigo-400 font-medium tracking-widest uppercase">
                CRM
              </span>
            </div>
          )}
        </div>

        {/* ── Nav ─────────────────────────────────────────── */}
        <ScrollArea className="flex-1 py-3">
          <div className={cn('px-3 space-y-5')}>
            {mainNav.map((section) => (
              <div key={section.label}>
                {/* Section label */}
                {!collapsed && (
                  <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    {section.label}
                  </p>
                )}
                {collapsed && (
                  <div className="mb-1.5 mx-auto h-px w-5 bg-slate-700" />
                )}

                <nav className="flex flex-col gap-0.5">
                  {section.items.map(item => (
                    <NavItem key={item.href} item={item} collapsed={collapsed} setMobileOpen={setMobileOpen} />
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* ── Bottom section ───────────────────────────────── */}
        <div className="shrink-0 border-t border-slate-800 px-3 py-3 space-y-0.5">
          {bottomNav.map(item => (
            <NavItem key={item.href} item={item} collapsed={collapsed} setMobileOpen={setMobileOpen} />
          ))}

          {/* Logout */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5',
                  'text-slate-400 hover:text-red-400 hover:bg-red-500/10',
                  'transition-all duration-150 text-sm font-medium',
                  collapsed && 'justify-center px-2',
                )}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                {!collapsed && <span>Logout</span>}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                Logout
              </TooltipContent>
            )}
          </Tooltip>

          {/* User pill */}
          {!collapsed && (
            <div className="mt-2 flex items-center gap-3 rounded-xl bg-slate-800/60 px-3 py-2.5 border border-slate-700/50">
              <div className="h-7 w-7 shrink-0 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow">
                U
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">My Account</p>
                <p className="text-[10px] text-slate-500 truncate">Lead Manager</p>
              </div>
              <Bell className="h-3.5 w-3.5 text-slate-500 hover:text-white transition-colors cursor-pointer shrink-0" />
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}

// ── Individual nav item ──────────────────────────────────────
type NavItemDef = {
  name: string
  href: string
  icon: React.ElementType
  color: string
}

function NavItem({
  item,
  collapsed,
  setMobileOpen
}: {
  item: NavItemDef;
  collapsed: boolean;
  setMobileOpen?: (open: boolean) => void
}) {
  const pathname = usePathname()
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

  const inner = (
    <Link
      href={item.href}
      onClick={() => setMobileOpen?.(false)}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5',
        'text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-white/10 text-white shadow-sm'
          : 'text-slate-400 hover:text-white hover:bg-white/5',
        collapsed && 'justify-center px-2',
      )}
    >
      {/* Active left accent bar */}
      {isActive && !collapsed && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full"
          style={{ backgroundColor: item.color }}
        />
      )}

      {/* Icon container */}
      <span
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-150',
          isActive
            ? 'shadow-sm'
            : 'bg-transparent group-hover:bg-white/5',
        )}
        style={isActive ? { backgroundColor: `${item.color}22`, color: item.color } : {}}
      >
        <item.icon
          className="h-4 w-4"
          style={isActive ? { color: item.color } : {}}
        />
      </span>

      {!collapsed && (
        <span className="truncate leading-none">{item.name}</span>
      )}

      {/* Active dot indicator (collapsed) */}
      {isActive && collapsed && (
        <span
          className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: item.color }}
        />
      )}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{inner}</TooltipTrigger>
        <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700 text-xs">
          {item.name}
        </TooltipContent>
      </Tooltip>
    )
  }

  return inner
}
