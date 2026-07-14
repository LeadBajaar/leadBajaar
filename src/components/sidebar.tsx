"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { LogOut } from 'lucide-react'
import { logout, integrationApi, evolutionApi } from '@/lib/api'
import { clearSession, setSession } from '@/lib/auth'
import { useUser, UserRole, UserType } from '@/contexts/UserContext'

// ── Types ────────────────────────────────────────────────────
type NavItemDef = {
  name: string
  href: string
  iconClass: string
  roles: UserRole[]
  types?: UserType[]
  plans?: string[]
  feature?: string
  exact?: boolean
}

type NavSection = {
  label: string
  items: NavItemDef[]
}

const mainNav: NavItemDef[] = [
  { name: 'Dashboard', href: '/dashboard', iconClass: 'ti ti-layout-dashboard', roles: ['Super Admin', 'Admin', 'Manager', 'Agent'], feature: 'dashboard' },
  { name: 'Leads', href: '/leads', iconClass: 'ti ti-users', roles: ['Super Admin', 'Admin', 'Manager', 'Agent'], feature: 'leads' },
  { name: 'Live Chat', href: '/live-chat', iconClass: 'ti ti-brand-whatsapp', roles: ['Super Admin', 'Admin', 'Manager', 'Agent'], feature: 'live_chat' },
  { name: 'Evolution Inbox', href: '/evolution/inbox', iconClass: 'ti ti-message-circle', roles: ['Super Admin', 'Admin', 'Manager', 'Agent'], feature: 'live_chat' },
  { name: 'Chatbot', href: '/chatbot', iconClass: 'ti ti-robot', roles: ['Super Admin', 'Admin', 'Manager'], types: ['agency', 'super_admin', 'individual'], feature: 'chatbot' },
  { name: 'Evolution Chatbot', href: '/evolution/chatbot', iconClass: 'ti ti-robot-face', roles: ['Super Admin', 'Admin', 'Manager'], types: ['agency', 'super_admin', 'individual'], feature: 'chatbot' },
  { name: 'Meetings', href: '/meetings', iconClass: 'ti ti-calendar-event', roles: ['Super Admin', 'Admin', 'Manager', 'Agent'], feature: 'meetings' },
]

