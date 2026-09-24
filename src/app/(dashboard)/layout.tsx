"use client"
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { UserProvider } from '@/contexts/UserContext'
import { SubscriptionGuard } from '@/components/SubscriptionGuard'
import { GlobalBanners } from '@/components/global-banners'

import { cn } from '@/lib/utils'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const isFullHeightPage = pathname.includes('/live-chat') || pathname.includes('/evolution/inbox') || pathname.includes('/builder') || pathname.includes('/meetings/event-types/')

  return (
    <UserProvider>
      <SubscriptionGuard>
        <div className="flex flex-col h-screen overflow-hidden bg-[var(--crm-bg)]">
            <GlobalBanners />
            {/* Mobile Overlay */}
            {mobileOpen && (
              <div
                className="fixed inset-0 z-[90] bg-[#00000080] lg:hidden transition-opacity"
                onClick={() => setMobileOpen(false)}
              />
            )}

            <Header mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

            <div className="flex-1 flex min-h-0 relative">
              <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

              <main className={cn(
                "flex-1 flex flex-col relative custom-scrollbar bg-[var(--crm-surface-2)] lg:rounded-tl-[18px] text-[var(--crm-text-primary)] shadow-[-4px_0_24px_rgba(0,0,0,0.1)] min-h-0",
                isFullHeightPage ? "overflow-hidden h-full" : "overflow-y-auto"
              )}>
                {pathname === '/dashboard' || isFullHeightPage ? (
                  children
                ) : (
                  <div className="flex flex-col flex-1 min-h-0 bg-[var(--crm-surface-1)] lg:rounded-[var(--r-sm)]">
                    <div className="flex flex-col flex-1 overflow-y-auto p-2 sm:p-3 lg:p-4 lg:px-10 custom-scrollbar">
                      {children}
                    </div>
                  </div>
                )}
              </main>
            </div>
          </div>
      </SubscriptionGuard>
    </UserProvider>
  )
}
