'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Shield, Users, Mail, UserPlus, MoreVertical, Star, ShieldCheck, User, Trash2, Edit, CheckCircle2, XCircle, Info, AlertCircle, Search } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { teamApi } from '@/lib/api'
import { RoleGuard } from '@/components/RoleGuard'
import { handleError } from '@/utils/handleError'
import { getAgentColor } from '@/utils/agentColors'
import { PageHeader } from '@/components/page-header/PageHeader'

type Role = 'Admin' | 'Manager' | 'Agent'

interface TeamMember {
  id: string
  name: string
  email: string
  role: Role
  status: 'Active' | 'Invited' | 'Suspended'
  lastActive: string
}

interface Permission {
  name: string
  description: string
  admin: boolean
  manager: boolean
  agent: boolean
}

const permissions: Permission[] = [
  { name: 'Dashboard Access', description: 'View performance metrics (Agents see personal stats only)', admin: true, manager: true, agent: true },
  { name: 'Lead Management', description: 'Access assigned leads and update stages', admin: true, manager: true, agent: true },
  { name: 'Bulk Operations', description: 'Delete, export or update multiple leads at once', admin: true, manager: true, agent: false },
  { name: 'Team Settings', description: 'Invite, remove and manage team member roles', admin: true, manager: false, agent: false },
  { name: 'Integration Setup', description: 'Connect Facebook, WhatsApp and other services', admin: true, manager: false, agent: false },
  { name: 'Billing & Invoices', description: 'Manage subscription and view payment history', admin: true, manager: false, agent: false },
  { name: 'Reports Generation', description: 'Generate and download advanced performance reports', admin: true, manager: true, agent: false },
  { name: 'Live Chat Support', description: 'Respond to leads via live chat and chatbot', admin: true, manager: true, agent: true },
]

