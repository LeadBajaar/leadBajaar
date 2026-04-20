"use client"
import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { cn } from '@/lib/utils'

import { UserProvider } from '@/contexts/UserContext'
import { SubscriptionGuard } from '@/components/SubscriptionGuard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <UserProvider>
      <SubscriptionGuard>
        <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950">
          {/* Mobile Overlay */}
          {mobileOpen && (
            <div
              className="fixed inset-0 z-[90] bg-slate-950/50 backdrop-blur-sm lg:hidden transition-all duration-300"
              onClick={() => setMobileOpen(false)}
            />
          )}

          <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <Header mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
            <main className="flex-1 overflow-y-auto relative">
              {children}
            </main>
          </div>
        </div>
      </SubscriptionGuard>
    </UserProvider>
  )
}
