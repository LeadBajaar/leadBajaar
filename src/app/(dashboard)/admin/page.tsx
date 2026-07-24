'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { adminApi, integrationApi } from '@/lib/api'
import { RoleGuard } from '@/components/RoleGuard'
import { PromotionModal } from '@/components/promotion-modal'
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
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { format } from 'date-fns'
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
  Download,
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
  Loader2,
  Lock,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  X,
  Tag,
  UserPlus,
  Calendar,
  Megaphone,
  Image as ImageIcon,
  AlertCircle,
  Send,
  Eye,
  Info
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
import { setSession } from '@/lib/auth'
import { ConfirmationModal } from '@/components/shared/ConfirmationModal'

// ── Types ───────────────────────────────────────────────────────────────────

type Plan = string | 'Free' | 'Pro' | 'Enterprise'
type AccountStatus = 'Active' | 'Delinquent' | 'Suspended'

interface ServiceStatus {
  service: string
  active: boolean
}

interface Company {
  id: string | number
  name: string
  owner_id?: number | null
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
  tags?: string[]
  is_email_enabled?: boolean
}

interface PlanFeature {
  name: string
  included: boolean
  limit?: string | number
}

interface FeatureCapability {
  featureId: string
  allowedRoles: string[]
}

interface PlanDefinition {
  id: string
  name: Plan
  price: number
  billingCycle: 'monthly' | 'yearly'
  features: PlanFeature[]
  capabilities: Record<string, string[]> // Map of featureId -> allowed roles (e.g. { "whatsapp_bot": ["Admin"] })
  activeSubscribers: number
  color: string
}

const AVAILABLE_PLATFORM_FEATURES = [
  // Pinned Items
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'leads', label: 'Leads' },
  { id: 'live_chat', label: 'Live Chat' },
  { id: 'chatbot', label: 'Chatbot' },
  { id: 'meetings', label: 'Meetings' },
  { id: 'integrations', label: 'Integrations' },
  
  // Clients & Growth
  { id: 'agency_management', label: 'Clients' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'team_management', label: 'Team Management' },
  
  // Automation
  { id: 'automations', label: 'Automations' },
  { id: 'whatsapp_bot', label: 'WhatsApp Bot' },
  { id: 'whatsapp_cloud_api', label: 'WhatsApp Cloud API' },
  
  // Platform Control
  { id: 'system_admin', label: 'Admin' },
  { id: 'email_logs', label: 'Emails' },
  { id: 'error_logs', label: 'Error Logs' },
  { id: 'finance_module', label: 'Finance' },
  { id: 'developer_tools', label: 'Dev Hub' },
  
  // Account
  { id: 'account_settings', label: 'Settings' },
]

const PLATFORM_ROLES = ['Admin', 'Manager', 'Agent']

interface AdminUser {
  id: number | string
  name: string
  email: string
  company?: { name: string }
  company_id?: number
  role: string
  status: string
  user_type?: string
  tags?: string[]
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
    ],
    capabilities: {}
  }
]