export default function TeamManagementPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<Role>('Agent')
  const [isInviting, setIsInviting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMembers = async () => {
    try {
      setIsLoading(true)
      const data = await teamApi.getMembers()
      setMembers(data)
    } catch (error: any) {
      handleError(error, { title: 'Failed to fetch team members' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const handleInvite = async () => {
    if (!inviteEmail) return
    try {
      setError(null)
      setIsInviting(true)
      await teamApi.inviteMember({ email: inviteEmail, role: inviteRole })
      setIsInviteModalOpen(false)
      setInviteEmail('')
      setInviteRole('Agent')
      toast.success(`An invitation has been sent to ${inviteEmail}`)
      fetchMembers()
    } catch (error: any) {
      handleError(error, { title: 'Invitation Failed' })
    } finally {
      setIsInviting(false)
    }
  }

  const handleUpdateRole = async () => {
    if (!editingMember) return
    try {
      setError(null)
      setIsUpdating(true)
      await teamApi.updateRole(editingMember.id, editingMember.role)
      setIsEditModalOpen(false)
      setEditingMember(null)
      toast.success("Member role has been successfully changed.")
      fetchMembers()
    } catch (error: any) {
      handleError(error, { title: 'Role Update Failed' })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await teamApi.removeMember(id)
      toast.success("The team member has been successfully removed.")
      fetchMembers()
    } catch (error: any) {
      handleError(error, { title: 'Removal Failed' })
    }
  }

  const handleResendInvite = async (id: string) => {
    try {
      await teamApi.resendInvite(id)
      toast.success("Invitation has been resent successfully.")
    } catch (error: any) {
      handleError(error, { title: 'Failed to resend invitation' })
    }
  }

  const filteredMembers = members.filter(m => 
    (m.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (m.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'Admin':
        return (
          <Badge className="border-none rounded-full px-2.5 py-0.5 font-semibold text-white text-[11px] bg-purple-600 shadow-xs flex w-fit items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            Admin
          </Badge>
        )
      case 'Manager':
        return (
          <Badge className="border-none rounded-full px-2.5 py-0.5 font-semibold text-white text-[11px] bg-amber-500 shadow-xs flex w-fit items-center gap-1">
            <Star className="h-3 w-3" />
            Manager
          </Badge>
        )
      case 'Agent':
        return (
          <Badge className="border-none rounded-full px-2.5 py-0.5 font-semibold text-white text-[11px] bg-blue-600 shadow-xs flex w-fit items-center gap-1">
            <User className="h-3 w-3" />
            Agent
          </Badge>
        )
    }
  }

  return (
    <RoleGuard allowedFeatures={['team_management']}>
      <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full pb-10 font-sans">
        
        {/* Header Bar */}
        <PageHeader
          title="Team Management"
          description="Manage organization members, assign roles, and configure access permissions"
          icon={<Users className="h-6 w-6 text-[var(--crm-accent)]" />}
          actions={
            <Dialog open={isInviteModalOpen} onOpenChange={(v) => {
              setIsInviteModalOpen(v)
              if (!v) setError(null)
            }}>
              <DialogTrigger asChild>
                {/* TODO: Migrate raw button to shared <Button> component later (complex styling) */}
                <button className="w-full sm:w-auto px-4 py-2 bg-[#E84C3A] hover:bg-[#d8402f] text-white font-semibold text-xs rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer">
                  <UserPlus className="h-4 w-4 shrink-0" />
                  <span>Invite Member</span>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] rounded-2xl border-slate-200 dark:border-slate-800">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold font-heading">Invite Team Member</DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                    Send an email invitation to add a colleague to your workspace.
                  </DialogDescription>
                </DialogHeader>

                {error && (
                  <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-850 p-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                    <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                <div className="grid gap-4 py-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address</Label>
                    <Input 
                      id="email" 
                      placeholder="colleague@company.com" 
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="role" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Assign Role</Label>
                    <Select value={inviteRole} onValueChange={(v: Role) => setInviteRole(v)}>
                      <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-medium">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700">
                        <SelectItem value="Admin" className="rounded-lg">
                          <div className="flex items-center gap-2 py-0.5">
                            <ShieldCheck className="h-4 w-4 text-purple-600" />
                            <div className="text-left">
                              <p className="font-semibold text-xs">Admin</p>
                              <p className="text-[10px] text-slate-400">Full workspace and billing control</p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="Manager" className="rounded-lg">
                          <div className="flex items-center gap-2 py-0.5">
                            <Star className="h-4 w-4 text-amber-500" />
                            <div className="text-left">
                              <p className="font-semibold text-xs">Manager</p>
                              <p className="text-[10px] text-slate-400">Manage leads, representatives & reports</p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="Agent" className="rounded-lg">
                          <div className="flex items-center gap-2 py-0.5">
                            <User className="h-4 w-4 text-blue-600" />
                            <div className="text-left">
                              <p className="font-semibold text-xs">Agent</p>
                              <p className="text-[10px] text-slate-400">Access assigned leads and communications only</p>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter className="mt-4 gap-2">
                  <Button variant="ghost" onClick={() => setIsInviteModalOpen(false)} className="rounded-xl h-9 text-xs font-medium" disabled={isInviting}>Cancel</Button>
                  <Button onClick={handleInvite} className="rounded-xl h-9 text-xs font-semibold bg-[#E84C3A] hover:bg-[#d8402f] text-white px-5 shadow-xs" disabled={!inviteEmail || isInviting}>
                    {isInviting ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          }
        />

        {/* Quick KPI Strip (Unified Summary Bar) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm">
          <div className="flex items-center gap-3 p-2">
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-600 text-white shadow-xs shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Members</span>
              <span className="text-xl font-bold font-heading text-slate-900 dark:text-white tabular-nums">{members.length}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-purple-600 text-white shadow-xs shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Admins</span>
              <span className="text-xl font-bold font-heading text-slate-900 dark:text-white tabular-nums">{members.filter(m => m.role === 'Admin').length}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-indigo-600 text-white shadow-xs shrink-0">
              <User className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Agents</span>
              <span className="text-xl font-bold font-heading text-slate-900 dark:text-white tabular-nums">{members.filter(m => m.role === 'Agent').length}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-amber-500 text-white shadow-xs shrink-0">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Pending</span>
              <span className="text-xl font-bold font-heading text-slate-900 dark:text-white tabular-nums">{members.filter(m => m.status === 'Invited').length}</span>
            </div>
          </div>
        </div>

        {/* Tabs: Directory & Roles */}
        <Tabs defaultValue="directory" className="space-y-4 w-full">
          <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl h-auto flex flex-row border border-slate-200 dark:border-slate-700 w-full sm:w-fit shrink-0">
            <TabsTrigger value="directory" className="flex-1 sm:flex-none rounded-lg px-5 py-1.5 text-xs font-semibold font-heading data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-xs transition-all">
              <Users className="h-3.5 w-3.5 mr-1.5 shrink-0" />
              <span>Directory</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex-1 sm:flex-none rounded-lg px-5 py-1.5 text-xs font-semibold font-heading data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-xs transition-all">
              <Shield className="h-3.5 w-3.5 mr-1.5 shrink-0" />
              <span>Roles & Permissions</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="directory" className="space-y-4">
            {/* Members Directory Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60 py-3.5 px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="text-sm font-bold font-heading text-slate-900 dark:text-white">Active Members</h2>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input 
                    placeholder="Search by name or email..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8.5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium pl-8.5 shadow-xs"
                  />
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="bg-slate-50/80 dark:bg-slate-850/80 border-b border-slate-200/80 dark:border-slate-800">
                    <TableRow>
                      <TableHead className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] py-3.5 pl-6">Member</TableHead>
                      <TableHead className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] py-3.5">Role</TableHead>
                      <TableHead className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] py-3.5">Status</TableHead>
                      <TableHead className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] py-3.5">Last Active</TableHead>
                      <TableHead className="text-right font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] py-3.5 pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredMembers.length > 0 ? (
                      filteredMembers.map((member) => {
                        const colors = getAgentColor(member.id);
                        return (
                          <TableRow key={member.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                            <TableCell className="py-3.5 pl-6">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold font-heading text-sm shadow-xs shrink-0"
                                  style={{ backgroundColor: colors.bg }}
                                >
                                  {member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold font-heading text-slate-900 dark:text-slate-100 text-sm truncate">{member.name || 'Invited User'}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 font-normal truncate">{member.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getRoleBadge(member.role)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className={cn("h-2 w-2 rounded-full", 
                                  member.status === 'Active' ? 'bg-emerald-500' : 
                                  member.status === 'Invited' ? 'bg-amber-400' : 'bg-red-500'
                                )} />
                                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{member.status}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                              {member.lastActive}
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                                    <span className="sr-only">Open menu</span>
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44 rounded-xl border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 p-1">
                                  <DropdownMenuLabel className="font-semibold text-[10.5px] uppercase tracking-wider text-slate-400 px-2 py-1">Manage Member</DropdownMenuLabel>
                                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                                  <DropdownMenuItem 
                                    className="cursor-pointer text-xs font-medium py-1.5 px-2.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    onClick={() => {
                                      setEditingMember({...member})
                                      setIsEditModalOpen(true)
                                    }}
                                  >
                                    <Edit className="mr-2 h-3.5 w-3.5 text-slate-400" /> Edit Role
                                  </DropdownMenuItem>
                                  {member.status === 'Invited' && (
                                    <DropdownMenuItem 
                                      className="cursor-pointer text-xs font-medium py-1.5 px-2.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                      onClick={() => handleResendInvite(member.id)}
                                    >
                                      <Mail className="mr-2 h-3.5 w-3.5" /> Resend Invite
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem 
                                    className="cursor-pointer text-xs font-medium py-1.5 px-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
                                    onClick={() => handleDelete(member.id)}
                                  >
                                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Remove User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : isLoading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell className="py-3.5 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
                              <div className="space-y-1.5 flex-1">
                                <div className="h-3.5 w-28 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                                <div className="h-2.5 w-40 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell><div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" /></TableCell>
                          <TableCell><div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" /></TableCell>
                          <TableCell><div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" /></TableCell>
                          <TableCell className="text-right pr-6"><div className="h-7 w-7 bg-slate-200 dark:bg-slate-800 rounded-lg ml-auto animate-pulse" /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-28 text-center text-slate-500 dark:text-slate-400 text-xs font-normal">
                          No team members found matching your search.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden p-4 space-y-3">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-3.5 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                          <div className="h-2.5 w-36 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => {
                    const colors = getAgentColor(member.id);
                    return (
                      <div key={member.id} className="bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-xs">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex items-center gap-3">
                            <div 
                              className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-white font-bold font-heading text-sm shadow-xs"
                              style={{ backgroundColor: colors.bg }}
                            >
                              {member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold font-heading text-sm text-slate-900 dark:text-white leading-tight">{member.name || 'Invited User'}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[160px]">{member.email}</p>
                            </div>
                          </div>
                          {getRoleBadge(member.role)}
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Status</span>
                            <div className="flex items-center gap-1.5">
                              <div className={cn("h-2 w-2 rounded-full", member.status === 'Active' ? 'bg-emerald-500' : member.status === 'Invited' ? 'bg-amber-400' : 'bg-red-500')} />
                              <span className="font-medium text-slate-800 dark:text-slate-200">{member.status}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Last Active</span>
                            <span className="font-normal text-slate-600 dark:text-slate-400">{member.lastActive}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-slate-800 gap-2">
                          <Button 
                            onClick={() => {
                              setEditingMember({...member})
                              setIsEditModalOpen(true)
                            }}
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-xs font-semibold rounded-lg"
                          >
                            <Edit className="h-3 w-3 mr-1" /> Edit
                          </Button>
                          {member.status === 'Invited' && (
                            <Button 
                              onClick={() => handleResendInvite(member.id)}
                              variant="outline" 
                              size="sm" 
                              className="h-7 text-xs font-semibold text-blue-600 rounded-lg"
                            >
                              <Mail className="h-3 w-3 mr-1" /> Resend
                            </Button>
                          )}
                          <Button 
                            onClick={() => handleDelete(member.id)}
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2 py-8 text-slate-400">
                    <Users className="h-8 w-8 opacity-40" />
                    <p className="text-xs font-medium">No team members found</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            {/* Permissions Matrix */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="border-b border-slate-200/80 dark:border-slate-800 py-3.5 px-6 bg-slate-50/60 dark:bg-slate-850/60">
                <h2 className="text-sm font-bold font-heading text-slate-900 dark:text-white">Permissions Matrix</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">Granular access breakdown for each user tier.</p>
              </div>

              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="bg-slate-50/80 dark:bg-slate-850/80 border-b border-slate-200/80 dark:border-slate-800">
                    <TableRow>
                      <TableHead className="font-semibold text-slate-600 dark:text-slate-300 py-3.5 pl-6 text-xs uppercase tracking-wider">Feature / Module</TableHead>
                      <TableHead className="text-center font-bold font-heading text-purple-600 text-xs py-3.5">Admin</TableHead>
                      <TableHead className="text-center font-bold font-heading text-amber-500 text-xs py-3.5">Manager</TableHead>
                      <TableHead className="text-center font-bold font-heading text-blue-600 text-xs py-3.5">Agent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {permissions.map((perm, idx) => (
                      <TableRow key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <TableCell className="py-3.5 pl-6">
                          <p className="font-semibold font-heading text-xs text-slate-900 dark:text-slate-100">{perm.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-tight mt-0.5">{perm.description}</p>
                        </TableCell>
                        <TableCell className="text-center">
                          {perm.admin ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <XCircle className="h-4 w-4 text-slate-300 dark:text-slate-600 mx-auto" />}
                        </TableCell>
                        <TableCell className="text-center">
                          {perm.manager ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <XCircle className="h-4 w-4 text-slate-300 dark:text-slate-600 mx-auto" />}
                        </TableCell>
                        <TableCell className="text-center">
                          {perm.agent ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <XCircle className="h-4 w-4 text-slate-300 dark:text-slate-600 mx-auto" />}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="bg-slate-50/60 dark:bg-slate-850/60 border-t border-slate-200/80 dark:border-slate-800 p-4 px-6 flex items-start gap-3">
                <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  Role permissions are workspace-wide. Custom roles with bespoke ACL rules are available on Enterprise plans.
                </p>
              </div>
            </div>

            {/* Role Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { role: 'Admin', color: 'bg-purple-600', desc: 'Full workspace authority, billing, team invitations, and integration settings.', icon: ShieldCheck },
                { role: 'Manager', color: 'bg-amber-500', desc: 'Manage lead workflows, oversee representative performance, and generate reports.', icon: Star },
                { role: 'Agent', color: 'bg-blue-600', desc: 'Dedicated to processing assigned leads, appointments, and live chat conversations.', icon: User }
              ].map((role) => (
                <div key={role.role} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 flex flex-col items-center text-center shadow-sm">
                  <div className={cn("h-10 w-10 rounded-full flex items-center justify-center mb-3 text-white shadow-xs", role.color)}>
                    <role.icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold font-heading text-slate-900 dark:text-white mb-1 text-sm">{role.role}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mb-3 flex-1">{role.desc}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Role Dialog */}
        <Dialog open={isEditModalOpen} onOpenChange={(v) => {
          setIsEditModalOpen(v)
          if (!v) setError(null)
        }}>
          <DialogContent className="sm:max-w-[425px] rounded-2xl border-slate-200 dark:border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold font-heading tracking-tight">Edit Member Role</DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Change the workspace role and permissions for {editingMember?.name || 'this member'}.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-850 p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="grid gap-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-role" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select Role</Label>
                <Select 
                  value={editingMember?.role} 
                  onValueChange={(v: Role) => setEditingMember(prev => prev ? {...prev, role: v} : null)}
                >
                  <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-medium">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700">
                    <SelectItem value="Admin" className="rounded-lg">
                      <div className="flex items-center gap-2 py-0.5">
                        <ShieldCheck className="h-4 w-4 text-purple-600" />
                        <div>
                          <p className="font-semibold text-xs">Admin</p>
                          <p className="text-[10px] text-slate-400">Full workspace access and billing</p>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="Manager" className="rounded-lg">
                      <div className="flex items-center gap-2 py-0.5">
                        <Star className="h-4 w-4 text-amber-500" />
                        <div>
                          <p className="font-semibold text-xs">Manager</p>
                          <p className="text-[10px] text-slate-400">Manage leads, representatives, and reports</p>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="Agent" className="rounded-lg">
                      <div className="flex items-center gap-2 py-0.5">
                        <User className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="font-semibold text-xs">Agent</p>
                          <p className="text-[10px] text-slate-400">Process assigned leads and conversations</p>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-4 gap-2">
              <Button variant="ghost" onClick={() => setIsEditModalOpen(false)} className="rounded-xl h-9 text-xs font-medium" disabled={isUpdating}>Cancel</Button>
              <Button onClick={handleUpdateRole} className="rounded-xl h-9 text-xs font-semibold bg-[#E84C3A] hover:bg-[#d8402f] text-white px-5 shadow-xs" disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  )
}
