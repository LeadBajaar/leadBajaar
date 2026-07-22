"use client"

import { usePathname } from "next/navigation"
import { ModeToggle } from "@/components/mode-toggle"
import { NotificationBell } from "@/components/notification-bell"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWhatsApp } from "@/contexts/WhatsAppContext"
import { Badge } from "@/components/ui/badge"
import { WhatsAppConnectModal } from "@/components/whatsapp-bot/WhatsAppConnectModal"

const pageMeta: Record<string, { title: string; description: string }> = {
  '/dashboard': { title: 'Dashboard', description: 'Overview of your performance' },
  '/leads': { title: 'Leads', description: 'Manage and track your leads' },
  '/live-chat': { title: 'Live Chat', description: 'Real-time conversations' },
  '/chatbot': { title: 'Chatbot', description: 'Automated messaging flows' },
  '/whatsapp-bot': { title: 'WhatsApp Pro Bot', description: 'Self-hosted automation engine v2.0' },
  '/meetings': { title: 'Meetings', description: 'Schedule and manage meetings' },
  '/meetings/event-types': { title: 'Meetings', description: 'Configure your scheduling cards' },
  '/integrations': { title: 'Integrations', description: 'Connect your tools' },
  '/analytics': { title: 'Analytics', description: 'Insights and reports' },
  '/settings': { title: 'Settings', description: 'Preferences and configuration' },
  '/team': { title: 'Team Management', description: 'Members, roles and permissions' },
  '/admin': { title: 'Super Admin Portal', description: 'Global platform control and user management' },
  '/agency': { title: 'Clients', description: 'Manage your client portfolio' },
  '/automations': { title: 'Automations', description: 'Build powerful workflows' },
  '/developer': { title: 'Dev Hub', description: 'API keys & developer tools' },
  '/evolution/inbox': { title: 'Evolution Inbox', description: 'Manage your centralized conversations' },
}

interface HeaderProps {
  setMobileOpen: (open: boolean) => void
  mobileOpen: boolean
}

export function Header({ setMobileOpen, mobileOpen }: HeaderProps) {
  const pathname = usePathname()
  const meta = pageMeta[pathname] ?? { title: 'Dashboard', description: '' }
  const { setIsConnectModalOpen } = useWhatsApp()

  const isWhatsAppPage = pathname === '/whatsapp-bot'

  return (
    <header className="
      z-40 w-full shrink-0
      flex h-[56px] items-center gap-3 px-5
      bg-[var(--crm-sidebar-bg)] border-b border-[var(--crm-border)]
    ">
      {/* Mobile menu toggle */}
      <button
        className="lg:hidden flex items-center justify-center h-10 w-10 rounded-full text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] transition-all bg-transparent hover:bg-transparent"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-[22px] w-[22px]" /> : <Menu className="h-[22px] w-[22px]" />}
      </button>

      {/* Page title + description */}
      <div className="flex-1 min-w-0">
        <h1 className="text-[15px] font-semibold text-[var(--crm-text-primary)] truncate leading-tight flex items-center gap-2">
          {meta.title}
          {isWhatsAppPage && (
            <Badge className="h-4 text-[9px] bg-primary/10 dark:bg-indigo-900/30 text-primary dark:text-indigo-400 border-indigo-100 dark:border-indigo-800 font-bold px-1.5">
              v2.0
            </Badge>
          )}
        </h1>
        {meta.description && (
          <p className="hidden sm:block text-[11px] text-[var(--crm-text-tertiary)] truncate leading-tight mt-0.5">
            {meta.description}
          </p>
        )}
      </div>

      {/* Right-side icon actions */}
      <div className="flex items-center gap-2 shrink-0">
        <NotificationBell />
        <ModeToggle />
      </div>

      <WhatsAppConnectModal />
    </header>
  )
}
