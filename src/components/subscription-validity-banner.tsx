"use client"

import React, { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import { AlertCircle, X, Calendar, ArrowRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function SubscriptionValidityBanner() {
  const { user, isLoading } = useUser()
  const [isVisible, setIsVisible] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hasCheckedModal, setHasCheckedModal] = useState(false)

  useEffect(() => {
    if (isLoading || !user || !user.company || !user.company.expires_at || hasCheckedModal) return

    const expiryDate = new Date(user.company.expires_at)
    const now = new Date()
    const diffTime = expiryDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 3) {
      const hasShownModal = sessionStorage.getItem('validityModalShown')
      if (!hasShownModal) {
        setIsModalOpen(true)
        sessionStorage.setItem('validityModalShown', 'true')
      }
    }
    setHasCheckedModal(true)
  }, [user, isLoading, hasCheckedModal])

  if (isLoading || !user || !user.company || !user.company.expires_at) return null

  const expiryDate = new Date(user.company.expires_at)
  const now = new Date()
  const diffTime = expiryDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const isExpired = diffDays <= 0

  return (
    <>
      {isVisible && diffDays <= 3 && (
        <div className="bg-red-500 text-white px-4 py-2 flex items-center justify-between text-sm font-semibold shadow-sm z-50 relative shrink-0">
          <div className="flex items-center gap-2 justify-center flex-1">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="text-center">
              {isExpired 
                ? 'Your subscription has expired. Please renew your plan immediately to avoid service interruption.'
                : `Your subscription validity is completing in ${diffDays} ${diffDays === 1 ? 'day' : 'days'}. Please renew soon!`
              }
            </span>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-white/80 hover:text-white transition-colors shrink-0 p-1 rounded-md hover:bg-white/20"
            title="Dismiss warning"
          >
          <X className="w-4 h-4" />
        </button>
      </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[460px] p-8 pb-10 text-center gap-0 border-none shadow-2xl rounded-2xl">
          {/* Custom Icon Illustration */}
          <div className="relative mx-auto w-[100px] h-[100px] bg-rose-50/80 rounded-full flex items-center justify-center mb-6">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100/50 z-10">
              <Calendar className="w-9 h-9 text-rose-500 stroke-[1.5]" />
            </div>
            
            {/* Notification Badge */}
            <div className="absolute bottom-1 right-2 bg-rose-500 text-white rounded-full p-1 border-2 border-white shadow-sm z-20">
              <span className="font-bold text-[12px] leading-none w-3.5 h-3.5 flex items-center justify-center">!</span>
            </div>
            
            {/* Sparkle/Accent lines */}
            <svg className="absolute -top-1 -right-2 w-10 h-10 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4v4M18.36 7.64l-2.83 2.83M22 14h-4" />
            </svg>
          </div>

          <h2 className="text-[22px] font-bold text-slate-900 tracking-tight mb-3">
            {isExpired ? 'Subscription expired' : 'Subscription expiring soon'}
          </h2>
          
          <p className="text-[14px] text-slate-500 leading-relaxed max-w-[340px] mx-auto mb-8">
            {isExpired 
              ? 'Your current plan has expired. Renew your subscription to continue using LeadBajaar without interruption.'
              : `Your current plan will expire in ${diffDays} ${diffDays === 1 ? 'day' : 'days'}. Renew your subscription to continue using LeadBajaar without interruption.`
            }
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full sm:w-auto px-8 h-11 text-[14px] font-medium border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-lg"
              onClick={() => setIsModalOpen(false)}
            >
              Not now
            </Button>
            <Button 
              type="button" 
              className="w-full sm:w-auto px-6 h-11 text-[14px] font-medium bg-[#E64C4C] hover:bg-[#D63D3D] text-white rounded-lg shadow-sm border-none transition-all" 
              onClick={() => {
                setIsModalOpen(false)
                window.location.href = '/settings?tab=billing'
              }}
            >
              Renew subscription <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
