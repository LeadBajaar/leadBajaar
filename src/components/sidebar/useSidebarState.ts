import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { integrationApi } from '@/lib/api'
import { useUser } from '@/contexts/UserContext'
import { NavItemDef, NavSection } from './types'

export const mainNav: NavItemDef[] = [
  { name: 'Dashboard', href: '/dashboard', iconClass: 'ti ti-layout-dashboard', roles: ['Super Admin', 'Admin', 'Manager', 'Agent'], feature: 'dashboard' },
  { name: 'Leads', href: '/leads', iconClass: 'ti ti-users', roles: ['Super Admin', 'Admin', 'Manager', 'Agent'], feature: 'leads' },
  { name: 'Live Chat', href: '/live-chat', iconClass: 'ti ti-brand-whatsapp', roles: ['Super Admin', 'Admin', 'Manager', 'Agent'], feature: 'live_chat' },
  { name: 'Evolution Inbox', href: '/evolution/inbox', iconClass: 'ti ti-message-circle', roles: ['Super Admin', 'Admin', 'Manager', 'Agent'], feature: 'live_chat' },
  { name: 'Chatbot', href: '/chatbot', iconClass: 'ti ti-robot', roles: ['Super Admin', 'Admin', 'Manager'], types: ['agency', 'super_admin', 'individual'], feature: 'chatbot' },
  { name: 'Evolution Chatbot', href: '/evolution/chatbot', iconClass: 'ti ti-robot-face', roles: ['Super Admin', 'Admin', 'Manager'], types: ['agency', 'super_admin', 'individual'], feature: 'chatbot' },
  { name: 'Meetings', href: '/meetings', iconClass: 'ti ti-calendar-event', roles: ['Super Admin', 'Admin', 'Manager', 'Agent'], feature: 'meetings' },
  { name: 'Tutorials', href: '/tutorials', iconClass: 'ti ti-video', roles: ['Super Admin', 'Admin', 'Manager', 'Agent'], feature: 'tutorials' },
]

export const sidebarSections: NavSection[] = [
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
    label: 'Meta Ads',
    items: [
      { name: 'Campaigns', href: '/ads/campaigns', iconClass: 'ti ti-ad', roles: ['Super Admin', 'Admin', 'Manager', 'Agent'], types: ['agency', 'super_admin', 'individual'] },
      { name: 'Performance', href: '/ads/performance', iconClass: 'ti ti-chart-bar', roles: ['Super Admin', 'Admin', 'Manager', 'Agent'], types: ['agency', 'super_admin', 'individual'] },
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
]

export function useSidebarState(setMobileOpen?: (open: boolean) => void) {
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

  const [pendingHref, setPendingHref] = useState<string | null>(null)

  useEffect(() => {
    setMobileOpen?.(false)
    setPendingHref(null)
  }, [pathname, setMobileOpen])

  const handleLinkClick = (href: string) => {
    if (pathname !== href && !pathname.startsWith(`${href}/`)) {
      setPendingHref(href)
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

  return {
    pathname,
    user,
    isAdminImpersonating,
    pendingHref,
    handleLinkClick,
    visibleMain,
    visibleSections
  }
}
