import React, { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Settings } from 'lucide-react'

export function SettingsTab() {
  const [minPayment, setMinPayment] = useState('999')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const res = await adminApi.getSettings()
      const minPaymentSetting = res.find((s: any) => s.key === 'min_payment_amount')
      if (minPaymentSetting) {
        setMinPayment(minPaymentSetting.value)
      }
    } catch (error: any) {
      toast.error('Failed to load settings', { description: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await adminApi.updateSettings({
        key: 'min_payment_amount',
        value: minPayment
      })
      toast.success('Settings saved successfully')
    } catch (error: any) {
      toast.error('Failed to save settings', { description: error.message })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-500" /> Payment Settings
        </CardTitle>
        <CardDescription>Configure global payment limits and requirements.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 max-w-xl">
        <div className="space-y-2">
          <Label>Minimum Payment Amount (₹)</Label>
          <div className="flex items-center gap-2">
            <Input 
              type="number"
              value={minPayment}
              onChange={(e) => setMinPayment(e.target.value)}
              placeholder="999"
              min="1"
            />
          </div>
          <p className="text-sm text-[var(--crm-text-secondary)]">
            Payments below this amount will be rejected automatically.
          </p>
        </div>
      </CardContent>
      <CardFooter className="border-t border-[var(--crm-border)] px-6 py-4">
        <Button onClick={handleSave} disabled={isSaving || !minPayment}>
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Settings
        </Button>
      </CardFooter>
    </Card>
  )
}
