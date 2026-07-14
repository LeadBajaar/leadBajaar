'use client'

import { useState, useEffect, useCallback } from 'react'
import { financeApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  Settings, History, DollarSign, Edit3,
  Clock, CheckCircle, Save, RefreshCw,
} from 'lucide-react'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0)
}

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [editingPlan, setEditingPlan] = useState<any>(null)
  const [newPrice, setNewPrice] = useState('')
  const [notes, setNotes] = useState('')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [pRes, hRes] = await Promise.all([
        financeApi.getPlans(),
        financeApi.getPlanPricingHistory()
      ])
      setPlans(pRes.plans || [])
      setHistory(hRes.history?.data || [])
    } catch { toast.error('Failed to load plans data') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleUpdate = async () => {
    if (!editingPlan) return
    try {
      await financeApi.updatePlanPricing({
        plan_name: editingPlan.name,
        new_price: parseFloat(newPrice),
        notes: notes
      })
      toast.success('Plan pricing updated')
      setShowEdit(false)
      fetchData()
    } catch { toast.error('Update failed') }
  }

  if (loading && plans.length === 0) return <Skeleton className="h-96 w-full rounded-xl" />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Plans & Pricing</h2>
          <p className="text-sm text-muted-foreground">Manage SaaS subscription tiers and track pricing changes</p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm" className="h-9 gap-1">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan: any) => (
          <Card key={plan.id} className="relative overflow-hidden group">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold capitalize flex items-center justify-between">
                {plan.name}
                <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => { setEditingPlan(plan); setNewPrice(plan.price); setNotes(''); setShowEdit(true) }}>
                  <Edit3 className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black">{fmt(plan.price)}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Last Changed: {plan.last_price_change ? new Date(plan.last_price_change).toLocaleDateString() : 'Never'}</span>
                </div>
                {plan.previous_price && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <History className="h-3 w-3" />
                    <span>Previous: {fmt(plan.previous_price)}</span>
                  </div>
                )}
              </div>
            </CardContent>
            {/* Background decoration */}
            <div className="absolute -right-4 -bottom-4 opacity-5 rotate-12">
              <DollarSign className="h-24 w-24" />
            </div>
          </Card>
        ))}
      </div>

      <div className="pt-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Pricing Change Log
        </h3>
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-muted-foreground">
                  <th className="p-3 text-left font-medium">Plan</th>
                  <th className="p-3 text-right font-medium">Old Price</th>
                  <th className="p-3 text-right font-medium">New Price</th>
                  <th className="p-3 text-center font-medium">Change Date</th>
                  <th className="p-3 text-left font-medium">Changed By</th>
                  <th className="p-3 text-left font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No pricing history recorded</td></tr>
                ) : history.map((h: any) => (
                  <tr key={h.id} className="border-b hover:bg-muted/10 transition-colors">
                    <td className="p-3 font-bold capitalize">{h.plan_name}</td>
                    <td className="p-3 text-right text-muted-foreground line-through">{fmt(h.old_price)}</td>
                    <td className="p-3 text-right font-bold text-emerald-600">{fmt(h.new_price)}</td>
                    <td className="p-3 text-center text-xs text-muted-foreground">{new Date(h.changed_at).toLocaleString()}</td>
                    <td className="p-3 text-xs">{h.changed_by?.name || 'System'}</td>
                    <td className="p-3 text-xs text-muted-foreground max-w-xs truncate">{h.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Edit Price Modal */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Pricing — {editingPlan?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">New Monthly Price (₹)</Label>
              <Input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Reason for Change</Label>
              <Input placeholder="Market adjustment, new features, etc." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 text-[10px] text-amber-800 dark:text-amber-300">
              <p className="font-bold flex items-center gap-1 mb-1"><Settings className="h-3 w-3" /> IMPORTANT</p>
              Updating the price will only affect NEW subscriptions. Existing users will continue on their current billing until manual renewal or migration.
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button size="sm" onClick={handleUpdate} className="bg-primary hover:bg-primary/90 text-white gap-2">
              <Save className="h-3.5 w-3.5" /> Save New Price
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
