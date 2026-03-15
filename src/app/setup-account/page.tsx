'use client'

import { useState, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { teamApi } from '@/lib/api'
import { setSession } from '@/lib/auth'
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  User,
  Lock,
  Zap,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react'

type SetupFormData = {
  fullName: string
  password: string
  confirmPassword: string
}

function SetupAccount() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const token = searchParams.get('token')
  const companyName = searchParams.get('company') || 'LeadBajaar'
  const invitedEmail = searchParams.get('email') || 'your account'

  const { register, handleSubmit, formState: { errors }, watch } = useForm<SetupFormData>()

  const password = watch('password')

  const onSubmit = async (data: SetupFormData) => {
    if (!token) {
      toast.error("Invalid or missing invitation token")
      return
    }

    setIsLoading(true)
    try {
      const response = await teamApi.setupAccount({
        token,
        name: data.fullName,
        password: data.password,
        password_confirmation: data.confirmPassword
      })
      
      setSession(response.token)
      setIsSuccess(true)
      toast.success("Account activated successfully!")
      
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
    } catch (error: any) {
      toast.error(error.message || "An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#020617] p-6 antialiased text-center">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full" />
        </div>
        
        <div className="w-full max-w-[420px] relative z-10 flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
          <div className="h-20 w-20 bg-emerald-50 dark:bg-emerald-950/20 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-xl">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Account Active!</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Welcome to the team at <span className="text-indigo-600 font-bold">{companyName}</span>.
            </p>
          </div>
          <div className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
             <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
             <p className="text-xs font-bold text-slate-600 dark:text-slate-400 italic">Redirecting you to workspace...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#020617] p-6 antialiased">
      {/* ── Background Detail ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-violet-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-[420px] relative z-10 flex flex-col gap-8">
        {/* Branding */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="h-12 w-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center shadow-sm">
            <ShieldCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Join the Workspace</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              Invited to <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-tight italic text-xs px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-md">{companyName}</span>
            </p>
          </div>
        </div>

        <Card className="border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-[32px] overflow-hidden">
          <CardHeader className="space-y-1 pb-6 pt-8 px-8 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-lg font-bold tracking-tight">Setup Your Account</CardTitle>
            <CardDescription className="text-[11px] text-slate-500 font-medium">
              You are joining as <span className="text-indigo-500 font-bold">{invitedEmail}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 py-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-0.5">Your Full Name</Label>
                <div className="relative group transition-all">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <Input
                    id="fullName"
                    placeholder="E.g. Alex Johnson"
                    className="h-12 pl-10 bg-slate-50/50 dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 rounded-xl focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
                    {...register('fullName', { required: 'Name is required' })}
                  />
                </div>
                {errors.fullName && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.fullName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-0.5">Set Password</Label>
                <div className="relative group transition-all">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-12 pl-10 pr-10 bg-slate-50/50 dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 rounded-xl focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: { value: 8, message: 'Must be at least 8 characters' }
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors rounded-lg"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-0.5">Confirm Password</Label>
                <div className="relative group transition-all">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="h-12 pl-10 bg-slate-50/50 dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 rounded-xl focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
                    {...register('confirmPassword', { 
                      required: 'Please confirm your password',
                      validate: (val: string) => val === password || 'Passwords do not match'
                    })}
                  />
                </div>
                {errors.confirmPassword && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.confirmPassword.message}</p>}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Activate Account
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer info */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-6">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Workspace Invite</span>
            <div className="h-1 w-1 bg-slate-300 dark:bg-slate-800 rounded-full" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Direct Access</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center font-medium opacity-80">
            By activating your account, you agree to LeadBajaar's <br className="hidden sm:block" /> 
            <span className="text-slate-500 cursor-pointer hover:underline">Terms of Service</span> and <span className="text-slate-500 cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SetupAccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#020617] p-6">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
      </div>
    }>
      <SetupAccount />
    </Suspense>
  )
}
