'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from '@/lib/utils'
import { useUser } from '@/contexts/UserContext'
import { api, subscriptionApi } from '@/lib/api'
import { toast } from 'sonner'
import { RoleGuard } from '@/components/RoleGuard'
import {
  User, Bell, Shield, Mail,
  Settings, ChevronRight, Camera,
  Check, Info, LucideIcon, Globe,
  Briefcase, Phone, CreditCard, Lock
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface SettingsSection {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
}

const SECTIONS: SettingsSection[] = [
  { id: 'profile', title: 'Public Profile', icon: User, description: 'Manage your personal brand and details' },
  { id: 'notifications', title: 'Notifications', icon: Bell, description: 'Choose how you want to be alerted' },
  { id: 'security', title: 'Security', icon: Shield, description: 'Secure your account and sessions' },
  { id: 'billing', title: 'Billing', icon: CreditCard, description: 'Manage your plan and invoices' }
]

export default function SettingsPage() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('profile')

  // Honor deep links like /settings?tab=billing (used by the dashboard's
  // Renew button and SubscriptionGuard's renew flow).
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get('tab')
    if (tab && SECTIONS.some(s => s.id === tab)) setActiveTab(tab)
  }, [])
  const [isSaving, setIsSaving] = useState(false)
  const [profileSettings, setProfileSettings] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    bio: '',
    image: null as string | null
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [paymentAmount, setPaymentAmount] = useState<string>('1000')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [minPaymentAmount, setMinPaymentAmount] = useState<number>(999)
  
  const [couponCode, setCouponCode] = useState('')
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    original_amount: number;
    discount_amount: number;
    final_amount: number;
  } | null>(null)

  const [localNotificationSettings, setLocalNotificationSettings] = useState<any>({
    email_notifications: {
      new_lead: false,
      meeting_booked: false,
      daily_digest: false
    },
    push_notifications: {
      new_lead: true,
      meeting_booked: true,
      security_alerts: true
    }
  })

  useEffect(() => {
    if (user) {
      setProfileSettings({
        name: user.name || '',
        email: user.email || '',
        company: user.company_name || user.company?.name || '',
        phone: user.phone || '',
        bio: user.bio || '',
        image: user.avatar_url || null
      })
      if (user.avatar_url) setImagePreview(user.avatar_url)
      
      // Initialize notification settings
      setLocalNotificationSettings(user.notification_settings || {})
    }
  }, [user])

  useEffect(() => {
    // Fetch global subscription settings
    const fetchSubSettings = async () => {
      try {
        const res = await subscriptionApi.getSettings()
        if (res?.min_payment_amount) {
          setMinPaymentAmount(res.min_payment_amount)
          setPaymentAmount(res.min_payment_amount.toString())
        }
      } catch (err) {
        console.error('Failed to load minimum payment limit')
      }
    }
    fetchSubSettings()
  }, [])

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      toast.error('Please enter a coupon code')
      return
    }
    if (!paymentAmount || isNaN(Number(paymentAmount)) || Number(paymentAmount) <= 0) {
      toast.error('Please enter a valid amount first')
      return
    }

    try {
      setIsApplyingCoupon(true)
      const res = await api.post('/subscription/validate-coupon', {
        coupon_code: couponCode,
        amount: Number(paymentAmount)
      })
      if (res.data.success) {
        setAppliedCoupon({
          code: couponCode,
          original_amount: Number(paymentAmount),
          discount_amount: res.data.discount,
          final_amount: res.data.final_amount
        })
        toast.success(`Coupon applied! You saved ₹${res.data.discount}`)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to apply coupon')
      setAppliedCoupon(null)
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  // Recalculate or clear coupon if base amount changes
  useEffect(() => {
    if (appliedCoupon && paymentAmount) {
      // For simplicity, just clear the coupon so they re-apply on the new amount
      setAppliedCoupon(null)
      setCouponCode('')
    }
  }, [paymentAmount])

  const handleToggleSetting = async (category: string, setting: string, value: boolean) => {
    if (!user) return
    try {
      // 1. Update UI Instantly
      const updatedSettings = {
        ...(localNotificationSettings || {}),
        [category]: {
          ...((localNotificationSettings?.[category]) || {}),
          [setting]: value
        }
      }
      setLocalNotificationSettings(updatedSettings)

      // 2. Update Backend
      await api.put(`/users/${user.id}`, { 
        notification_settings: updatedSettings 
      })
      toast.success('Preference updated')
    } catch (error) {
      toast.error('Failed to save setting')
      // Revert UI on error
      setLocalNotificationSettings(user.notification_settings || {})
    }
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return
    
    try {
      setIsSaving(true)
      
      let avatarUrl = user.avatar_url;

      // 1. If a new file was selected, upload it to R2 first
      if (selectedFile) {
        const formData = new FormData()
        formData.append('image', selectedFile)
        
        try {
          const uploadRes = await api.post('/storage/r2/upload-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
          
          if (uploadRes.data.success) {
            // Delete old avatar if it exists on R2
            if (user.avatar_url) {
              try {
                await api.delete('/storage/r2/delete', { 
                  data: { path: user.avatar_url } 
                })
              } catch (e) {
                console.warn('Failed to delete old avatar:', e) // Non-blocking
              }
            }
            avatarUrl = uploadRes.data.url
          } else {
            throw new Error(uploadRes.data.message || 'Upload failed')
          }
        } catch (uploadError: any) {
          console.error('Failed to upload image to R2:', uploadError)
          const errorMsg = uploadError.response?.data?.message || uploadError.response?.data?.errors?.image?.[0] || 'Image upload failed'
          toast.error(`Image upload failed: ${errorMsg}`)
          return
        }
      }

      // 2. Update the user profile
      const response = await api.put(`/users/${user.id}`, {
        name: profileSettings.name,
        company_name: profileSettings.company,
        phone: profileSettings.phone,
        bio: profileSettings.bio,
        avatar_url: avatarUrl,
      })
      
      if (response.status === 200) {
        toast.success('Profile updated successfully')
        setSelectedFile(null) 
        // Force refresh user data or reload to show changes globally
        window.location.reload()
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error)
      const message = error.response?.data?.message || 'Failed to update profile settings'
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCustomPayment = async () => {
    const finalAmount = appliedCoupon ? appliedCoupon.final_amount : Number(paymentAmount)
    
    if (isNaN(finalAmount) || finalAmount < minPaymentAmount) {
      toast.error(`Amount must be at least ₹${minPaymentAmount}`)
      return
    }

    try {
      setIsProcessingPayment(true)

      const res = await api.post('/subscription/create-order', { 
        amount: Number(paymentAmount),
        coupon_code: appliedCoupon ? appliedCoupon.code : null
      })
      const order = res.data

      if (!order.success || !order.order_id) {
        throw new Error(order.message || 'Failed to create order')
      }

      if (!(window as any).Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = resolve
          script.onerror = reject
          document.body.appendChild(script)
        })
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: order.amount,
        currency: order.currency,
        name: 'LeadBajaar',
        description: 'Custom Subscription Payment',
        order_id: order.order_id,
        handler: async function (response: any) {
          try {
            const verifyRes = await api.post('/subscription/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: Number(paymentAmount),
              coupon_code: appliedCoupon ? appliedCoupon.code : null
            })

            if (verifyRes.data.success) {
              toast.success('Payment successful! Your account has been activated.')
              setTimeout(() => {
                window.location.reload()
              }, 1500)
            } else {
              throw new Error(verifyRes.data.message || 'Verification failed')
            }
          } catch (err: any) {
            console.error(err)
            toast.error(err.message || 'Payment verification failed.')
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: {
          color: '#4F46E5'
        }
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on('payment.failed', function (response: any) {
        toast.error('Payment failed: ' + response.error.description)
      })
      rzp.open()

    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Failed to initiate payment')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  return (
    <RoleGuard allowedFeatures={['account_settings']}>
      <div className="flex flex-col lg:flex-row flex-1 gap-6 lg:gap-8">

      {/* ── Sidebar Navigation ── */}
      <div className="w-full lg:w-72 flex flex-col gap-4 lg:gap-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[var(--crm-text-primary)]">Settings</h1>
          <p className="text-sm text-[var(--crm-text-secondary)] mt-1">Configure your account preferences</p>
        </div>

        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible no-scrollbar pb-2 lg:pb-0">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveTab(section.id)}
              className={cn(
                "group flex items-center lg:items-start gap-3 lg:gap-4 p-3 lg:p-4 rounded-xl lg:rounded-2xl transition-all duration-200 text-left relative shrink-0 lg:shrink",
                activeTab === section.id
                  ? "bg-[var(--crm-surface-1)] shadow-sm ring-1 ring-[var(--crm-border-hover)]"
                  : "hover:bg-[var(--crm-surface-2)]"
              )}
            >
              <div className={cn(
                "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center transition-colors",
                activeTab === section.id
                  ? "bg-[var(--crm-blue)] text-white shadow-lg shadow-[var(--crm-blue)]/30"
                  : "bg-[var(--crm-surface-2)] text-[var(--crm-text-secondary)] group-hover:bg-[var(--crm-surface-3)]"
              )}>
                <section.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-bold text-sm",
                  activeTab === section.id ? "text-[var(--crm-blue)]" : "text-[var(--crm-text-primary)]"
                )}>
                  {section.title}
                </p>
                <p className="hidden lg:block text-[11px] text-[var(--crm-text-secondary)] leading-tight mt-0.5">{section.description}</p>
              </div>
              {activeTab === section.id && (
                <div className="hidden lg:block absolute right-4 top-1/2 -translate-y-1/2">
                  <ChevronRight className="h-4 w-4 text-indigo-400" />
                </div>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Content Area ── */}
      <div className="flex-1 overflow-y-auto pr-0 lg:pr-4 custom-scrollbar">
        <div className="max-w-3xl mx-auto lg:mx-0 space-y-6 lg:space-y-8 pb-12">

          {activeTab === 'profile' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Header Info */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[var(--crm-text-primary)]">Profile Details</h2>
                  <p className="text-sm text-[var(--crm-text-secondary)]">Update your photo and personal information here.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="h-10 rounded-xl border-[var(--crm-border)] px-6 font-bold" onClick={() => window.location.reload()}>Cancel</Button>
                  <Button 
                    onClick={handleSaveProfile} 
                    disabled={isSaving}
                    className="h-10 rounded-xl bg-[var(--crm-blue)] hover:opacity-90 px-8 font-bold shadow-lg shadow-[var(--crm-blue)]/20 gap-2"
                  >
                    {isSaving && <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>

              {/* Profile Photo */}
              <Card className="border-[var(--crm-border)] shadow-sm bg-[var(--crm-surface-1)] p-4 lg:p-6 rounded-2xl lg:rounded-3xl ring-1 ring-[var(--crm-border)]">
                <div className="flex flex-col sm:flex-row items-center gap-6 lg:gap-8 text-center sm:text-left">
                  <div className="relative group shrink-0">
                    <Avatar className="h-24 w-24 lg:h-28 lg:w-28 ring-4 ring-[var(--crm-surface-2)] shadow-xl">
                      <AvatarImage src={imagePreview || undefined} />
                      <AvatarFallback className="text-2xl font-bold bg-[var(--crm-surface-2)]">
                        {profileSettings.name.split(' ').filter(Boolean).map(n => n[0].toUpperCase()).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 rounded-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer backdrop-blur-[2px]"
                    >
                      <div className="bg-[var(--crm-surface-1)]/20 p-2 rounded-full border border-white/40">
                        <Camera className="h-5 w-5 text-white" />
                      </div>
                    </button>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="font-bold text-[var(--crm-text-primary)] text-lg">Change Avatar</h3>
                    <p className="text-xs text-[var(--crm-text-tertiary)] max-w-xs leading-relaxed mx-auto sm:mx-0">
                      Recommended: 400x400px. JPG, PNG or WebP. Max size: 2MB. Your avatar will be visible to team members.
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                      <Button variant="outline" size="sm" className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider px-3" onClick={() => fileInputRef.current?.click()}>Upload New</Button>
                      <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-600" onClick={() => setImagePreview(null)}>Remove</Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Form Fields */}
              <Card className="border-[var(--crm-border)] shadow-sm bg-[var(--crm-surface-1)] p-6 lg:p-8 rounded-2xl lg:rounded-3xl ring-1 ring-[var(--crm-border)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-[var(--crm-text-secondary)] uppercase tracking-wider">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--crm-text-tertiary)]" />
                      <Input value={profileSettings.name} onChange={e => setProfileSettings(p => ({ ...p, name: e.target.value }))} className="pl-10 h-10 bg-[var(--crm-surface-1)] border-[var(--crm-border)] focus:ring-[var(--crm-blue)] focus:border-[var(--crm-blue)] bg-[var(--crm-surface-1)] rounded-xl font-medium" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-[var(--crm-text-secondary)] uppercase tracking-wider">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--crm-text-tertiary)]" />
                      <Input value={profileSettings.email} disabled className="pl-10 h-10 bg-[var(--crm-surface-2)] border-[var(--crm-border)] rounded-xl text-[var(--crm-text-tertiary)] cursor-not-allowed" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-[var(--crm-text-secondary)] uppercase tracking-wider">Company</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--crm-text-tertiary)]" />
                      <Input value={profileSettings.company} onChange={e => setProfileSettings(p => ({ ...p, company: e.target.value }))} className="pl-10 h-10 bg-[var(--crm-surface-1)] border-[var(--crm-border)] focus:ring-[var(--crm-blue)] focus:border-[var(--crm-blue)] bg-[var(--crm-surface-1)] rounded-xl font-medium" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-[var(--crm-text-secondary)] uppercase tracking-wider">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--crm-text-tertiary)]" />
                      <Input value={profileSettings.phone} onChange={e => setProfileSettings(p => ({ ...p, phone: e.target.value }))} className="pl-10 h-10 bg-[var(--crm-surface-1)] border-[var(--crm-border)] focus:ring-[var(--crm-blue)] focus:border-[var(--crm-blue)] bg-[var(--crm-surface-1)] rounded-xl font-medium" />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-xs font-bold text-[var(--crm-text-secondary)] uppercase tracking-wider">Bio / Signature</Label>
                    <Textarea value={profileSettings.bio} onChange={e => setProfileSettings(p => ({ ...p, bio: e.target.value }))} className="h-32 bg-[var(--crm-surface-1)] border-[var(--crm-border)] focus:ring-[var(--crm-blue)] focus:border-[var(--crm-blue)] bg-[var(--crm-surface-1)] rounded-2xl p-4 font-medium resize-none" placeholder="Write a few lines about yourself..." />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h2 className="text-xl font-bold text-[var(--crm-text-primary)]">Push & Email Notifications</h2>
                <p className="text-sm text-[var(--crm-text-secondary)]">Control how you stay updated with platform events.</p>
              </div>

              <Card className="border-[var(--crm-border)] shadow-sm bg-[var(--crm-surface-1)] rounded-3xl overflow-hidden ring-1 ring-[var(--crm-border)]">
                <div className="divide-y divide-[var(--crm-border)]">
                  {/* Lead Notifications */}
                  <div className="p-6 space-y-4 hover:bg-[var(--crm-surface-2)] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 pr-4">
                        <p className="font-bold text-[var(--crm-text-primary)]">Lead Notifications</p>
                        <p className="text-xs text-[var(--crm-text-secondary)] leading-relaxed">Receive alerts when a new lead arrives in your pipeline.</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col items-center gap-1.5">
                           <span className="text-[10px] font-bold text-[var(--crm-text-tertiary)] uppercase tracking-tighter">Email</span>
                           <Switch 
                            checked={localNotificationSettings?.email_notifications?.new_lead === true}
                            onCheckedChange={(checked) => handleToggleSetting('email_notifications', 'new_lead', checked)}
                            className="data-[state=checked]:bg-[var(--crm-blue)] scale-90" 
                          />
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                           <span className="text-[10px] font-bold text-[var(--crm-text-tertiary)] uppercase tracking-tighter">Push</span>
                           <Switch 
                            checked={localNotificationSettings?.push_notifications?.new_lead !== false}
                            onCheckedChange={(checked) => handleToggleSetting('push_notifications', 'new_lead', checked)}
                            className="data-[state=checked]:bg-[var(--crm-blue)] scale-90" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Meeting Notifications */}
                  <div className="p-6 space-y-4 hover:bg-[var(--crm-surface-2)] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 pr-4">
                        <p className="font-bold text-[var(--crm-text-primary)]">Meeting Notifications</p>
                        <p className="text-xs text-[var(--crm-text-secondary)] leading-relaxed">Alerts for new bookings and confirmed appointments.</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col items-center gap-1.5">
                           <span className="text-[10px] font-bold text-[var(--crm-text-tertiary)] uppercase tracking-tighter">Email</span>
                           <Switch 
                            checked={localNotificationSettings?.email_notifications?.meeting_booked === true}
                            onCheckedChange={(checked) => handleToggleSetting('email_notifications', 'meeting_booked', checked)}
                            className="data-[state=checked]:bg-[var(--crm-blue)] scale-90" 
                          />
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                           <span className="text-[10px] font-bold text-[var(--crm-text-tertiary)] uppercase tracking-tighter">Push</span>
                           <Switch 
                            checked={localNotificationSettings?.push_notifications?.meeting_booked !== false}
                            onCheckedChange={(checked) => handleToggleSetting('push_notifications', 'meeting_booked', checked)}
                            className="data-[state=checked]:bg-[var(--crm-blue)] scale-90" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Daily Digest */}
                  <div className="p-6 flex items-center justify-between hover:bg-[var(--crm-surface-2)] transition-colors">
                    <div className="space-y-1 pr-4">
                      <p className="font-bold text-[var(--crm-text-primary)]">Daily Performance Digest</p>
                      <p className="text-xs text-[var(--crm-text-secondary)] leading-relaxed">A summary of your daily conversion rates and top lead rankings at 9:00 AM.</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                       <span className="text-[10px] font-bold text-[var(--crm-text-tertiary)] uppercase tracking-tighter mr-2">Email Only</span>
                       <Switch 
                        checked={localNotificationSettings?.email_notifications?.daily_digest === true}
                        onCheckedChange={(checked) => handleToggleSetting('email_notifications', 'daily_digest', checked)}
                        className="data-[state=checked]:bg-[var(--crm-blue)]" 
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h2 className="text-xl font-bold text-[var(--crm-text-primary)]">Security & Privacy</h2>
                <p className="text-sm text-[var(--crm-text-secondary)]">Manage your password and platform access control.</p>
              </div>

              <Card className="border-[var(--crm-border)] shadow-sm bg-[var(--crm-surface-1)] p-8 rounded-3xl ring-1 ring-[var(--crm-border)]">
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--crm-surface-1)] border border-[var(--crm-border)]">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 flex items-center justify-center bg-[var(--crm-surface-1)] border border-[var(--crm-border)] rounded-xl">
                        <Lock className="h-5 w-5 text-[var(--crm-blue)]" />
                      </div>
                      <div>
                        <p className="font-bold text-[var(--crm-text-primary)]">Password Authentication</p>
                        <p className="text-[11px] text-[var(--crm-text-secondary)] uppercase font-bold tracking-wider pt-0.5">Last updated 3 months ago</p>
                      </div>
                    </div>
                    <Button variant="outline" className="h-9 px-6 rounded-xl font-bold border-[var(--crm-border)]">Change</Button>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--crm-surface-1)] border border-[var(--crm-border)]">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 flex items-center justify-center bg-[var(--crm-surface-1)] border border-[var(--crm-border)] rounded-xl">
                        <Shield className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="font-bold text-[var(--crm-text-primary)]">Two-Factor Authentication</p>
                        <p className="text-[11px] text-[var(--crm-text-secondary)]">Currently disabled. We recommend enabling for extra security.</p>
                      </div>
                    </div>
                    <Button className="h-9 px-6 rounded-xl font-bold bg-[var(--crm-blue)] hover:opacity-90 shadow-sm">Enable Now</Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h2 className="text-xl font-bold text-[var(--crm-text-primary)]">Billing & Usage</h2>
                <p className="text-sm text-[var(--crm-text-secondary)]">View your current plan, limits, and platform usage.</p>
              </div>

              <Card className="border-[var(--crm-border)] shadow-sm bg-[var(--crm-surface-1)] p-8 rounded-3xl ring-1 ring-[var(--crm-border)]">
                <div className="space-y-6">
                  {/* Current Plan & Custom Payment */}
                  <div className="flex flex-col gap-6 pb-6 border-b border-[var(--crm-border)]">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <p className="text-xs font-bold text-[var(--crm-text-secondary)] uppercase tracking-wider mb-1">Current Plan</p>
                        <h3 className="text-2xl font-bold text-[var(--crm-text-primary)] capitalize flex items-center gap-2">
                          {user?.company?.plan || 'Free'} Plan
                          <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-600 border-emerald-200">
                            {user?.company?.status || 'Active'}
                          </Badge>
                        </h3>
                        {user?.company?.expires_at && (
                          <p className="text-sm font-medium text-[var(--crm-text-secondary)] mt-1">
                            Expires on: {new Date(user.company.expires_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Custom Payment Section */}
                    <div className="bg-[var(--crm-surface-2)] p-4 rounded-xl border border-[var(--crm-border)] flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex-1">
                          <p className="font-bold text-[var(--crm-text-primary)]">Custom Payment</p>
                          <p className="text-xs text-[var(--crm-text-secondary)] leading-relaxed">
                            Enter the amount to pay (Min: ₹{minPaymentAmount}). Your account will automatically activate with a Pro plan pending admin review.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[var(--crm-text-tertiary)]">₹</span>
                            <Input 
                              type="number" 
                              min={minPaymentAmount}
                              value={paymentAmount} 
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              className="pl-7 w-28 h-10 bg-[var(--crm-surface-1)] border-[var(--crm-border)] rounded-xl font-bold"
                            />
                          </div>
                          <div className="relative flex gap-2">
                            <Input 
                              type="text" 
                              placeholder="Coupon code"
                              value={couponCode} 
                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                              className="w-32 h-10 bg-[var(--crm-surface-1)] border-[var(--crm-border)] rounded-xl uppercase"
                            />
                            <Button 
                              variant="outline"
                              onClick={handleApplyCoupon}
                              disabled={isApplyingCoupon || !couponCode}
                              className="rounded-xl h-10"
                            >
                              Apply
                            </Button>
                          </div>
                        </div>
                      </div>

                      {appliedCoupon && (
                        <div className="flex justify-end pt-2 border-t border-[var(--crm-border)]">
                          <div className="text-right text-sm">
                            <p className="text-[var(--crm-text-secondary)] line-through">Subtotal: ₹{appliedCoupon.original_amount}</p>
                            <p className="text-emerald-600 font-semibold text-xs mb-1">
                              Coupon {appliedCoupon.code} applied (-₹{appliedCoupon.discount_amount})
                            </p>
                            <p className="font-bold text-lg text-[var(--crm-text-primary)]">Total: ₹{appliedCoupon.final_amount}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Button 
                          onClick={handleCustomPayment} 
                          disabled={isProcessingPayment}
                          className="rounded-xl font-bold bg-[var(--crm-blue)] hover:opacity-90 h-10 px-8"
                        >
                          {isProcessingPayment ? 'Processing...' : `Pay ₹${appliedCoupon ? appliedCoupon.final_amount : paymentAmount}`}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Email Usage limit */}
                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-bold text-[var(--crm-text-primary)] flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[var(--crm-blue)]" /> Monthly Email Usage
                      </p>
                      <p className="text-sm font-medium text-[var(--crm-text-secondary)]">
                        {user?.company?.monthly_email_count || 0} sent
                        {user?.company?.plan === 'pro' && ' / 5,000'}
                        {user?.company?.plan === 'enterprise' && ' / 50,000'}
                        {(!user?.company?.plan || user?.company?.plan === 'free') && ' / 100'}
                        {(user?.company?.plan === 'agency' || user?.company?.type === 'agency') && ' (Unlimited)'}
                      </p>
                    </div>
                    {/* Fake progress bar calculation */}
                    <div className="h-3 w-full bg-[var(--crm-surface-2)] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[var(--crm-blue)] to-[var(--crm-blue-border)] rounded-full"
                        style={{ 
                          width: (user?.company?.plan === 'agency' || user?.company?.type === 'agency') 
                            ? '5%' 
                            : `${Math.min(100, ((user?.company?.monthly_email_count || 0) / (
                                user?.company?.plan === 'pro' ? 5000 : 
                                user?.company?.plan === 'enterprise' ? 50000 : 100
                              )) * 100)}%` 
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-[var(--crm-text-secondary)] mt-2">Emails are sent via AWS SES and include full tracking. Count resets on the 1st of every month.</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

        </div>
      </div>
    </div>
    </RoleGuard>
  )
}
