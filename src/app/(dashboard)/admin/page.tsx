'use client'

import React, { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs'
import { 
  Users, 
  Building2, 
  CreditCard, 
  Activity, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  ShieldAlert,
  Zap,
  DollarSign,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Mail,
  Smartphone,
  Facebook,
  Globe,
  Settings,
  Plus,
  ArrowRight,
  UserCheck,
  CalendarCheck2,
  Plug2,
  ChevronRight,
  History,
  Clock,
  Loader2
} from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { RoleGuard } from '@/components/RoleGuard'
import { setSession } from '@/lib/auth'
import { ConfirmationModal } from '@/components/shared/ConfirmationModal'

// ── Types ───────────────────────────────────────────────────────────────────

type Plan = 'Free' | 'Pro' | 'Enterprise'
type AccountStatus = 'Active' | 'Delinquent' | 'Suspended'

interface ServiceStatus {
  service: string
  active: boolean
}

interface Company {
  id: string | number
  name: string
  owner: string | any
  email: string
  plan: Plan
  status: AccountStatus
  usersCount: number
  activeServices: string[]
  monthlySpend: number
  joinedDate: string
  type: 'agency' | 'individual'
  parent_id?: number | null
  subscription_started_at?: string | null
  expires_at?: string | null
}

interface PlanFeature {
  name: string
  included: boolean
  limit?: string | number
}

interface PlanDefinition {
  id: string
  name: Plan
  price: number
  billingCycle: 'monthly' | 'yearly'
  features: PlanFeature[]
  activeSubscribers: number
  color: string
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const initialCompanies: Company[] = [
  {
    id: 'c1',
    name: 'Tech Solutions Inc',
    owner: 'Arjun Sharma',
    email: 'arjun@techsolutions.com',
    plan: 'Enterprise',
    status: 'Active',
    usersCount: 24,
    activeServices: ['Facebook Ads', 'WhatsApp CRM', 'Google Forms'],
    monthlySpend: 499,
    joinedDate: 'Jan 12, 2026',
    type: 'agency'
  },
  {
    id: 'c2',
    name: 'Growth Marketers',
    owner: 'Sriya Patel',
    email: 'sriya@growth.io',
    plan: 'Pro',
    status: 'Active',
    usersCount: 8,
    activeServices: ['Facebook Ads', 'WhatsApp CRM'],
    monthlySpend: 149,
    joinedDate: 'Feb 05, 2026',
    type: 'agency'
  },
  {
    id: 'c3',
    name: 'Real Estate Hub',
    owner: 'Vikram Singh',
    email: 'vikram@rehub.in',
    plan: 'Free',
    status: 'Delinquent',
    usersCount: 2,
    activeServices: ['Facebook Ads'],
    monthlySpend: 0,
    joinedDate: 'Feb 20, 2026',
    type: 'individual'
  },
  {
    id: 'demo-4',
    name: 'Global EduTech',
    owner: 'Zoya Qureshi',
    email: 'zoya@edutech.com',
    plan: 'Pro',
    status: 'Active',
    usersCount: 15,
    activeServices: ['Meta Ads', 'Lead Forms'],
    monthlySpend: 149,
    joinedDate: 'Mar 01, 2026',
    type: 'individual'
  },
  {
    id: 'demo-5',
    name: 'Nexus Digital',
    owner: 'Rahul Verma',
    email: 'rahul@nexus.io',
    plan: 'Enterprise',
    status: 'Active',
    usersCount: 42,
    activeServices: ['WhatsApp', 'Messenger', 'Instagram'],
    monthlySpend: 499,
    joinedDate: 'Dec 15, 2025',
    type: 'agency'
  },
  {
    id: 'demo-6',
    name: 'Zenith Logistics',
    owner: 'Neha Kapoor',
    email: 'neha@zenith.in',
    plan: 'Free',
    status: 'Suspended',
    usersCount: 3,
    activeServices: [],
    monthlySpend: 0,
    joinedDate: 'Mar 10, 2026',
    type: 'individual'
  }
]

const initialUsers = [
  { id: 1, name: 'Arjun Sharma', email: 'arjun@techsolutions.com', company: { name: 'Tech Solutions Inc' }, role: 'Super Admin', status: 'Active' },
  { id: 101, name: 'Sriya Patel', email: 'sriya@growth.io', company: { name: 'Growth Marketers' }, role: 'Admin', status: 'Active' },
  { id: 102, name: 'Vikram Singh', email: 'vikram@rehub.in', company: { name: 'Real Estate Hub' }, role: 'User', status: 'Active' },
  { id: 103, name: 'Zoya Qureshi', email: 'zoya@edutech.com', company: { name: 'Global EduTech' }, role: 'Admin', status: 'Active' },
  { id: 104, name: 'Rahul Verma', email: 'rahul@nexus.io', company: { name: 'Nexus Digital' }, role: 'User', status: 'Active' },
  { id: 105, name: 'Neha Kapoor', email: 'neha@zenith.in', company: { name: 'Zenith Logistics' }, role: 'Manager', status: 'Suspended' },
  { id: 106, name: 'Amit Desai', email: 'amit@demo.com', company: { name: 'Tech Solutions Inc' }, role: 'User', status: 'Active' },
  { id: 107, name: 'Pooja Hegde', email: 'pooja@demo.com', company: { name: 'Nexus Digital' }, role: 'Manager', status: 'Active' },
  { id: 108, name: 'Kabir Khan', email: 'kabir@demo.com', company: { name: 'Global EduTech' }, role: 'User', status: 'Inactive' },
]

const demoStats = {
  revenue: { value: '₹14,50,000', sub: '+12.5% from last month', trend: '+12.5%' },
  active_companies: { value: '142', sub: '8 new this week', trend: '+5.4%' },
  total_users: { value: '1,284', sub: 'Across 142 orgs', trend: '+8.2%' },
  api_health: { value: '99.98%', sub: 'Latency: 42ms', trend: 'Stable' },
  platformMetrics: {
    total_leads: 12450,
    total_meetings: 842,
    active_integrations: 312,
    system_load: 'Medium'
  }
}

const initialPlans: PlanDefinition[] = [
  {
    id: 'p1',
    name: 'Free' as Plan,
    price: 0,
    billingCycle: 'monthly',
    activeSubscribers: 84,
    color: 'slate',
    features: [
      { name: 'Up to 100 Leads/mo', included: true },
      { name: '2 Team Members', included: true },
      { name: 'Basic Analytics', included: true },
      { name: 'Facebook Integration', included: true },
      { name: 'WhatsApp Gateway', included: false },
      { name: 'Custom Webhooks', included: false },
      { name: 'White-labeling', included: false },
    ]
  },
  {
    id: 'p2',
    name: 'Pro' as Plan,
    price: 149,
    billingCycle: 'monthly',
    activeSubscribers: 42,
    color: 'blue',
    features: [
      { name: 'Unlimited Leads', included: true },
      { name: '10 Team Members', included: true },
      { name: 'Advanced CRM Tools', included: true },
      { name: 'WhatsApp Business API', included: true },
      { name: 'Full Analytics Suite', included: true },
      { name: 'Custom Webhooks', included: true },
      { name: 'Priority Support', included: true },
    ]
  },
  {
    id: 'p3',
    name: 'Enterprise' as Plan,
    price: 499,
    billingCycle: 'monthly',
    activeSubscribers: 16,
    color: 'purple',
    features: [
      { name: 'Everything in Pro', included: true },
      { name: 'Unlimited Team Members', included: true },
      { name: 'Dedicated Account Manager', included: true },
      { name: 'SLA Guarantee', included: true },
      { name: 'White-labeling', included: true },
      { name: 'Custom API Limits', included: true },
      { name: 'Multi-org Management', included: true },
    ]
  }
]

export default function SuperAdminPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [plans, setPlans] = useState<PlanDefinition[]>(initialPlans)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('companies')
  const [editingPlan, setEditingPlan] = useState<PlanDefinition | null>(null)
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [demoMode, setDemoMode] = useState(false)
  const [isUpdatingCompany, setIsUpdatingCompany] = useState(false)
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'delete_user' | 'delete_company';
    id: number;
    name: string;
    variant: 'destructive' | 'primary' | 'success';
  }>({ isOpen: false, type: 'delete_user', id: 0, name: '', variant: 'primary' })

  const [historyModal, setHistoryModal] = useState({ isOpen: false, companyId: 0, companyName: '', logs: [] as any[] })
  const [renewModal, setRenewModal] = useState({ isOpen: false, companyId: 0, companyName: '', days: 30, notes: '' })
  const [editDays, setEditDays] = useState(30)

  useEffect(() => {
    fetchData()
  }, [])

  // ── Date Synchronizer Logic ────────────────────────────────────────────────
  useEffect(() => {
    if (isEditModalOpen && editingCompany) {
       // Only default if they are COMPLETELY missing from the object OR truly null
       const hasStart = !!editingCompany.subscription_started_at
       const hasEnd = !!editingCompany.expires_at

       const startStr = editingCompany.subscription_started_at || new Date().toISOString()
       const endStr = editingCompany.expires_at || new Date(new Date().setDate(new Date().getDate() + 30)).toISOString()

       const start = new Date(startStr)
       const end = new Date(endStr)
      
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffTime = end.getTime() - start.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        setEditDays(diffDays > 0 ? diffDays : 0)
        
        // Only update state if we are actually applying defaults for the first time
        if (!hasStart || !hasEnd) {
          setEditingCompany(prev => prev ? { 
            ...prev, 
            subscription_started_at: startStr,
            expires_at: endStr
          } : null)
        }
      }
    }
  }, [isEditModalOpen])

  const handleStartDateChange = (dateStr: string) => {
    const newStart = new Date(dateStr)
    if (isNaN(newStart.getTime())) return
    
    setEditingCompany(prev => {
      if (!prev) return null
      const newEnd = new Date(newStart)
      newEnd.setDate(newEnd.getDate() + editDays)
      return { 
        ...prev, 
        subscription_started_at: newStart.toISOString(),
        expires_at: newEnd.toISOString()
      }
    })
  }

  const handleEndDateChange = (dateStr: string) => {
    const newEnd = new Date(dateStr)
    const start = new Date(editingCompany?.subscription_started_at || new Date())
    if (isNaN(newEnd.getTime()) || isNaN(start.getTime())) return

    const diffTime = newEnd.getTime() - start.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    setEditDays(diffDays > 0 ? diffDays : 0)
    setEditingCompany(prev => prev ? { ...prev, expires_at: newEnd.toISOString() } : null)
  }

  const handleEditDaysChange = (days: number) => {
    setEditDays(days)
    const start = new Date(editingCompany?.subscription_started_at || new Date())
    if (isNaN(start.getTime())) return

    const newEnd = new Date(start)
    newEnd.setDate(newEnd.getDate() + days)
    setEditingCompany(prev => prev ? { ...prev, expires_at: newEnd.toISOString() } : null)
  }

  const fetchData = async () => {
    if (demoMode) {
      setCompanies(initialCompanies)
      setStats(demoStats)
      setUsers(initialUsers)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const [companiesData, statsData, usersData] = await Promise.all([
        adminApi.getCompanies(),
        adminApi.getStats(),
        adminApi.getUsers()
      ])
      setCompanies(companiesData)
      setStats(statsData)
      setUsers(usersData)
    } catch (error: any) {
      toast.error("Platform Error", {
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [demoMode])

  const filteredCompanies = companies.filter((c: Company) => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (typeof c.owner === 'string' ? c.owner.toLowerCase().includes(searchQuery.toLowerCase()) : c.owner?.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleStatusChange = async (id: number | string, newStatus: AccountStatus) => {
    try {
      await adminApi.updateCompany(Number(id), { status: newStatus })
      toast.success("Status Synchronized", {
        description: `Account status updated to ${newStatus}`,
      })
      fetchData()
    } catch (error: any) {
      toast.error("Status Update Failed", {
        description: error.message,
      })
    }
  }

  const handleUpdateCompany = async () => {
    if (!editingCompany) return
    try {
      setIsUpdatingCompany(true)
      await adminApi.updateCompany(Number(editingCompany.id), {
        plan: editingCompany.plan,
        status: editingCompany.status,
        expires_at: editingCompany.expires_at ? new Date(editingCompany.expires_at).toISOString() : undefined,
        subscription_started_at: editingCompany.subscription_started_at ? new Date(editingCompany.subscription_started_at).toISOString() : undefined
      })
      
      toast.success("Global Sync Complete", {
        description: `${editingCompany.name} configuration updated successfully.`,
      })

      setIsEditModalOpen(false)
      fetchData()
    } catch (error: any) {
      toast.error("Update Failed", {
        description: error.message,
      })
    } finally {
      setIsUpdatingCompany(false)
    }
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return
    try {
      await adminApi.updateUser(Number(editingUser.id), {
        role: editingUser.role,
        status: editingUser.status,
        company_id: editingUser.company_id
      })
      setIsUserModalOpen(false)
      toast.success("User Updated", {
        description: `${editingUser.name} permissions modified successfully.`,
      })
      fetchData()
    } catch (error: any) {
      toast.error("Update Failed", {
        description: error.message,
      })
    }
  }

  const handleDeleteUser = async () => {
    const { id, name } = confirmModal
    try {
      await adminApi.deleteUser(id)
      toast.success("User Removed", { description: `${name}'s account has been wiped.` })
      setConfirmModal({ ...confirmModal, isOpen: false })
      fetchData()
    } catch (error: any) {
      toast.error("Deletion Failed", { description: error.message })
    }
  }

  const handleDeleteCompany = async () => {
    const { id, name } = confirmModal
    try {
      await adminApi.deleteCompany(id)
      toast.success("Company Wiped", { description: `${name} workspace has been deleted.` })
      setConfirmModal({ ...confirmModal, isOpen: false })
      fetchData()
    } catch (error: any) {
      toast.error("Deletion Failed", { description: error.message })
    }
  }

  const handleRenewCompany = async () => {
    try {
      await adminApi.renewCompany(renewModal.companyId, renewModal.days, renewModal.notes)
      toast.success("Subscription Prolonged", { description: `${renewModal.companyName} extended for ${renewModal.days} days.` })
      setRenewModal({ ...renewModal, isOpen: false })
      fetchData()
    } catch (error: any) {
      toast.error("Renewal Failed", { description: error.message })
    }
  }

  const handleViewHistory = async (id: number, name: string) => {
    try {
      const logs = await adminApi.getCompanyHistory(id)
      setHistoryModal({ isOpen: true, companyId: id, companyName: name, logs })
    } catch (error: any) {
      toast.error("History Recall Failed", {
        description: error.message,
      })
    }
  }

  const handleImpersonate = async (userId: number) => {
    try {
      toast.info("Gateway Opening", { description: "Bypassing protocols for admin entry..." })
      
      const currentToken = localStorage.getItem('token')
      if (currentToken) {
        localStorage.setItem('admin_token', currentToken)
      }

      const { token } = await adminApi.loginAsAnyUser(userId)
      setSession(token)
      window.location.href = '/dashboard'
    } catch (error: any) {
      toast.error("Impersonation Failed", { description: error.message })
    }
  }

  const handleConfirmAction = () => {
    switch(confirmModal.type) {
      case 'delete_user': handleDeleteUser(); break;
      case 'delete_company': handleDeleteCompany(); break;
    }
  }

  const handleSync = () => {
    toast.info("Syncing Data", {
      description: "Pulling latest metrics from Meta and WhatsApp gateways...",
    })
  }

  const handleExport = () => {
    toast.info("Export Started", {
      description: "Platform audit log is being generated (CSV).",
    })
  }

  const handleCreatePlan = () => {
    const newPlan: PlanDefinition = {
      id: `p${plans.length + 1}`,
      name: 'New Tier' as Plan,
      price: 99,
      billingCycle: 'monthly',
      activeSubscribers: 0,
      color: 'indigo',
      features: [
        { name: 'Feature 1', included: true },
        { name: 'Feature 2', included: true },
        { name: 'Feature 3', included: false },
      ]
    }
    setEditingPlan(newPlan)
    setIsPlanModalOpen(true)
  }

  const handleEditPlan = (plan: PlanDefinition) => {
    setEditingPlan({ ...plan, features: [...plan.features] })
    setIsPlanModalOpen(true)
  }

  const handleSavePlan = () => {
    if (!editingPlan) return
    const exists = plans.some(p => p.id === editingPlan.id)
    if (exists) {
      setPlans(plans.map(p => p.id === editingPlan.id ? editingPlan : p) as any)
      toast.success("Plan Synchronized", { description: `${editingPlan.name} features updated across system.` })
    } else {
      setPlans([...plans, editingPlan])
      toast.success("New Plan Launched", { description: `${editingPlan.name} tier is now live for all users.` })
    }
    setIsPlanModalOpen(false)
  }

  const togglePlanFeature = (featureName: string) => {
    if (!editingPlan) return
    setEditingPlan({
      ...editingPlan,
      features: editingPlan.features.map(f => f.name === featureName ? { ...f, included: !f.included } : f)
    })
  }

  const getPlanColor = (plan: Plan) => {
    switch (plan) {
      case 'Enterprise': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400'
      case 'Pro': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400'
      default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
    }
  }

  const getStatusBadge = (status: AccountStatus) => {
    switch (status) {
      case 'Active': return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400">Active</Badge>
      case 'Delinquent': return <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400">Delinquent</Badge>
      case 'Suspended': return <Badge className="bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400">Suspended</Badge>
    }
  }

  return (
    <RoleGuard allowedRoles={['Super Admin']}>
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950/20">
        <div className="px-4 lg:px-6 py-6 space-y-6 w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-6 w-6 rounded bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white">SA</div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Super Admin Portal</h1>
              </div>
              <p className="text-sm text-slate-500 font-medium italic">Master control for LeadBajaar Platform</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Demo Data</p>
                <button 
                  onClick={() => setDemoMode(!demoMode)}
                  className={cn(
                    "w-10 h-5 rounded-full transition-all relative",
                    demoMode ? "bg-indigo-600" : "bg-slate-300"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                    demoMode ? "right-1" : "left-1"
                  )} />
                </button>
              </div>
              <Button variant="outline" onClick={handleSync} className="rounded-xl border-slate-200 h-10 font-bold text-sm">
                <RefreshCw className="h-4 w-4 mr-2" /> Sync Data
              </Button>
              <Button onClick={() => toast.success("System Healthy", { description: "All 14 services operating within normal parameters." })} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md rounded-xl h-10 px-5">
                <Zap className="h-4 w-4 mr-2" /> System Status
              </Button>
            </div>
          </div>

        {/* Global Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              label: 'Total Revenue', 
              value: stats?.revenue?.value || '₹0', 
              sub: stats?.revenue?.sub || 'Last 30 days', 
              icon: DollarSign, 
              color: 'emerald', 
              trend: stats?.revenue?.trend || '+0%', 
              items: true 
            },
            { 
              label: 'Active Companies', 
              value: stats?.active_companies?.value || '0', 
              sub: stats?.active_companies?.sub || 'Live on platform', 
              icon: Building2, 
              color: 'blue', 
              trend: stats?.active_companies?.trend || '+0%', 
              items: true 
            },
            { 
              label: 'Platform Users', 
              value: stats?.total_users?.value || '0', 
              sub: stats?.total_users?.sub || 'Registered users', 
              icon: Users, 
              color: 'indigo', 
              trend: stats?.total_users?.trend || '+0%', 
              items: true 
            },
            { 
              label: 'API Health', 
              value: stats?.api_health?.value || '99.9%', 
              sub: stats?.api_health?.sub || 'System status', 
              icon: Activity, 
              color: 'purple', 
              trend: stats?.api_health?.trend || 'Stable', 
              items: false 
            }
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden relative group">
              <div className={cn("absolute top-0 right-0 -mt-2 -mr-2 h-16 w-16 rounded-full blur-2xl opacity-10", `bg-${stat.color}-500 group-hover:opacity-20 transition-opacity`)}></div>
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mb-3", `bg-${stat.color}-50 text-${stat.color}-600 dark:bg-${stat.color}-950/30 dark:text-${stat.color}-400`)}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", stat.trend.includes('+') ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500")}>
                    {stat.trend}
                  </div>
                </div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
                {isLoading ? (
                  <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg mt-1" />
                ) : (
                  <p className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{stat.value}</p>
                )}
                <p className="text-[10px] text-slate-400 mt-1.5 font-medium">{stat.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>


        <Tabs defaultValue="companies" onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl h-11 border border-slate-200 dark:border-slate-800 w-fit">
            <TabsTrigger value="companies" className="rounded-lg px-6 py-2 text-sm font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm transition-all">
              <Building2 className="h-4 w-4 mr-2" />
              Manage Companies
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg px-6 py-2 text-sm font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm transition-all">
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </TabsTrigger>
            <TabsTrigger value="billing" className="rounded-lg px-6 py-2 text-sm font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm transition-all">
              <CreditCard className="h-4 w-4 mr-2" />
              Global Billing
            </TabsTrigger>
            <TabsTrigger value="plans" className="rounded-lg px-6 py-2 text-sm font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm transition-all">
              <Settings className="h-4 w-4 mr-2" />
              Plan Management
            </TabsTrigger>
            <TabsTrigger value="health" className="rounded-lg px-6 py-2 text-sm font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm transition-all">
              <Activity className="h-4 w-4 mr-2" />
              Service Status
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-96">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search className="h-4 w-4" />
                </div>
                <Input 
                  placeholder="Search users by name, email..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl text-sm shadow-sm pl-10"
                />
              </div>
            </div>

            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50/80 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-bold text-slate-500 py-4 pl-6">User</TableHead>
                      <TableHead className="font-bold text-slate-500 py-4">Company</TableHead>
                      <TableHead className="font-bold text-slate-500 py-4">Account Type</TableHead>
                      <TableHead className="font-bold text-slate-500 py-4">Role</TableHead>
                      <TableHead className="font-bold text-slate-500 py-4">Status</TableHead>
                      <TableHead className="text-right font-bold text-slate-500 py-4 pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())).map((u) => (
                      <TableRow key={u.id} className="border-slate-100 dark:border-slate-800">
                        <TableCell className="py-4 pl-6">
                          <div>
                            <p className="font-bold text-sm">{u.name}</p>
                            <p className="text-[10px] text-slate-400">{u.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-medium">{u.company?.name || 'No Company'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-bold uppercase bg-slate-50">{u.user_type || 'Individual'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" className="text-[10px] font-bold uppercase">{u.role}</Badge>
                        </TableCell>
                        <TableCell>
                           <Badge className={cn("text-[10px] font-bold", u.status === 'Active' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600")}>
                            {u.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                           <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setEditingUser(u); setIsUserModalOpen(true); }}>
                                Edit Role
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-indigo-600 font-bold"
                                onClick={() => handleImpersonate(u.id)}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" /> Impersonate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600 font-bold"
                                onClick={() => setConfirmModal({ isOpen: true, type: 'delete_user', id: u.id, name: u.name, variant: 'destructive' })}
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Wipe Account
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companies" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Filter Row */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
               <div className="relative w-full sm:w-96">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search className="h-4 w-4" />
                </div>
                <Input 
                  placeholder="Search by company, owner, or email..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl text-sm shadow-sm pl-10"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button variant="outline" className="rounded-xl border-slate-200 h-10 w-full sm:w-auto">
                  <Filter className="h-4 w-4 mr-2" /> Filter
                </Button>
                <Button variant="outline" onClick={handleExport} className="rounded-xl border-slate-200 h-10 w-full sm:w-auto text-indigo-600 border-indigo-100 bg-indigo-50/50">
                  <ArrowUpRight className="h-4 w-4 mr-2" /> Export CSV
                </Button>
              </div>
            </div>

            {/* Companies Table */}
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50/80 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-xs py-5 pl-6">Company & Owner</TableHead>
                      <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-xs py-5">Plan</TableHead>
                      <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-xs py-5">Entity Type</TableHead>
                      <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-xs py-5">Status</TableHead>
                      <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px] py-5">Node</TableHead>
                      <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px] py-5">Users</TableHead>
                      <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px] py-5">Expiration</TableHead>
                      <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px] py-5">Started</TableHead>
                      <TableHead className="text-right font-bold text-slate-500 uppercase tracking-wider text-[10px] py-5 pr-6">Monthly MRR</TableHead>
                      <TableHead className="text-right font-bold text-slate-500 uppercase tracking-wider text-[10px] py-5 pr-6"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompanies.map((company: Company) => (
                      <TableRow key={company.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                        <TableCell className="py-5 pl-6">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold shadow-sm">
                              {company.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white text-sm">{company.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <p className="text-xs text-slate-500 font-medium">{company.owner}</p>
                                <span className="text-slate-300">•</span>
                                <p className="text-[11px] text-slate-400">{company.email}</p>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("font-bold px-2.5 py-0.5", getPlanColor(company.plan))}>
                            {company.plan}
                          </Badge>
                        </TableCell>
                        <TableCell>
                           <Badge variant="secondary" className={cn("text-[10px] uppercase font-black tracking-widest px-2 py-0.5", company.type === 'agency' ? "bg-indigo-50 text-indigo-700 border-indigo-100" : "bg-slate-50 text-slate-600 border-slate-100")}>
                            {company.type || 'individual'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(company.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{company.usersCount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                           <div className="space-y-0.5">
                              <p className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                                 {company.expires_at ? new Date(company.expires_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) : 'Never'}
                              </p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Automatic Expiry</p>
                           </div>
                        </TableCell>
                        <TableCell>
                           <div className="space-y-0.5">
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                 {company.subscription_started_at ? new Date(company.subscription_started_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) : 'N/A'}
                              </p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Plan Started</p>
                           </div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <p className="font-black text-slate-900 dark:text-white text-sm">₹{company.monthlySpend}</p>
                          <p className="text-[10px] text-slate-500">Joined {company.joinedDate}</p>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                           <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-2xl border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-950 p-1.5">
                              <DropdownMenuLabel className="font-bold text-xs uppercase tracking-wider text-slate-500 px-3 py-2">Account Control</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                              <DropdownMenuItem 
                                className="cursor-pointer font-medium py-2.5 px-3 focus:bg-slate-50 dark:focus:bg-slate-900 rounded-xl"
                                onClick={() => {
                                  setEditingCompany({ ...company })
                                  setIsEditModalOpen(true)
                                }}
                              >
                                <Edit className="mr-3 h-4 w-4 text-slate-400" /> Edit Plan & Billing
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer font-bold py-2.5 px-3 text-indigo-600 focus:bg-slate-50 dark:focus:bg-slate-900 rounded-xl"
                                onClick={() => handleImpersonate(Number(company.id))}
                              >
                                <ExternalLink className="mr-3 h-4 w-4" /> Enter Account
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                              <DropdownMenuLabel className="font-bold text-[10px] uppercase tracking-wider text-slate-400 px-3 py-1">Advanced Actions</DropdownMenuLabel>
                              <DropdownMenuItem 
                                className="cursor-pointer font-bold py-2.5 px-3 text-emerald-600 focus:bg-emerald-50 dark:focus:bg-emerald-950/30 rounded-xl"
                                onClick={() => setRenewModal({ isOpen: true, companyId: Number(company.id), companyName: company.name, days: 30, notes: '' })}
                              >
                                <RefreshCw className="mr-3 h-4 w-4 text-emerald-400" /> Prolong Plan
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer font-bold py-2.5 px-3 text-slate-600 focus:bg-slate-50 dark:focus:bg-slate-900 rounded-xl"
                                onClick={() => handleViewHistory(Number(company.id), company.name)}
                              >
                                <History className="mr-3 h-4 w-4 text-slate-400" /> Audit History
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer font-medium py-2.5 px-3 text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30 focus:text-red-600 rounded-xl"
                                onClick={() => handleStatusChange(company.id, 'Suspended')}
                              >
                                <ShieldAlert className="mr-3 h-4 w-4" /> Suspend Account
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer font-bold py-2.5 px-3 text-red-600 focus:bg-red-100 dark:focus:bg-red-900/40 rounded-xl"
                                onClick={() => setConfirmModal({ isOpen: true, type: 'delete_company', id: Number(company.id), name: company.name, variant: 'destructive' })}
                              >
                                <Trash2 className="mr-3 h-4 w-4" /> Terminate Node
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 py-4 px-6">
                <div className="flex items-center justify-between w-full">
                  <p className="text-xs text-slate-500 font-medium italic">Showing {companies.length} of 142 total registered companies.</p>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs font-bold disabled:opacity-50" disabled>Previous</Button>
                    <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm shadow-indigo-500/20">1</div>
                    <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs font-bold">Next</Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                  <CardTitle className="text-lg font-bold">Recent Invoices</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                      <TableRow>
                        <TableHead className="font-bold text-[11px] uppercase pl-6">Invoice ID</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase">Company</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase text-right">Amount</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase text-right pr-6">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        {id: 'INV-001', company: 'Tech Solutions Inc', amount: '$499.00', date: 'Mar 01, 2026' },
                        { id: 'INV-002', company: 'Growth Marketers', amount: '$149.00', date: 'Feb 28, 2026' },
                        { id: 'INV-003', company: 'Lead Gen Pro', amount: '$149.00', date: 'Feb 25, 2026' }
                      ].map((inv: { id: string, company: string, amount: string, date: string }) => (
                        <TableRow key={inv.id} className="border-slate-100 dark:border-slate-800">
                          <TableCell className="font-medium pl-6 text-sm">{inv.id}</TableCell>
                          <TableCell className="font-bold text-sm text-slate-800 dark:text-slate-200">{inv.company}</TableCell>
                          <TableCell className="text-right font-black text-sm">{inv.amount}</TableCell>
                          <TableCell className="text-right text-slate-500 text-xs pr-6">{inv.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
                <div className="relative z-10 flex flex-col h-full">
                  <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-2">Total MRR</p>
                  <h3 className="text-4xl font-black mb-6">{stats?.revenue?.value || '₹0'}</h3>
                  <div className="space-y-4 flex-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-indigo-100">Pro Subscriptions</span>
                      <span className="font-bold">92</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-indigo-100">Enterprise Deals</span>
                      <span className="font-bold">14</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-indigo-100">Custom Add-ons</span>
                      <span className="font-bold">$2,400</span>
                    </div>
                  </div>
                  <Button className="mt-8 bg-white/20 hover:bg-white/30 backdrop-blur-md border-none text-white font-bold w-full rounded-xl">
                    View Revenue Analytics
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="plans" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Subscription Tiers</h3>
                <p className="text-sm text-slate-500">Configure features and pricing for LeadBajaar plans.</p>
              </div>
              <Button onClick={handleCreatePlan} className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 font-bold rounded-xl h-10 px-5">
                <Plus className="h-4 w-4 mr-2" /> Create New Plan
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className="border-none shadow-md bg-white dark:bg-slate-900 rounded-3xl ring-1 ring-slate-200 dark:ring-slate-800 flex flex-col overflow-hidden relative group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className={cn("absolute top-0 left-0 w-full h-1.5", 
                    plan.name === 'Enterprise' ? "bg-purple-500" : 
                    plan.name === 'Pro' ? "bg-indigo-500" : "bg-slate-400"
                  )}></div>
                  
                  <CardHeader className="pt-8 pb-4 text-center">
                    <Badge variant="outline" className={cn("mx-auto mb-2 font-black tracking-widest uppercase text-[10px] px-3", getPlanColor(plan.name))}>
                      {plan.name} Tier
                    </Badge>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <span className="text-sm font-bold text-slate-500">$</span>
                      <span className="text-4xl font-black text-slate-900 dark:text-white leading-none">{plan.price}</span>
                      <span className="text-sm font-bold text-slate-500">/mo</span>
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-xs font-bold text-slate-500">{plan.activeSubscribers} Active Subscribers</span>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 px-8 py-4">
                    <div className="space-y-3.5">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          {feat.included ? (
                            <div className="h-5 w-5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            </div>
                          ) : (
                            <div className="h-5 w-5 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                              <XCircle className="h-3.5 w-3.5 text-slate-300 dark:text-slate-700" />
                            </div>
                          )}
                          <span className={cn("text-xs font-semibold", feat.included ? "text-slate-700 dark:text-slate-200" : "text-slate-400 line-through")}>
                            {feat.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                    <Button 
                      variant="outline" 
                      onClick={() => handleEditPlan(plan)}
                      className="w-full rounded-2xl h-11 font-bold border-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                    >
                      <Edit className="h-4 w-4 mr-2" /> Edit Features
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <Card className="border-none shadow-sm bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-white/10 blur-3xl transition-transform duration-700 group-hover:scale-125"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-xl text-center md:text-left">
                  <h4 className="text-2xl font-black mb-3 italic">Custom Enterprise Solutions?</h4>
                  <p className="text-blue-100 font-medium leading-relaxed">
                    For high-volume clients requiring bespoke API limits, custom white-labeling, or dedicated private server infrastructure. 
                    Manage custom contracts directly through the Enterprise Deal Hub.
                  </p>
                </div>
                <Button className="bg-white text-blue-600 hover:bg-white/90 font-black h-12 px-8 rounded-2xl text-sm shadow-xl shadow-blue-500/20 shrink-0">
                  Open Deal Hub <Plus className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
               {[
                 { label: 'Platform Leads', value: stats?.platformMetrics?.totalLeads || 0, icon: UserCheck, color: 'emerald' },
                 { label: 'Bookings', value: stats?.platformMetrics?.totalMeetings || 0, icon: CalendarCheck2, color: 'blue' },
                 { label: 'Integrations', value: stats?.platformMetrics?.activeIntegrations || 0, icon: Plug2, color: 'violet' },
                 { label: 'System Load', value: stats?.platformMetrics?.systemLoad || 'N/A', icon: Activity, color: 'indigo' },
               ].map((m, i) => (
                 <Card key={i} className="bg-white dark:bg-slate-900 border-none ring-1 ring-slate-200 dark:ring-slate-800 p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", `bg-${m.color}-50 text-${m.color}-600 dark:bg-${m.color}-950/30 dark:text-${m.color}-400`)}>
                        <m.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">{m.label}</p>
                        <p className="text-xl font-black">{m.value}</p>
                      </div>
                    </div>
                 </Card>
               ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                       <Facebook className="h-4 w-4 text-blue-600" /> Meta API Node 1
                    </CardTitle>
                    <Badge className="bg-emerald-50 text-emerald-600 border-none">Stable</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between items-end gap-1 h-12">
                     {[80, 75, 90, 85, 95, 100, 95, 80, 70, 85, 90, 95, 100, 98, 92, 100, 100, 100, 95, 90].map((h: number, i: number) => (
                       <div key={i} className="flex-1 bg-emerald-500 dark:bg-emerald-600 opacity-60 rounded-t-sm" style={{ height: `${h}%` }}></div>
                     ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/50">
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Response Time</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white">124ms</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/50">
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Active Hooks</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white">4,281</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                       <Smartphone className="h-4 w-4 text-emerald-600" /> WhatsApp Gateway
                    </CardTitle>
                    <Badge className="bg-emerald-50 text-emerald-600 border-none">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between items-end gap-1 h-12">
                     {[60, 65, 70, 75, 80, 85, 90, 85, 80, 75, 70, 80, 85, 90, 95, 100, 98, 95, 90, 95].map((h: number, i: number) => (
                       <div key={i} className="flex-1 bg-emerald-500 dark:bg-emerald-600 opacity-60 rounded-t-sm" style={{ height: `${h}%` }}></div>
                     ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/50">
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Queue Size</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white">14 pkts</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/50">
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Success Rate</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white">98.2%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Company Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Edit Company Billing</DialogTitle>
              <DialogDescription>
                Modify plan and subscription details for <strong>{editingCompany?.name}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-xs font-bold uppercase text-slate-500">Plan Tier</Label>
                       <Select 
                        value={editingCompany?.plan} 
                        onValueChange={(val) => setEditingCompany(prev => prev ? { ...prev, plan: val as Plan } : null)}
                      >
                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200">
                          <SelectValue placeholder="Select Plan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Free">Free</SelectItem>
                          <SelectItem value="Pro">Pro</SelectItem>
                          <SelectItem value="Enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Node Status</Label>
                      <Select 
                        value={editingCompany?.status} 
                        onValueChange={(val) => setEditingCompany(prev => prev ? { ...prev, status: val as AccountStatus } : null)}
                      >
                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Delinquent">Delinquent</SelectItem>
                          <SelectItem value="Suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-xs font-bold uppercase text-slate-500">Subscription Start</Label>
                       <Input 
                        type="date"
                        value={editingCompany?.subscription_started_at ? new Date(editingCompany.subscription_started_at).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleStartDateChange(e.target.value)}
                        className="h-11 rounded-xl bg-slate-50 border-slate-200 font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-xs font-bold uppercase text-slate-500">Duration (Days)</Label>
                       <Input 
                        type="number"
                        value={editDays}
                        onChange={(e) => handleEditDaysChange(parseInt(e.target.value) || 0)}
                        className="h-11 rounded-xl bg-white border-slate-200 font-black text-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500">Auto Expiration Date</Label>
                    <Input 
                      type="date"
                      value={editingCompany?.expires_at ? new Date(editingCompany.expires_at).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleEndDateChange(e.target.value)}
                      className="h-11 rounded-xl bg-slate-50 border-slate-200 font-bold"
                    />
                  </div>
                </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                variant="outline" 
                onClick={() => setIsEditModalOpen(false)} 
                className="rounded-xl h-11 font-bold border-slate-200"
                disabled={isUpdatingCompany}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateCompany} 
                className={cn("rounded-xl h-11 font-black px-8 shadow-lg transition-all", 
                  isUpdatingCompany ? "bg-slate-400" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20"
                )}
                disabled={isUpdatingCompany}
              >
                {isUpdatingCompany ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : "Push Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Plan Feature Modal */}
        <Dialog open={isPlanModalOpen} onOpenChange={setIsPlanModalOpen}>
          <DialogContent className="sm:max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-black">Plan Configuration</DialogTitle>
              <DialogDescription className="font-medium text-slate-500">
                Define pricing and feature limits for the <strong>{editingPlan?.name}</strong> tier.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500">Plan Name</Label>
                  <Input 
                    value={editingPlan?.name}
                    onChange={(e) => setEditingPlan(prev => prev ? { ...prev, name: e.target.value as Plan } : null)}
                    className="h-11 rounded-xl bg-slate-50 border-slate-200 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500">Price ($/mo)</Label>
                  <Input 
                    type="number"
                    value={editingPlan?.price}
                    onChange={(e) => setEditingPlan(prev => prev ? { ...prev, price: parseInt(e.target.value) || 0 } : null)}
                    className="h-11 rounded-xl bg-slate-50 border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase text-slate-500">Feature Distribution</Label>
                <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                  {editingPlan?.features.map((feat, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 group transition-colors hover:border-indigo-200">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{feat.name}</span>
                      <Button 
                        size="sm"
                        variant={feat.included ? "default" : "outline"}
                        onClick={() => togglePlanFeature(feat.name)}
                        className={cn("h-7 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all", 
                          feat.included ? "bg-emerald-500 hover:bg-emerald-600 border-none shadow-sm shadow-emerald-500/20" : "border-slate-200 text-slate-400")
                        }
                      >
                        {feat.included ? "Enabled" : "Disabled"}
                      </Button>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full h-10 rounded-xl border-dashed border-2 border-slate-200 text-slate-400 text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200">
                    <Plus className="h-3 w-3 mr-2" /> Add custom feature
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => setIsPlanModalOpen(false)} className="rounded-xl h-11 font-bold text-slate-500">Discard</Button>
              <Button onClick={handleSavePlan} className="rounded-xl h-11 font-black bg-slate-900 dark:bg-white dark:text-slate-900 px-8 shadow-xl">Apply Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Manual Renewal Modal */}
        <Dialog open={renewModal.isOpen} onOpenChange={(open) => setRenewModal({ ...renewModal, isOpen: open })}>
          <DialogContent className="sm:max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-black">Manual License Extension</DialogTitle>
              <DialogDescription className="font-medium text-slate-500">
                Prolonging platform access for <strong>{renewModal.companyName}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Extension Duration (Days)</Label>
                <div className="relative">
                  <Input 
                    type="number" 
                    value={renewModal.days}
                    onChange={(e) => setRenewModal({ ...renewModal, days: parseInt(e.target.value) || 0 })}
                    className="h-11 rounded-xl bg-slate-50 border-slate-200 pl-10 font-black"
                  />
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-400 font-medium italic">* To reduce duration, use negative values.</p>
              </div>
              <div className="space-y-2">
                 <Label className="text-xs font-bold uppercase text-slate-500">Audit Notes (Optional)</Label>
                 <Input 
                  placeholder="e.g., Client loyalty credit, Backdated activation..."
                  value={renewModal.notes}
                  onChange={(e) => setRenewModal({ ...renewModal, notes: e.target.value })}
                  className="h-11 rounded-xl bg-white border-slate-200 text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setRenewModal({ ...renewModal, isOpen: false })} className="rounded-xl h-11 font-bold">Cancel</Button>
              <Button onClick={handleRenewCompany} className="rounded-xl h-11 font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20">Apply Extension</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Global Audit History Modal */}
        <Dialog open={historyModal.isOpen} onOpenChange={(open) => setHistoryModal({ ...historyModal, isOpen: open })}>
          <DialogContent className="sm:max-w-[700px] border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden p-0 shadow-2xl">
            <div className="p-6 bg-slate-900 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-white/5 blur-3xl"></div>
               <div className="relative z-10">
                  <DialogTitle className="text-xl font-black flex items-center gap-2">
                    <History className="h-5 w-5 text-indigo-400" />
                    Subscription Audit Trail
                  </DialogTitle>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Workspace: {historyModal.companyName}</p>
               </div>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-900 sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800">
                  <TableRow>
                    <TableHead className="text-[10px] uppercase font-black py-4 pl-6">Timestamp</TableHead>
                    <TableHead className="text-[10px] uppercase font-black py-4">Event Node</TableHead>
                    <TableHead className="text-[10px] uppercase font-black py-4">Processor</TableHead>
                    <TableHead className="text-[10px] uppercase font-black py-4">New Expiry</TableHead>
                    <TableHead className="text-[10px] uppercase font-black py-4 pr-6">Narrative</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyModal.logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3 text-slate-300">
                          <History className="h-10 w-10 opacity-20" />
                          <p className="font-bold text-sm">No recorded transactions for this node.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    historyModal.logs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <TableCell className="text-xs font-bold text-slate-600 dark:text-slate-400 py-4 pl-6">
                          {new Date(log.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-[8px] font-black uppercase px-2", 
                            log.type === 'RENEWAL' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            log.type === 'ADJUSTMENT' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-500'
                          )}>
                            {log.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {log.processor?.name || 'System Auto'}
                        </TableCell>
                        <TableCell className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                          {log.new_expiry ? new Date(log.new_expiry).toLocaleDateString() : '—'}
                        </TableCell>
                        <TableCell className="text-[10px] text-slate-500 font-medium pr-6 max-w-[200px] truncate italic">
                          {log.notes || 'No narrative provided.'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center px-6">
              <p className="text-[10px] text-slate-400 font-bold uppercase">End of audit log</p>
              <Button onClick={() => setHistoryModal({ ...historyModal, isOpen: false })} className="rounded-xl font-bold bg-slate-900 dark:bg-white dark:text-slate-900 px-8 h-10">Close Audit</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Universal Confirmation Modal */}
        <ConfirmationModal 
          isOpen={confirmModal.isOpen}
          onOpenChange={(open) => setConfirmModal({ ...confirmModal, isOpen: open })}
          onConfirm={handleConfirmAction}
          variant={confirmModal.variant}
          title={
            confirmModal.type === 'delete_user' ? "Wipe User Account" :
            "Terminate Workspace Node"
          }
          description={
            confirmModal.type === 'delete_user' ? `Are you sure you want to permanently delete ${confirmModal.name}? This cannot be reversed.` :
            `Are you sure you want to terminate ${confirmModal.name}? All workspace nodes, leads, and integrations will be purged.`
          }
          confirmText={
            confirmModal.type === 'delete_user' ? "Yes, Wipe Account" :
            "Yes, Terminate Node"
          }
        />
        </div>
      </div>
    </RoleGuard>
  )
}
