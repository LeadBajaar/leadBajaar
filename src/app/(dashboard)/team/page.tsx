'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Shield, Users, Mail, UserPlus, MoreVertical, Star, ShieldCheck, User, Trash2, Edit, CheckCircle2, XCircle, Info, Settings } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { teamApi } from '@/lib/api'
import { useEffect } from 'react'
import { RoleGuard } from '@/components/RoleGuard'


// Mock Data
type Role = 'Admin' | 'Manager' | 'Agent'

interface TeamMember {
  id: string
  name: string
  email: string
  role: Role
  status: 'Active' | 'Invited' | 'Suspended'
  lastActive: string
}

const initialMembers: TeamMember[] = [
  { id: '1', name: 'John Doe', email: 'john@leadbajaar.com', role: 'Admin', status: 'Active', lastActive: '2 mins ago' },
  { id: '2', name: 'Sarah Smith', email: 'sarah@leadbajaar.com', role: 'Manager', status: 'Active', lastActive: '1 hour ago' },
  { id: '3', name: 'Mike Johnson', email: 'mike@leadbajaar.com', role: 'Agent', status: 'Active', lastActive: '3 hours ago' },
  { id: '4', name: 'Emily Davis', email: 'emily@leadbajaar.com', role: 'Agent', status: 'Invited', lastActive: 'Never' },
]

// Permission Definition
interface Permission {
  name: string
  description: string
  admin: boolean
  manager: boolean
  agent: boolean
}

