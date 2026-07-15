"use client"
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { UserProvider } from '@/contexts/UserContext'
import { SubscriptionGuard } from '@/components/SubscriptionGuard'
import { WhatsAppProvider } from '@/contexts/WhatsAppContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <UserProvider>
      <WhatsAppProvider>
        <SubscriptionGuard>
          <div className="flex h-screen overflow-hidden bg-[var(--crm-bg)] text-[var(--crm-text-primary)]">
            {/* Mobile Overlay */}
            {mobileOpen && (
              <div
                className="fixed inset-0 z-[90] bg-[#00000080] lg:hidden transition-opacity"
                onClick={() => setMobileOpen(false)}
              />
            )}

            <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
              <Header mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
              <main className="flex-1 flex flex-col overflow-y-auto relative lg:p-4 custom-scrollbar">
                {pathname === '/dashboard' || pathname.includes('/live-chat') || pathname.includes('/evolution/inbox') || pathname.includes('/builder') ? (
                  children
                ) : (
                  <div className="flex flex-col flex-1 min-h-0 bg-[var(--crm-surface-1)] lg:rounded-[var(--r-sm)] lg:border border-[var(--crm-border)] lg:shadow-sm">
                    <div className="flex flex-col flex-1 overflow-y-auto p-2 sm:p-3 lg:p-4 custom-scrollbar">
                      {children}
                    </div>
                  </div>
                )}
              </main>
            </div>
          </div>
        </SubscriptionGuard>
      </WhatsAppProvider>
    </UserProvider>
  )
}