const sidebarSections: NavSection[] = [
  {
    label: 'Clients & Growth',
    items: [
      { name: 'Clients', href: '/agency', iconClass: 'ti ti-briefcase', roles: ['Super Admin', 'Admin'], types: ['agency', 'super_admin'], feature: 'agency_management' },
      { name: 'Analytics', href: '/analytics', iconClass: 'ti ti-chart-arrows', roles: ['Super Admin', 'Admin', 'Manager'], types: ['agency', 'super_admin', 'individual'], feature: 'analytics' },
    ],
  },
  {
    label: 'Organization',
    items: [
      { name: 'Team', href: '/team', iconClass: 'ti ti-users-group', roles: ['Super Admin', 'Admin'], feature: 'team_management' },
    ],
  },
  {
    label: 'Automation',
    items: [
      { name: 'Automations', href: '/automations', iconClass: 'ti ti-bolt', roles: ['Super Admin', 'Admin'], types: ['agency', 'super_admin', 'individual'], feature: 'automations' },
    ],
  },
  {
    label: 'Platform Control',
    items: [
      { name: 'Admin', href: '/admin', iconClass: 'ti ti-shield', roles: ['Super Admin'], types: ['super_admin'], feature: 'system_admin', exact: true },
      { name: 'Emails', href: '/admin/emails', iconClass: 'ti ti-mail', roles: ['Super Admin'], types: ['super_admin'], feature: 'email_logs' },
      { name: 'Error Logs', href: '/admin/errors', iconClass: 'ti ti-activity', roles: ['Super Admin'], types: ['super_admin'], feature: 'error_logs' },
      { name: 'Finance', href: '/admin/finance/dashboard', iconClass: 'ti ti-currency-dollar', roles: ['Super Admin'], types: ['super_admin'], feature: 'finance_module' },
      { name: 'Payments', href: '/admin/payments', iconClass: 'ti ti-cash', roles: ['Super Admin'], types: ['super_admin'], feature: 'system_admin' },
      { name: 'Dev Hub', href: '/developer', iconClass: 'ti ti-code', roles: ['Super Admin', 'Admin'], feature: 'developer_tools' },
    ],
  },
  {
    label: 'Integrations',
    items: [
      { name: 'LB Forms', href: '/lb-forms', iconClass: 'ti ti-file-description', roles: ['Super Admin', 'Admin', 'Manager'], types: ['agency', 'super_admin', 'individual'], feature: 'integrations' },
      { name: 'WhatsApp Cloud API', href: '/integrations/whatsapp', iconClass: 'ti ti-brand-whatsapp', roles: ['Super Admin', 'Admin', 'Manager'], types: ['agency', 'super_admin', 'individual'], feature: 'integrations' },
      { name: 'WhatsApp (Evolution)', href: '/integrations/evolution', iconClass: 'ti ti-brand-whatsapp', roles: ['Super Admin', 'Admin', 'Manager'], types: ['agency', 'super_admin', 'individual'], feature: 'integrations' },
      { name: 'Facebook Lead Forms', href: '/integrations/facebook-lead-forms', iconClass: 'ti ti-brand-facebook', roles: ['Super Admin', 'Admin', 'Manager'], types: ['agency', 'super_admin', 'individual'], feature: 'integrations' },
      { name: 'Meta Conversion API', href: '/integrations/meta-capi', iconClass: 'ti ti-brand-meta', roles: ['Super Admin', 'Admin', 'Manager'], types: ['agency', 'super_admin', 'individual'], feature: 'integrations' },
      { name: 'Webhooks', href: '/integrations/webhooks', iconClass: 'ti ti-webhook', roles: ['Super Admin', 'Admin', 'Manager'], types: ['agency', 'super_admin', 'individual'], feature: 'integrations' },
      { name: 'Email Marketing', href: '/integrations/email-marketing', iconClass: 'ti ti-mail', roles: ['Super Admin', 'Admin', 'Manager'], types: ['agency', 'super_admin', 'individual'], feature: 'integrations' },
      { name: 'Facebook Auth', href: '/integrations/facebook-auth', iconClass: 'ti ti-brand-facebook', roles: ['Super Admin', 'Admin', 'Manager'], types: ['agency', 'super_admin', 'individual'], feature: 'integrations' },
      { name: 'Integrations', href: '/integrations', iconClass: 'ti ti-puzzle', roles: ['Super Admin', 'Admin'], types: ['agency', 'super_admin', 'individual'], feature: 'integrations', exact: true },
      { name: 'WhatsApp Bot', href: '/whatsapp-bot', iconClass: 'ti ti-brand-whatsapp', roles: ['Super Admin', 'Admin'], types: ['agency', 'super_admin', 'individual'], feature: 'whatsapp_bot' },
    ],
  },
  {
    label: 'Account',
    items: [
      { name: 'Settings', href: '/settings', iconClass: 'ti ti-settings', roles: ['Super Admin', 'Admin', 'Manager', 'Agent'], feature: 'account_settings' },
    ],
  },
]

interface SidebarProps {
  mobileOpen?: boolean
  setMobileOpen?: (open: boolean) => void
  isCollapsed?: boolean
  setIsCollapsed?: (collapsed: boolean) => void
}

