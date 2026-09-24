"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ModeToggle } from "@/components/mode-toggle"
import { NotificationBell } from "@/components/notification-bell"
import { Menu, X, Search, LayoutGrid, Settings, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useUser } from '@/contexts/UserContext'
import { cn } from "@/lib/utils"

interface HeaderProps {
  setMobileOpen: (open: boolean) => void
  mobileOpen: boolean
}

export function Header({ setMobileOpen, mobileOpen }: HeaderProps) {
  const { user } = useUser()
  const pathname = usePathname()
  
  return (
    <header className="z-40 w-full shrink-0 flex h-[72px] items-center justify-between px-6 bg-transparent border-none">
      
      {/* Left: Logo + See Plans */}
      <div className="flex items-center gap-6">
        <button
          className="lg:hidden flex items-center justify-center h-10 w-10 rounded-full text-[var(--crm-shell-text)] hover:opacity-80 transition-all bg-transparent"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-[22px] w-[22px]" /> : <Menu className="h-[22px] w-[22px]" />}
        </button>

        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
          <img src="/logo-sm.png" alt="LeadBajaar" className="h-7 w-auto object-contain shrink-0" />
          <div style={{
            fontFamily: "'Lexend Deca', sans-serif",
            fontWeight: 500,
            fontSize: '15px',
            lineHeight: 'normal',
            color: 'rgb(255, 255, 255)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>LeadBajaar CRM</div>
        </div>

        <Link 
          href="/plans"
          prefetch={true}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-900 transition-all text-[12px] font-extrabold shadow-sm border border-slate-200 select-none hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="text-[10px]">💎</span> See plans
        </Link>
      </div>

      {/* Center: Global Search */}
      <div className="hidden md:flex flex-1 max-w-[480px] mx-6 relative group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-white transition-opacity" />
        <input 
          type="text" 
          placeholder="Search for anything..."
          className="w-full h-10 pl-10 pr-12 bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.08)] rounded-[8px] outline-none focus:bg-[rgba(255,255,255,0.1)] focus:border-[rgba(255,255,255,0.2)] transition-all"
          style={{
            fontFamily: "'Lexend Deca', sans-serif",
            fontWeight: 300,
            fontSize: '13px',
            lineHeight: 'normal',
            color: 'rgb(255,255,255)',
          }}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] font-medium text-[var(--crm-shell-text-muted)]">
          <span className="px-1.5 py-0.5 rounded border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.05)]">⌘</span>
          <span className="px-1.5 py-0.5 rounded border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.05)]">K</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 shrink-0 text-[var(--crm-shell-text)]">
        <NotificationBell />
        <Link 
          href="/integrations"
          prefetch={true}
          className={cn(
            "h-9 w-9 flex items-center justify-center rounded-[var(--radius-button-secondary)] transition-all",
            pathname.startsWith('/integrations')
              ? "bg-[rgba(255,255,255,0.12)] text-white border border-[rgba(255,255,255,0.1)] shadow-sm"
              : "text-white hover:bg-[rgba(255,255,255,0.08)] border border-transparent"
          )}
          title="Integrations"
        >
          <LayoutGrid className="h-[20px] w-[20px] stroke-[1.8px]" />
        </Link>
        <Link 
          href="/settings"
          prefetch={true}
          className={cn(
            "h-9 w-9 flex items-center justify-center rounded-[var(--radius-button-secondary)] transition-all hidden sm:flex",
            pathname.startsWith('/settings') && !(typeof window !== 'undefined' && window.location.search.includes('tab=profile'))
              ? "bg-[rgba(255,255,255,0.12)] text-white border border-[rgba(255,255,255,0.1)] shadow-sm"
              : "text-white hover:bg-[rgba(255,255,255,0.08)] border border-transparent"
          )}
          title="Account Settings"
        >
          <Settings className="h-[20px] w-[20px] stroke-[1.8px]" />
        </Link>
        <button 
          onClick={() => window.open('mailto:support@leadbajaar.com')}
          className="h-9 w-9 flex items-center justify-center rounded-[var(--radius-button-secondary)] hover:bg-[rgba(255,255,255,0.08)] text-white border border-transparent transition-colors hidden sm:flex"
          title="Email Support"
        >
          <HelpCircle className="h-[20px] w-[20px] stroke-[1.8px]" />
        </button>
        
        <div className="h-4 w-[1px] bg-[rgba(255,255,255,0.1)] mx-1 hidden sm:block" />
 
        <Link 
          href="/settings?tab=profile"
          prefetch={true}
          className={cn(
            "relative h-8 w-8 ml-1 rounded-full bg-[rgba(255,255,255,0.15)] text-[11px] font-bold text-[var(--crm-shell-text)] flex items-center justify-center cursor-pointer border transition-all",
            pathname.startsWith('/settings') && (typeof window !== 'undefined' && window.location.search.includes('tab=profile'))
              ? "border-blue-400 ring-2 ring-blue-500/20"
              : "border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.3)]"
          )}
          title="Profile Settings"
        >
          {user?.name?.[0]?.toUpperCase() || 'U'}
          <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-[var(--crm-green)] border-2 border-[var(--crm-bg)] rounded-full" />
        </Link>
      </div>
    </header>
  )
}
