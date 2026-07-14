import React, { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api'
import { toast } from 'sonner'
import { format } from 'date-fns'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Plus, Trash2, Edit } from 'lucide-react'

export function CouponsTab() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    valid_until: '',
    usage_limit: ''
  })

  const fetchCoupons = async () => {
    try {
      setIsLoading(true)
      const res = await adminApi.getCoupons()
      setCoupons(res.data || [])
    } catch (error: any) {
      toast.error('Failed to load coupons', { description: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const handleOpenModal = (coupon?: any) => {
    if (coupon) {
      setEditingId(coupon.id)
      setFormData({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : '',
        usage_limit: coupon.usage_limit?.toString() || ''
      })
    } else {
      setEditingId(null)
      setFormData({
        code: '',
        type: 'percentage',
        value: '',
        valid_until: '',
        usage_limit: ''
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const dataToSave = {
        ...formData,
        value: Number(formData.value),
        usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null
      }
      
      if (editingId) {
        await adminApi.updateCoupon(editingId, dataToSave)
        toast.success('Coupon updated successfully')
      } else {
        await adminApi.createCoupon(dataToSave)
        toast.success('Coupon created successfully')
      }
      setIsModalOpen(false)
      fetchCoupons()
    } catch (error: any) {
      toast.error('Failed to save coupon', { description: error.message })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return
    try {
      await adminApi.deleteCoupon(id)
      toast.success('Coupon deleted successfully')
      fetchCoupons()
    } catch (error: any) {
      toast.error('Failed to delete coupon', { description: error.message })
    }
  }

  return (
    <Card className="border-none shadow-sm bg-[var(--crm-surface-1)] rounded-xl ring-1 ring-[var(--crm-border)] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Discount Coupons</CardTitle>
          <CardDescription>Manage promotional codes and discounts.</CardDescription>
        </div>
        <Button onClick={() => handleOpenModal()} size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Add Coupon
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-[var(--crm-text-secondary)]" /></div>
        ) : coupons.length === 0 ? (
          <div className="text-center p-8 text-[var(--crm-text-secondary)]">No coupons found.</div>
        ) : (
          <div className="border border-[var(--crm-border)] rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-[var(--crm-surface-active)]">
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.code}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{c.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}
                    </TableCell>
                    <TableCell>
                      {c.used_count} / {c.usage_limit ? c.usage_limit : '∞'}
                    </TableCell>
                    <TableCell>
                      {c.valid_until ? format(new Date(c.valid_until), 'MMM dd, yyyy') : 'Forever'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(c)}>
                        <Edit className="w-4 h-4 text-primary hover:text-primary transition-colors" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                        <Trash2 className="w-4 h-4 text-red-500 hover:text-red-600 transition-colors" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Basic Modal implementation */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--crm-surface-1)] rounded-lg shadow-xl w-full max-w-md border border-[var(--crm-border)]">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Coupon' : 'Create Coupon'}</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Coupon Code</Label>
                  <Input 
                    value={formData.code}
                    onChange={e => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. SUMMER2024"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Value</Label>
                    <Input 
                      type="number" 
                      value={formData.value}
                      onChange={e => setFormData(prev => ({ ...prev, value: e.target.value }))}
                      placeholder={formData.type === 'percentage' ? '%' : '₹'}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Usage Limit (Optional)</Label>
                    <Input 
                      type="number" 
                      value={formData.usage_limit}
                      onChange={e => setFormData(prev => ({ ...prev, usage_limit: e.target.value }))}
                      placeholder="Unlimited"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valid Until (Optional)</Label>
                    <Input 
                      type="date" 
                      value={formData.valid_until}
                      onChange={e => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={isSaving || !formData.code || !formData.value}>
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
