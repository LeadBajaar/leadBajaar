"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Shield, HelpCircle, ArrowRight, Zap, Sparkles, Building, Star } from 'lucide-react'
import { useUser } from '@/contexts/UserContext'

export default function PlansPage() {
  const router = useRouter()
  const { user } = useUser()
  const [isYearly, setIsYearly] = useState(false)

  const currentPlan = (user?.company?.plan || 'free').toLowerCase()

  const plans = [
    {
      name: 'Free',
      id: 'free',
      price: 0,
      description: 'Perfect for exploring CRM capabilities.',
      icon: Shield,
      features: [
        '100 leads per month limit',
        '1 Team member seat',
        'Basic lead list and details',
        'Standard Kanban pipeline view',
        'Email notifications'
      ],
      cta: 'Current Plan',
      popular: false,
      color: 'border-slate-200 text-slate-800 bg-white hover:bg-slate-50'
    },
    {
      name: 'Pro',
      id: 'pro',
      price: 1499,
      description: 'Ideal for small teams and active agents.',
      icon: Zap,
      features: [
        '5,000 leads per month limit',
        'Up to 5 Team member seats',
        'Full WhatsApp Cloud API access',
        'Live Chat interface integration',
        'Custom Webhooks for automation',
        'Priority email support'
      ],
      cta: 'Upgrade to Pro',
      popular: true,
      color: 'bg-gradient-to-r from-[#4E54F3] to-[#3B82F6] text-white hover:opacity-95 shadow-md shadow-blue-500/10'
    },
    {
      name: 'Enterprise',
      id: 'enterprise',
      price: 4999,
      description: 'Built for scaling sales operations.',
      icon: Star,
      features: [
        '50,000 leads per month limit',
        'Unlimited Team member seats',
        'Custom Lead Forms with builder',
        'Advanced Analytics and exports',
        'Multiple WhatsApp lines',
        'Dedicated account manager',
        '24/7 Priority support SLA'
      ],
      cta: 'Upgrade to Enterprise',
      popular: false,
      color: 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
    },
    {
      name: 'Agency',
      id: 'agency',
      price: 9999,
      description: 'White-label solutions for resellers.',
      icon: Building,
      features: [
        'Unlimited leads per month',
        'Multi-tenant workspace setup',
        'Custom white-label branding',
        'Custom domains integration',
        'Full API access & developer hub',
        'Direct developer-to-developer support'
      ],
      cta: 'Upgrade to Agency',
      popular: false,
      color: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-95 shadow-md shadow-purple-500/10'
    }
  ]

  const handleSelectPlan = (planId: string, price: number) => {
    if (planId === 'free') {
      router.push('/dashboard')
      return
    }
    // Calculate final price based on billing frequency
    const finalPrice = isYearly ? Math.round(price * 10) : price
    router.push(`/settings?tab=billing&amount=${finalPrice}`)
  }

  const faqs = [
    {
      q: 'How does payment work?',
      a: 'We support custom online payments through standard bank transfers and UPI. Once you enter the custom amount and execute the payment, the system processes it, and pending admin review, your upgrade is activated automatically.'
    },
    {
      q: 'Can I change my plan later?',
      a: 'Absolutely. You can change your plan amount or upgrade at any time directly through the Billing Settings page. Your limits will be automatically adjusted.'
    },
    {
      q: 'What is the "custom renewal" fee?',
      a: 'Administrators have the capability to set custom renewal or setup fees for specific companies. If a custom fee is configured, your checkout amount on the billing tab will reflect that rate.'
    }
  ]

  return (
    <div className="flex-1 flex flex-col bg-slate-50/50 p-6 sm:p-8 lg:p-12 overflow-y-auto custom-scrollbar">
      {/* Header Info */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none mb-4 satoshi-heading">
          Plans & Pricing
        </h1>
        <p className="text-sm sm:text-base text-slate-500 font-semibold leading-relaxed">
          Upgrade your LeadBajaar CRM workspace to unlock higher lead thresholds, live chat integration, and advanced automations.
        </p>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <span className={`text-xs font-extrabold transition-all duration-150 ${!isYearly ? 'text-slate-900' : 'text-slate-400'}`}>
            Monthly
          </span>
          <button 
            onClick={() => setIsYearly(!isYearly)}
            className="w-12 h-6.5 rounded-full bg-slate-200 p-0.5 transition-all duration-200 relative flex items-center"
          >
            <div className={`w-5.5 h-5.5 rounded-full bg-white shadow-sm transition-all duration-200 transform ${isYearly ? 'translate-x-5.5' : 'translate-x-0'}`} />
          </button>
          <span className={`text-xs font-extrabold transition-all duration-150 flex items-center gap-1.5 ${isYearly ? 'text-slate-900' : 'text-slate-400'}`}>
            Yearly 
            <span className="bg-emerald-100 text-emerald-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md leading-none select-none">
              Save 17%
            </span>
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto w-full mb-16">
        {plans.map((p) => {
          const isCurrent = currentPlan === p.id
          const Icon = p.icon
          const displayPrice = isYearly ? p.price * 10 : p.price

          return (
            <div 
              key={p.id}
              className={`relative flex flex-col bg-white rounded-2xl border transition-all duration-200 p-6 flex-1 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:scale-[1.01] ${
                p.popular 
                  ? 'border-[#2563EB]/80 ring-2 ring-[#2563EB]/10' 
                  : 'border-slate-200/80'
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#4E54F3] to-[#3B82F6] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 select-none">
                  <Sparkles className="h-2.5 w-2.5" />
                  Most Popular
                </span>
              )}

              <div className="mb-6 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  p.popular ? 'bg-blue-50 text-[#2563EB]' : 'bg-slate-50 text-slate-600'
                }`}>
                  <Icon className="h-5 w-5 shrink-0" strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-[16px] font-extrabold text-slate-900 satoshi-heading">{p.name}</h3>
                  <p className="text-[11px] font-bold text-slate-400 capitalize">{p.id} tier</p>
                </div>
              </div>

              <div className="mb-5 flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900 satoshi-heading">₹{displayPrice.toLocaleString()}</span>
                <span className="text-[12px] font-bold text-slate-400">/{isYearly ? 'year' : 'month'}</span>
              </div>

              <p className="text-[12px] font-semibold text-slate-500 mb-6 leading-relaxed min-h-[36px]">
                {p.description}
              </p>

              {/* Select Button */}
              <button
                onClick={() => handleSelectPlan(p.id, p.price)}
                disabled={isCurrent && p.id === 'free'}
                className={`w-full h-11 rounded-xl text-[12px] font-extrabold transition-all flex items-center justify-center gap-2 select-none hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 ${
                  isCurrent 
                    ? 'bg-slate-100 text-slate-500 border border-slate-200 cursor-default' 
                    : p.color
                }`}
              >
                {isCurrent ? 'Your Plan' : p.cta}
                {!isCurrent && p.id !== 'free' && <ArrowRight className="h-3.5 w-3.5" />}
              </button>

              <hr className="my-6 border-slate-100" />

              {/* Features List */}
              <div className="flex-1 flex flex-col gap-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Features</p>
                {p.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <div className="h-4.5 w-4.5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 mt-0.5">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </div>
                    <span className="text-[12px] font-semibold text-slate-600 leading-snug">
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto w-full pt-10 border-t border-slate-200">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 text-center mb-8 satoshi-heading">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
              <div className="flex gap-2.5 items-start">
                <HelpCircle className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[13px] font-extrabold text-slate-900 leading-snug mb-1.5">{faq.q}</h4>
                  <p className="text-[12px] font-semibold text-slate-500 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
