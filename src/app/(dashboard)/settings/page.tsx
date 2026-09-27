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
import { PageHeader } from '@/components/page-header/PageHeader'
import {
  User, Bell, Shield, Mail,
  Settings, ChevronRight, Camera,
  Check, Info, LucideIcon, Globe,
  Briefcase, Phone, CreditCard, Lock, Download,
  Users, Blocks, SlidersHorizontal, Edit2, Upload, Trash2
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    if (tab && SECTIONS.some(s => s.id === tab)) {
      setActiveTab(tab)
      const amount = params.get('amount')
      if (amount && tab === 'billing') {
        setPaymentAmount(amount)
      }
    }
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

  const [paymentAmount, setPaymentAmount] = useState<string>('1500')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [minPaymentAmount, setMinPaymentAmount] = useState<number>(1500)
  
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

      // If they have an expiry date or start date, they are an existing customer (admin might have set them up)
      const isExistingCustomer = user.company?.subscription_started_at || user.company?.expires_at;
      let defaultPrice = user.company?.plan_details?.price || 1500;
      
      if (user.company?.custom_setup_fee && !isExistingCustomer) {
        defaultPrice = user.company.custom_setup_fee;
      } else if (user.company?.custom_renewal_fee && isExistingCustomer) {
        defaultPrice = user.company.custom_renewal_fee;
      }
      setPaymentAmount(defaultPrice.toString())
      setMinPaymentAmount(defaultPrice)
    }
  }, [user])

  const [invoices, setInvoices] = useState<any[]>([])

  useEffect(() => {
    // Fetch global subscription settings
    const fetchSubSettings = async () => {
      try {
        const res = await subscriptionApi.getSettings()
        if (res?.min_payment_amount) {
          setMinPaymentAmount((prev) => {
            // If the user already has a plan price set, don't override it
            return prev === 1500 ? res.min_payment_amount : prev;
          })
        }
      } catch (err: any) {
        console.warn('Failed to load minimum payment limit:', err.message)
      }
    }
    const fetchInvoices = async () => {
      try {
        const res = await subscriptionApi.getInvoices()
        if (res?.invoices) setInvoices(res.invoices)
      } catch (err: any) {
        console.warn('Failed to load invoices:', err.message)
      }
    }
    fetchSubSettings()
    fetchInvoices()
  }, [])

  const handleDownloadInvoice = async (invoiceId: number) => {
    try {
      const toastId = toast.loading('Generating invoice...')
      const response = await api.get(`/invoices/${invoiceId}/download`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `invoice-${invoiceId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Invoice downloaded', { id: toastId })
    } catch (error) {
      toast.error('Failed to download invoice')
    }
  }

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
      const message = error.response?.data?.message || 'Failed to update profile settings'
      console.error('Failed to update profile:', message)
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
      <div className="flex flex-col h-full w-full gap-6 lg:gap-8 flex-1 min-h-0 relative">
        <PageHeader 
          title="Settings" 
          description="Manage your account, preferences and workspace settings." 
          actions={
            <div className="flex items-center gap-3">
              <Button variant="outline" className="h-10 rounded-xl px-6 font-semibold bg-white border-slate-200" onClick={() => window.location.reload()}>Cancel</Button>
              <Button 
                onClick={handleSaveProfile} 
                disabled={isSaving}
                className="h-10 rounded-xl bg-[#ff5a36] hover:opacity-90 px-6 font-semibold shadow-sm text-white gap-2 border-0"
              >
                {isSaving && <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          }
        />

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1 min-h-0">
          {/* ── Sidebar Navigation ── */}
          <div className="w-full lg:w-72 flex flex-col gap-2 shrink-0">

            <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible no-scrollbar pb-2 lg:pb-0">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  className={cn(
                    "group flex items-center lg:items-start gap-4 p-4 rounded-2xl transition-all duration-200 text-left relative shrink-0 lg:shrink",
                    activeTab === section.id
                      ? "bg-red-50 text-slate-900 font-semibold"
                      : "bg-white text-slate-700 hover:bg-slate-50 border border-transparent shadow-sm"
                  )}
                >
                  <div className={cn(
                    "h-10 w-10 shrink-0 rounded-[14px] flex items-center justify-center transition-colors",
                    activeTab === section.id
                      ? "bg-[#ff5a36] text-white shadow-sm"
                      : "bg-slate-50 text-slate-500 group-hover:bg-slate-100"
                  )}>
                    <section.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center h-10">
                    <p className={cn(
                      "text-[15px]",
                      activeTab === section.id ? "font-bold" : "font-semibold"
                    )}>
                      {section.title}
                    </p>
                    <p className="hidden lg:block text-[12px] text-slate-500 leading-tight mt-0.5">{section.description}</p>
                  </div>
                  {activeTab === section.id && (
                    <div className="hidden lg:block absolute right-4 top-1/2 -translate-y-1/2">
                      <ChevronRight className="h-4 w-4 text-red-500" />
                    </div>
                  )}
                </button>
              ))}
        </nav>
      </div>

          {/* ── Content Area ── */}
          <div className="flex-1 overflow-y-auto pb-12 custom-scrollbar pr-1">
            <div className="max-w-4xl space-y-8">

          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Profile Information Card */}
              <div className="bg-white rounded-[14px] p-6 shadow-sm border border-slate-100">
                <div className="mb-6">
                  <h3 className="text-[17px] font-bold text-slate-900">Profile Information</h3>
                  <p className="text-[13px] text-slate-500 mt-1">Update your photo and personal information. This information will be visible to your team members.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-6 lg:gap-8 text-center sm:text-left">
                  <div className="relative group shrink-0">
                    <Avatar className="h-[104px] w-[104px] ring-4 ring-red-50 bg-red-50">
                      <AvatarImage src={imagePreview || undefined} />
                      <AvatarFallback className="text-[32px] font-bold text-slate-900 bg-red-50">
                        {profileSettings.name.split(' ').filter(Boolean).map(n => n[0].toUpperCase()).join('') || 'MD'}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-white rounded-xl p-2 shadow-sm border border-slate-200 cursor-pointer text-slate-700 hover:text-slate-900"
                    >
                      <Camera className="h-[18px] w-[18px]" />
                    </button>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div>
                      <h3 className="font-bold text-slate-900 text-[14px]">Change Avatar</h3>
                      <p className="text-[12px] text-slate-500 mt-0.5">
                        Recommended: 400x400px, JPG, PNG or WebP. Max size: 2MB.
                      </p>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-3 mt-3">
                      <Button variant="outline" className="h-9 rounded-lg font-semibold border-slate-200 text-slate-700 bg-white" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="h-3.5 w-3.5 mr-2" />
                        Upload New
                      </Button>
                      <Button variant="outline" className="h-9 rounded-lg font-semibold bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300 hover:text-red-700 shadow-none transition-all" onClick={() => setImagePreview(null)}>
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Fields Card */}
              <div className="bg-white rounded-[14px] p-6 shadow-sm border border-slate-100">
                <div className="mb-6">
                  <h3 className="text-[17px] font-bold text-slate-900">Personal Details</h3>
                  <p className="text-[13px] text-slate-500 mt-1">Keep your information up to date.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                  <div className="space-y-2">
                    <Label className="text-[13px] font-bold text-slate-900">Full Name <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-slate-400" />
                      <Input value={profileSettings.name} onChange={e => setProfileSettings(p => ({ ...p, name: e.target.value }))} className="pl-[38px] h-10 bg-white border-slate-200 rounded-[10px] font-medium" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] font-bold text-slate-900">Email Address <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-slate-400" />
                      <Input value={profileSettings.email} disabled className="pl-[38px] h-10 bg-slate-50 border-slate-200 rounded-[10px] text-slate-500 cursor-not-allowed" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] font-bold text-slate-900">Company</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-slate-400" />
                      <Input value={profileSettings.company} onChange={e => setProfileSettings(p => ({ ...p, company: e.target.value }))} className="pl-[38px] h-10 bg-white border-slate-200 rounded-[10px] font-medium" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] font-bold text-slate-900">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-slate-400" />
                      <Input value={profileSettings.phone} onChange={e => setProfileSettings(p => ({ ...p, phone: e.target.value }))} className="pl-[38px] h-10 bg-white border-slate-200 rounded-[10px] font-medium" />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-[13px] font-bold text-slate-900">Bio / Signature</Label>
                    <div className="relative">
                      <Edit2 className="absolute left-3 top-[14px] h-[18px] w-[18px] text-slate-400" />
                      <Textarea value={profileSettings.bio} onChange={e => setProfileSettings(p => ({ ...p, bio: e.target.value }))} className="pl-[38px] h-24 bg-white border-slate-200 rounded-[10px] py-3.5 font-medium resize-none" placeholder="Write a few lines about yourself...&#10;For example: your role, expertise, interests, etc." />
                    </div>
                    <div className="flex justify-end mt-1">
                      <span className="text-[11px] text-slate-400">{profileSettings.bio.length}/500 characters</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Preview Card */}
              <div className="bg-white rounded-[14px] p-6 shadow-sm border border-slate-100">
                <div className="mb-6">
                  <h3 className="text-[17px] font-bold text-slate-900">Profile Preview</h3>
                  <p className="text-[13px] text-slate-500 mt-1">This is how your profile will appear to your team members.</p>
                </div>
                <div className="bg-[#fff1ed] border border-[#ffe0d6] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-5">
                    <Avatar className="h-16 w-16 bg-[#ffddce] text-[#ff5a36] font-bold text-xl ring-2 ring-[#ffe0d6]">
                      <AvatarImage src={imagePreview || undefined} />
                      <AvatarFallback className="bg-[#ffddce] text-[#ff5a36]">{profileSettings.name.split(' ').filter(Boolean).map(n => n[0].toUpperCase()).join('') || 'MD'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-[16px]">{profileSettings.name || 'Your Name'}</h4>
                        <Badge variant="secondary" className="bg-[#ffddce] text-[#ff5a36] text-[10px] uppercase font-bold tracking-wider hover:bg-[#ffddce] px-2 py-0.5 rounded-full border-0">Admin</Badge>
                      </div>
                      <p className="text-[13px] text-slate-600 mt-0.5">{profileSettings.company || 'Your Workspace'}</p>
                      <div className="flex items-center gap-5 mt-2.5 text-[12px] text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-slate-400" /> {profileSettings.email || 'Email not set'}</div>
                        <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-400" /> {profileSettings.phone || 'Not provided'}</div>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="shrink-0 h-9 rounded-[8px] font-bold border-[#ffd1c3] text-[#ff5a36] bg-transparent hover:bg-white hover:text-[#ff5a36] w-full sm:w-auto">
                    <Edit2 className="h-3.5 w-3.5 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h2 className="text-xl font-bold text-[var(--crm-text-primary)]">Push & Email Notifications</h2>
                <p className="text-sm text-[var(--crm-text-secondary)] mt-1">Control how you stay updated with platform events.</p>
              </div>

              <div className="overflow-hidden">
                <div className="divide-y divide-[var(--crm-border)]">
                  {/* Lead Notifications */}
                  <div className="p-5 lg:p-6 space-y-4 hover:bg-[var(--crm-surface-2)] transition-colors">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1 pr-4">
                        <p className="font-bold text-[var(--crm-text-primary)]">Lead Notifications</p>
                        <p className="text-xs text-[var(--crm-text-secondary)] leading-relaxed">Receive alerts when a new lead arrives in your pipeline.</p>
                      </div>
                      <div className="flex items-center gap-6 shrink-0">
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
                  <div className="p-5 lg:p-6 space-y-4 hover:bg-[var(--crm-surface-2)] transition-colors">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1 pr-4">
                        <p className="font-bold text-[var(--crm-text-primary)]">Meeting Notifications</p>
                        <p className="text-xs text-[var(--crm-text-secondary)] leading-relaxed">Alerts for new bookings and confirmed appointments.</p>
                      </div>
                      <div className="flex items-center gap-6 shrink-0">
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
                  <div className="p-5 lg:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[var(--crm-surface-2)] transition-colors">
                    <div className="space-y-1 pr-4">
                      <p className="font-bold text-[var(--crm-text-primary)]">Daily Performance Digest</p>
                      <p className="text-xs text-[var(--crm-text-secondary)] leading-relaxed">A summary of your daily conversion rates and top lead rankings at 9:00 AM.</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                       <span className="text-[10px] font-bold text-[var(--crm-text-tertiary)] uppercase tracking-tighter mr-2">Email Only</span>
                       <Switch 
                        checked={localNotificationSettings?.email_notifications?.daily_digest === true}
                        onCheckedChange={(checked) => handleToggleSetting('email_notifications', 'daily_digest', checked)}
                        className="data-[state=checked]:bg-[var(--crm-blue)]" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h2 className="text-xl font-bold text-[var(--crm-text-primary)]">Security & Privacy</h2>
                <p className="text-sm text-[var(--crm-text-secondary)]">Manage your password and platform access control.</p>
              </div>

              <div className="py-4">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-[var(--crm-border)]">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 shrink-0 flex items-center justify-center bg-[var(--crm-surface-1)] border border-[var(--crm-border)] rounded-xl">
                        <Lock className="h-5 w-5 text-[var(--crm-blue)]" />
                      </div>
                      <div>
                        <p className="font-bold text-[var(--crm-text-primary)] text-sm">Password Authentication</p>
                        <p className="text-[11px] text-[var(--crm-text-secondary)] uppercase font-bold tracking-wider pt-0.5">Last updated 3 months ago</p>
                      </div>
                    </div>
                    <Button variant="outline" className="h-9 w-full sm:w-auto px-6 rounded-xl font-bold border-[var(--crm-border)]">Change</Button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 shrink-0 flex items-center justify-center bg-[var(--crm-surface-1)] border border-[var(--crm-border)] rounded-xl">
                        <Shield className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="font-bold text-[var(--crm-text-primary)] text-sm">Two-Factor Authentication</p>
                        <p className="text-xs text-[var(--crm-text-secondary)]">Currently disabled. We recommend enabling for extra security.</p>
                      </div>
                    </div>
                    <Button className="h-9 w-full sm:w-auto px-6 rounded-xl font-bold bg-[var(--crm-blue)] hover:opacity-90">Enable Now</Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h2 className="text-xl font-bold text-[var(--crm-text-primary)]">Billing & Usage</h2>
                <p className="text-sm text-[var(--crm-text-secondary)]">View your current plan, limits, and platform usage.</p>
              </div>

              <div className="py-6">
                <div className="space-y-8">
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
                    <div className="bg-[var(--crm-surface-2)] p-5 rounded-2xl border border-[var(--crm-border)] flex flex-col gap-5">
                      <div className="flex flex-col xl:flex-row items-start xl:items-center gap-4">
                        <div className="flex-1">
                          <p className="font-bold text-[var(--crm-text-primary)] text-sm">Custom Payment</p>
                          <p className="text-xs text-[var(--crm-text-secondary)] leading-relaxed mt-1">
                            Enter the amount to pay (Min: ₹{minPaymentAmount}). Your account will automatically activate with a Pro plan pending admin review.
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[var(--crm-text-tertiary)]">₹</span>
                            <Input 
                              type="number" 
                              min={minPaymentAmount}
                              value={paymentAmount} 
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              className="pl-7 w-full sm:w-32 h-10 bg-[var(--crm-surface-1)] border-[var(--crm-border)] rounded-xl font-bold"
                            />
                          </div>
                          <div className="relative flex gap-2 w-full sm:w-auto">
                            <Input 
                              type="text" 
                              placeholder="Coupon code"
                              value={couponCode} 
                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                              className="w-full sm:w-32 h-10 bg-[var(--crm-surface-1)] border-[var(--crm-border)] rounded-xl uppercase flex-1"
                            />
                            <Button 
                              variant="outline"
                              onClick={handleApplyCoupon}
                              disabled={isApplyingCoupon || !couponCode}
                              className="rounded-xl h-10 shrink-0"
                            >
                              Apply
                            </Button>
                          </div>
                        </div>
                      </div>

                      {appliedCoupon && (
                        <div className="flex justify-end pt-3 border-t border-[var(--crm-border)]">
                          <div className="text-right text-sm">
                            <p className="text-[var(--crm-text-secondary)] line-through">Subtotal: ₹{appliedCoupon.original_amount}</p>
                            <p className="text-emerald-600 font-semibold text-xs mb-1">
                              Coupon {appliedCoupon.code} applied (-₹{appliedCoupon.discount_amount})
                            </p>
                            <p className="font-bold text-lg text-[var(--crm-text-primary)]">Total: ₹{appliedCoupon.final_amount}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-start sm:justify-end">
                        <Button 
                          onClick={handleCustomPayment} 
                          disabled={isProcessingPayment}
                          className="rounded-xl font-bold bg-[var(--crm-blue)] hover:opacity-90 h-10 px-8 w-full sm:w-auto"
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
              </div>

              <div className="py-6 border-t border-[var(--crm-border)]">
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-[var(--crm-text-primary)]">Billing History & Invoices</h3>
                  {invoices.length === 0 ? (
                    <p className="text-sm text-[var(--crm-text-secondary)]">No previous invoices found.</p>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-[var(--crm-border)]">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-[var(--crm-text-secondary)] uppercase bg-[var(--crm-surface-2)] border-b border-[var(--crm-border)]">
                          <tr>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Plan</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Notes</th>
                            <th className="px-4 py-3 text-right">Invoice</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoices.map((inv) => (
                            <tr key={inv.id} className="border-b border-[var(--crm-border)] last:border-0 hover:bg-[var(--crm-surface-2)]/50 transition-colors">
                              <td className="px-4 py-4 font-medium text-[var(--crm-text-primary)] whitespace-nowrap">{inv.date}</td>
                              <td className="px-4 py-4 font-bold text-[var(--crm-text-primary)] whitespace-nowrap">₹{inv.amount}</td>
                              <td className="px-4 py-4 capitalize whitespace-nowrap">{inv.plan_name || '-'}</td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <Badge variant="outline" className={cn(
                                  "text-[10px] uppercase font-bold",
                                  (!inv.status || inv.status.toLowerCase() === 'success' || inv.status.toLowerCase() === 'approved') 
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                                    : 'bg-amber-50 text-amber-600 border-amber-200'
                                )}>
                                  {inv.status || 'Success'}
                                </Badge>
                              </td>
                              <td className="px-4 py-4 text-xs text-[var(--crm-text-secondary)] min-w-[200px]">{inv.notes || '-'}</td>
                              <td className="px-4 py-4 text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDownloadInvoice(inv.id)}
                                  className="text-[var(--crm-primary)] hover:text-[var(--crm-primary-dark)] hover:bg-[var(--crm-primary)]/10"
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
    </div>
    </RoleGuard>
  )
}