export default function SuperAdminPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])

  const [globalTags, setGlobalTags] = useState<string[]>([])

  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [plans, setPlans] = useState<PlanDefinition[]>(initialPlans)
  const [searchQuery, setSearchQuery] = useState('')

  // Preview broadcast modal state
  const [previewBroadcast, setPreviewBroadcast] = useState<any>(null)
  
  // Details broadcast modal state
  const [detailsBroadcast, setDetailsBroadcast] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('companies')
  const [editingPlan, setEditingPlan] = useState<PlanDefinition | null>(null)
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)

  const [isUpdatingCompany, setIsUpdatingCompany] = useState(false)
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false)
  const [isUpdatingUser, setIsUpdatingUser] = useState(false)
  const [testerRequests, setTesterRequests] = useState<any[]>([])
  const [testerRequestsMeta, setTesterRequestsMeta] = useState<any>(null)
  const [testerRequestsPage, setTesterRequestsPage] = useState(1)
  const [isUpdatingTester, setIsUpdatingTester] = useState(false)

  // Pagination states
  const [companiesPage, setCompaniesPage] = useState(1)
  const [usersPage, setUsersPage] = useState(1)
  const [billingPage, setBillingPage] = useState(1)
  const [companiesMeta, setCompaniesMeta] = useState<any>(null)
  const [usersMeta, setUsersMeta] = useState<any>(null)
  const [billingMeta, setBillingMeta] = useState<any>(null)
  const [billingData, setBillingData] = useState<any[]>([])
  const [filterPlan, setFilterPlan] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterTag, setFilterTag] = useState('all')
  const [filterRole, setFilterRole] = useState('all')
  const [filterUserType, setFilterUserType] = useState('all')
  const [filterUserStatus, setFilterUserStatus] = useState('all')
  const [filterExpiration, setFilterExpiration] = useState('all')
  const [filterStarted, setFilterStarted] = useState('all')
  const [customExpStart, setCustomExpStart] = useState('')
  const [customExpEnd, setCustomExpEnd] = useState('')
  const [customStartStart, setCustomStartStart] = useState('')
  const [customStartEnd, setCustomStartEnd] = useState('')
  const [newTag, setNewTag] = useState('')

  // Reset pagination when filters change to avoid empty pages
  useEffect(() => { setCompaniesPage(1) }, [searchQuery, filterPlan, filterStatus, filterTag, filterExpiration, filterStarted, customExpStart, customExpEnd, customStartStart, customStartEnd])
  useEffect(() => { setUsersPage(1) }, [searchQuery, filterTag, filterRole, filterUserStatus, filterUserType])
  useEffect(() => { setBillingPage(1) }, [searchQuery])

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
  const [deletionRequests, setDeletionRequests] = useState<any[]>([])

  // Broadcast states
  const [broadcastData, setBroadcastData] = useState({
    title: '',
    message: '',
    category: 'Announcement',
    type: 'info' as 'info' | 'warning' | 'success',
    target: 'all' as 'all' | 'company',
    company_ids: [] as number[],
    image_url: '',
    is_modal: false,
    frequency: 'once' as 'once' | 'session' | 'always',
    cta_text: '',
    cta_link: '',
    expires_at: '',
    allow_snooze: true
  })
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false)
  const [broadcastHistory, setBroadcastHistory] = useState<any[]>([])
  const [broadcastPage, setBroadcastPage] = useState(1)
  const [broadcastMeta, setBroadcastMeta] = useState<any>(null)

  const transformPlan = (p: any): PlanDefinition => {
    // Robust parsing of the 'features' column (Smart JSON)
    const raw = p.features || {};
    return {
      ...p,
      features: Array.isArray(raw.display) ? raw.display : (Array.isArray(raw) ? raw : []),
      capabilities: raw.permissions || {}
    };
  };
  const [selectionCompanies, setSelectionCompanies] = useState<Company[]>([])
  const [workspaceSearch, setWorkspaceSearch] = useState('')

  const filteredSelectionCompanies = useMemo(() => {
    if (!workspaceSearch) return selectionCompanies
    return selectionCompanies.filter(c => 
      c.name.toLowerCase().includes(workspaceSearch.toLowerCase())
    )
  }, [selectionCompanies, workspaceSearch])

  // Initial fetch is handled by the debounced useEffect below

  const handleSendBroadcast = async () => {
    if (!broadcastData.title || !broadcastData.message) {
      toast.error("Composition Error", { description: "Please provide both a title and message." })
      return
    }

    try {
      setIsSendingBroadcast(true)
      await adminApi.sendBroadcast(broadcastData)
      
      toast.success("Broadcast Sent", { 
        description: `Your announcement "${broadcastData.title}" has been dispatched.` 
      })
      
      // Reset form
      setBroadcastData({
        title: '',
        message: '',
        category: 'Announcement',
        type: 'info',
        target: 'all',
        company_ids: [],
        image_url: '',
        is_modal: false,
        frequency: 'once',
        cta_text: '',
        cta_link: '',
        expires_at: '',
        allow_snooze: true
      })
      
      fetchData()
    } catch (error: any) {
      toast.error("Broadcast Failed", { description: error.message })
    } finally {
      setIsSendingBroadcast(false)
    }
  }

  const handleToggleBroadcastStatus = async (id: number) => {
    try {
      await adminApi.toggleBroadcastStatus(id);
      toast.success("Broadcast Status Updated", { description: "The broadcast has been stopped." });
      fetchData();
    } catch (error: any) {
      toast.error("Status Update Failed", { description: error.message });
    }
  }

  const handleDeleteBroadcast = async (id: number) => {
    if (!confirm("Are you sure you want to delete this broadcast? This will remove all associated unread notifications.")) return;
    try {
      await adminApi.deleteBroadcast(id);
      toast.success("Broadcast Deleted", { description: "The broadcast has been successfully deleted." });
      fetchData();
    } catch (error: any) {
      toast.error("Delete Failed", { description: error.message });
    }
  }

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
          setEditingCompany((prev: Company | null) => prev ? {
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

    setEditingCompany((prev: Company | null) => {
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
    setEditingCompany((prev: Company | null) => prev ? { ...prev, expires_at: newEnd.toISOString() } : null)
  }

  const handleEditDaysChange = (days: number) => {
    setEditDays(days)
    const start = new Date(editingCompany?.subscription_started_at || new Date())
    if (isNaN(start.getTime())) return

    const newEnd = new Date(start)
    newEnd.setDate(newEnd.getDate() + days)
    setEditingCompany((prev: Company | null) => prev ? { ...prev, expires_at: newEnd.toISOString() } : null)
  }

  const PaginationSection = ({
    currentPage,
    lastPage,
    onPageChange,
    totalItems,
    itemsShown,
    from,
    to
  }: {
    currentPage: number;
    lastPage: number;
    onPageChange: (page: number) => void;
    totalItems?: number;
    itemsShown?: number;
    from?: number;
    to?: number;
  }) => {
    if (lastPage <= 1 && currentPage === 1) return null;

    const getVisiblePages = () => {
      const pages = [];
      const range = 2;
      let start = Math.max(1, currentPage - range);
      let end = Math.min(lastPage, currentPage + range);

      // Adjust to always show at least 5 pages if available
      if (end - start < 4) {
        if (start === 1) {
          end = Math.min(lastPage, start + 4);
        } else if (end === lastPage) {
          start = Math.max(1, end - 4);
        }
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    };

    return (
      <div className="flex items-center justify-between w-full">
        <p className="text-xs text-[var(--crm-text-secondary)] font-medium italic">
          {from !== undefined && to !== undefined ? (
            `Showing ${from} to ${to} of ${totalItems} total entries.`
          ) : (
            `Showing ${itemsShown} of ${totalItems} total entries.`
          )}
        </p>
        <div className="flex items-center gap-1">
          {/* First Page */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0 rounded-lg"
            title="First Page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous Page */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 px-2 rounded-lg text-xs font-bold"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Prev
          </Button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1 mx-1">
            {getVisiblePages().map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "ghost"}
                size="sm"
                onClick={() => onPageChange(page)}
                className={cn(
                  "h-8 w-8 rounded-lg text-xs font-bold transition-all",
                  currentPage === page
                    ? "bg-[var(--crm-accent)] text-white shadow-sm shadow-primary/20 hover:opacity-90"
                    : "text-[var(--crm-text-secondary)] hover:bg-[var(--crm-surface-3)]"
                )}
              >
                {page}
              </Button>
            ))}
          </div>

          {/* Next Page */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= lastPage}
            className="h-8 px-2 rounded-lg text-xs font-bold"
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>

          {/* Last Page */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(lastPage)}
            disabled={currentPage >= lastPage}
            className="h-8 w-8 p-0 rounded-lg"
            title="Last Page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const fetchData = async () => {


    try {
      setIsLoading(true)
      
      // Always fetch global stats
      const statsData = await adminApi.getStats()
      setStats(statsData)

      // Fetch specific data based on the active tab to prevent CloudLinux LVE / connection exhaustion
      if (activeTab === 'companies') {
        const companiesRes = await adminApi.getCompanies(companiesPage, 10, searchQuery, filterPlan, filterStatus, filterTag, filterExpiration, filterStarted, customExpStart, customExpEnd, customStartStart, customStartEnd)
        setCompanies(companiesRes.data || companiesRes)
        if (companiesRes.data) {
          setCompaniesMeta({
            current_page: companiesRes.current_page,
            last_page: companiesRes.last_page,
            total: companiesRes.total,
            from: companiesRes.from,
            to: companiesRes.to
          })
        }
        // Also fetch tags for company editing
        const tagsRes = await adminApi.getTags()
        if (tagsRes) setGlobalTags(tagsRes)
        
        // Also fetch plans for company filtering and editing
        const plansRes = await adminApi.getPlans()
        const plansList = plansRes.plans || (Array.isArray(plansRes) ? plansRes : [])
        if (plansList && plansList.length > 0) {
          setPlans(plansList.map(transformPlan))
        }
      } 
      else if (activeTab === 'users') {
        const usersRes = await adminApi.getUsers(usersPage, 10, searchQuery, filterTag, filterRole, filterUserStatus, filterUserType)
        setUsers(usersRes.data || usersRes)
        if (usersRes.data) {
          setUsersMeta({ current_page: usersRes.current_page, last_page: usersRes.last_page, total: usersRes.total })
        }
        // Also fetch tags for user editing
        const tagsRes = await adminApi.getTags()
        if (tagsRes) setGlobalTags(tagsRes)
      }
      else if (activeTab === 'billing') {
        const billingRes = await adminApi.getBilling(billingPage, 10, searchQuery)
        setBillingData(billingRes.data || [])
        if (billingRes.data) {
          setBillingMeta({ current_page: billingRes.current_page, last_page: billingRes.last_page, total: billingRes.total })
        }
      }
      else if (activeTab === 'announcements') {
        const broadcastRes = await adminApi.getBroadcastHistory()
        setBroadcastHistory(Array.isArray(broadcastRes) ? broadcastRes : broadcastRes.data || [])
        if (broadcastRes && broadcastRes.current_page) {
           setBroadcastMeta({ current_page: broadcastRes.current_page, last_page: broadcastRes.last_page, total: broadcastRes.total })
        }
        // Needed for broadcast targeting
        const selectCompaniesRes = await adminApi.getCompanies(1, 100)
        setSelectionCompanies(selectCompaniesRes.data || selectCompaniesRes)
      }
      else if (activeTab === 'testers') {
        const testerRequestsRes = await adminApi.getTesterRequests(testerRequestsPage, 10, searchQuery)
        setTesterRequests(testerRequestsRes.data || [])
        if (testerRequestsRes) {
          setTesterRequestsMeta({
            current_page: testerRequestsRes.current_page, last_page: testerRequestsRes.last_page,
            total: testerRequestsRes.total, from: testerRequestsRes.from, to: testerRequestsRes.to
          })
        }
      }
      else if (activeTab === 'plans') {
        const plansRes = await adminApi.getPlans()
        const plansList = plansRes.plans || (Array.isArray(plansRes) ? plansRes : [])
        if (plansList && plansList.length > 0) {
          setPlans(plansList.map(transformPlan))
        }
      }
      else if (activeTab === 'meta-deletions') {
        const deletionsRes = await integrationApi.getDeletionRequests()
        if (deletionsRes.status === 'success') {
          setDeletionRequests(deletionsRes.requests || [])
        }
      }

    } catch (error: any) {
      toast.error("Platform Error", { description: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setCompaniesPage(1)
    setUsersPage(1)
    setBillingPage(1)
  }, [searchQuery])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData()
    }, 500) // Debounce search
    return () => clearTimeout(timer)
  }, [activeTab, companiesPage, usersPage, billingPage, testerRequestsPage, searchQuery, filterPlan, filterStatus, filterTag, filterRole, filterUserType, filterUserStatus, filterExpiration, filterStarted, customExpStart, customExpEnd, customStartStart, customStartEnd])

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
        subscription_started_at: editingCompany.subscription_started_at ? new Date(editingCompany.subscription_started_at).toISOString() : undefined,
        is_email_enabled: editingCompany.is_email_enabled
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
      setIsUpdatingUser(true)
      await adminApi.updateUser(Number(editingUser.id), {
        role: editingUser.role,
        status: editingUser.status,
        company_id: editingUser.company_id,
        tags: editingUser.tags
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
    } finally {
      setIsUpdatingUser(false)
    }
  }

  const handleUpdateTesterStatus = async (id: number, status: string) => {
    try {
      setIsUpdatingTester(true)
      await adminApi.updateTesterRequestStatus(id, status)
      toast.success("Status Updated", { description: "Tester request status has been updated." })
      fetchData()
    } catch (error: any) {
      toast.error("Update Failed", { description: error.message })
    } finally {
      setIsUpdatingTester(false)
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
    switch (confirmModal.type) {
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
      ],
      capabilities: {}
    }
    setEditingPlan(newPlan)
    setIsPlanModalOpen(true)
  }

  const handleEditPlan = (plan: PlanDefinition) => {
    setEditingPlan({ ...plan, features: [...plan.features] })
    setIsPlanModalOpen(true)
  }

  const handleSavePlan = async () => {
    if (!editingPlan) return

    try {
      setIsUpdatingPlan(true)
      const isNewPlan = String(editingPlan.id).startsWith('p');
      
      // Package for backend using the Smart JSON structure
      const backendData = {
        name: editingPlan.name, // Required for creation
        price: editingPlan.price,
        features: {
          display: editingPlan.features,
          permissions: editingPlan.capabilities
        }
      }

      let response: any;
      if (isNewPlan) {
        response = await adminApi.createPlan(backendData);
        const newPlan = transformPlan(response.plan);
        setPlans([...plans.filter(p => p.id !== editingPlan.id), newPlan]);
        toast.success("Plan Created", { description: `${editingPlan.name} added to platform.` });
      } else {
        response = await adminApi.updatePlan(Number(editingPlan.id), backendData);
        const updatedPlan = transformPlan(response.plan);
        setPlans(plans.map(p => p.id === editingPlan.id ? updatedPlan : p));
        toast.success("Plan Synchronized", { description: `${editingPlan.name} features updated in database.` });
      }

      setIsPlanModalOpen(false)
    } catch (error: any) {
      toast.error("Update Failed", { description: error.message })
    } finally {
      setIsUpdatingPlan(false)
    }
  }

  const togglePlanFeature = (featureName: string) => {
    if (!editingPlan) return
    setEditingPlan({
      ...editingPlan,
      features: editingPlan.features.map(f => f.name === featureName ? { ...f, included: !f.included } : f)
    })
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Enterprise': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'Pro': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'Free': return 'bg-[var(--crm-surface-3)] text-[var(--crm-text-primary)] border-[var(--crm-border)]'
      default: return 'bg-primary/20 text-primary border-primary/20'
    }
  }

  const getStatusBadge = (status: AccountStatus) => {
    switch (status) {
      case 'Active': return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Active</Badge>
      case 'Delinquent': return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Delinquent</Badge>
      case 'Suspended': return <Badge className="bg-red-100 text-red-700 border-red-200">Suspended</Badge>
    }
  }

  return (
    <RoleGuard allowedFeatures={['system_admin']}>
      <div className="flex flex-col flex-1 gap-4 sm:gap-5">
        <div className="space-y-6 w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-6 w-6 rounded bg-[var(--crm-accent)] flex items-center justify-center text-[10px] font-black text-white">SA</div>
                <h1 className="text-2xl font-extrabold text-[var(--crm-text-primary)] tracking-tight">Super Admin Portal</h1>
              </div>
              <p className="text-sm text-[var(--crm-text-secondary)] font-medium italic">Master control for LeadBajaar Platform</p>
            </div>
            <div className="flex items-center gap-4">

              <Button variant="outline" onClick={handleSync} className="rounded-xl border-[var(--crm-border)] h-10 font-bold text-sm">
                <RefreshCw className="h-4 w-4 mr-2" /> Sync Data
              </Button>
              <Button onClick={() => toast.success("System Healthy", { description: "All 14 services operating within normal parameters." })} className="bg-[var(--crm-accent)] hover:opacity-90 text-white font-bold shadow-md rounded-xl h-10 px-5">
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
              <Card key={i} className="border-none shadow-sm bg-[var(--crm-surface-1)] rounded-xl ring-1 ring-[var(--crm-border)] overflow-hidden relative group">
                <div className={cn("absolute top-0 right-0 -mt-2 -mr-2 h-16 w-16 rounded-full blur-2xl opacity-10", `bg-${stat.color}-500 group-hover:opacity-20 transition-opacity`)}></div>
                <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                  <div className={cn("h-10 w-10 shrink-0 rounded-xl flex items-center justify-center", `bg-${stat.color}-50 text-${stat.color}-600`)}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-[10px] font-bold text-[var(--crm-text-secondary)] uppercase tracking-wider truncate mr-2">{stat.label}</p>
                      <div className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0", stat.trend.includes('+') ? "bg-emerald-50 text-emerald-600" : "bg-[var(--crm-surface-3)] text-[var(--crm-text-secondary)]")}>
                        {stat.trend}
                      </div>
                    </div>
                    {isLoading ? (
                      <div className="h-6 w-20 bg-[var(--crm-surface-3)] animate-pulse rounded mt-1" />
                    ) : (
                      <div className="flex items-baseline gap-1.5 overflow-hidden">
                        <p className="text-lg font-black text-[var(--crm-text-primary)] leading-none">{stat.value}</p>
                        <p className="text-[9px] text-[var(--crm-text-secondary)] font-medium truncate">{stat.sub}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>


          <Tabs defaultValue="companies" onValueChange={setActiveTab} className="space-y-4">
          <div className="w-full overflow-x-auto no-scrollbar pb-1">
            <TabsList className="bg-[var(--crm-surface-3)] p-1 rounded-xl h-12 border border-[var(--crm-border)] w-max min-w-full justify-start flex-nowrap">
              <TabsTrigger value="companies" className="rounded-lg px-6 py-2 text-sm font-bold data-[state=active]:bg-[var(--crm-surface-1)] data-[state=active]:shadow-sm transition-all whitespace-nowrap">
                <Building2 className="h-4 w-4 mr-2" />
                Manage Companies
              </TabsTrigger>
              <TabsTrigger value="users" className="rounded-lg px-6 py-2 text-sm font-bold data-[state=active]:bg-[var(--crm-surface-1)] data-[state=active]:shadow-sm transition-all whitespace-nowrap">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </TabsTrigger>
              <TabsTrigger value="billing" className="rounded-lg px-6 py-2 text-sm font-bold data-[state=active]:bg-[var(--crm-surface-1)] data-[state=active]:shadow-sm transition-all whitespace-nowrap">
                <CreditCard className="h-4 w-4 mr-2" />
                Global Billing
              </TabsTrigger>
              <TabsTrigger value="plans" className="rounded-lg px-6 py-2 text-sm font-bold data-[state=active]:bg-[var(--crm-surface-1)] data-[state=active]:shadow-sm transition-all whitespace-nowrap">
                <Settings className="h-4 w-4 mr-2" />
                Plan Management
              </TabsTrigger>
              <TabsTrigger value="health" className="rounded-lg px-6 py-2 text-sm font-bold data-[state=active]:bg-[var(--crm-surface-1)] data-[state=active]:shadow-sm transition-all whitespace-nowrap">
                <Activity className="h-4 w-4 mr-2" />
                Service Status
              </TabsTrigger>
              <TabsTrigger value="meta-deletions" className="rounded-lg px-6 py-2 text-sm font-bold data-[state=active]:bg-[var(--crm-surface-1)] data-[state=active]:shadow-sm transition-all whitespace-nowrap">
                <ShieldAlert className="h-4 w-4 mr-2 text-red-500" />
                Meta Compliance
              </TabsTrigger>
              <TabsTrigger value="announcements" className="rounded-lg px-6 py-2 text-sm font-bold data-[state=active]:bg-[var(--crm-surface-1)] data-[state=active]:shadow-sm transition-all whitespace-nowrap">
                <Megaphone className="h-4 w-4 mr-2 text-amber-500" />
                Announcements
              </TabsTrigger>
              <TabsTrigger value="testers" className="rounded-lg px-6 py-2 text-sm font-bold data-[state=active]:bg-[var(--crm-surface-1)] data-[state=active]:shadow-sm transition-all whitespace-nowrap">
                <Smartphone className="h-4 w-4 mr-2 text-primary" />
                Beta Testers
              </TabsTrigger>
            </TabsList>
          </div>

            <TabsContent value="users" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-96">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-text-secondary)]">
                    <Search className="h-4 w-4" />
                  </div>
                  <Input
                    placeholder="Search users by name, email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 bg-[var(--crm-surface-1)] border-[var(--crm-border)] rounded-xl text-sm shadow-sm pl-10"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                  {/* Role Filter */}
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="h-10 w-full sm:w-32 rounded-xl bg-[var(--crm-surface-1)] border-[var(--crm-border)] font-bold text-[10px] uppercase">
                      <Users className="h-3 w-3 mr-2 text-primary" />
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="Super Admin">Super Admin</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Agent">Agent</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Account Type Filter */}
                  <Select value={filterUserType} onValueChange={setFilterUserType}>
                    <SelectTrigger className="h-10 w-full sm:w-36 rounded-xl bg-[var(--crm-surface-1)] border-[var(--crm-border)] font-bold text-[10px] uppercase">
                      <Building2 className="h-3 w-3 mr-2 text-primary" />
                      <SelectValue placeholder="Account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Accounts</SelectItem>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="agency">Agency</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Status Filter */}
                  <Select value={filterUserStatus} onValueChange={setFilterUserStatus}>
                    <SelectTrigger className="h-10 w-full sm:w-32 rounded-xl bg-[var(--crm-surface-1)] border-[var(--crm-border)] font-bold text-[10px] uppercase">
                      <Activity className="h-3 w-3 mr-2 text-primary" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Tag Filter */}
                  <Select value={filterTag} onValueChange={setFilterTag}>
                    <SelectTrigger className="h-10 w-full sm:w-40 rounded-xl bg-[var(--crm-surface-1)] border-[var(--crm-border)] font-bold text-[10px] uppercase">
                      <div className="flex items-center">
                        <Tag className="h-3 w-3 mr-2 text-primary" />
                        <SelectValue placeholder="Tag" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tags</SelectItem>
                      {globalTags.map(tag => (
                        <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterTag('all');
                      setFilterRole('all');
                      setFilterUserType('all');
                      setFilterUserStatus('all');
                      fetchData();
                    }}
                    className="h-10 rounded-xl border-[var(--crm-border)] text-[var(--crm-text-secondary)] shadow-sm px-3"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <Card className="border-none shadow-sm bg-[var(--crm-surface-1)] rounded-2xl ring-1 ring-slate-200 overflow-hidden">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-[var(--crm-surface-2)] border-b border-[var(--crm-border)]">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-bold text-[var(--crm-text-secondary)] py-4 pl-6">User</TableHead>
                        <TableHead className="font-bold text-[var(--crm-text-secondary)] py-4">Company</TableHead>
                        <TableHead className="font-bold text-[var(--crm-text-secondary)] py-4">Account Type</TableHead>
                        <TableHead className="font-bold text-[var(--crm-text-secondary)] py-4">Role</TableHead>
                        <TableHead className="font-bold text-[var(--crm-text-secondary)] py-4">Status</TableHead>
                        <TableHead className="font-bold text-[var(--crm-text-secondary)] py-4">Tags</TableHead>
                        <TableHead className="text-right font-bold text-[var(--crm-text-secondary)] py-4 pr-6">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-64 text-center">
                            <div className="flex flex-col items-center justify-center gap-3">
                              <Loader2 className="h-10 w-10 text-primary animate-spin" />
                              <p className="text-sm font-bold text-[var(--crm-text-secondary)] italic">Retrieving user directory...</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : users.length > 0 ? (
                        users.map((u) => (
                          <TableRow key={u.id} className="border-[var(--crm-border)]">
                            <TableCell className="py-4 pl-6">
                              <div>
                                <p className="font-bold text-sm text-[var(--crm-text-primary)]">{u.name}</p>
                                <p className="text-[10px] text-[var(--crm-text-secondary)] font-medium">{u.email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm font-medium text-[var(--crm-text-secondary)]">{u.company?.name || 'No Company'}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px] font-bold uppercase bg-[var(--crm-surface-2)] text-[var(--crm-text-secondary)] border-[var(--crm-border)]">{u.user_type || 'Individual'}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="default" className="text-[10px] font-bold uppercase bg-[var(--crm-accent)] text-white border-none">{u.role}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={cn("text-[10px] font-bold py-0.5", u.status === 'Active' ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-[var(--crm-surface-3)] text-[var(--crm-text-secondary)] border-[var(--crm-border)]")}>
                                {u.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1 max-w-[150px]">
                                {u.tags && u.tags.length > 0 ? u.tags.map((tag, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-[9px] px-1.5 h-4 bg-[var(--crm-accent-soft)] text-[var(--crm-accent)] border-none">
                                    {tag}
                                  </Badge>
                                )) : (
                                  <span className="text-[10px] text-[var(--crm-text-secondary)] italic">No tags</span>
                                )}
                              </div>
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
                                    className="text-[var(--crm-accent)] font-bold"
                                    onClick={() => handleImpersonate(Number(u.id))}
                                  >
                                    <ExternalLink className="h-4 w-4 mr-2" /> Impersonate
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600 font-bold"
                                    onClick={() => setConfirmModal({ isOpen: true, type: 'delete_user', id: Number(u.id), name: u.name, variant: 'destructive' })}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" /> Wipe Account
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-64 text-center">
                            <div className="flex flex-col items-center justify-center gap-3">
                              <div className="h-12 w-12 rounded-2xl bg-[var(--crm-surface-2)] flex items-center justify-center">
                                <Search className="h-6 w-6 text-slate-300" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-base font-bold text-[var(--crm-text-primary)]">No Users Found</p>
                                <p className="text-sm text-[var(--crm-text-secondary)] max-w-[250px] mx-auto">We couldn't find any users matching your current filters or search query.</p>
                              </div>
                              <Button
                                variant="link"
                                onClick={() => {
                                  setSearchQuery('');
                                  setFilterTag('all');
                                  setFilterRole('all');
                                  setFilterUserType('all');
                                  setFilterUserStatus('all');
                                  fetchData();
                                }}
                                className="text-[var(--crm-accent)] font-bold"
                              >
                                Reset all filters
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
                {usersMeta && (
                  <CardFooter className="bg-[var(--crm-surface-2)] border-t border-[var(--crm-border)] py-4 px-6">
                    <PaginationSection
                      currentPage={usersPage}
                      lastPage={usersMeta.last_page}
                      onPageChange={setUsersPage}
                      totalItems={usersMeta.total}
                      itemsShown={users.length}
                    />
                  </CardFooter>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="companies" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Filter Row */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-96">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-text-secondary)]">
                    <Search className="h-4 w-4" />
                  </div>
                  <Input
                    placeholder="Search by company, owner, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 bg-[var(--crm-surface-1)] border-[var(--crm-border)] rounded-xl text-sm shadow-sm pl-10"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                  {/* Plan Filter */}
                  <Select value={filterPlan} onValueChange={setFilterPlan}>
                    <SelectTrigger className={cn(
                      "h-10 w-10 px-0 flex items-center justify-center hover:w-auto hover:px-4 rounded-xl bg-[var(--crm-surface-1)] border-[var(--crm-border)] font-bold text-[10px] uppercase group transition-all duration-300 overflow-hidden",
                      filterPlan !== 'all' && "w-auto px-4"
                    )}>
                      <div className="flex items-center justify-center w-full">
                        <CreditCard className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <span className={cn(
                          "max-w-0 group-hover:max-w-[120px] opacity-0 group-hover:opacity-100 transition-all duration-300 ml-0 group-hover:ml-2 whitespace-nowrap",
                          filterPlan !== 'all' && "max-w-[120px] opacity-100 ml-2"
                        )}>
                          <SelectValue placeholder="Plan" />
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="dark:bg-[var(--crm-accent)] shadow-xl">
                      <SelectItem value="all" className="font-bold">All Plans</SelectItem>
                      {plans.map((p) => (
                        <SelectItem key={p.id} value={p.name}>{p.name} Tier</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Status Filter */}
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className={cn(
                      "h-10 w-10 px-0 flex items-center justify-center hover:w-auto hover:px-4 rounded-xl bg-[var(--crm-surface-1)] border-[var(--crm-border)] font-bold text-[10px] uppercase group transition-all duration-300 overflow-hidden",
                      filterStatus !== 'all' && "w-auto px-4"
                    )}>
                      <div className="flex items-center justify-center w-full">
                        <Activity className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <span className={cn(
                          "max-w-0 group-hover:max-w-[120px] opacity-0 group-hover:opacity-100 transition-all duration-300 ml-0 group-hover:ml-2 whitespace-nowrap",
                          filterStatus !== 'all' && "max-w-[120px] opacity-100 ml-2"
                        )}>
                          <SelectValue placeholder="Status" />
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Delinquent">Delinquent</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Tag Filter */}
                  <Select value={filterTag} onValueChange={setFilterTag}>
                    <SelectTrigger className={cn(
                      "h-10 w-10 px-0 flex items-center justify-center hover:w-auto hover:px-4 rounded-xl bg-[var(--crm-surface-1)] border-[var(--crm-border)] font-bold text-[10px] uppercase group transition-all duration-300 overflow-hidden",
                      filterTag !== 'all' && "w-auto px-4"
                    )}>
                      <div className="flex items-center justify-center w-full">
                        <Tag className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <span className={cn(
                          "max-w-0 group-hover:max-w-[120px] opacity-0 group-hover:opacity-100 transition-all duration-300 ml-0 group-hover:ml-2 whitespace-nowrap",
                          filterTag !== 'all' && "max-w-[120px] opacity-100 ml-2"
                        )}>
                          <SelectValue placeholder="Tag" />
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tags</SelectItem>
                      {globalTags.map(tag => (
                        <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Expiration Filter */}
                  <DateRangePicker
                    value={filterExpiration === 'custom' ? {
                      from: customExpStart ? new Date(customExpStart) : undefined,
                      to: customExpEnd ? new Date(customExpEnd) : undefined
                    } : undefined}
                    onChange={(range) => {
                      if (!range) {
                        setFilterExpiration('all')
                        setCustomExpStart('')
                        setCustomExpEnd('')
                        return
                      }
                      setFilterExpiration('custom')
                      setCustomExpStart(range.from ? format(range.from, 'yyyy-MM-dd') : '')
                      setCustomExpEnd(range.to ? format(range.to, 'yyyy-MM-dd') : '')
                    }}
                    placeholder="Expiration Filter"
                    isIconTriggerOnly={true}
                    icon={<Clock className="h-3.5 w-3.5 text-primary" />}
                  />

                  {/* Started Filter */}
                  <DateRangePicker
                    value={filterStarted === 'custom' ? {
                      from: customStartStart ? new Date(customStartStart) : undefined,
                      to: customStartEnd ? new Date(customStartEnd) : undefined
                    } : undefined}
                    onChange={(range) => {
                      if (!range) {
                        setFilterStarted('all')
                        setCustomStartStart('')
                        setCustomStartEnd('')
                        return
                      }
                      setFilterStarted('custom')
                      setCustomStartStart(range.from ? format(range.from, 'yyyy-MM-dd') : '')
                      setCustomStartEnd(range.to ? format(range.to, 'yyyy-MM-dd') : '')
                    }}
                    placeholder="Started Filter"
                    isIconTriggerOnly={true}
                    icon={<Calendar className="h-3.5 w-3.5 text-primary" />}
                  />

                  <Button
                    variant="outline"
                    onClick={() => {
                      // ... same as provided in instructions, simplified here to target correctly
                      setSearchQuery('');
                      setFilterPlan('all');
                      setFilterStatus('all');
                      setFilterTag('all');
                      setFilterExpiration('all');
                      setFilterStarted('all');
                      setCustomExpStart('');
                      setCustomExpEnd('');
                      setCustomStartStart('');
                      setCustomStartEnd('');
                      fetchData();
                    }}
                    className="h-10 w-10 p-0 flex flex-shrink-0 items-center justify-center rounded-xl border-[var(--crm-border)] text-[var(--crm-text-secondary)] shadow-sm group transition-all duration-300 overflow-hidden hover:w-auto hover:px-4"
                  >
                    <div className="flex items-center justify-center w-full">
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span className="max-w-0 group-hover:max-w-[120px] opacity-0 group-hover:opacity-100 transition-all duration-300 ml-0 group-hover:ml-2 text-[10px] font-black uppercase whitespace-nowrap">
                        Reset Filters
                      </span>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleExport}
                    className="h-10 w-10 p-0 flex flex-shrink-0 items-center justify-center rounded-xl border-indigo-100 bg-[var(--crm-accent-soft)]/50 text-[var(--crm-accent)] shadow-sm group transition-all duration-300 overflow-hidden hover:w-auto hover:px-4"
                  >
                    <div className="flex items-center justify-center w-full">
                      <Download className="h-4 w-4" />
                      <span className="max-w-0 group-hover:max-w-[120px] opacity-0 group-hover:opacity-100 transition-all duration-300 ml-0 group-hover:ml-2 text-[10px] font-black uppercase whitespace-nowrap">
                        Export Data
                      </span>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Companies Table */}
              <Card className="border-none shadow-sm bg-[var(--crm-surface-1)] rounded-2xl ring-1 ring-slate-200 overflow-hidden">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-[var(--crm-surface-2)] border-b border-[var(--crm-border)]">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-bold text-[var(--crm-text-secondary)] uppercase tracking-wider text-xs py-5 pl-6">Company & Owner</TableHead>
                        <TableHead className="font-bold text-[var(--crm-text-secondary)] uppercase tracking-wider text-xs py-5">Plan</TableHead>
                        <TableHead className="font-bold text-[var(--crm-text-secondary)] uppercase tracking-wider text-xs py-5">Entity Type</TableHead>
                        <TableHead className="font-bold text-[var(--crm-text-secondary)] uppercase tracking-wider text-xs py-5">Status</TableHead>
                        <TableHead className="font-bold text-[var(--crm-text-secondary)] uppercase tracking-wider text-[10px] py-5">Node</TableHead>
                        <TableHead className="font-bold text-[var(--crm-text-secondary)] uppercase tracking-wider text-[10px] py-5">Users</TableHead>
                        <TableHead className="font-bold text-[var(--crm-text-secondary)] uppercase tracking-wider text-[10px] py-5">Expiration</TableHead>
                        <TableHead className="font-bold text-[var(--crm-text-secondary)] uppercase tracking-wider text-[10px] py-5">Started</TableHead>
                        <TableHead className="text-right font-bold text-[var(--crm-text-secondary)] uppercase tracking-wider text-[10px] py-5 pr-6">Monthly MRR</TableHead>
                        <TableHead className="text-right font-bold text-[var(--crm-text-secondary)] uppercase tracking-wider text-[10px] py-5 pr-6"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={10} className="h-64 text-center">
                            <div className="flex flex-col items-center justify-center gap-3">
                              <Loader2 className="h-10 w-10 text-primary animate-spin" />
                              <p className="text-sm font-bold text-[var(--crm-text-secondary)] italic">Syncing company nodes...</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : companies.length > 0 ? (
                        companies.map((company: Company) => (
                          <TableRow key={company.id} className="border-[var(--crm-border)] hover:bg-[var(--crm-surface-3)] transition-colors group">
                            {/* ... existing table cells ... */}
                            <TableCell className="py-5 pl-6">
                              <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-[var(--crm-surface-3)] flex items-center justify-center text-[var(--crm-text-secondary)] font-bold shadow-sm">
                                  {company.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-[var(--crm-text-primary)] text-sm">{company.name}</p>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <p className="text-xs text-[var(--crm-text-secondary)] font-medium">{company.owner}</p>
                                    <span className="text-slate-300">•</span>
                                    <p className="text-[11px] text-[var(--crm-text-secondary)]">{company.email}</p>
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {company.tags?.map((tag, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-[8px] px-1.5 h-3.5 bg-[var(--crm-surface-3)] text-[var(--crm-text-secondary)] border-none font-bold">
                                        {tag}
                                      </Badge>
                                    ))}
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
                              <Badge variant="secondary" className={cn("text-[10px] uppercase font-black tracking-widest px-2 py-0.5", company.type === 'agency' ? "bg-[var(--crm-accent-soft)] text-primary border-indigo-100" : "bg-[var(--crm-surface-2)] text-[var(--crm-text-secondary)] border-[var(--crm-border)]")}>
                                {company.type || 'individual'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(company.status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <Activity className="h-3.5 w-3.5 text-[var(--crm-text-secondary)]" />
                                <span className="text-sm font-bold text-[var(--crm-text-primary)]">{company.usersCount}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5 text-[var(--crm-text-secondary)]" />
                                <span className="text-sm font-bold text-[var(--crm-text-primary)]">{company.usersCount}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-0.5">
                                <p className="text-xs font-black text-[var(--crm-accent)]">
                                  {company.expires_at ? new Date(company.expires_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) : 'Never'}
                                </p>
                                <p className="text-[9px] text-[var(--crm-text-secondary)] font-bold uppercase tracking-tighter">Automatic Expiry</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-0.5">
                                <p className="text-xs font-bold text-[var(--crm-text-primary)]">
                                  {company.subscription_started_at ? new Date(company.subscription_started_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) : 'N/A'}
                                </p>
                                <p className="text-[9px] text-[var(--crm-text-secondary)] font-bold uppercase tracking-tighter">Plan Started</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <p className="font-black text-[var(--crm-text-primary)] text-sm">₹{company.monthlySpend}</p>
                              <p className="text-[10px] text-[var(--crm-text-secondary)]">Joined {company.joinedDate}</p>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-[var(--crm-surface-3)] rounded-xl text-[var(--crm-text-secondary)]">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 rounded-2xl border-[var(--crm-border)] shadow-xl bg-[var(--crm-surface-1)] p-1.5">
                                  <DropdownMenuLabel className="font-bold text-xs uppercase tracking-wider text-[var(--crm-text-secondary)] px-3 py-2">Account Control</DropdownMenuLabel>
                                  <DropdownMenuSeparator className="bg-[var(--crm-surface-3)]" />
                                  <DropdownMenuItem
                                    className="cursor-pointer font-medium py-2.5 px-3 focus:bg-[var(--crm-surface-2)]:bg-[var(--crm-accent)] rounded-xl"
                                    onClick={() => {
                                      setEditingCompany({ ...company })
                                      setIsEditModalOpen(true)
                                    }}
                                  >
                                    <Edit className="mr-3 h-4 w-4 text-[var(--crm-text-secondary)]" /> Edit Plan & Billing
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer font-bold py-2.5 px-3 text-[var(--crm-accent)] focus:bg-[var(--crm-surface-2)]:bg-[var(--crm-accent)] rounded-xl"
                                    onClick={() => {
                                      if (company.owner_id) {
                                        handleImpersonate(Number(company.owner_id))
                                      } else {
                                        toast.error("Impersonation Failed", { description: "No owner associated with this company." })
                                      }
                                    }}
                                  >
                                    <ExternalLink className="mr-3 h-4 w-4" /> Enter Account
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-[var(--crm-surface-3)]" />
                                  <DropdownMenuLabel className="font-bold text-[10px] uppercase tracking-wider text-[var(--crm-text-secondary)] px-3 py-1">Advanced Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    className="cursor-pointer font-bold py-2.5 px-3 text-emerald-600 focus:bg-emerald-50:bg-emerald-950/30 rounded-xl"
                                    onClick={() => setRenewModal({ isOpen: true, companyId: Number(company.id), companyName: company.name, days: 30, notes: '' })}
                                  >
                                    <RefreshCw className="mr-3 h-4 w-4 text-emerald-400" /> Prolong Plan
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer font-bold py-2.5 px-3 text-[var(--crm-text-secondary)] focus:bg-[var(--crm-surface-2)]:bg-[var(--crm-accent)] rounded-xl"
                                    onClick={() => handleViewHistory(Number(company.id), company.name)}
                                  >
                                    <History className="mr-3 h-4 w-4 text-[var(--crm-text-secondary)]" /> Audit History
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer font-medium py-2.5 px-3 text-red-600 focus:bg-red-50:bg-red-950/30 focus:text-red-600 rounded-xl"
                                    onClick={() => handleStatusChange(company.id, 'Suspended')}
                                  >
                                    <ShieldAlert className="mr-3 h-4 w-4" /> Suspend Account
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer font-bold py-2.5 px-3 text-red-600 focus:bg-red-100:bg-red-900/40 rounded-xl"
                                    onClick={() => setConfirmModal({ isOpen: true, type: 'delete_company', id: Number(company.id), name: company.name, variant: 'destructive' })}
                                  >
                                    <Trash2 className="mr-3 h-4 w-4" /> Terminate Node
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={10} className="h-64 text-center">
                            <div className="flex flex-col items-center justify-center gap-3">
                              <div className="h-12 w-12 rounded-2xl bg-[var(--crm-surface-2)] flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-slate-300" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-base font-bold text-[var(--crm-text-primary)]">No Companies Found</p>
                                <p className="text-sm text-[var(--crm-text-secondary)] max-w-[250px] mx-auto">Try adjusting your filters or search keywords.</p>
                              </div>
                              <Button
                                variant="link"
                                onClick={() => { setFilterPlan('all'); setFilterStatus('all'); setSearchQuery(''); fetchData(); }}
                                className="text-[var(--crm-accent)] font-bold"
                              >
                                Reset all filters
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="bg-[var(--crm-surface-2)] border-t border-[var(--crm-border)] py-4 px-6">
                  <PaginationSection
                    currentPage={companiesPage}
                    lastPage={companiesMeta?.last_page || 1}
                    onPageChange={setCompaniesPage}
                    totalItems={companiesMeta?.total}
                    from={companiesMeta?.from}
                    to={companiesMeta?.to}
                  />
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-none shadow-sm bg-[var(--crm-surface-1)] rounded-2xl ring-1 ring-slate-200">
                  <CardHeader className="border-b border-[var(--crm-border)]">
                    <CardTitle className="text-lg font-bold">Recent Invoices</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-[var(--crm-surface-2)]">
                        <TableRow>
                          <TableHead className="font-bold text-[11px] uppercase pl-6">ID</TableHead>
                          <TableHead className="font-bold text-[11px] uppercase">Company</TableHead>
                          <TableHead className="font-bold text-[11px] uppercase">Type</TableHead>
                          <TableHead className="font-bold text-[11px] uppercase text-right">Amount</TableHead>
                          <TableHead className="font-bold text-[11px] uppercase text-right pr-6">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={5} className="h-48 text-center">
                              <div className="flex flex-col items-center justify-center gap-2">
                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                <p className="text-sm font-medium text-[var(--crm-text-secondary)] italic">Fetching transaction history...</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : billingData.length > 0 ? (
                          billingData.map((inv: any) => (
                            <TableRow key={inv.id} className="border-[var(--crm-border)]">
                              <TableCell className="font-medium pl-6 text-sm">#{inv.id}</TableCell>
                              <TableCell className="font-bold text-sm text-slate-800">{inv.company?.name || 'Deleted'}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-[10px] font-bold uppercase">{inv.type}</Badge>
                              </TableCell>
                              <TableCell className="text-right font-black text-sm">
                                ₹{inv.amount && parseFloat(inv.amount) > 0 ? parseFloat(inv.amount).toLocaleString() : '0'}
                              </TableCell>
                              <TableCell className="text-right text-[var(--crm-text-secondary)] text-xs pr-6">
                                {new Date(inv.created_at).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="py-10 text-center text-[var(--crm-text-secondary)] italic font-medium">No billing history found matching current criteria.</TableCell>
                          </TableRow>
                        )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  {billingMeta && (
                    <CardFooter className="bg-[var(--crm-surface-2)] border-t border-[var(--crm-border)] py-4 px-6">
                      <PaginationSection
                        currentPage={billingPage}
                        lastPage={billingMeta.last_page}
                        onPageChange={setBillingPage}
                        totalItems={billingMeta.total}
                        itemsShown={billingData.length}
                      />
                    </CardFooter>
                  )}
                </Card>

                <Card className="border-none shadow-sm bg-[var(--crm-accent)] rounded-2xl p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-[var(--crm-surface-1)]/10 blur-3xl"></div>
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest">Total MRR</p>
                      <div className="group relative">
                        <Activity className="h-3.5 w-3.5 text-indigo-300 cursor-help" />
                        <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-[var(--crm-surface-1)] rounded-xl shadow-xl border border-[var(--crm-border)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                          <p className="text-[10px] font-bold text-[var(--crm-text-secondary)] uppercase mb-2">Calculation Logic</p>
                          <ul className="space-y-1.5 text-xs font-medium text-[var(--crm-text-primary)]">
                            <li className="flex justify-between">
                              <span>Pro Tier:</span>
                              <span className="font-bold">Qty × ₹1,490</span>
                            </li>
                            <li className="flex justify-between">
                              <span>Enterprise:</span>
                              <span className="font-bold">Qty × ₹4,990</span>
                            </li>
                            <li className="flex justify-between border-t border-[var(--crm-border)] pt-1.5">
                              <span>Custom:</span>
                              <span className="font-bold">Manual Adjustments</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-4xl font-black mb-6">{stats?.revenue?.value || '₹0'}</h3>
                    <div className="space-y-4 flex-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-indigo-100">Pro Subscriptions</span>
                        <span className="font-bold">{stats?.revenue?.breakdown?.pro || 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-indigo-100">Enterprise Deals</span>
                        <span className="font-bold">{stats?.revenue?.breakdown?.enterprise || 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-indigo-100">Custom Add-ons</span>
                        <span className="font-bold">{stats?.revenue?.breakdown?.custom || '₹0'}</span>
                      </div>
                    </div>
                    <Button className="mt-8 bg-[var(--crm-surface-1)]/20 hover:bg-[var(--crm-surface-1)]/30 backdrop-blur-md border-none text-white font-bold w-full rounded-xl">
                      View Revenue Analytics
                    </Button>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="plans" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-[var(--crm-text-primary)]">Subscription Tiers</h3>
                  <p className="text-sm text-[var(--crm-text-secondary)]">Configure features and pricing for LeadBajaar plans.</p>
                </div>
                <Button onClick={handleCreatePlan} className="bg-[var(--crm-accent)] font-bold rounded-xl h-10 px-5">
                  <Plus className="h-4 w-4 mr-2" /> Create New Plan
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <Card key={plan.id} className="border-none shadow-md bg-[var(--crm-surface-1)] rounded-3xl ring-1 ring-slate-200 flex flex-col overflow-hidden relative group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <div className={cn("absolute top-0 left-0 w-full h-1.5",
                      plan.name === 'Enterprise' ? "bg-purple-500" :
                        plan.name === 'Pro' ? "bg-[var(--crm-accent-soft)]0" : "bg-slate-400"
                    )}></div>

                    <CardHeader className="pt-8 pb-4 text-center">
                      <Badge variant="outline" className={cn("mx-auto mb-2 font-black tracking-widest uppercase text-[10px] px-3", getPlanColor(plan.name))}>
                        {plan.name} Tier
                      </Badge>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <span className="text-sm font-bold text-[var(--crm-text-secondary)]">₹</span>
                        <span className="text-4xl font-black text-[var(--crm-text-primary)] leading-none">{plan.price}</span>
                        <span className="text-sm font-bold text-[var(--crm-text-secondary)]">/mo</span>
                      </div>
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <Users className="h-3.5 w-3.5 text-[var(--crm-text-secondary)]" />
                        <span className="text-xs font-bold text-[var(--crm-text-secondary)]">{plan.activeSubscribers} Active Subscribers</span>
                      </div>
                    </CardHeader>

                      <div className="space-y-3.5">
                        {Array.isArray(plan.features) ? plan.features.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            {feat.included ? (
                              <div className="h-5 w-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              </div>
                            ) : (
                              <div className="h-5 w-5 rounded-full bg-[var(--crm-surface-2)] flex items-center justify-center shrink-0">
                                <XCircle className="h-3.5 w-3.5 text-slate-300" />
                              </div>
                            )}
                            <span className={cn("text-xs font-semibold", feat.included ? "text-[var(--crm-text-primary)]" : "text-[var(--crm-text-secondary)] line-through")}>
                              {feat.name}
                            </span>
                          </div>
                        )) : (
                          <p className="text-xs text-[var(--crm-text-secondary)] italic">No features defined.</p>
                        )}
                      </div>

                    <CardFooter className="p-6 bg-[var(--crm-surface-2)] border-t border-[var(--crm-border)]">
                      <Button
                        variant="outline"
                        onClick={() => handleEditPlan(plan)}
                        className="w-full rounded-2xl h-11 font-bold border-[var(--crm-border)] hover:bg-[var(--crm-surface-2)] transition-colors"
                      >
                        <Edit className="h-4 w-4 mr-2" /> Edit Features
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              <Card className="border-none shadow-sm bg-primary rounded-3xl p-8 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-[var(--crm-surface-1)]/10 blur-3xl transition-transform duration-700 group-hover:scale-125"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="max-w-xl text-center md:text-left">
                    <h4 className="text-2xl font-black mb-3 italic">Custom Enterprise Solutions?</h4>
                    <p className="text-blue-100 font-medium leading-relaxed">
                      For high-volume clients requiring bespoke API limits, custom white-labeling, or dedicated private server infrastructure.
                      Manage custom contracts directly through the Enterprise Deal Hub.
                    </p>
                  </div>
                  <Button className="bg-[var(--crm-surface-1)] text-primary hover:bg-[var(--crm-surface-1)]/90 font-black h-12 px-8 rounded-2xl text-sm shadow-xl shadow-blue-500/20 shrink-0">
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
                  <Card key={i} className="bg-[var(--crm-surface-1)] border-none ring-1 ring-slate-200 p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", `bg-${m.color}-50 text-${m.color}-600${m.color}-950/30${m.color}-400`)}>
                        <m.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[var(--crm-text-secondary)] uppercase">{m.label}</p>
                        <p className="text-xl font-black">{m.value}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-none shadow-sm bg-[var(--crm-surface-1)] rounded-2xl ring-1 ring-slate-200 overflow-hidden">
                  <CardHeader className="border-b border-[var(--crm-border)] pb-4">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Facebook className="h-4 w-4 text-primary" /> Meta API Node 1
                      </CardTitle>
                      <Badge className="bg-emerald-50 text-emerald-600 border-none">Stable</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-between items-end gap-1 h-12">
                      {[80, 75, 90, 85, 95, 100, 95, 80, 70, 85, 90, 95, 100, 98, 92, 100, 100, 100, 95, 90].map((h: number, i: number) => (
                        <div key={i} className="flex-1 bg-emerald-500 opacity-60 rounded-t-sm" style={{ height: `${h}%` }}></div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-[var(--crm-surface-2)] rounded-xl border border-[var(--crm-border)]">
                        <p className="text-[10px] font-bold text-[var(--crm-text-secondary)] uppercase mb-1">Response Time</p>
                        <p className="text-lg font-black text-[var(--crm-text-primary)]">124ms</p>
                      </div>
                      <div className="p-3 bg-[var(--crm-surface-2)] rounded-xl border border-[var(--crm-border)]">
                        <p className="text-[10px] font-bold text-[var(--crm-text-secondary)] uppercase mb-1">Active Hooks</p>
                        <p className="text-lg font-black text-[var(--crm-text-primary)]">4,281</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-[var(--crm-surface-1)] rounded-2xl ring-1 ring-slate-200 overflow-hidden">
                  <CardHeader className="border-b border-[var(--crm-border)] pb-4">
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
                        <div key={i} className="flex-1 bg-emerald-500 opacity-60 rounded-t-sm" style={{ height: `${h}%` }}></div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-[var(--crm-surface-2)] rounded-xl border border-[var(--crm-border)]">
                        <p className="text-[10px] font-bold text-[var(--crm-text-secondary)] uppercase mb-1">Queue Size</p>
                        <p className="text-lg font-black text-[var(--crm-text-primary)]">14 pkts</p>
                      </div>
                      <div className="p-3 bg-[var(--crm-surface-2)] rounded-xl border border-[var(--crm-border)]">
                        <p className="text-[10px] font-bold text-[var(--crm-text-secondary)] uppercase mb-1">Success Rate</p>
                        <p className="text-lg font-black text-[var(--crm-text-primary)]">98.2%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="meta-deletions" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-[var(--crm-text-primary)] flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-red-500" /> Meta Data Deletion Monitor
                  </h3>
                  <p className="text-sm text-[var(--crm-text-secondary)]">Track and act on user requests to wipe Facebook/Meta data from the database.</p>
                </div>
                <Button variant="outline" onClick={fetchData} className="rounded-xl h-10">
                  <RefreshCw className="h-4 w-4 mr-2" /> Refresh List
                </Button>
              </div>

              <Card className="border-none shadow-sm bg-[var(--crm-surface-1)] rounded-2xl ring-1 ring-slate-200 overflow-hidden">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-[var(--crm-surface-2)] border-b border-[var(--crm-border)]">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-bold text-[var(--crm-text-secondary)] py-4 pl-6">Company/User</TableHead>
                        <TableHead className="font-bold text-[var(--crm-text-secondary)] py-4">Confirmation ID</TableHead>
                        <TableHead className="font-bold text-[var(--crm-text-secondary)] py-4">Request Date</TableHead>
                        <TableHead className="font-bold text-[var(--crm-text-secondary)] py-4">Current Status</TableHead>
                        <TableHead className="text-right font-bold text-[var(--crm-text-secondary)] py-4 pr-6">Database Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-48 text-center">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <Loader2 className="h-8 w-8 text-primary animate-spin" />
                              <p className="text-sm font-medium text-[var(--crm-text-secondary)] italic">Scanning compliance logs...</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : deletionRequests.length > 0 ? (
                        deletionRequests.map((req, i) => (
                          <TableRow key={i} className="border-[var(--crm-border)]">
                            <TableCell className="py-4 pl-6">
                              <div>
                                <p className="font-bold text-sm text-[var(--crm-text-primary)]">{req.user?.name || 'Unknown'}</p>
                                <p className="text-[10px] text-[var(--crm-text-secondary)] font-medium tracking-tight uppercase">USER ID: {req.user?.id}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <code className="text-xs font-black bg-[var(--crm-surface-3)] px-2.5 py-1 rounded-lg text-[var(--crm-accent)] border border-[var(--crm-border)]">
                                {req.code}
                              </code>
                            </TableCell>
                            <TableCell className="text-sm font-medium text-[var(--crm-text-secondary)]">
                              {req.requested_at ? new Date(req.requested_at).toLocaleString() : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-amber-100 text-amber-700 border-none font-bold text-[10px] uppercase">
                                {req.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 rounded-lg text-xs font-bold border-red-100 text-red-600 bg-red-50/50 hover:bg-red-100"
                                  onClick={() => toast.info('Perform manual cleanup', { description: `Please manually delete leads for User ID: ${req.user?.id} in your database manager.` })}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" /> Mark as Wiped
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="py-12 text-center">
                            <div className="flex flex-col items-center gap-2 opacity-40">
                              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                              <p className="text-sm font-bold text-[var(--crm-text-secondary)]">No pending deletion requests.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="bg-[var(--crm-surface-2)] border-t border-[var(--crm-border)] py-3 px-6">
                  <p className="text-[10px] font-bold text-[var(--crm-text-secondary)] uppercase tracking-widest flex items-center gap-2">
                    <Lock className="h-3 w-3" /> Encrypted Compliance Log
                  </p>
                </CardFooter>
              </Card>

              <Card className="border-none shadow-sm bg-[var(--crm-accent-soft)] rounded-2xl p-6 ring-1 ring-indigo-100">
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <ShieldAlert className="h-5 w-5 text-[var(--crm-accent)]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-indigo-900">Compliance Warning</h4>
                    <p className="text-xs text-primary leading-relaxed max-w-2xl mt-1">
                      Meta (Facebook) requires that all User Data be deleted within a reasonable timeframe (usually 30 days) upon request.
                      Use this monitor to track requests that come via the standard deauthorization webhooks or in-app buttons.
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="announcements" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Composition Form */}
                <Card className="lg:col-span-1 border-none shadow-xl bg-[var(--crm-surface-1)] rounded-3xl ring-1 ring-slate-200 overflow-hidden h-fit">
                  <CardHeader className="bg-[var(--crm-accent)] text-white p-6">
                    <CardTitle className="text-xl font-black flex items-center gap-3">
                      <div className="p-2 bg-[var(--crm-accent-soft)]0 rounded-xl">
                        <Megaphone className="h-5 w-5 text-white" />
                      </div>
                      Broadcast System
                    </CardTitle>
                    <CardDescription className="text-[var(--crm-text-secondary)] font-medium">Draft and dispatch platform-wide alerts.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase text-[var(--crm-text-secondary)] tracking-wider">Announcement Title</Label>
                      <Input
                        placeholder="e.g. Scheduled Maintenance, New Feature..."
                        value={broadcastData.title}
                        onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })}
                        className="h-11 rounded-xl bg-[var(--crm-surface-2)] border-[var(--crm-border)] font-bold"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase text-[var(--crm-text-secondary)] tracking-wider">Message Narrative</Label>
                      <textarea
                        placeholder="Provide the details for the users..."
                        value={broadcastData.message}
                        onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
                        className="w-full min-h-[120px] p-4 rounded-xl bg-[var(--crm-surface-2)] border border-[var(--crm-border)] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crm-accent)]/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase text-[var(--crm-text-secondary)] tracking-wider">Cover Image URL (Optional)</Label>
                      <div className="relative">
                        <Input
                          placeholder="https://example.com/image.jpg"
                          value={broadcastData.image_url}
                          onChange={(e) => setBroadcastData({ ...broadcastData, image_url: e.target.value })}
                          className="h-11 rounded-xl bg-[var(--crm-surface-2)] border-[var(--crm-border)] font-bold pl-10"
                        />
                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--crm-text-secondary)]" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-[var(--crm-text-secondary)] tracking-wider">Alert Level</Label>
                        <Select
                          value={broadcastData.type}
                          onValueChange={(val) => setBroadcastData({ ...broadcastData, type: val as 'info' | 'warning' | 'success' })}
                        >
                          <SelectTrigger className="h-11 rounded-xl bg-[var(--crm-surface-2)] border-[var(--crm-border)] font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="info">Information</SelectItem>
                            <SelectItem value="warning">Warning</SelectItem>
                            <SelectItem value="success">Success</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-[var(--crm-text-secondary)] tracking-wider">Category</Label>
                        <Select
                          value={broadcastData.category}
                          onValueChange={(val) => setBroadcastData({ ...broadcastData, category: val })}
                        >
                          <SelectTrigger className="h-11 rounded-xl bg-[var(--crm-surface-2)] border-[var(--crm-border)] font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Announcement">Announcement</SelectItem>
                            <SelectItem value="New feature">New feature</SelectItem>
                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                            <SelectItem value="Alert">Alert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-[var(--crm-text-secondary)] tracking-wider">Target Audience</Label>
                        <Select
                          value={broadcastData.target}
                          onValueChange={(val: 'all' | 'company') => setBroadcastData({ ...broadcastData, target: val, company_ids: [] })}
                        >
                          <SelectTrigger className="h-11 rounded-xl bg-[var(--crm-surface-2)] border-[var(--crm-border)] font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            <SelectItem value="company">Specific Company</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {broadcastData.target === 'company' && (
                      <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex justify-between items-center">
                          <Label className="text-xs font-black uppercase text-[var(--crm-text-secondary)] tracking-wider">Target Workspaces</Label>
                          <Badge variant="outline" className="text-[10px] bg-[var(--crm-accent-soft)] text-[var(--crm-accent)] border-indigo-100">
                            {broadcastData.company_ids.length} Selected
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--crm-text-secondary)]" />
                            <Input
                              placeholder="Search workspaces..."
                              value={workspaceSearch}
                              onChange={(e) => setWorkspaceSearch(e.target.value)}
                              className="h-9 rounded-lg bg-[var(--crm-surface-2)] border-[var(--crm-border)] text-xs pl-9"
                            />
                          </div>

                          <div className="max-h-[200px] overflow-y-auto border border-[var(--crm-border)] rounded-xl p-2 space-y-1 bg-[var(--crm-surface-2)] custom-scrollbar">
                            {filteredSelectionCompanies.length === 0 ? (
                              <p className="text-[10px] text-center py-4 text-[var(--crm-text-secondary)] font-bold uppercase tracking-widest">No results found</p>
                            ) : (
                              filteredSelectionCompanies.map((c: Company) => {
                                const isSelected = broadcastData.company_ids.includes(Number(c.id))
                                return (
                                  <div 
                                    key={c.id}
                                    onClick={() => {
                                      const ids = [...broadcastData.company_ids]
                                      if (isSelected) {
                                        setBroadcastData({ ...broadcastData, company_ids: ids.filter(id => id !== Number(c.id)) })
                                      } else {
                                        setBroadcastData({ ...broadcastData, company_ids: [...ids, Number(c.id)] })
                                      }
                                    }}
                                    className={cn(
                                      "flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all border group",
                                      isSelected 
                                        ? "bg-[var(--crm-accent)] border-[var(--crm-accent)] text-white shadow-md shadow-primary/20" 
                                        : "bg-[var(--crm-surface-1)] border-[var(--crm-border)] hover:border-indigo-300:border-indigo-900"
                                    )}
                                  >
                                    <div className="flex flex-col">
                                      <span className={cn("text-xs font-black", isSelected ? "text-white" : "text-[var(--crm-text-primary)]")}>{c.name}</span>
                                      <span className={cn("text-[9px] font-bold uppercase tracking-tight", isSelected ? "text-indigo-100" : "text-[var(--crm-text-secondary)]")}>{c.plan} Plan</span>
                                    </div>
                                    <div className={cn(
                                      "h-4 w-4 rounded-full border flex items-center justify-center transition-all",
                                      isSelected ? "bg-[var(--crm-surface-1)] border-white text-[var(--crm-accent)]" : "border-[var(--crm-border)]"
                                    )}>
                                      {isSelected && <CheckCircle2 className="h-3 w-3" />}
                                    </div>
                                  </div>
                                )
                              })
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-4 bg-[var(--crm-accent-soft)]/50 rounded-2xl border border-indigo-100 mt-4">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-black text-indigo-900">Promotional Modal</Label>
                        <p className="text-[10px] text-primary font-medium">Show as an interstitial overlay on page load.</p>
                      </div>
                      <Switch 
                        checked={broadcastData.is_modal}
                        onCheckedChange={(val) => setBroadcastData({ ...broadcastData, is_modal: val })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[var(--crm-surface-1)] rounded-2xl border border-[var(--crm-border)] mt-4">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-black text-[var(--crm-text-primary)]">Allow 'Remind me later'</Label>
                        <p className="text-[10px] text-[var(--crm-text-secondary)] font-medium">Give users the option to snooze this announcement.</p>
                      </div>
                      <Switch 
                        checked={broadcastData.allow_snooze}
                        onCheckedChange={(val) => setBroadcastData({ ...broadcastData, allow_snooze: val })}
                      />
                    </div>

                    {broadcastData.is_modal && (
                      <div className="space-y-5 p-4 bg-[var(--crm-surface-2)] rounded-2xl border border-[var(--crm-border)] animate-in fade-in zoom-in-95 duration-200 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-[var(--crm-text-secondary)]">Frequency</Label>
                            <Select
                              value={broadcastData.frequency}
                              onValueChange={(val: any) => setBroadcastData({ ...broadcastData, frequency: val })}
                            >
                              <SelectTrigger className="h-9 rounded-lg bg-[var(--crm-surface-1)] border-[var(--crm-border)] text-xs font-bold">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="once">Once Ever</SelectItem>
                                <SelectItem value="session">Once Per Session</SelectItem>
                                <SelectItem value="always">Every Load</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-[var(--crm-text-secondary)]">Expiry Date</Label>
                            <Input
                              type="date"
                              value={broadcastData.expires_at}
                              onChange={(e) => setBroadcastData({ ...broadcastData, expires_at: e.target.value })}
                              className="h-9 rounded-lg bg-[var(--crm-surface-1)] border-[var(--crm-border)] text-xs font-bold"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-[var(--crm-text-secondary)]">CTA Text</Label>
                            <Input
                              placeholder="e.g. Claim Offer"
                              value={broadcastData.cta_text}
                              onChange={(e) => setBroadcastData({ ...broadcastData, cta_text: e.target.value })}
                              className="h-9 rounded-lg bg-[var(--crm-surface-1)] border-[var(--crm-border)] text-xs font-bold"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-[var(--crm-text-secondary)]">CTA Link</Label>
                            <Input
                              placeholder="https://..."
                              value={broadcastData.cta_link}
                              onChange={(e) => setBroadcastData({ ...broadcastData, cta_link: e.target.value })}
                              className="h-9 rounded-lg bg-[var(--crm-surface-1)] border-[var(--crm-border)] text-xs font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (!broadcastData.title || !broadcastData.message) {
                            toast.error("Preview Error", { description: "Please provide at least a title and message." })
                            return
                          }
                          setPreviewBroadcast({ id: 0, ...broadcastData } as any)
                        }}
                        className="w-1/3 h-12 rounded-xl border-[var(--crm-border)] text-[var(--crm-text-primary)] hover:bg-[var(--crm-surface-2)] font-black uppercase tracking-widest group"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        onClick={handleSendBroadcast}
                        disabled={isSendingBroadcast}
                        className="w-2/3 h-12 rounded-xl bg-[var(--crm-accent)] hover:opacity-90 text-white font-black uppercase tracking-widest shadow-lg shadow-primary/20 group"
                      >
                        {isSendingBroadcast ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                            Dispatch
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* History Log */}
                <Card className="lg:col-span-2 border-none shadow-xl bg-[var(--crm-surface-1)] rounded-3xl ring-1 ring-slate-200 overflow-hidden">
                  <CardHeader className="border-b border-[var(--crm-border)]">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg font-black text-[var(--crm-text-primary)]">Broadcast History</CardTitle>
                        <CardDescription>Track previous platform-wide announcements.</CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-[var(--crm-surface-2)] text-[var(--crm-text-secondary)] font-black text-[10px] uppercase">{broadcastHistory.length} SENT</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[650px] overflow-y-auto custom-scrollbar">
                      <Table>
                        <TableHeader className="bg-[var(--crm-surface-2)] sticky top-0 z-10">
                          <TableRow>
                            <TableHead className="w-[45%] font-bold text-[var(--crm-text-secondary)] py-4 pl-6">Timestamp & Subject</TableHead>
                            <TableHead className="w-[20%] font-bold text-[var(--crm-text-secondary)] py-4">Audience</TableHead>
                            <TableHead className="w-[10%] font-bold text-[var(--crm-text-secondary)] py-4">Type</TableHead>
                            <TableHead className="w-[25%] text-right font-bold text-[var(--crm-text-secondary)] py-4 pr-6">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {broadcastHistory.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="py-24 text-center">
                                <div className="flex flex-col items-center gap-3 opacity-30">
                                  <History className="h-12 w-12 text-[var(--crm-text-secondary)]" />
                                  <p className="font-bold text-sm">No broadcast history available.</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            broadcastHistory.map((log, i) => (
                              <TableRow key={i} className="border-[var(--crm-border)] hover:bg-[var(--crm-surface-3)] transition-colors">
                                <TableCell className="py-4 pl-6">
                                  <div className="flex gap-4">
                                    {log.image_url && (
                                      <div className="h-12 w-12 rounded-lg bg-[var(--crm-surface-3)] border border-[var(--crm-border)] overflow-hidden shrink-0">
                                        <img src={log.image_url} alt="" className="w-full h-full object-cover" />
                                      </div>
                                    )}
                                    <div>
                                      <p className="font-black text-[var(--crm-text-primary)] text-sm">{log.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <p className="text-[10px] text-[var(--crm-text-secondary)] font-bold uppercase">{new Date(log.created_at).toLocaleString()}</p>
                                      <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                      <p className="text-[10px] text-indigo-400 font-bold uppercase">Sent by Admin</p>
                                    </div>
                                    <p className="text-xs text-[var(--crm-text-secondary)] mt-2 line-clamp-1 max-w-md font-medium italic">"{log.message}"</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="bg-[var(--crm-surface-2)] text-[var(--crm-text-secondary)] font-bold text-[10px] uppercase border-[var(--crm-border)]">
                                    {log.target === 'all' ? 'All Platform' : (log.company?.name || 'Specific Node')}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge className={cn("text-[10px] font-black uppercase px-2 py-0 h-5", 
                                    log.type === 'info' ? 'bg-[var(--crm-accent-soft)] text-[var(--crm-accent)]' :
                                    log.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                                    'bg-emerald-50 text-emerald-600'
                                  )}>
                                    {log.type}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                  <div className="flex items-center justify-end gap-3">
                                    {log.status === 'stopped' ? (
                                      <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                                        <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                                        Stopped
                                      </div>
                                    ) : log.frequency !== 'once' ? (
                                      <div className="flex items-center gap-2">
                                        <div className="text-emerald-500 font-bold text-xs flex items-center gap-1">
                                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                          Active
                                        </div>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          onClick={() => handleToggleBroadcastStatus(log.id)}
                                          className="h-7 px-3 text-[10px] font-bold uppercase border-amber-200 text-amber-600 hover:bg-amber-50"
                                        >
                                          Stop
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Delivered
                                      </div>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setDetailsBroadcast(log)}
                                      className="h-7 w-7 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg"
                                      title="View Details"
                                    >
                                      <Info className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setPreviewBroadcast(log)}
                                      className="h-7 w-7 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                      title="Preview Broadcast"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteBroadcast(log.id)}
                                      className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                      title="Delete Broadcast"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-[var(--crm-surface-2)] border-t border-[var(--crm-border)] py-4 px-6 flex justify-between items-center">
                    <p className="text-[10px] font-black text-[var(--crm-text-secondary)] uppercase tracking-widest">Platform Sync Active</p>
                    {broadcastMeta && (
                      <PaginationSection 
                        currentPage={broadcastMeta.current_page}
                        lastPage={broadcastMeta.last_page}
                        onPageChange={setBroadcastPage}
                        totalItems={broadcastMeta.total}
                        itemsShown={broadcastHistory.length}
                      />
                    )}
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="testers" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-96">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-text-secondary)]">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    placeholder="Search testers by name, email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex h-10 w-full bg-[var(--crm-surface-1)] border border-[var(--crm-border)] rounded-xl text-sm shadow-sm pl-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--crm-accent)]"
                  />
                </div>
              </div>

              <Card className="border-none shadow-sm bg-[var(--crm-surface-1)] rounded-2xl ring-1 ring-slate-200 overflow-hidden">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-[var(--crm-surface-2)] border-b border-[var(--crm-border)]">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-bold text-[var(--crm-text-secondary)] py-4 pl-6">Tester Info</TableHead>
                        <TableHead className="font-bold text-[var(--crm-text-secondary)] py-4">Phone</TableHead>
                        <TableHead className="font-bold text-[var(--crm-text-secondary)] py-4">Requested On</TableHead>
                        <TableHead className="font-bold text-[var(--crm-text-secondary)] py-4">Status</TableHead>
                        <TableHead className="text-right font-bold text-[var(--crm-text-secondary)] py-4 pr-6">Manage Access</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-64 text-center">
                            <div className="flex flex-col items-center justify-center gap-3">
                              <Loader2 className="h-10 w-10 text-primary animate-spin" />
                              <p className="text-sm font-bold text-[var(--crm-text-secondary)] italic">Syncing tester applications...</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : testerRequests.length > 0 ? (
                        testerRequests.map((req) => (
                          <TableRow key={req.id} className="border-[var(--crm-border)]">
                            <TableCell className="py-4 pl-6">
                              <div>
                                <p className="font-bold text-sm text-[var(--crm-text-primary)]">{req.name}</p>
                                <p className="text-[10px] text-[var(--crm-accent)] font-bold">{req.email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm font-medium text-[var(--crm-text-secondary)]">{req.phone}</TableCell>
                            <TableCell className="text-xs text-[var(--crm-text-secondary)]">
                              {new Date(req.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                            </TableCell>
                            <TableCell>
                              <Badge className={cn(
                                "text-[10px] font-bold py-0.5", 
                                req.status === 'notified' ? "bg-emerald-100 text-emerald-700" : 
                                req.status === 'approved' ? "bg-blue-100 text-blue-700" : 
                                "bg-amber-100 text-amber-700"
                              )}>
                                {req.status === 'notified' ? 'Access Granted' : req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <div className="flex justify-end gap-2">
                                {req.status === 'pending' && (
                                  <Button 
                                    size="sm" 
                                    className="bg-primary hover:bg-primary/90 text-white text-[10px] font-bold h-7 rounded-lg"
                                    onClick={() => handleUpdateTesterStatus(req.id, 'approved')}
                                    disabled={isUpdatingTester}
                                  >
                                    Mark Approved
                                  </Button>
                                )}
                                {req.status === 'approved' && (
                                  <Button 
                                    size="sm" 
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold h-7 rounded-lg"
                                    onClick={() => handleUpdateTesterStatus(req.id, 'notified')}
                                    disabled={isUpdatingTester}
                                  >
                                    Mark Notified
                                  </Button>
                                )}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleUpdateTesterStatus(req.id, 'pending')}>
                                      Reset to Pending
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleUpdateTesterStatus(req.id, 'approved')}>
                                      Set Approved
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleUpdateTesterStatus(req.id, 'notified')}>
                                      Set Notified
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-64 text-center text-[var(--crm-text-secondary)] italic">
                            No tester requests found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
                {testerRequestsMeta && (
                  <CardFooter className="bg-[var(--crm-surface-2)] border-t border-[var(--crm-border)] py-4 px-6">
                    <PaginationSection
                      currentPage={testerRequestsPage}
                      lastPage={testerRequestsMeta.last_page}
                      onPageChange={setTesterRequestsPage}
                      totalItems={testerRequestsMeta.total}
                      itemsShown={testerRequests.length}
                    />
                  </CardFooter>
                )}
              </Card>
            </TabsContent>
          </Tabs>

          {/* Edit Company Modal */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-[425px] bg-[var(--crm-surface-1)] border-[var(--crm-border)] rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-black text-[var(--crm-text-primary)]">Edit Company Billing</DialogTitle>
                <DialogDescription className="text-[var(--crm-text-secondary)] font-medium">
                  Modify plan and subscription details for <strong>{editingCompany?.name}</strong>.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-[var(--crm-text-secondary)]">Plan Tier</Label>
                      <Select
                        value={editingCompany?.plan}
                        onValueChange={(val) => setEditingCompany(prev => prev ? { ...prev, plan: val as Plan } : null)}
                      >
                        <SelectTrigger className="h-11 rounded-xl bg-[var(--crm-surface-2)] border-[var(--crm-border)] font-bold">
                          <SelectValue placeholder="Select Plan" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-[var(--crm-accent)]">
                          {plans.map((p) => (
                            <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-[var(--crm-text-secondary)]">Node Status</Label>
                      <Select
                        value={editingCompany?.status}
                        onValueChange={(val) => setEditingCompany(prev => prev ? { ...prev, status: val as AccountStatus } : null)}
                      >
                        <SelectTrigger className="h-11 rounded-xl bg-[var(--crm-surface-2)] border-[var(--crm-border)] font-bold">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-[var(--crm-accent)]">
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Delinquent">Delinquent</SelectItem>
                          <SelectItem value="Suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-[var(--crm-text-secondary)]">Subscription Start</Label>
                      <Input
                        type="date"
                        value={editingCompany?.subscription_started_at ? new Date(editingCompany.subscription_started_at).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleStartDateChange(e.target.value)}
                        className="h-11 rounded-xl bg-[var(--crm-surface-2)] border-[var(--crm-border)] font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-[var(--crm-text-secondary)]">Duration (Days)</Label>
                      <Input
                        type="number"
                        value={editDays}
                        onChange={(e) => handleEditDaysChange(parseInt(e.target.value) || 0)}
                        className="h-11 rounded-xl bg-[var(--crm-surface-1)] border-[var(--crm-border)] font-black text-[var(--crm-accent)]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-[var(--crm-text-secondary)]">Auto Expiration Date</Label>
                    <Input
                      type="date"
                      value={editingCompany?.expires_at ? new Date(editingCompany.expires_at).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleEndDateChange(e.target.value)}
                      className="h-11 rounded-xl bg-[var(--crm-surface-2)] border-[var(--crm-border)] font-bold"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[var(--crm-accent-soft)] border border-indigo-100 rounded-2xl">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold text-[var(--crm-text-primary)]">Email Feature</Label>
                      <p className="text-[10px] text-[var(--crm-text-secondary)] font-medium">Enable/Disable platform email sending for this company.</p>
                    </div>
                    <Switch 
                      checked={editingCompany?.is_email_enabled ?? false} 
                      onCheckedChange={(checked) => setEditingCompany(prev => prev ? { ...prev, is_email_enabled: checked } : null)}
                      className="data-[state=checked]:bg-[var(--crm-accent)]"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl h-11 font-bold border-[var(--crm-border)]"
                  disabled={isUpdatingCompany}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateCompany}
                  className={cn("rounded-xl h-11 font-black px-8 shadow-lg transition-all",
                    isUpdatingCompany ? "bg-slate-400" : "bg-[var(--crm-accent)] hover:opacity-90 shadow-primary/20"
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
            <DialogContent className="sm:max-w-4xl rounded-3xl bg-[var(--crm-surface-1)] border-[var(--crm-border)] p-0 overflow-hidden">
              <div className="flex flex-col h-[85vh]">
                <DialogHeader className="p-6 border-b border-[var(--crm-border)] bg-[var(--crm-surface-2)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <DialogTitle className="text-2xl font-black text-[var(--crm-text-primary)]">Plan Configuration</DialogTitle>
                      <DialogDescription className="font-medium text-[var(--crm-text-secondary)]">
                        Configure pricing, marketing, and system engine for the <strong>{editingPlan?.name}</strong> tier.
                      </DialogDescription>
                    </div>
                    <Badge className={cn("px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest shadow-lg", 
                      editingPlan?.name === 'Enterprise' ? "bg-purple-600" : editingPlan?.name === 'Pro' ? "bg-primary" : "bg-slate-600"
                    )}>
                      {editingPlan?.name}
                    </Badge>
                  </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex">
                  {/* Left Column: Core Pricing & Marketing */}
                  <div className="w-[40%] border-r border-[var(--crm-border)] p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase text-[var(--crm-accent)] tracking-tighter">Core Economics</Label>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-[var(--crm-text-secondary)]">Plan Name</Label>
                          <Input
                            value={editingPlan?.name}
                            onChange={(e) => setEditingPlan((prev: PlanDefinition | null) => prev ? { ...prev, name: e.target.value as Plan } : null)}
                            className="h-11 rounded-xl bg-[var(--crm-surface-2)] border-[var(--crm-border)] font-bold"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-[var(--crm-text-secondary)]">Price (₹/mo)</Label>
                          <Input
                            type="number"
                            value={editingPlan?.price}
                            onChange={(e) => setEditingPlan((prev: PlanDefinition | null) => prev ? { ...prev, price: parseInt(e.target.value) || 0 } : null)}
                            className="h-11 rounded-xl bg-[var(--crm-surface-2)] border-[var(--crm-border)] font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-slate-50">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-black uppercase text-[var(--crm-accent)] tracking-tighter">Marketing Bullets</Label>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingPlan(p => p ? { ...p, features: [...p.features, { name: 'New Feature', included: true }] } : null)}
                          className="h-6 text-[10px] rounded-lg font-black bg-[var(--crm-accent-soft)] text-[var(--crm-accent)]"
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add Bullet
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {Array.isArray(editingPlan?.features) ? editingPlan.features.map((feat, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-[var(--crm-surface-2)] border border-[var(--crm-border)]">
                            <Input 
                              value={feat.name}
                              onChange={(e) => {
                                const newName = e.target.value;
                                setEditingPlan(prev => prev ? {
                                  ...prev,
                                  features: prev.features.map((f, idx) => idx === i ? { ...f, name: newName } : f)
                                } : null)
                              }}
                              className="h-7 text-[11px] border-none bg-transparent font-medium focus-visible:ring-0 px-1 flex-1"
                            />
                            <div className="flex items-center gap-1.5">
                              <Switch 
                                checked={feat.included} 
                                onCheckedChange={(checked) => {
                                  setEditingPlan(prev => prev ? {
                                    ...prev,
                                    features: prev.features.map((f, idx) => idx === i ? { ...f, included: checked } : f)
                                  } : null)
                                }}
                                className="scale-75"
                              />
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 text-[var(--crm-text-secondary)] hover:text-rose-500"
                                onClick={() => {
                                  setEditingPlan(prev => prev ? {
                                    ...prev,
                                    features: prev.features.filter((_, idx) => idx !== i)
                                  } : null)
                                }}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        )) : null}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: System Engine */}
                  <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar bg-[var(--crm-surface-2)]">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-[10px] font-black uppercase text-[var(--crm-accent)] tracking-tighter">System Capabilities & RBAC</Label>
                      <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter text-primary border-[var(--crm-accent)]/20 bg-[var(--crm-accent-soft)]0/5 px-2">Backend Logic</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {AVAILABLE_PLATFORM_FEATURES.map((feature) => {
                        const isEnabled = !!editingPlan?.capabilities[feature.id];
                        const activeRoles = editingPlan?.capabilities[feature.id] || [];
                        
                        return (
                          <div key={feature.id} className={cn(
                            "p-4 rounded-2xl border transition-all duration-300",
                            isEnabled 
                              ? "bg-[var(--crm-surface-1)] border-primary/20 shadow-md ring-1 ring-[var(--crm-accent)]/5" 
                              : "bg-transparent border-[var(--crm-border)] opacity-60 grayscale"
                          )}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-3 h-3 rounded-full",
                                  isEnabled ? "bg-[var(--crm-accent-soft)]0 shadow-[0_0_10px_rgba(99,102,241,0.5)]" : "bg-slate-300"
                                )} />
                                <span className="text-sm font-black text-slate-800 tracking-tight">{feature.label}</span>
                              </div>
                              <Switch 
                                checked={isEnabled}
                                onCheckedChange={(checked) => {
                                  setEditingPlan(prev => {
                                    if (!prev) return null;
                                    const newCaps = { ...prev.capabilities };
                                    if (checked) {
                                      newCaps[feature.id] = ['*'];
                                    } else {
                                      delete newCaps[feature.id];
                                    }
                                    return { ...prev, capabilities: newCaps };
                                  });
                                }}
                              />
                            </div>
                            
                            {isEnabled && (
                              <div className="pt-3 border-t border-slate-50 space-y-3">
                                <div className="flex items-center justify-between">
                                  <Label className="text-[10px] font-bold uppercase text-[var(--crm-text-secondary)]">Restricted Roles</Label>
                                  <span className="text-[10px] text-primary font-bold">{activeRoles.includes('*') ? "Global Access" : `${activeRoles.length} Roles`}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Badge 
                                    variant={activeRoles.includes('*') ? "default" : "outline"}
                                    className="text-[10px] py-1 px-3 cursor-pointer rounded-lg font-black transition-all"
                                    onClick={() => {
                                      setEditingPlan(prev => {
                                        if (!prev) return null;
                                        const newCaps = { ...prev.capabilities };
                                        newCaps[feature.id] = ['*'];
                                        return { ...prev, capabilities: newCaps };
                                      });
                                    }}
                                  >
                                    Everyone (*)
                                  </Badge>
                                  {PLATFORM_ROLES.map(role => (
                                    <Badge 
                                      key={role}
                                      variant={activeRoles.includes(role) && !activeRoles.includes('*') ? "default" : "outline"}
                                      className="text-[10px] py-1 px-3 cursor-pointer rounded-lg font-bold transition-all"
                                      onClick={() => {
                                        setEditingPlan(prev => {
                                          if (!prev) return null;
                                          const newCaps = { ...prev.capabilities };
                                          let roles = [...(newCaps[feature.id] || [])].filter(r => r !== '*');
                                          if (roles.includes(role)) {
                                            roles = roles.filter(r => r !== role);
                                          } else {
                                            roles.push(role);
                                          }
                                          if (roles.length === 0) roles = ['*'];
                                          newCaps[feature.id] = roles;
                                          return { ...prev, capabilities: newCaps };
                                        });
                                      }}
                                    >
                                      {role}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <DialogFooter className="p-6 border-t border-[var(--crm-border)] bg-[var(--crm-surface-2)] flex items-center justify-end gap-3">
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsPlanModalOpen(false)} 
                    className="rounded-xl h-11 font-bold text-[var(--crm-text-secondary)] hover:bg-[var(--crm-surface-3)]" 
                    disabled={isUpdatingPlan}
                  >
                    Discard Changes
                  </Button>
                  <Button
                    onClick={handleSavePlan}
                    className="rounded-xl h-11 font-black bg-[var(--crm-accent)] hover:opacity-90 text-white px-10 shadow-xl shadow-primary/20"
                    disabled={isUpdatingPlan}
                  >
                    {isUpdatingPlan ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Synchronizing...
                      </>
                    ) : "Save Plan Engine"}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

          {/* Manual Renewal Modal */}
          <Dialog open={renewModal.isOpen} onOpenChange={(open) => setRenewModal({ ...renewModal, isOpen: open })}>
            <DialogContent className="sm:max-w-md rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-black">Manual License Extension</DialogTitle>
                <DialogDescription className="font-medium text-[var(--crm-text-secondary)]">
                  Prolonging platform access for <strong>{renewModal.companyName}</strong>.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-[var(--crm-text-secondary)]">Extension Duration (Days)</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={renewModal.days}
                      onChange={(e) => setRenewModal({ ...renewModal, days: parseInt(e.target.value) || 0 })}
                      className="h-11 rounded-xl bg-[var(--crm-surface-2)] border-[var(--crm-border)] pl-10 font-black"
                    />
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--crm-text-secondary)]" />
                  </div>
                  <p className="text-[10px] text-[var(--crm-text-secondary)] font-medium italic">* To reduce duration, use negative values.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-[var(--crm-text-secondary)]">Audit Notes (Optional)</Label>
                  <Input
                    placeholder="e.g., Client loyalty credit, Backdated activation..."
                    value={renewModal.notes}
                    onChange={(e) => setRenewModal({ ...renewModal, notes: e.target.value })}
                    className="h-11 rounded-xl bg-[var(--crm-surface-1)] border-[var(--crm-border)] text-sm"
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
            <DialogContent className="sm:max-w-[700px] border-[var(--crm-border)] rounded-3xl overflow-hidden p-0 shadow-2xl">
              <div className="p-6 bg-[var(--crm-accent)] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-[var(--crm-surface-1)]/5 blur-3xl"></div>
                <div className="relative z-10">
                  <DialogTitle className="text-xl font-black flex items-center gap-2">
                    <History className="h-5 w-5 text-indigo-400" />
                    Subscription Audit Trail
                  </DialogTitle>
                  <p className="text-[10px] text-[var(--crm-text-secondary)] font-bold uppercase tracking-widest mt-1">Workspace: {historyModal.companyName}</p>
                </div>
              </div>

              <div className="max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader className="bg-[var(--crm-surface-2)] sticky top-0 z-10 border-b border-[var(--crm-border)]">
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
                        <TableRow key={log.id} className="hover:bg-[var(--crm-surface-3)] transition-colors">
                          <TableCell className="text-xs font-bold text-[var(--crm-text-secondary)] py-4 pl-6">
                            {new Date(log.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("text-[8px] font-black uppercase px-2",
                              log.type === 'RENEWAL' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                log.type === 'ADJUSTMENT' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-[var(--crm-surface-2)] text-[var(--crm-text-secondary)]'
                            )}>
                              {log.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs font-bold text-[var(--crm-text-primary)]">
                            {log.processor?.name || 'System Auto'}
                          </TableCell>
                          <TableCell className="text-xs font-black text-[var(--crm-accent)]">
                            {log.new_expiry ? new Date(log.new_expiry).toLocaleDateString() : '—'}
                          </TableCell>
                          <TableCell className="text-[10px] text-[var(--crm-text-secondary)] font-medium pr-6 max-w-[200px] truncate italic">
                            {log.notes || 'No narrative provided.'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="p-4 bg-[var(--crm-surface-2)] border-t border-[var(--crm-border)] flex justify-between items-center px-6">
                <p className="text-[10px] text-[var(--crm-text-secondary)] font-bold uppercase">End of audit log</p>
                <Button onClick={() => setHistoryModal({ ...historyModal, isOpen: false })} className="rounded-xl font-bold bg-[var(--crm-accent)] px-8 h-10">Close Audit</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* User Permission Modal */}
          <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
            <DialogContent className="sm:max-w-md rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-black text-[var(--crm-text-primary)]">User Permissions</DialogTitle>
                <DialogDescription className="font-medium text-[var(--crm-text-secondary)]">
                  Modify role and access status for <strong>{editingUser?.name}</strong>.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-[var(--crm-text-secondary)]">System Role</Label>
                    <Select
                      value={editingUser?.role}
                      onValueChange={(val: string) => setEditingUser((prev: AdminUser | null) => prev ? { ...prev, role: val } : null)}
                    >
                      <SelectTrigger className="h-11 rounded-xl bg-[var(--crm-surface-2)] border-[var(--crm-border)]">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Super Admin">Super Admin</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Agent">Agent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-[var(--crm-text-secondary)]">Account Status</Label>
                    <Select
                      value={editingUser?.status}
                      onValueChange={(val: string) => setEditingUser((prev: AdminUser | null) => prev ? { ...prev, status: val } : null)}
                    >
                      <SelectTrigger className="h-11 rounded-xl bg-[var(--crm-surface-2)] border-[var(--crm-border)]">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase text-[var(--crm-text-secondary)]">User Tags</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--crm-text-secondary)]" />
                        <Input
                          placeholder="Type and press Enter to add..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newTag.trim() && editingUser) {
                                const tag = newTag.trim();
                                const tags = editingUser.tags || [];
                                if (!tags.includes(tag)) {
                                  setEditingUser({ ...editingUser, tags: [...tags, tag] });
                                }
                                setNewTag('');
                              }
                            }
                          }}
                          className="h-10 rounded-xl bg-[var(--crm-surface-1)] border-[var(--crm-border)] pl-9 font-medium"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[44px] p-2.5 rounded-2xl bg-[var(--crm-surface-2)] border border-[var(--crm-border)]">
                      {editingUser?.tags && editingUser.tags.length > 0 ? editingUser.tags.map((tag, idx) => (
                        <Badge key={idx} className="bg-[var(--crm-accent-soft)] text-primary border-indigo-100 px-3 py-1 rounded-full group font-bold text-[10px] uppercase tracking-wide">
                          {tag}
                          <X
                            className="h-3 w-3 ml-2 cursor-pointer hover:text-red-500 transition-colors"
                            onClick={() => {
                              if (editingUser) {
                                setEditingUser({
                                  ...editingUser,
                                  tags: editingUser.tags?.filter(t => t !== tag)
                                });
                              }
                            }}
                          />
                        </Badge>
                      )) : (
                        <div className="flex items-center justify-center w-full py-2">
                          <p className="text-[10px] text-[var(--crm-text-secondary)] font-bold uppercase tracking-widest italic">No tags assigned</p>
                        </div>
                      )}
                    </div>

                    {/* Tag Suggestions */}
                    {globalTags.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-[var(--crm-text-secondary)] tracking-widest">Library Suggestions</Label>
                        <div className="flex flex-wrap gap-1.5">
                          {globalTags
                            .filter(tag => !editingUser?.tags?.includes(tag))
                            .slice(0, 10)
                            .map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => {
                                  if (editingUser) {
                                    const tags = editingUser.tags || [];
                                    setEditingUser({ ...editingUser, tags: [...tags, tag] });
                                  }
                                }}
                                className="text-[9px] px-2.5 py-1 rounded-lg bg-[var(--crm-accent-soft)]/50 text-[var(--crm-accent)] border border-indigo-100/50 hover:bg-primary/20:bg-indigo-900/40 transition-all font-black uppercase"
                              >
                                + {tag}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => setIsUserModalOpen(false)}
                  className="rounded-xl font-bold h-11 border-transparent"
                  disabled={isUpdatingUser}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateUser}
                  className="rounded-xl font-black bg-[var(--crm-accent)] hover:opacity-90 text-white shadow-lg shadow-primary/20 px-8 h-11 transition-all active:scale-95"
                  disabled={isUpdatingUser}
                >
                  {isUpdatingUser ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : "Save Permissions"}
                </Button>
              </DialogFooter>
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

          {/* Preview Broadcast Modal */}
          {previewBroadcast && (
            <PromotionModal
              notifications={[{
                id: previewBroadcast.id,
                title: previewBroadcast.title,
                message: previewBroadcast.message,
                data: {
                  category: previewBroadcast.category,
                  cta_link: previewBroadcast.cta_link,
                  cta_text: previewBroadcast.cta_text,
                  image_url: previewBroadcast.image_url,
                  allow_snooze: previewBroadcast.allow_snooze
                }
              }]}
              onClose={() => setPreviewBroadcast(null)}
              onMarkAsRead={() => setPreviewBroadcast(null)}
            />
          )}

          {/* Broadcast Details Modal */}
          <Dialog open={!!detailsBroadcast} onOpenChange={(open) => !open && setDetailsBroadcast(null)}>
            <DialogContent className="max-w-md bg-[var(--crm-surface-1)] border border-[var(--crm-border)]">
              <DialogHeader>
                <DialogTitle className="text-xl font-black text-[var(--crm-text-primary)]">Broadcast Details</DialogTitle>
                <DialogDescription className="text-[var(--crm-text-secondary)] font-medium">
                  Configuration and metadata for this broadcast.
                </DialogDescription>
              </DialogHeader>
              
              {detailsBroadcast && (
                <div className="space-y-4 py-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-[var(--crm-text-tertiary)] uppercase mb-1">Status</p>
                      <Badge variant="outline" className={cn("text-[10px] font-black uppercase px-2 py-0 h-5",
                        detailsBroadcast.status === 'stopped' ? 'bg-slate-50 text-slate-500' :
                        detailsBroadcast.frequency === 'once' ? 'bg-emerald-50 text-emerald-600' :
                        'bg-emerald-50 text-emerald-500 border-emerald-200'
                      )}>
                        {detailsBroadcast.status === 'stopped' ? 'Stopped' : (detailsBroadcast.frequency === 'once' ? 'Delivered' : 'Active')}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[var(--crm-text-tertiary)] uppercase mb-1">Type / Category</p>
                      <Badge variant="outline" className="bg-[var(--crm-surface-2)] text-[var(--crm-text-secondary)] font-bold text-[10px] uppercase border-[var(--crm-border)]">
                        {detailsBroadcast.type} / {detailsBroadcast.category || 'Announcement'}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-[var(--crm-text-tertiary)] uppercase mb-1">Target Audience</p>
                    <div className="text-sm font-medium text-[var(--crm-text-primary)]">
                      {detailsBroadcast.target === 'all' ? 'All Platform Workspaces' : (detailsBroadcast.company?.name || 'Specific Node')}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-[var(--crm-text-tertiary)] uppercase mb-1">Frequency</p>
                    <div className="text-sm font-medium text-[var(--crm-text-primary)] capitalize">
                      {detailsBroadcast.frequency}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-[10px] font-bold text-[var(--crm-text-tertiary)] uppercase mb-1">Modal Type</p>
                    <div className="text-sm font-medium text-[var(--crm-text-primary)]">
                      {detailsBroadcast.is_modal ? 'Center Screen Modal' : 'Notification Bell Only'}
                    </div>
                  </div>

                  {(detailsBroadcast.cta_text || detailsBroadcast.cta_link) && (
                    <div className="bg-[var(--crm-surface-2)] p-3 rounded-lg border border-[var(--crm-border)]">
                      <p className="text-[10px] font-bold text-[var(--crm-text-tertiary)] uppercase mb-2">Call to Action Configuration</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-[var(--crm-text-secondary)] font-medium">Text:</span> {detailsBroadcast.cta_text || '—'}</div>
                        <div className="truncate"><span className="text-[var(--crm-text-secondary)] font-medium">Link:</span> {detailsBroadcast.cta_link ? <a href={detailsBroadcast.cta_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{detailsBroadcast.cta_link}</a> : '—'}</div>
                      </div>
                    </div>
                  )}

                  {detailsBroadcast.expires_at && (
                    <div>
                      <p className="text-[10px] font-bold text-[var(--crm-text-tertiary)] uppercase mb-1">Expiration Date</p>
                      <div className="text-sm font-medium text-[var(--crm-text-primary)]">
                        {new Date(detailsBroadcast.expires_at).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailsBroadcast(null)} className="h-9 font-bold">
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </RoleGuard>
  )
}
