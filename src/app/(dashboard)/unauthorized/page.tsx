'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Lock, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[70vh] p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center">
          <Lock className="w-8 h-8 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Access Restricted
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            You don't have the necessary permissions to access this page. Please contact your workspace administrator if you need access.
          </p>
        </div>
        
        <div className="pt-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
            className="rounded-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}

