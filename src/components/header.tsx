"use client"

import { usePathname } from "next/navigation"
import { ModeToggle } from "@/components/mode-toggle"
import { NotificationBell } from "@/components/notification-bell"
import { Menu, X, QrCode, Trash2, Zap, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWhatsApp } from "@/contexts/WhatsAppContext"
import { Badge } from "@/components/ui/badge"
import { WhatsAppConnectModal } from "@/components/whatsapp-bot/WhatsAppConnectModal"
import axios from "axios"
import { WHATSAPP_BASE_URL } from "@/lib/api"
import { toast } from "sonner"

const pageMeta: Record<string, { title: string; description: string }> = {
  '/dashboard':            { title: 'Dashboard',        description: 'Overview of your performance' },
  '/leads':                { title: 'Leads',             description: 'Manage and track your leads' },
  '/live-chat':            { title: 'Live Chat',         description: 'Real-time conversations' },
  '/chatbot':              { title: 'Chatbot',           description: 'Automated messaging flows' },
  '/whatsapp-bot':         { title: 'WhatsApp Pro Bot',  description: 'Self-hosted automation engine v2.0' },
  '/meetings':             { title: 'Meetings',          description: 'Schedule and manage meetings' },
  '/meetings/event-types': { title: 'Meetings',          description: 'Configure your scheduling cards' },
  '/integrations':         { title: 'Integrations',      description: 'Connect your tools' },
  '/analytics':            { title: 'Analytics',         description: 'Insights and reports' },
  '/settings':             { title: 'Settings',          description: 'Preferences and configuration' },
  '/team':                 { title: 'Team Management',   description: 'Members, roles and permissions' },
  '/admin':                { title: 'Super Admin Portal', description: 'Global platform control and user management' },
  '/agency':               { title: 'Clients',           description: 'Manage your client portfolio' },
  '/automations':          { title: 'Automations',       description: 'Build powerful workflows' },
  '/developer':            { title: 'Dev Hub',           description: 'API keys & developer tools' },
}

interface HeaderProps {
  setMobileOpen: (open: boolean) => void
  mobileOpen: boolean
}

export function Header({ setMobileOpen, mobileOpen }: HeaderProps) {
  const pathname = usePathname()
  const meta = pageMeta[pathname] ?? { title: 'Dashboard', description: '' }
  const { 
    sessions, 
    ghostSessions, 
    selectedUser, 
    setIsConnectModalOpen, 
    fetchSessions,
    shredSession 
  } = useWhatsApp()

  const isWhatsAppPage = pathname === '/whatsapp-bot'

  return (
    <header className="
      z-40 w-full shrink-0
      flex h-[60px] items-center gap-4 px-6
      bg-transparent border-b border-[var(--crm-border)]
    ">
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Page title */}
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <div>
          <h1 className="text-[15px] font-bold text-slate-900 dark:text-white truncate leading-none flex items-center gap-2">
            {meta.title}
            {isWhatsAppPage && <Badge className="h-4 text-[9px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800 font-bold px-1.5">v2.0</Badge>}
          </h1>
          {meta.description && (
            <p className="hidden sm:block text-[10px] text-slate-500 dark:text-slate-500 truncate leading-none mt-1.5 font-medium">
              {meta.description}
            </p>
          )}
        </div>
      </div>

      {/* Right-side actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="flex items-center justify-center h-8 w-8 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
          <NotificationBell />
        </div>
        <div className="flex items-center justify-center h-8 w-8 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
          <ModeToggle />
        </div>
      </div>
      <WhatsAppConnectModal />
    </header>
  )
}