const permissions: Permission[] = [
  { name: 'Dashboard Access', description: 'View general analytics and performance metrics', admin: true, manager: true, agent: true },
  { name: 'Lead Management', description: 'Create, update, and delete leads', admin: true, manager: true, agent: true },
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
  const { toast } = useToast()

  const fetchMembers = async () => {
    try {
      setIsLoading(true)
      const data = await teamApi.getMembers()
      setMembers(data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
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
      await teamApi.inviteMember({ email: inviteEmail, role: inviteRole })
      setIsInviteModalOpen(false)
      setInviteEmail('')
      setInviteRole('Agent')
      toast({
        title: "Invitation Sent",
        description: `An invitation has been sent to ${inviteEmail}`,
      })
      fetchMembers()
    } catch (error: any) {
      toast({
        title: "Invite Failed",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleUpdateRole = async () => {
    if (!editingMember) return
    try {
      await teamApi.updateRole(editingMember.id, editingMember.role)
      setIsEditModalOpen(false)
      setEditingMember(null)
      toast({
        title: "Role Updated",
        description: "Member role has been successfully changed.",
      })
      fetchMembers()
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await teamApi.removeMember(id)
      toast({
        title: "Member Removed",
        description: "The team member has been successfully removed.",
        variant: "destructive"
      })
      fetchMembers()
    } catch (error: any) {
      toast({
        title: "Remove Failed",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const filteredMembers = members.filter(m => 
    (m.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (m.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'Admin': return <ShieldCheck className="h-4 w-4 text-purple-500" />
      case 'Manager': return <Star className="h-4 w-4 text-amber-500" />
      case 'Agent': return <User className="h-4 w-4 text-blue-500" />
    }
  }

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case 'Admin': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'Manager': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'Agent': return 'bg-blue-100 text-blue-700 border-blue-200'
    }
  }

  return (
    <RoleGuard allowedRoles={['Super Admin', 'Admin']}>
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950/20">
        <div className="px-4 lg:px-6 py-6 space-y-4 w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Team Management</h1>
              <p className="text-sm text-slate-500 font-medium italic">Members, roles, and access permissions.</p>
            </div>
            
            <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-500/20 rounded-xl px-5 h-10 text-sm transition-all hover:scale-[1.02]">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Invite Team Member</DialogTitle>
                  <DialogDescription className="font-medium text-slate-500">
                    Send an email invitation to add a new member.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-5 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-bold text-slate-700 dark:text-slate-300">Email address</Label>
                    <Input 
                      id="email" 
                      placeholder="colleague@company.com" 
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="font-bold text-slate-700 dark:text-slate-300">Assign Role</Label>
                    <Select value={inviteRole} onValueChange={(v: Role) => setInviteRole(v)}>
                      <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 p-1">
                        <SelectItem value="Admin" className="rounded-lg">
                          <div className="flex items-center py-0.5">
                            <ShieldCheck className="h-4 w-4 text-purple-500 mr-3" />
                            <div className="text-left">
                              <p className="font-bold text-sm">Admin</p>
                              <p className="text-[10px] text-slate-500 font-medium">Full workspace control</p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="Manager" className="rounded-lg">
                          <div className="flex items-center py-0.5">
                            <Star className="h-4 w-4 text-amber-500 mr-3" />
                            <div className="text-left">
                              <p className="font-bold text-sm">Manager</p>
                              <p className="text-[10px] text-slate-500 font-medium">Manage leads & reports</p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="Agent" className="rounded-lg">
                          <div className="flex items-center py-0.5">
                            <User className="h-4 w-4 text-blue-500 mr-3" />
                            <div className="text-left">
                              <p className="font-bold text-sm">Agent</p>
                              <p className="text-[10px] text-slate-500 font-medium">Handle assigned leads</p>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsInviteModalOpen(false)} className="rounded-xl h-11 font-bold">Cancel</Button>
                  <Button onClick={handleInvite} className="rounded-xl h-11 font-black bg-slate-900 dark:bg-white dark:text-slate-900 px-8" disabled={!inviteEmail}>Send Invitation</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>


        <Tabs defaultValue="directory" className="space-y-4">
          <TabsList className="bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl h-11 border border-slate-200 dark:border-slate-800 w-fit">
            <TabsTrigger value="directory" className="rounded-lg px-6 py-2 text-sm font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm transition-all">
              <Users className="h-4 w-4 mr-2" />
              Directory
            </TabsTrigger>
            <TabsTrigger value="roles" className="rounded-lg px-6 py-2 text-sm font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm transition-all">
              <Shield className="h-4 w-4 mr-2" />
              Roles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="directory" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Optimized Compact Stat Boxes */}
            <div className="flex flex-wrap gap-6 py-1">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase mr-1.5">Total:</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">{members.length}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase mr-1.5">Admins:</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">{members.filter(m => m.role === 'Admin').length}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase mr-1.5">Pending:</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">{members.filter(m => m.status === 'Invited').length}</span>
                </div>
              </div>
            </div>

            {/* Members Table */}
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-xl ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 py-4 px-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200">Directory</CardTitle>
                  <div className="relative w-full sm:w-72">
                    <Input 
                      placeholder="Search members..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg text-sm shadow-sm pl-4"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50/80 dark:bg-slate-900">
                    <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                      <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-xs py-4 pl-6">User</TableHead>
                      <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-xs py-4">Role</TableHead>
                      <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-xs py-4">Status</TableHead>
                      <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-xs py-4">Last Active</TableHead>
                      <TableHead className="text-right font-bold text-slate-500 uppercase tracking-wider text-xs py-4 pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.length > 0 ? (
                      filteredMembers.map((member) => (
                        <TableRow key={member.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <TableCell className="py-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-50 dark:from-indigo-900/40 dark:to-blue-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm ring-1 ring-white dark:ring-slate-900 shadow-sm shrink-0">
                                {member.name ? member.name.charAt(0) : member.email.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{member.name || 'Invited User'}</p>
                                <p className="text-xs text-slate-500 truncate">{member.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`font-bold border px-2.5 py-0.5 shadow-sm flex w-fit items-center gap-1.5 ${getRoleBadgeColor(member.role)}`}>
                              {getRoleIcon(member.role)}
                              {member.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`h-2.5 w-2.5 rounded-full ${
                                member.status === 'Active' ? 'bg-emerald-500' : 
                                member.status === 'Invited' ? 'bg-amber-400' : 'bg-red-500'
                              }`} />
                              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{member.status}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-slate-500 font-medium">
                            {member.lastActive}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500">
                                  <span className="sr-only">Open menu</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-950 p-1">
                                <DropdownMenuLabel className="font-bold text-xs uppercase tracking-wider text-slate-500 px-2 py-1.5">Manage Member</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                                <DropdownMenuItem 
                                  className="cursor-pointer font-medium py-2 px-2.5 focus:bg-slate-50 dark:focus:bg-slate-900 rounded-lg text-slate-700 dark:text-slate-300"
                                  onClick={() => {
                                    setEditingMember({...member})
                                    setIsEditModalOpen(true)
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4 text-slate-400" /> Edit Role
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="cursor-pointer font-medium py-2 px-2.5 text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30 focus:text-red-600 rounded-lg mt-1"
                                  onClick={() => handleDelete(member.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Remove User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-slate-500 font-medium">
                          No team members found matching your search.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-xl ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 py-4 px-6">
                <CardTitle className="text-base font-bold">Permissions Matrix</CardTitle>
                <CardDescription className="text-xs">Access level breakdown for each role.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table className="min-w-[600px]">
                  <TableHeader className="bg-slate-50/80 dark:bg-slate-900">
                    <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                      <TableHead className="font-bold text-slate-700 py-4 pl-6">Feature / Access</TableHead>
                      <TableHead className="text-center font-bold text-purple-600">Admin</TableHead>
                      <TableHead className="text-center font-bold text-amber-500">Manager</TableHead>
                      <TableHead className="text-center font-bold text-blue-500">Agent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions.map((perm, idx) => (
                      <TableRow key={idx} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50">
                        <TableCell className="py-4 pl-6">
                          <p className="font-bold text-sm text-slate-900 dark:text-white">{perm.name}</p>
                          <p className="text-xs text-slate-500 leading-tight">{perm.description}</p>
                        </TableCell>
                        <TableCell className="text-center">
                          {perm.admin ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" /> : <XCircle className="h-4 w-4 text-slate-200 dark:text-slate-800 mx-auto" />}
                        </TableCell>
                        <TableCell className="text-center">
                          {perm.manager ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" /> : <XCircle className="h-4 w-4 text-slate-200 dark:text-slate-800 mx-auto" />}
                        </TableCell>
                        <TableCell className="text-center">
                          {perm.agent ? <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" /> : <XCircle className="h-5 w-5 text-slate-200 dark:text-slate-800 mx-auto" />}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 p-6">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Permissions are global and affect all members with the assigned role. Currently, custom role creation is limited to enterprise plans. 
                    Contact support to learn more about granular access control.
                  </p>
                </div>
              </CardFooter>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { role: 'Admin', color: 'purple', shadow: 'purple', desc: 'Full access to billing, security, and team management.', icon: ShieldCheck },
                { role: 'Manager', color: 'amber', shadow: 'amber', desc: 'Can manage leads and oversee agent performance.', icon: Star },
                { role: 'Agent', color: 'blue', shadow: 'blue', desc: 'Dedicated to lead processing and chat interactions.', icon: User }
              ].map((role) => (
                <Card key={role.role} className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-xl ring-1 ring-slate-100 dark:ring-slate-800 p-4 flex flex-col items-center text-center group hover:ring-indigo-500/50 transition-all duration-300">
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-300",
                    role.role === 'Admin' ? "bg-purple-50 text-purple-600 dark:bg-purple-900/20" : 
                    role.role === 'Manager' ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20" : 
                    "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                  )}>
                    <role.icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1 text-sm">{role.role} Role</h4>
                  <p className="text-[10px] text-slate-500 mb-4 flex-1 px-1">{role.desc}</p>
                  <Button variant="outline" className="w-full rounded-lg font-bold text-[9px] uppercase tracking-wider h-8 border-slate-200 dark:border-slate-800 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors">
                    View Members
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Role Dialog */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Update Member Role</DialogTitle>
              <DialogDescription>
                Change the access level for <strong>{editingMember?.name}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-role" className="font-bold text-slate-700">Role & Permissions</Label>
                <Select 
                  value={editingMember?.role} 
                  onValueChange={(v: Role) => setEditingMember(prev => prev ? {...prev, role: v} : null)}
                >
                  <SelectTrigger className="h-11 rounded-lg bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">
                      <div className="flex items-center">
                        <ShieldCheck className="h-4 w-4 text-purple-500 mr-2" />
                        <div>
                          <p className="font-bold">Admin</p>
                          <p className="text-[10px] text-slate-500">Full access to all settings and billing</p>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="Manager">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-amber-500 mr-2" />
                        <div>
                          <p className="font-bold">Manager</p>
                          <p className="text-[10px] text-slate-500">Can manage leads, agents, and reports</p>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="Agent">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-blue-500 mr-2" />
                        <div>
                          <p className="font-bold">Agent</p>
                          <p className="text-[10px] text-slate-500">Can only handle assigned leads and calls</p>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="rounded-lg h-10 font-bold border-slate-200">Cancel</Button>
              <Button onClick={handleUpdateRole} className="rounded-lg h-10 font-bold bg-indigo-600 hover:bg-indigo-700 shadow-sm">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  </RoleGuard>
  )
}

