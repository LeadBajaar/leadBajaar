'use client'

import { useState, useEffect, useCallback } from 'react'
import { financeApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  Plus, RefreshCw, Pencil, Users, UserCheck, UserX,
  Eye, Building2, ChevronRight, Mail, Phone, Calendar,
  TrendingUp, History, ArrowUpRight,
} from 'lucide-react'

const DEPTS = ['engineering','sales','marketing','ops','management','other']
const EMP_TYPES = ['full_time','part_time','contract','freelancer']

const EMPTY_FORM = {
  name: '', email: '', phone: '', role: '', department: '', employment_type: 'full_time',
  base_salary: '', joining_date: new Date().toISOString().split('T')[0],
  relieving_date: '', pan_number: '', bank_account: '', bank_ifsc: '',
  bank_name: '', upi_id: '', tds_percentage: '0', notes: '',
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0)
}

export default function EmployeesPage() {
  const [employees, setEmployees]     = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const [showAdd, setShowAdd]         = useState(false)
  const [editEmp, setEditEmp]         = useState<any>(null)
  const [viewEmp, setViewEmp]         = useState<any>(null)
  const [salaryHistory, setSalaryHistory] = useState<any[]>([])
  const [revisions, setRevisions]     = useState<any[]>([])
  const [form, setForm]               = useState<any>({ ...EMPTY_FORM })
  const [saving, setSaving]           = useState(false)
  const [totalBurn, setTotalBurn]     = useState(0)
  const [headcount, setHeadcount]     = useState(0)

  // Revision Form
  const [showRevModal, setShowRevModal] = useState(false)
  const [revForm, setRevForm] = useState({ new_salary: '', effective_date: new Date().toISOString().split('T')[0], reason: '', notes: '' })

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      const res = await financeApi.getEmployees()
      setEmployees(res.employees ?? [])
      setTotalBurn(res.total_burn ?? 0)
      setHeadcount(res.headcount ?? 0)
    } catch { toast.error('Failed to load employees') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const resetForm = () => { setForm({ ...EMPTY_FORM }); setEditEmp(null) }

  const handleSave = async () => {
    if (!form.name || !form.email) { toast.error('Name and email required'); return }
    if (!form.base_salary || parseFloat(form.base_salary) < 0) { toast.error('Enter valid salary'); return }
    try {
      setSaving(true)
      const payload = { ...form, base_salary: parseFloat(form.base_salary), tds_percentage: parseFloat(form.tds_percentage) || 0 }
      if (editEmp) { await financeApi.updateEmployee(editEmp.id, payload); toast.success('Employee updated') }
      else         { await financeApi.createEmployee(payload); toast.success('Employee added') }
      setShowAdd(false); resetForm(); fetchAll()
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Failed to save') }
    finally { setSaving(false) }
  }

  const handleToggleActive = async (emp: any) => {
    await financeApi.toggleEmployeeActive(emp.id)
    toast.success(emp.is_active ? 'Employee deactivated' : 'Employee reactivated')
    fetchAll()
  }

  const openEdit = (emp: any) => {
    setForm({ ...EMPTY_FORM, ...emp, joining_date: emp.joining_date?.split('T')[0] ?? emp.joining_date, base_salary: String(emp.base_salary), tds_percentage: String(emp.tds_percentage) })
    setEditEmp(emp); setShowAdd(true)
  }

  const openView = async (emp: any) => {
    setViewEmp(emp)
    const [hRes, rRes] = await Promise.all([
      financeApi.getSalaryHistory(emp.id),
      financeApi.getEmployeeRevisions(emp.id)
    ])
    setSalaryHistory(hRes.payouts?.data ?? [])
    setRevisions(rRes.revisions ?? [])
  }

  const handleAddRevision = async () => {
    if (!revForm.new_salary || !revForm.reason) { toast.error('Salary and reason required'); return }
    try {
      await financeApi.addEmployeeRevision(viewEmp.id, {
        ...revForm,
        new_salary: parseFloat(revForm.new_salary)
      })
      toast.success('Salary revision recorded')
      setShowRevModal(false)
      // Refresh view data
      const [hRes, rRes] = await Promise.all([
        financeApi.getSalaryHistory(viewEmp.id),
        financeApi.getEmployeeRevisions(viewEmp.id)
      ])
      setSalaryHistory(hRes.payouts?.data ?? [])
      setRevisions(rRes.revisions ?? [])
      fetchAll()
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Revision failed') }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Employees</h2>
          <p className="text-sm text-muted-foreground">Manage team profiles and employment details</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAdd(true) }} className="bg-primary hover:bg-primary/90 text-white gap-2">
          <Plus className="h-4 w-4" /> Add Employee
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/20 dark:bg-indigo-900/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Headcount</p>
              <p className="text-xl font-bold">{headcount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Monthly Salary Burn</p>
              <p className="text-xl font-bold text-red-500">{fmt(totalBurn)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Salary</p>
              <p className="text-xl font-bold">{headcount > 0 ? fmt(totalBurn / headcount) : '—'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp: any) => (
            <Card key={emp.id} className={`transition-all hover:shadow-md ${!emp.is_active ? 'opacity-60' : ''}`}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {emp.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{emp.name}</p>
                      <p className="text-xs text-muted-foreground">{emp.role ?? 'No role'}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] capitalize ${emp.is_active ? 'text-emerald-600 border-emerald-300' : 'text-red-500 border-red-300'}`}>
                    {emp.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" /> {emp.email}
                  </div>
                  {emp.phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" /> {emp.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" /> Joined {emp.joining_date}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Base Salary</p>
                    <p className="font-bold text-sm">{fmt(emp.base_salary)}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openView(emp)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(emp)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className={`h-7 w-7 ${emp.is_active ? 'text-red-400' : 'text-emerald-500'}`} onClick={() => handleToggleActive(emp)}>
                      {emp.is_active ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>

                {/* Current month payout badge */}
                {emp.current_month_payout && (
                  <div className="mt-2">
                    <Badge variant="outline" className={`text-[10px] w-full justify-center py-1 ${emp.current_month_payout.status === 'paid' ? 'text-emerald-600 border-emerald-300 bg-emerald-50' : 'text-amber-600 border-amber-300 bg-amber-50'}`}>
                      {emp.current_month_payout.status === 'paid' ? `✓ Paid ${fmt(emp.current_month_payout.net_salary)}` : `⏳ Pending ${fmt(emp.current_month_payout.net_salary)}`}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Employee Dialog */}
      <Dialog open={showAdd} onOpenChange={open => { if (!open) resetForm(); setShowAdd(open) }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editEmp ? `Edit: ${editEmp.name}` : 'Add New Employee'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Full Name *</Label>
              <Input value={form.name} onChange={e => setForm((f: any) => ({...f, name: e.target.value}))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email *</Label>
              <Input type="email" value={form.email} onChange={e => setForm((f: any) => ({...f, email: e.target.value}))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Phone</Label>
              <Input value={form.phone} onChange={e => setForm((f: any) => ({...f, phone: e.target.value}))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role / Designation</Label>
              <Input placeholder="Backend Developer" value={form.role} onChange={e => setForm((f: any) => ({...f, role: e.target.value}))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Department</Label>
              <Select value={form.department} onValueChange={v => setForm((f: any) => ({...f, department: v}))}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select dept" /></SelectTrigger>
                <SelectContent>
                  {DEPTS.map(d => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Employment Type</Label>
              <Select value={form.employment_type} onValueChange={v => setForm((f: any) => ({...f, employment_type: v}))}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EMP_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace('_',' ')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Base Salary (₹/month) *</Label>
              <Input type="number" placeholder="50000" value={form.base_salary} onChange={e => setForm((f: any) => ({...f, base_salary: e.target.value}))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">TDS %</Label>
              <Input type="number" placeholder="0" step="0.01" value={form.tds_percentage} onChange={e => setForm((f: any) => ({...f, tds_percentage: e.target.value}))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Joining Date *</Label>
              <Input type="date" value={form.joining_date} onChange={e => setForm((f: any) => ({...f, joining_date: e.target.value}))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Relieving Date</Label>
              <Input type="date" value={form.relieving_date} onChange={e => setForm((f: any) => ({...f, relieving_date: e.target.value}))} />
            </div>

            <div className="col-span-2 border-t pt-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Bank & Payment Details</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Bank Account Number</Label>
              <Input value={form.bank_account} onChange={e => setForm((f: any) => ({...f, bank_account: e.target.value}))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">IFSC Code</Label>
              <Input placeholder="HDFC0000001" value={form.bank_ifsc} onChange={e => setForm((f: any) => ({...f, bank_ifsc: e.target.value}))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Bank Name</Label>
              <Input placeholder="HDFC Bank" value={form.bank_name} onChange={e => setForm((f: any) => ({...f, bank_name: e.target.value}))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">UPI ID</Label>
              <Input placeholder="name@upi" value={form.upi_id} onChange={e => setForm((f: any) => ({...f, upi_id: e.target.value}))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">PAN Number</Label>
              <Input placeholder="ABCDE1234F" value={form.pan_number} onChange={e => setForm((f: any) => ({...f, pan_number: e.target.value}))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Notes</Label>
              <Textarea rows={2} value={form.notes} onChange={e => setForm((f: any) => ({...f, notes: e.target.value}))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { resetForm(); setShowAdd(false) }}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-white">
              {saving ? 'Saving...' : editEmp ? 'Update' : 'Add Employee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Employee View / History Dialog */}
      <Dialog open={!!viewEmp} onOpenChange={() => { setViewEmp(null); setSalaryHistory([]); setRevisions([]) }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b">
            <div>
              <DialogTitle className="text-xl font-bold">{viewEmp?.name}</DialogTitle>
              <p className="text-xs text-muted-foreground">{viewEmp?.role} • {viewEmp?.department}</p>
            </div>
            <Button size="sm" className="bg-primary text-white h-8" onClick={() => setShowRevModal(true)}>
              <ArrowUpRight className="h-3.5 w-3.5 mr-1" /> Log Salary Hike
            </Button>
          </DialogHeader>

          <Tabs defaultValue="payouts" className="mt-4">
            <TabsList className="grid w-64 grid-cols-2 h-9">
              <TabsTrigger value="payouts" className="text-xs">Payouts</TabsTrigger>
              <TabsTrigger value="revisions" className="text-xs">Revisions</TabsTrigger>
            </TabsList>

            <TabsContent value="payouts" className="pt-4">
              {salaryHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 bg-muted/20 rounded-xl border border-dashed">
                  <History className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No payout history yet</p>
                </div>
              ) : (
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="text-left p-3 text-xs font-bold text-muted-foreground">Month</th>
                        <th className="text-right p-3 text-xs font-bold text-muted-foreground">Gross</th>
                        <th className="text-right p-3 text-xs font-bold text-muted-foreground">TDS</th>
                        <th className="text-right p-3 text-xs font-bold text-muted-foreground">Net Pay</th>
                        <th className="text-center p-3 text-xs font-bold text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salaryHistory.map((p: any) => (
                        <tr key={p.id} className="border-b hover:bg-muted/10 transition-colors">
                          <td className="p-3 font-medium">{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][p.month-1]} {p.year}</td>
                          <td className="p-3 text-right">{fmt(p.gross_salary)}</td>
                          <td className="p-3 text-right text-red-500">{fmt(p.tds_deducted)}</td>
                          <td className="p-3 text-right font-bold text-primary">{fmt(p.net_salary)}</td>
                          <td className="p-3 text-center">
                            <Badge variant="outline" className={`text-[10px] capitalize ${p.status === 'paid' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-amber-600 border-amber-200 bg-amber-50'}`}>
                              {p.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="revisions" className="pt-4">
              {revisions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 bg-muted/20 rounded-xl border border-dashed">
                  <TrendingUp className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No salary revisions recorded</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {revisions.map((rev: any) => (
                    <Card key={rev.id} className="border-l-4 border-l-emerald-500">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground line-through">{fmt(rev.old_salary)}</span>
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-bold text-emerald-600">{fmt(rev.new_salary)}</span>
                            <Badge className="text-[10px] bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">+{rev.hike_percentage}%</Badge>
                          </div>
                          <p className="text-xs font-medium">{rev.reason}</p>
                          <p className="text-[10px] text-muted-foreground">Effective: {rev.effective_date}</p>
                        </div>
                        {rev.notes && (
                          <div className="max-w-[200px]">
                            <p className="text-[10px] text-muted-foreground italic truncate" title={rev.notes}>{rev.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Salary Hike / Revision Modal */}
      <Dialog open={showRevModal} onOpenChange={setShowRevModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Salary Revision — {viewEmp?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Current Salary</p>
                <p className="text-sm font-bold">{fmt(viewEmp?.base_salary)}</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">New Salary</p>
                <p className="text-sm font-bold text-emerald-600">{revForm.new_salary ? fmt(parseFloat(revForm.new_salary)) : '—'}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">New Monthly Salary (₹) *</Label>
              <Input type="number" placeholder="Enter new base" value={revForm.new_salary} onChange={e => setRevForm(f => ({...f, new_salary: e.target.value}))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Effective Date *</Label>
              <Input type="date" value={revForm.effective_date} onChange={e => setRevForm(f => ({...f, effective_date: e.target.value}))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Reason for Hike *</Label>
              <Select value={revForm.reason} onValueChange={v => setRevForm(f => ({...f, reason: v}))}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select reason" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Annual Appraisal">Annual Appraisal</SelectItem>
                  <SelectItem value="Promotion">Promotion</SelectItem>
                  <SelectItem value="Performance Hike">Performance Hike</SelectItem>
                  <SelectItem value="Market Correction">Market Correction</SelectItem>
                  <SelectItem value="Probation Confirmation">Probation Confirmation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Private Notes</Label>
              <Textarea rows={2} placeholder="Any confidential details about this revision..." value={revForm.notes} onChange={e => setRevForm(f => ({...f, notes: e.target.value}))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setShowRevModal(false)}>Cancel</Button>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleAddRevision}>
              Confirm Salary Hike
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
