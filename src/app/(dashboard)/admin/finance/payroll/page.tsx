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
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  CreditCard, RefreshCw, CheckCircle, Clock, AlertCircle,
  Upload, Wand2, ChevronDown, ChevronUp, Users, DollarSign,
} from 'lucide-react'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const PAYMENT_MODES = ['bank_transfer','upi','cash','cheque']

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0)
}

export default function PayrollPage() {
  const now         = new Date()
  const [month, setMonth]         = useState(now.getMonth() + 1)
  const [year, setYear]           = useState(now.getFullYear())
  const [cycle, setCycle]         = useState<any>(null)
  const [loading, setLoading]     = useState(true)
  const [generating, setGenerating] = useState(false)
  const [markingId, setMarkingId] = useState<number|null>(null)
  const [uploadingId, setUploadingId] = useState<number|null>(null)
  const [payModal, setPayModal]   = useState<any>(null)
  const [payForm, setPayForm]     = useState<any>({ payment_mode: 'bank_transfer', transaction_ref: '', paid_at: new Date().toISOString().split('T')[0], bonus: 0, other_deductions: 0, remarks: '' })

  const fetchCycle = useCallback(async () => {
    try {
      setLoading(true)
      const res = await financeApi.getPayrollCycle(month, year)
      setCycle(res)
    } catch { toast.error('Failed to load payroll cycle') }
    finally { setLoading(false) }
  }, [month, year])

  useEffect(() => { fetchCycle() }, [fetchCycle])

  const handleGenerate = async () => {
    if (!confirm(`Generate payroll for ${MONTHS[month-1]} ${year}? This will create pending payouts for all active employees.`)) return
    try {
      setGenerating(true)
      const res = await financeApi.generatePayroll(month, year)
      toast.success(`Generated ${res.generated} payouts`)
      fetchCycle()
    } catch { toast.error('Failed to generate payroll') }
    finally { setGenerating(false) }
  }

  const openPayModal = (payout: any) => {
    setPayModal(payout)
    setPayForm({ payment_mode: 'bank_transfer', transaction_ref: '', paid_at: new Date().toISOString().split('T')[0], bonus: payout.bonus ?? 0, other_deductions: payout.other_deductions ?? 0, remarks: '' })
  }

  const handleMarkPaid = async () => {
    if (!payModal) return
    try {
      setMarkingId(payModal.id)
      await financeApi.markPayoutPaid(payModal.id, payForm)
      toast.success(`${payModal.employee?.name} marked as paid`)
      setPayModal(null); fetchCycle()
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Failed to mark paid') }
    finally { setMarkingId(null) }
  }

  const handleStatusToggle = async (payout: any, status: 'hold'|'pending') => {
    await financeApi.updatePayoutStatus(payout.id, status)
    toast.success(`Status updated to ${status}`)
    fetchCycle()
  }

  const handleProofUpload = async (payoutId: number, file: File) => {
    try {
      setUploadingId(payoutId)
      await financeApi.uploadPayoutProof(payoutId, file)
      toast.success('Proof uploaded')
      fetchCycle()
    } catch { toast.error('Upload failed') }
    finally { setUploadingId(null) }
  }

  const payouts: any[] = cycle?.payouts ?? []
  const summary: any   = cycle?.summary ?? {}

  // Preview net salary calculation in modal
  const previewNet = payModal
    ? (parseFloat(payModal.gross_salary) + parseFloat(payForm.bonus || 0) - parseFloat(payModal.tds_deducted) - parseFloat(payForm.other_deductions || 0))
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Monthly Payroll</h2>
          <p className="text-sm text-muted-foreground">Manage salary payout cycles</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(month)} onValueChange={v => setMonth(Number(v))}>
            <SelectTrigger className="w-32 h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => <SelectItem key={i} value={String(i+1)}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
            <SelectTrigger className="w-24 h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[2024,2025,2026,2027].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchCycle} className="h-9"><RefreshCw className="h-3.5 w-3.5" /></Button>
        </div>
      </div>

      {/* Cycle Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Total Payout</p>
              <p className="text-xl font-bold">{fmt(summary.total_amount ?? 0)}</p>
              <p className="text-xs text-muted-foreground mt-1">{summary.total_employees ?? 0} employees</p>
            </CardContent>
          </Card>
          <Card className="border-emerald-200/50">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Paid</p>
              <p className="text-xl font-bold text-emerald-600">{summary.paid ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">{fmt(summary.paid_amount ?? 0)}</p>
            </CardContent>
          </Card>
          <Card className="border-amber-200/50">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-xl font-bold text-amber-600">{summary.pending ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">{fmt(summary.pending_amount ?? 0)}</p>
            </CardContent>
          </Card>
          <Card className={summary.cycle_closed ? 'border-emerald-300 bg-emerald-50/30' : 'border-amber-200/50'}>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Cycle Status</p>
              <div className="flex items-center gap-2 mt-1">
                {summary.cycle_closed
                  ? <><CheckCircle className="h-5 w-5 text-emerald-600" /><span className="font-semibold text-emerald-600">Closed</span></>
                  : <><Clock className="h-5 w-5 text-amber-500" /><span className="font-semibold text-amber-600">Open</span></>}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Generate / Action Bar */}
      {!loading && payouts.length === 0 && (
        <Card className="border-dashed border-2 bg-muted/20">
          <CardContent className="py-12 text-center">
            <Wand2 className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <p className="font-semibold mb-2">No payroll generated for {MONTHS[month-1]} {year}</p>
            <p className="text-sm text-muted-foreground mb-6">Click below to auto-generate pending payouts for all active employees</p>
            <Button onClick={handleGenerate} disabled={generating} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
              <Wand2 className="h-4 w-4" />
              {generating ? 'Generating...' : `Generate Payroll — ${MONTHS[month-1]} ${year}`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payroll Table */}
      {!loading && payouts.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{MONTHS[month-1]} {year} — {payouts.length} employees</p>
            {payouts.some((p: any) => p.status === 'pending') && (
              <Button variant="outline" size="sm" onClick={handleGenerate} className="h-8 gap-1 text-xs">
                <RefreshCw className="h-3 w-3" /> Re-sync
              </Button>
            )}
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-3 font-medium text-muted-foreground">Employee</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Gross</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">TDS</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Bonus</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Net Pay</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((payout: any) => (
                      <tr key={payout.id} className="border-b hover:bg-muted/20 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                              {payout.employee?.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{payout.employee?.name}</p>
                              <p className="text-[10px] text-muted-foreground capitalize">{payout.employee?.department}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-right">{fmt(payout.gross_salary)}</td>
                        <td className="p-3 text-right text-red-400">{fmt(payout.tds_deducted)}</td>
                        <td className="p-3 text-right text-emerald-600">{payout.bonus > 0 ? fmt(payout.bonus) : '—'}</td>
                        <td className="p-3 text-right font-bold">{fmt(payout.net_salary)}</td>
                        <td className="p-3">
                          <Badge variant="outline" className={`text-[10px] capitalize ${
                            payout.status === 'paid' ? 'text-emerald-600 border-emerald-300 bg-emerald-50'
                            : payout.status === 'hold' ? 'text-red-500 border-red-300 bg-red-50'
                            : 'text-amber-600 border-amber-300 bg-amber-50'
                          }`}>
                            {payout.status === 'paid' ? '✓ Paid' : payout.status === 'hold' ? '⏸ Hold' : '⏳ Pending'}
                          </Badge>
                          {payout.status === 'paid' && payout.paid_at && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">{payout.paid_at?.split('T')[0]}</p>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-1">
                            {payout.status !== 'paid' && (
                              <Button size="sm" variant="outline" className="h-7 text-xs text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                                onClick={() => openPayModal(payout)}>
                                Pay
                              </Button>
                            )}
                            {payout.status === 'pending' && (
                              <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground"
                                onClick={() => handleStatusToggle(payout, 'hold')}>
                                Hold
                              </Button>
                            )}
                            {payout.status === 'hold' && (
                              <Button size="sm" variant="ghost" className="h-7 text-xs"
                                onClick={() => handleStatusToggle(payout, 'pending')}>
                                Resume
                              </Button>
                            )}
                            {/* Proof upload */}
                            {payout.status === 'paid' && !payout.proof_url && (
                              <label className="cursor-pointer">
                                <input type="file" className="hidden" accept="image/*,.pdf" onChange={e => e.target.files?.[0] && handleProofUpload(payout.id, e.target.files[0])} />
                                <Button size="icon" variant="ghost" className="h-7 w-7" asChild>
                                  <span>{uploadingId === payout.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}</span>
                                </Button>
                              </label>
                            )}
                            {payout.proof_url && (
                              <a href={payout.proof_url} target="_blank" rel="noopener noreferrer">
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600">
                                  <CheckCircle className="h-3.5 w-3.5" />
                                </Button>
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/30 font-semibold">
                      <td className="p-3">Total</td>
                      <td className="p-3 text-right">{fmt(payouts.reduce((s: number, p: any) => s + parseFloat(p.gross_salary), 0))}</td>
                      <td className="p-3 text-right text-red-400">{fmt(payouts.reduce((s: number, p: any) => s + parseFloat(p.tds_deducted), 0))}</td>
                      <td className="p-3 text-right text-emerald-600">{fmt(payouts.reduce((s: number, p: any) => s + parseFloat(p.bonus), 0))}</td>
                      <td className="p-3 text-right">{fmt(payouts.reduce((s: number, p: any) => s + parseFloat(p.net_salary), 0))}</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Mark Paid Modal */}
      <Dialog open={!!payModal} onOpenChange={() => setPayModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mark Paid — {payModal?.employee?.name}</DialogTitle>
          </DialogHeader>
          {payModal && (
            <div className="space-y-4 py-2">
              {/* Net preview */}
              <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-lg p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Net Salary</p>
                <p className="text-3xl font-bold text-indigo-600">{fmt(previewNet)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {fmt(payModal.gross_salary)} gross + {fmt(parseFloat(payForm.bonus || 0))} bonus − {fmt(payModal.tds_deducted)} TDS − {fmt(parseFloat(payForm.other_deductions || 0))} deductions
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Bonus (₹)</Label>
                  <Input type="number" min={0} value={payForm.bonus} onChange={e => setPayForm((f: any) => ({...f, bonus: e.target.value}))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Other Deductions (₹)</Label>
                  <Input type="number" min={0} value={payForm.other_deductions} onChange={e => setPayForm((f: any) => ({...f, other_deductions: e.target.value}))} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs">Payment Mode *</Label>
                  <Select value={payForm.payment_mode} onValueChange={v => setPayForm((f: any) => ({...f, payment_mode: v}))}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_MODES.map(m => <SelectItem key={m} value={m} className="capitalize">{m.replace('_',' ')}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Transaction Reference</Label>
                  <Input placeholder="UTR / UPI ID / Cheque No." value={payForm.transaction_ref} onChange={e => setPayForm((f: any) => ({...f, transaction_ref: e.target.value}))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Payment Date</Label>
                  <Input type="date" value={payForm.paid_at} onChange={e => setPayForm((f: any) => ({...f, paid_at: e.target.value}))} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs">Remarks</Label>
                  <Textarea rows={2} placeholder="Any notes..." value={payForm.remarks} onChange={e => setPayForm((f: any) => ({...f, remarks: e.target.value}))} />
                </div>
              </div>

              {/* Bank details hint */}
              {payModal.employee?.bank_ifsc && (
                <div className="bg-muted/50 rounded p-3 text-xs space-y-1">
                  <p className="font-semibold text-muted-foreground">Employee Bank Details</p>
                  <p>Account: <span className="font-mono">{payModal.employee.masked_bank_account ?? 'XXXX XXXX ****'}</span></p>
                  <p>IFSC: <span className="font-mono">{payModal.employee.bank_ifsc}</span></p>
                  <p>Bank: {payModal.employee.bank_name}</p>
                  {payModal.employee.upi_id && <p>UPI: {payModal.employee.upi_id}</p>}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPayModal(null)}>Cancel</Button>
            <Button onClick={handleMarkPaid} disabled={!!markingId} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {markingId ? 'Saving...' : `Confirm Payment — ${fmt(previewNet)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
