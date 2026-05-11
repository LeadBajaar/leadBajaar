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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Plus, Search, RefreshCw, Pencil, Trash2, Receipt, CalendarDays, RotateCcw, Upload, Eye, AlertCircle, X } from 'lucide-react'

const DEPARTMENTS = ['engineering','sales','marketing','ops','management','shared']
const PAID_BY     = ['company_card','upi','bank_transfer','cash','reimbursement']
const CYCLES      = ['monthly','quarterly','yearly']

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0)
}

const EMPTY_FORM = {
  expense_date: new Date().toISOString().split('T')[0],
  amount: '', category_id: '', description: '', vendor_name: '',
  paid_by: '', payment_ref: '', is_recurring: false, recurring_cycle: '',
  next_due_date: '', gst_applicable: false, gst_amount: '', gstin_vendor: '',
  department: '', notes: '',
}

export default function ExpensesPage() {
  const [expenses, setExpenses]       = useState<any[]>([])
  const [categories, setCategories]   = useState<any[]>([])
  const [recurring, setRecurring]     = useState<any[]>([])
  const [monthly, setMonthly]         = useState<any>(null)
  const [loading, setLoading]         = useState(true)
  const [monthlyTotal, setMonthlyTotal] = useState(0)
  const [showAdd, setShowAdd]         = useState(false)
  const [editExpense, setEditExpense] = useState<any>(null)
  const [activeTab, setActiveTab]     = useState<'list'|'daily'|'recurring'>('list')
  const [form, setForm]               = useState<any>({ ...EMPTY_FORM })
  const [saving, setSaving]           = useState(false)
  const [uploadingId, setUploadingId] = useState<number|null>(null)

  // Filters
  const [search, setSearch]           = useState('')
  const [filterCat, setFilterCat]     = useState('all')
  const [filterDept, setFilterDept]   = useState('all')
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1)
  const [filterYear, setFilterYear]   = useState(new Date().getFullYear())

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      const [expRes, catRes, recRes, monthRes] = await Promise.all([
        financeApi.getExpenses({ month: filterMonth, year: filterYear, search: search || undefined, category_id: filterCat !== 'all' ? filterCat : undefined, department: filterDept !== 'all' ? filterDept : undefined }),
        financeApi.getCategories(),
        financeApi.getRecurringExpenses(),
        financeApi.getMonthlyExpenses(filterMonth, filterYear),
      ])
      setExpenses(expRes.expenses?.data ?? [])
      setMonthlyTotal(expRes.monthly_total ?? 0)
      setCategories(catRes.categories ?? [])
      setRecurring(recRes.recurring_expenses ?? [])
      setMonthly(monthRes)
    } catch { toast.error('Failed to load expenses') }
    finally { setLoading(false) }
  }, [filterMonth, filterYear, search, filterCat, filterDept])

  useEffect(() => { fetchAll() }, [fetchAll])

  const resetForm = () => { setForm({ ...EMPTY_FORM }); setEditExpense(null) }

  const handleSave = async () => {
    if (!form.description || form.description.length < 5) { toast.error('Description must be at least 5 characters'); return }
    if (!form.amount || parseFloat(form.amount) <= 0) { toast.error('Enter a valid amount'); return }
    if (!form.category_id) { toast.error('Select a category'); return }
    try {
      setSaving(true)
      const payload = { ...form, amount: parseFloat(form.amount), gst_amount: parseFloat(form.gst_amount) || 0 }
      if (editExpense) { await financeApi.updateExpense(editExpense.id, payload); toast.success('Expense updated') }
      else             { await financeApi.createExpense(payload); toast.success('Expense added') }
      setShowAdd(false); resetForm(); fetchAll()
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this expense?')) return
    await financeApi.deleteExpense(id)
    toast.success('Deleted'); fetchAll()
  }

  const handleReceiptUpload = async (id: number, file: File) => {
    try { setUploadingId(id); await financeApi.uploadReceipt(id, file); toast.success('Receipt uploaded'); fetchAll() }
    catch { toast.error('Upload failed') }
    finally { setUploadingId(null) }
  }

  const openEdit = (exp: any) => {
    setForm({ ...EMPTY_FORM, ...exp, expense_date: exp.expense_date?.split('T')[0] ?? exp.expense_date })
    setEditExpense(exp); setShowAdd(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Expense Tracker</h2>
          <p className="text-sm text-muted-foreground">Log and manage all business expenses</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAdd(true) }} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
          <Plus className="h-4 w-4" /> Add Expense
        </Button>
      </div>

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="col-span-2">
          <CardContent className="pt-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <Receipt className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-medium">Total This Month</p>
              <p className="text-2xl font-bold text-red-500">{fmt(monthlyTotal)}</p>
            </div>
          </CardContent>
        </Card>
        {(monthly?.by_category ?? []).slice(0, 2).map((cat: any) => (
          <Card key={cat.category}>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">{cat.category}</p>
              <p className="text-lg font-bold">{fmt(cat.total)}</p>
              {cat.budget && (
                <div className="mt-2">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        (cat.total / cat.budget) > 1 ? 'bg-red-500' : (cat.total / cat.budget) > 0.9 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min((cat.total / cat.budget) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">of {fmt(cat.budget)} budget</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-lg w-fit">
        {(['list','daily','recurring'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all capitalize ${activeTab === tab ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {tab === 'recurring' ? 'Recurring' : tab === 'daily' ? 'Daily Log' : 'All Expenses'}
          </button>
        ))}
      </div>

      {activeTab === 'list' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search vendor, description, ref..." className="pl-9 h-9"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={String(filterMonth)} onValueChange={v => setFilterMonth(Number(v))}>
              <SelectTrigger className="w-28 h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                  <SelectItem key={i} value={String(i+1)}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger className="w-40 h-9 text-xs"><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="w-36 h-9 text-xs"><SelectValue placeholder="All Depts" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {DEPARTMENTS.map(d => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchAll} className="h-9 gap-1">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Expense Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Description</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Vendor</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Amount</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Mode</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b"><td colSpan={7} className="p-3"><Skeleton className="h-5 w-full" /></td></tr>
                    )) : expenses.length === 0 ? (
                      <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No expenses found for this period</td></tr>
                    ) : expenses.map((exp: any) => (
                      <tr key={exp.id} className="border-b hover:bg-muted/20 transition-colors">
                        <td className="p-3 text-muted-foreground text-xs whitespace-nowrap">{exp.expense_date}</td>
                        <td className="p-3 max-w-48">
                          <p className="font-medium truncate">{exp.description}</p>
                          {exp.is_recurring && <Badge variant="outline" className="text-[10px] mt-0.5 text-amber-600 border-amber-300">Recurring</Badge>}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: exp.category?.color ?? '#6b7280' }} />
                            <span className="text-xs text-muted-foreground">{exp.category?.name ?? '—'}</span>
                          </div>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">{exp.vendor_name ?? '—'}</td>
                        <td className="p-3 text-right font-semibold text-red-500">{fmt(exp.amount)}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-[10px] capitalize">{exp.paid_by?.replace('_',' ') ?? '—'}</Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-1">
                            {exp.receipt_url
                              ? <a href={exp.receipt_url} target="_blank" rel="noopener noreferrer"><Button size="icon" variant="ghost" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button></a>
                              : <label className="cursor-pointer">
                                  <input type="file" className="hidden" accept="image/*,.pdf" onChange={e => e.target.files?.[0] && handleReceiptUpload(exp.id, e.target.files[0])} />
                                  <Button size="icon" variant="ghost" className="h-7 w-7" asChild>
                                    <span>{uploadingId === exp.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}</span>
                                  </Button>
                                </label>
                            }
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(exp)}><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => handleDelete(exp.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'recurring' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-amber-500" /> Recurring Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">Description</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Cycle</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Next Due</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recurring.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No recurring expenses</td></tr>
                ) : recurring.map((exp: any) => (
                  <tr key={exp.id} className="border-b hover:bg-muted/20">
                    <td className="p-3 font-medium">{exp.description}</td>
                    <td className="p-3"><Badge variant="outline" className="capitalize text-[10px]">{exp.recurring_cycle}</Badge></td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${exp.is_due_soon ? 'text-red-500 font-semibold' : 'text-muted-foreground'}`}>{exp.next_due_date}</span>
                        {exp.is_due_soon && <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
                      </div>
                    </td>
                    <td className="p-3 text-right font-semibold text-red-500">{fmt(exp.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'daily' && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Select a date to view daily expenses:</p>
            <Input type="date" className="mt-2 w-48" defaultValue={new Date().toISOString().split('T')[0]}
              onChange={async e => {
                const res = await financeApi.getDailyExpenses(e.target.value)
                setExpenses(res.expenses ?? [])
                setMonthlyTotal(res.total ?? 0)
              }} />
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAdd} onOpenChange={open => { if (!open) resetForm(); setShowAdd(open) }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Date *</Label>
              <Input type="date" value={form.expense_date} onChange={e => setForm((f: any) => ({...f, expense_date: e.target.value}))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Amount (₹) *</Label>
              <Input type="number" placeholder="0.00" value={form.amount} onChange={e => setForm((f: any) => ({...f, amount: e.target.value}))} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">Description * (min 5 chars)</Label>
              <Input placeholder="What was this expense for?" value={form.description} onChange={e => setForm((f: any) => ({...f, description: e.target.value}))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Category *</Label>
              <Select value={String(form.category_id)} onValueChange={v => setForm((f: any) => ({...f, category_id: v}))}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Vendor Name</Label>
              <Input placeholder="Amazon Web Services" value={form.vendor_name} onChange={e => setForm((f: any) => ({...f, vendor_name: e.target.value}))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Payment Mode</Label>
              <Select value={form.paid_by} onValueChange={v => setForm((f: any) => ({...f, paid_by: v}))}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select mode" /></SelectTrigger>
                <SelectContent>
                  {PAID_BY.map(p => <SelectItem key={p} value={p} className="capitalize">{p.replace('_',' ')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Payment Reference (UTR/UPI ID)</Label>
              <Input placeholder="Transaction ID" value={form.payment_ref} onChange={e => setForm((f: any) => ({...f, payment_ref: e.target.value}))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Department</Label>
              <Select value={form.department} onValueChange={v => setForm((f: any) => ({...f, department: v}))}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select dept" /></SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map(d => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Recurring */}
            <div className="col-span-2 flex items-center gap-3 pt-1">
              <Switch checked={form.is_recurring} onCheckedChange={v => setForm((f: any) => ({...f, is_recurring: v}))} />
              <Label className="text-xs">This is a recurring expense</Label>
            </div>
            {form.is_recurring && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs">Recurring Cycle</Label>
                  <Select value={form.recurring_cycle} onValueChange={v => setForm((f: any) => ({...f, recurring_cycle: v}))}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select cycle" /></SelectTrigger>
                    <SelectContent>
                      {CYCLES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Next Due Date</Label>
                  <Input type="date" value={form.next_due_date} onChange={e => setForm((f: any) => ({...f, next_due_date: e.target.value}))} />
                </div>
              </>
            )}

            {/* GST */}
            <div className="col-span-2 flex items-center gap-3 pt-1">
              <Switch checked={form.gst_applicable} onCheckedChange={v => setForm((f: any) => ({...f, gst_applicable: v}))} />
              <Label className="text-xs">GST Applicable</Label>
            </div>
            {form.gst_applicable && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs">GST Amount (₹)</Label>
                  <Input type="number" placeholder="0.00" value={form.gst_amount} onChange={e => setForm((f: any) => ({...f, gst_amount: e.target.value}))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Vendor GSTIN</Label>
                  <Input placeholder="22AAAAA0000A1Z5" value={form.gstin_vendor} onChange={e => setForm((f: any) => ({...f, gstin_vendor: e.target.value}))} />
                </div>
              </>
            )}

            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">Notes</Label>
              <Textarea rows={2} placeholder="Any additional context..." value={form.notes} onChange={e => setForm((f: any) => ({...f, notes: e.target.value}))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { resetForm(); setShowAdd(false) }}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {saving ? 'Saving...' : editExpense ? 'Update Expense' : 'Add Expense'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
