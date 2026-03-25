'use client'

import React, { useState, useEffect } from 'react'
import { agencyApi } from '@/lib/api'
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  Eye,
  EyeOff,
  Users, 
  Building2, 
  Plus, 
  Search, 
  TrendingUp, 
  ExternalLink,
  Briefcase,
  UserPlus2,
  PieChart,
  Trash2,
  RefreshCw,
  Calendar,
  History,
  Clock
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { RoleGuard } from '@/components/RoleGuard'
import { useRouter } from 'next/navigation'
import { setSession } from '@/lib/auth'
import { ConfirmationModal } from '@/components/shared/ConfirmationModal'

export default function AgencyPortalPage() {
  const [clients, setClients] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [onboardingResult, setOnboardingResult] = useState<{ link: string | null; email: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, clientId: 0, clientName: '' })
  const [renewModal, setRenewModal] = useState({ isOpen: false, clientId: 0, clientName: '' })
  const [historyModal, setHistoryModal] = useState({ isOpen: false, clientId: 0, clientName: '', logs: [] as any[] })
  const [newClient, setNewClient] = useState({
    company_name: '',
    owner_name: '',
    owner_email: '',
    password: '',
    plan: 'Pro'
  })
  
  const { toast } = useToast()
  const router = useRouter()

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [clientsData, statsData] = await Promise.all([
        agencyApi.getClients(),
        agencyApi.getStats()
      ])
      setClients(clientsData)
      setStats(statsData)
    } catch (error: any) {
      toast({
        title: "Connection Error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleOpenPanel = async (clientId: number) => {
    try {
      toast({ title: "Opening Client Portal", description: "Switching workspace context..." })
      
      // Store current agency token so we can return later
      const currentToken = localStorage.getItem('token')
      if (currentToken) {
        localStorage.setItem('admin_token', currentToken)
      }

      const { token } = await agencyApi.loginAsClient(clientId)
      setSession(token)
      // Force reload to refresh context/permission state
      window.location.href = '/dashboard'
    } catch (error: any) {
      toast({
        title: "Access Failed",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleDeleteClient = async () => {
    const { clientId, clientName } = deleteModal
    try {
      toast({ title: "Deleting...", description: `Removing ${clientName} portfolio...` })
      await agencyApi.deleteClient(clientId)
      toast({ title: "Client Deleted", description: `${clientName} has been removed.` })
      setDeleteModal({ ...deleteModal, isOpen: false })
      fetchData()
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleRenewClient = async () => {
    const { clientId, clientName } = renewModal
    try {
      toast({ title: "Renewing...", description: `Extending ${clientName}'s subscription...` })
      await agencyApi.renewClient(clientId)
      toast({ title: "Success! 🎉", description: "Plan extended for 30 days." })
      setRenewModal({ ...renewModal, isOpen: false })
      fetchData()
    } catch (error: any) {
      toast({
        title: "Renewal Failed",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleViewHistory = async (id: number, name: string) => {
    try {
      const logs = await agencyApi.getClientHistory(id)
      setHistoryModal({ isOpen: true, clientId: id, clientName: name, logs })
    } catch (error: any) {
      toast({
        title: "Load Failed",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleOnboard = async () => {
    try {
      toast({ title: "Processing...", description: "Creating dedicated workspace..." })
      const result = await agencyApi.onboardClient(newClient)
      
      if (result.invitation_link) {
        setOnboardingResult({
          link: result.invitation_link,
          email: newClient.owner_email
        })
      } else {
        toast({
          title: "Setup Complete! 🎉",
          description: `${newClient.company_name} was onboarded. Login details sent to ${newClient.owner_email}`,
        })
        setIsOnboardingOpen(false)
      }
      
      // Reset form
      setNewClient({
        company_name: '',
        owner_name: '',
        owner_email: '',
        password: '',
        plan: 'Pro'
      })
      fetchData()
    } catch (error: any) {
      toast({
        title: "Onboarding Failed",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.owner?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <RoleGuard allowedTypes={['agency', 'super_admin']}>
      <div className="flex flex-col min-h-screen bg-slate-50/50 dark:bg-slate-950/20 p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-indigo-600" />
              Agency Management Center
            </h1>
            <p className="text-sm text-slate-500 font-medium">Oversee your client portfolio and performance metrics</p>
          </div>

          <Dialog open={isOnboardingOpen} onOpenChange={(open) => {
            setIsOnboardingOpen(open);
            if (!open) setOnboardingResult(null);
          }}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02]">
                <UserPlus2 className="h-4 w-4 mr-2" /> Onboard New Client
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] rounded-3xl p-6 border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-black tracking-tight">Onboard Individual Client</DialogTitle>
                <DialogDescription className="text-slate-500 font-medium italic">
                  Create a dedicated workspace for your new customer.
                </DialogDescription>
              </DialogHeader>

              {onboardingResult ? (
                <div className="space-y-4 py-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 text-center space-y-2">
                     <p className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">Success! Client Onboarded.</p>
                     <p className="text-xs text-slate-500 uppercase font-black">Share this setup link with {onboardingResult.email}</p>
                  </div>
                  <div className="space-y-2">
                    <Input 
                      readOnly 
                      value={onboardingResult.link || ''}
                      className="h-11 rounded-xl bg-slate-50 border-slate-200 font-mono text-[10px]"
                    />
                    <Button 
                      onClick={() => {
                        navigator.clipboard.writeText(onboardingResult.link || '');
                        toast({ title: "Copied!", description: "Invitation link copied to clipboard." });
                      }}
                      className="w-full bg-slate-900 text-white rounded-xl h-11 font-bold"
                    >
                      Copy Link & Close
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Business Name</Label>
                      <Input 
                        placeholder="e.g. Realty Hub Chennai" 
                        value={newClient.company_name}
                        onChange={(e) => setNewClient({...newClient, company_name: e.target.value})}
                        className="h-11 rounded-xl bg-slate-50 border-slate-200"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-slate-500">Owner Name</Label>
                        <Input 
                          placeholder="Full Name" 
                          value={newClient.owner_name}
                          onChange={(e) => setNewClient({...newClient, owner_name: e.target.value})}
                          className="h-11 rounded-xl bg-slate-50 border-slate-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-slate-500">Tier</Label>
                        <Input 
                          placeholder="Pro / Starter" 
                          value={newClient.plan}
                          onChange={(e) => setNewClient({...newClient, plan: e.target.value})}
                          className="h-11 rounded-xl bg-slate-50 border-slate-200"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Email Address</Label>
                      <Input 
                        placeholder="client@email.com" 
                        value={newClient.owner_email}
                        onChange={(e) => setNewClient({...newClient, owner_email: e.target.value})}
                        className="h-11 rounded-xl bg-slate-50 border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-bold uppercase text-slate-500">Password (Optional)</Label>
                        <span className="text-[10px] text-slate-400 font-medium">Leave empty for setup link</span>
                      </div>
                      <div className="relative group/pass">
                        <Input 
                          type={showPassword ? "text" : "password"}
                          placeholder="Assign a password directly" 
                          value={newClient.password}
                          onChange={(e) => setNewClient({...newClient, password: e.target.value})}
                          className="h-11 rounded-xl bg-slate-50 border-slate-200 pr-10"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" className="rounded-xl h-11 font-bold text-slate-400" onClick={() => setIsOnboardingOpen(false)}>Cancel</Button>
                    <Button onClick={handleOnboard} className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-black rounded-xl h-11 px-8 shadow-xl">Complete Onboarding</Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: 'Managed Clients', value: stats?.total_clients || '0', icon: Building2, color: 'indigo', sub: 'Total onboarded orgs' },
            { label: 'Total Leads Managed', value: stats?.total_leads_managed || '0', icon: TrendingUp, color: 'emerald', sub: 'Aggregate across all clients' },
            { label: 'Portfolio Engagement', value: stats?.active_chats || '0', icon: PieChart, color: 'blue', sub: 'Live chat sessions active' }
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-sm rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden group">
              <CardContent className="p-6 relative">
                <div className={cn("absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full blur-3xl opacity-10", `bg-${stat.color}-500 group-hover:opacity-20 transition-opacity`)} />
                <div className="flex justify-between items-start mb-4">
                  <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", `bg-${stat.color}-50 text-${stat.color}-600 dark:bg-${stat.color}-950/30 dark:text-${stat.color}-400`)}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{stat.value}</p>
                  <p className="text-[10px] text-slate-400 font-medium italic">{stat.sub}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Clients Table */}
        <Card className="border-none shadow-sm rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
          <CardHeader className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between pb-6">
            <div>
              <CardTitle className="text-lg font-bold">Client Portfolio</CardTitle>
              <CardDescription>Direct management of Individual accounts</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search clients..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-10 rounded-xl bg-slate-50 border-slate-200 text-sm shadow-inner"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                <TableRow>
                  <TableHead className="font-bold py-5 pl-6 text-xs uppercase text-slate-500">Client / Owner</TableHead>
                  <TableHead className="font-bold py-5 text-xs uppercase text-slate-500">Plan & Expiry</TableHead>
                  <TableHead className="font-bold py-5 text-xs uppercase text-slate-500 text-center">Managed Leads</TableHead>
                  <TableHead className="font-bold py-5 text-xs uppercase text-slate-500">Status</TableHead>
                  <TableHead className="text-right py-5 pr-6 font-bold text-xs uppercase text-slate-500">Quick Access</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [1,2,3].map(i => (
                    <TableRow key={i}>
                      <TableCell colSpan={5} className="h-16 animate-pulse bg-slate-50/50" />
                    </TableRow>
                  ))
                ) : filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                        <Users className="h-12 w-12" />
                        <p className="font-bold text-base">You haven't onboarded any clients yet.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredClients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-indigo-50/30 dark:hover:bg-slate-800/30 transition-colors">
                    <TableCell className="py-5 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-black text-slate-600 dark:text-slate-400 text-xs">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">{client.name}</p>
                          <p className="text-[11px] text-slate-500">{client.owner?.name || 'Unassigned'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 border-indigo-100">
                          {client.plan}
                        </Badge>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                          <Calendar className="h-3 w-3" />
                          {client.expires_at ? new Date(client.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-bold text-slate-800 dark:text-white tabular-nums">
                        {client.leads_count || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-[10px] font-bold px-2 py-0.5", client.status === 'Active' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button 
                          onClick={() => handleOpenPanel(client.id)}
                          variant="ghost" 
                          size="sm" 
                          className="h-9 rounded-xl text-xs font-black hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 text-indigo-600 dark:text-indigo-400"
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-2" /> Open
                        </Button>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                onClick={() => handleViewHistory(client.id, client.name)}
                                variant="ghost" 
                                size="sm" 
                                className="h-9 w-9 rounded-xl text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
                              >
                                <History className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View History</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                onClick={() => setRenewModal({ isOpen: true, clientId: client.id, clientName: client.name })}
                                variant="ghost" 
                                size="sm" 
                                className="h-9 w-9 rounded-xl text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-colors"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Renew Subscription (30d)</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Button 
                          onClick={() => setDeleteModal({ isOpen: true, clientId: client.id, clientName: client.name })}
                          variant="ghost" 
                          size="sm" 
                          className="h-9 w-9 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 py-4 px-6">
            <p className="text-[10px] text-slate-400 font-medium">Data is isolated to your agency and sub-companies. Only you can access client dashboards.</p>
          </CardFooter>
        </Card>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal 
          isOpen={deleteModal.isOpen}
          onOpenChange={(open) => setDeleteModal({ ...deleteModal, isOpen: open })}
          onConfirm={handleDeleteClient}
          variant="destructive"
          title="Delete Client Portfolio"
          description={`Are you sure you want to delete ${deleteModal.clientName}? This will permanently remove their workspace, leads, and all associated data.`}
          confirmText="Yes, Delete Client"
        />

        {/* Renew Confirmation Modal */}
        <ConfirmationModal 
          isOpen={renewModal.isOpen}
          onOpenChange={(open) => setRenewModal({ ...renewModal, isOpen: open })}
          onConfirm={handleRenewClient}
          variant="success"
          title="Extend Client Access"
          description={`Are you sure you want to extend ${renewModal.clientName}'s subscription? This will add 30 days to their current plan.`}
          confirmText="Renew Plan"
        />

        {/* History Modal */}
        <Dialog open={historyModal.isOpen} onOpenChange={(open) => setHistoryModal({ ...historyModal, isOpen: open })}>
          <DialogContent className="sm:max-w-[600px] border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden p-0">
            <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              <DialogTitle className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <History className="h-5 w-5 text-indigo-500" />
                Subscription History
              </DialogTitle>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{historyModal.clientName}</p>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-900 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="text-[10px] uppercase font-black">Date</TableHead>
                    <TableHead className="text-[10px] uppercase font-black">Event</TableHead>
                    <TableHead className="text-[10px] uppercase font-black">Plan</TableHead>
                    <TableHead className="text-[10px] uppercase font-black">New Expiry</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyModal.logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-slate-400 font-bold text-sm">No transactions found.</TableCell>
                    </TableRow>
                  ) : (
                    historyModal.logs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <TableCell className="text-xs font-bold text-slate-600 dark:text-slate-400">
                          {new Date(log.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[9px] font-black uppercase">
                            {log.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-black text-slate-800 dark:text-white">{log.plan_name}</TableCell>
                        <TableCell className="text-xs font-bold text-slate-500">
                          {log.new_expiry ? new Date(log.new_expiry).toLocaleDateString() : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 text-right">
              <Button onClick={() => setHistoryModal({ ...historyModal, isOpen: false })} className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 h-10 shadow-indigo-200">Close history</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  )
}
