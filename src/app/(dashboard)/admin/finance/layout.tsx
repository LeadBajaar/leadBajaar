'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Receipt,
  Users,
  CreditCard,
  DollarSign,
  TrendingUp,
  UserX,
  FileText,
  Settings,
} from 'lucide-react'

const financeNav = [
  { label: 'Dashboard', href: '/admin/finance/dashboard', icon: LayoutDashboard },
  { label: 'Revenue',   href: '/admin/finance/revenue',   icon: TrendingUp },
  { label: 'Expenses',  href: '/admin/finance/expenses',  icon: Receipt },
  { label: 'Employees', href: '/admin/finance/employees', icon: Users },
  { label: 'Payroll',   href: '/admin/finance/payroll',   icon: CreditCard },
  { label: 'Churn',     href: '/admin/finance/churn',     icon: UserX },
  { label: 'Reports',   href: '/admin/finance/reports',   icon: FileText },
  { label: 'Plans',     href: '/admin/finance/plans',     icon: Settings },
]

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Finance sub-header */}
      <div className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur-sm">
        <div className="px-6 py-0">
          <div className="flex items-center gap-2 mb-3 pt-4">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
            <h1 className="text-base font-semibold text-foreground">Finance</h1>
            <span className="text-xs text-muted-foreground ml-1">Super Admin</span>
          </div>
          <nav className="flex gap-1">
            {financeNav.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-all',
                    isActive
                      ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  )
}
