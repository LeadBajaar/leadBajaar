"use client"
import { useState } from 'react'
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
              <main className="flex-1 overflow-y-auto relative p-4 lg:p-6 no-scrollbar">
                {children}
              </main>
            </div>
          </div>
        </SubscriptionGuard>
      </WhatsAppProvider>
    </UserProvider>
  )
}