export function Sidebar({ mobileOpen, setMobileOpen, isCollapsed = false, setIsCollapsed }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, hasRole, hasType, hasPlan, hasFeature } = useUser()
  const [isAdminImpersonating, setIsAdminImpersonating] = useState(false)
  const [lbFormsEnabled, setLbFormsEnabled] = useState(false)
  const [whatsappEnabled, setWhatsappEnabled] = useState(false)
  const [leadFormsEnabled, setLeadFormsEnabled] = useState(false)
  const [metaCapiEnabled, setMetaCapiEnabled] = useState(false)
  const [webhooksEnabled, setWebhooksEnabled] = useState(false)
  const [emailEnabled, setEmailEnabled] = useState(false)
  const [fbAuthEnabled, setFbAuthEnabled] = useState(false)
  const [evolutionEnabled, setEvolutionEnabled] = useState(false)

  useEffect(() => {
    setIsAdminImpersonating(!!localStorage.getItem('admin_token'))
    
    const checkIntegrations = async () => {
      try {
        const integrations = await integrationApi.getConnectedIntegrations()
        
        setLbFormsEnabled(integrations.some((i: any) => i.type === 'lb_forms' && i.is_active))
        setWhatsappEnabled(integrations.some((i: any) => i.type === 'whatsapp' && i.is_active))
        setLeadFormsEnabled(integrations.some((i: any) => i.type === 'leadform' && i.is_active))
        setMetaCapiEnabled(integrations.some((i: any) => i.type === 'facebook_conversion_api' && i.is_active))
        setWebhooksEnabled(integrations.some((i: any) => i.type === 'webhook' && i.is_active))
        setEmailEnabled(integrations.some((i: any) => i.type === 'email' && i.is_active))
        // Note: facebook_auth might have a different type in DB, checking for 'facebook_auth'
        setFbAuthEnabled(integrations.some((i: any) => i.type === 'facebook_auth' && i.is_active))
        setEvolutionEnabled(integrations.some((i: any) => i.type === 'evolution' && i.is_active))
      } catch (e) {
        // ignore
      }
    }
    
    checkIntegrations()
    window.addEventListener('integrationsUpdated', checkIntegrations)
    return () => window.removeEventListener('integrationsUpdated', checkIntegrations)
  }, [])

  useEffect(() => {
    setMobileOpen?.(false)
  }, [pathname, setMobileOpen])

  const handleLogout = async () => {
    try {
      await logout()
      clearSession()
      localStorage.removeItem('admin_token')
      router.push('/signin')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  const handleReturnToAdmin = () => {
    const adminToken = localStorage.getItem('admin_token')
    if (adminToken) {
      setSession(adminToken)
      localStorage.removeItem('admin_token')
      window.location.href = '/dashboard'
    }
  }

  const canSee = (item: NavItemDef) => {
    if (item.name === 'LB Forms' && !lbFormsEnabled) return false
    if (item.name === 'WhatsApp Cloud API' && !whatsappEnabled) return false
    if (item.name === 'Facebook Lead Forms' && !leadFormsEnabled) return false
    if (item.name === 'Meta Conversion API' && !metaCapiEnabled) return false
    if (item.name === 'Webhooks' && !webhooksEnabled) return false
    if (item.name === 'Email Marketing' && !emailEnabled) return false
    if (item.name === 'Facebook Auth' && !fbAuthEnabled) return false
    
    // Filter evolution features based on enabled status
    if ((item.href.startsWith('/evolution/inbox') || item.href.startsWith('/evolution/chatbot')) && !evolutionEnabled) {
      return false
    }
    if (item.name === 'WhatsApp (Evolution)' && !evolutionEnabled) return false
    
    const roleMatch = hasRole(item.roles)
    const typeMatch = !item.types || hasType(item.types)
    const featureMatch = !item.feature || hasFeature(item.feature)
    const planMatch = !item.plans || hasPlan(item.plans) || hasType(['agency', 'super_admin'])
    return roleMatch && typeMatch && featureMatch && planMatch
  }

  const visibleMain = mainNav.filter(canSee)
  const visibleSections = sidebarSections
    .map(s => ({ ...s, items: s.items.filter(canSee) }))
    .filter(s => s.items.length > 0)

  return (
    <>
      <aside
        style={{ width: isCollapsed ? '64px' : '220px' }}
        className={cn(
          "sidebar fixed lg:relative z-[100] h-screen transition-all duration-300 flex flex-col",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="sidebar-top relative flex h-[56px] items-center px-4 border-b border-[var(--crm-border)] shrink-0">
          {!isCollapsed && (
            <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap w-full">
              <img src="/logo-sm.png" alt="LeadBajaar" className="h-7 w-auto object-contain shrink-0" />
              <div className="text-[15px] font-extrabold tracking-tight text-[var(--crm-text-primary)] truncate">LeadBajaar</div>
            </div>
          )}
          {isCollapsed && (
            <div className="flex items-center justify-center shrink-0 w-full">
              <img src="/logo-sm.png" alt="LB" className="h-7 w-auto object-contain" />
            </div>
          )}
          {setIsCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                "hidden lg:flex items-center justify-center text-[var(--crm-text-secondary)] hover:bg-[var(--crm-surface-3)] hover:text-[var(--crm-text-primary)] transition-colors shrink-0",
                isCollapsed
                  ? "absolute -right-3 top-1/2 -translate-y-1/2 bg-[var(--crm-surface-1)] border border-[var(--crm-border)] shadow-sm rounded-full w-6 h-6 z-50"
                  : "ml-auto w-6 h-6 rounded-[var(--r-sm)]"
              )}
            >
              <i className={cn("ti", isCollapsed ? "ti-chevron-right text-[12px]" : "ti-layout-sidebar-right-collapse text-lg")} />
            </button>
          )}
          <button
            onClick={() => setMobileOpen?.(false)}
            className="lg:hidden ml-auto text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)]"
          >
            <i className="ti ti-x" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar py-2">
          {isAdminImpersonating && (
            <div className="px-2 mb-2">
                <button
                  onClick={handleReturnToAdmin}
                  className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] font-medium text-amber-500 hover:bg-amber-50"
                >
                  <i className="ti ti-corner-up-left" /> Return to Admin
                </button>
            </div>
          )}

          <div className="px-2 space-y-0.5">
            {visibleMain.map(item => {
              const isActive = item.exact ? pathname === item.href : (pathname === item.href || pathname.startsWith(`${item.href}/`))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-2.5 px-2 py-1.5 rounded-[var(--r-md)] text-[13px] font-medium transition-all duration-150",
                    isCollapsed ? "justify-center" : "",
                    isActive
                      ? "bg-[var(--crm-sidebar-active)] text-[var(--crm-text-primary)] font-semibold shadow-sm ring-1 ring-[var(--crm-border)]"
                      : "text-[var(--crm-text-primary)] hover:bg-[var(--crm-sidebar-active)] hover:text-[var(--crm-text-primary)]"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <i className={cn(item.iconClass, "text-[16px] shrink-0", isActive ? "text-[var(--crm-text-primary)]" : "text-[var(--crm-text-secondary)] group-hover:text-[var(--crm-text-primary)]")} />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </Link>
              )
            })}
          </div>

          {visibleSections.map(section => (
            <div key={section.label} className="mt-4 px-2 space-y-0.5 border-t border-[var(--crm-border)] pt-2">
              {!isCollapsed && <div className="section-label px-1.5 pb-1 truncate">{section.label}</div>}
              {section.items.map(item => {
                const isActive = item.exact ? pathname === item.href : (pathname === item.href || pathname.startsWith(`${item.href}/`))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] font-medium transition-all duration-150",
                      isCollapsed ? "justify-center" : "",
                      isActive 
                        ? "bg-[var(--crm-sidebar-active)] text-[var(--crm-text-primary)] font-semibold shadow-sm ring-1 ring-[var(--crm-border)]" 
                        : "text-[var(--crm-text-primary)] hover:bg-[var(--crm-sidebar-active)]"
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <i className={cn(item.iconClass, "text-[16px] shrink-0", isActive ? "text-[var(--crm-text-primary)]" : "text-[var(--crm-text-secondary)] group-hover:text-[var(--crm-text-primary)]")} />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </Link>
                )
              })}
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-[var(--crm-border)] mt-auto">
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-2.5 py-1.5 rounded-md text-[13px] font-medium text-[var(--crm-text-secondary)] hover:bg-[var(--crm-red-soft)] hover:text-[var(--crm-red)] transition-colors",
              isCollapsed ? "justify-center px-0" : "px-2"
            )}
            title={isCollapsed ? "Logout" : undefined}
          >
            <i className="ti ti-logout text-[16px] text-red-500 opacity-70 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
          <div
            className={cn(
              "mt-2 flex items-center gap-2 py-1.5 cursor-pointer hover:bg-[var(--crm-sidebar-hover)] rounded-[var(--r-md)]",
              isCollapsed ? "justify-center px-0" : "px-2"
            )}
            onClick={() => router.push('/settings')}
            title={isCollapsed ? user?.name || 'User' : undefined}
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--r-sm)] bg-[var(--crm-accent-soft)] text-[10px] font-bold text-[var(--crm-accent)]">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-medium text-[var(--crm-text-primary)] truncate">{user?.name || 'User'}</span>
                <span className="text-[9px] text-[var(--crm-text-secondary)] truncate">{user?.email || ''}</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
