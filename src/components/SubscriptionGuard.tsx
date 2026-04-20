"use client"

import React from 'react'
import { useUser } from '@/contexts/UserContext'
import { AlertTriangle, CreditCard, Mail, Phone, Info, X, Briefcase, CalendarCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface SubscriptionGuardProps {
  children: React.ReactNode
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { user, isLoading } = useUser()
  const pathname = usePathname()

  if (isLoading) return null // Do not render anything (not even children) until we know the sub status

  // Super Admins bypass all restrictions
  if (user?.role === 'Super Admin' || user?.user_type === 'super_admin') {
    return <>{children}</>
  }

  // Allow access to settings page so user can renew/billing info
  if (pathname === '/settings') {
    return <>{children}</>
  }

  // Debug: Log the company status and expiry
  // console.log('Sub Check:', user?.company?.status, user?.company?.expires_at);

  const expiresAtStr = user?.company?.expires_at
  const expiresAt = expiresAtStr ? new Date(expiresAtStr) : null
  
  // An account is expired if:
  // 1. It has an expiration date AND that date is in the past
  // 2. We can also add a check for status === 'Expired' if the backend sets it
  const isExpired = expiresAt ? expiresAt.getTime() < Date.now() : false
  const isSuspended = user?.company?.status === 'Suspended'

  if (isExpired || isSuspended) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-slate-100/40 dark:bg-slate-950/60 backdrop-blur-xl" />
        <div className="absolute top-1/4 left-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-indigo-500/10 rounded-full blur-[60px] sm:blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-red-500/10 rounded-full blur-[60px] sm:blur-[120px] animate-pulse delay-700" />

        <Card className="relative w-full max-w-[480px] border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] rounded-[24px] sm:rounded-[32px] overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl animate-in zoom-in-95 duration-500 my-auto">
          <CardHeader className="text-center pt-6 sm:pt-8 pb-3 sm:pb-4 px-4 sm:px-8">
            <div className={cn(
              "mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-3 sm:mb-4",
              isSuspended ? "bg-amber-50" : "bg-red-50 dark:bg-red-950/30"
            )}>
              {isSuspended ? (
                <AlertTriangle className="h-7 w-7 sm:h-8 sm:h-8 text-amber-500" />
              ) : (
                <div className="relative">
                  <CreditCard className="h-7 w-7 sm:h-8 sm:h-8 text-red-500" />
                  <div className="absolute -top-1 -right-1 w-3 sm:w-3.5 h-3 sm:h-3.5 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center">
                    <X className="h-2 sm:h-2.5 w-2 sm:w-2.5 text-red-600" />
                  </div>
                </div>
              )}
            </div>
            
            <CardTitle className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
              {isSuspended ? 'Access Suspended' : 'Stay Ahead, Renew Now'}
            </CardTitle>
            
            <CardDescription className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm px-1 sm:px-2 leading-relaxed">
              {isSuspended 
                ? 'Your account has been restricted. Please contact our team to resolve this.' 
                : 'Premium features are on pause. Renew now to resume your growth.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-5 sm:px-8 space-y-3 sm:space-y-4">
            {/* Status Info Box */}
            <div className="bg-slate-100/50 dark:bg-slate-800/40 rounded-[16px] sm:rounded-[20px] p-3.5 sm:p-4 border border-slate-200/50 dark:border-slate-700/50 space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
                    <Briefcase className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400" />
                  </div>
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-[8px] sm:text-[9px]">Status</span>
                </div>
                <Badge variant="outline" className={cn(
                  "font-black text-[8px] sm:text-[9px] uppercase px-1.5 sm:px-2 h-4.5 sm:h-5 border-0 shadow-sm",
                  isSuspended ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                )}>
                  {isSuspended ? 'Suspended' : 'Expired'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
                    <CreditCard className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400" />
                  </div>
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-[8px] sm:text-[9px]">Plan</span>
                </div>
                <span className="text-slate-900 dark:text-white font-black text-[11px] sm:text-xs capitalize">{user?.company?.plan || 'Free'} Plan</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
                    <CalendarCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400" />
                  </div>
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-[8px] sm:text-[9px]">Expiry</span>
                </div>
                <span className={cn(
                  "font-black text-[11px] sm:text-xs",
                  isExpired ? "text-red-500" : "text-slate-900 dark:text-white"
                )}>
                  {expiresAt ? expiresAt.toLocaleDateString('en-GB') : 'N/A'}
                </span>
              </div>
            </div>

            {/* Quick Warning */}
            {!isSuspended && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10">
                <div className="mt-0.5 text-indigo-500 shrink-0">
                  <Info className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <p className="text-[10px] sm:text-xs text-indigo-700 dark:text-indigo-400 font-medium leading-relaxed">
                  Your data is safe, but active lead sync and automations are currently paused.
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-2.5 sm:gap-3 p-5 sm:p-8 pt-2 sm:pt-4">
            <Button 
              onClick={() => window.location.href = '/settings?tab=billing'}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl sm:rounded-2xl h-11 sm:h-12 text-xs sm:text-sm shadow-xl shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] group"
            >
              <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2.5 sm:mr-3 transition-transform group-hover:rotate-12" /> 
              Renew Subscription
            </Button>
            
            <div className="flex items-center gap-2 w-full pt-0.5">
              <Button 
                variant="ghost" 
                className="flex-1 h-9 sm:h-10 text-slate-500 dark:text-slate-400 font-black rounded-lg sm:rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-[8px] sm:text-[10px] uppercase tracking-widest px-1"
                onClick={() => window.location.href = 'mailto:support@leadbajaar.com'}
              >
                <Mail className="h-3.5 w-3.5 mr-1.5 sm:mr-2" /> Support
              </Button>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />
              <Button 
                variant="ghost" 
                className="flex-1 h-9 sm:h-10 text-slate-500 dark:text-slate-400 font-black rounded-lg sm:rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-[8px] sm:text-[10px] uppercase tracking-widest px-1"
                onClick={() => window.location.href = 'https://wa.me/916376148776'}
              >
                <Phone className="h-3.5 w-3.5 mr-1.5 sm:mr-2" /> WhatsApp
              </Button>
            </div>
            
            <p className="text-center text-[9px] sm:text-[10px] text-slate-400 font-medium mt-3 sm:mt-4 tracking-tighter">
              &copy; {new Date().getFullYear()} LeadBajaar. All rights reserved.
            </p>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
