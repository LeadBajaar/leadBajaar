"use client"

import { usePathname } from "next/navigation"
import { ModeToggle } from "@/components/mode-toggle"
import { NotificationBell } from "@/components/notification-bell"

import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const pageMeta: Record<string, { title: string; description: string }> = {
  '/dashboard': { title: 'Dashboard', description: 'Overview of your performance' },
  '/leads': { title: 'Leads', description: 'Manage and track your leads' },
  '/live-chat': { title: 'Live Chat', description: 'Real-time conversations' },
  '/chatbot': { title: 'Chatbot', description: 'Automated messaging flows' },
  '/meetings': { title: 'Meetings', description: 'Schedule and manage meetings' },
  '/integrations': { title: 'Integrations', description: 'Connect your tools' },
  '/analytics': { title: 'Analytics', description: 'Insights and reports' },
  '/settings': { title: 'Settings', description: 'Preferences and configuration' },
}

interface HeaderProps {
  setMobileOpen: (open: boolean) => void
  mobileOpen: boolean
}

export function Header({ setMobileOpen, mobileOpen }: HeaderProps) {
  const pathname = usePathname()
  const meta = pageMeta[pathname] ?? { title: 'Dashboard', description: '' }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center border-b border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-4 lg:px-6 gap-4">
      {/* Mobile Menu Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-9 w-9 text-slate-500"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-slate-900 dark:text-white truncate">
          {meta.title}
        </h1>
        {meta.description && (
          <p className="hidden sm:block text-xs text-slate-400 dark:text-slate-500 truncate leading-none mt-0.5">
            {meta.description}
          </p>
        )}
      </div>

      {/* Right-side actions */}
      <div className="flex items-center gap-2 shrink-0">
        <NotificationBell />
        <ModeToggle />
      </div>
    </header>
  )
}
