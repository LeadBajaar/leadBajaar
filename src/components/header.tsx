"use client"

import { usePathname } from "next/navigation"
import { ModeToggle } from "@/components/mode-toggle"
import { NotificationBell } from "@/components/notification-bell"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const pageMeta: Record<string, { title: string; description: string }> = {
  '/dashboard':            { title: 'Dashboard',        description: 'Overview of your performance' },
  '/leads':                { title: 'Leads',             description: 'Manage and track your leads' },
  '/live-chat':            { title: 'Live Chat',         description: 'Real-time conversations' },
  '/chatbot':              { title: 'Chatbot',           description: 'Automated messaging flows' },
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

  return (
    <header className="
      z-40 w-full
      flex h-14 items-center gap-4 px-4
      bg-white/90 dark:bg-slate-950/95 backdrop-blur-md
      border border-slate-200/80 dark:border-slate-800/60 rounded-xl shadow-lg dark:shadow-2xl
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
      <div className="flex-1 min-w-0">
        <h1 className="text-[15px] font-semibold text-slate-900 dark:text-white truncate leading-none">
          {meta.title}
        </h1>
        {meta.description && (
          <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-500 truncate leading-none mt-1">
            {meta.description}
          </p>
        )}
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
    </header>
  )
}
