'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import { login } from '@/lib/api'
import { toast } from 'sonner'
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  Mail,
  Lock,
  Zap,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react'

type LoginFormData = {
  email: string
  password: string
  remember?: boolean
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { register, handleSubmit, formState: { errors }, setValue, setError } = useForm<LoginFormData>()

  useEffect(() => {
    const savedCredentials = localStorage.getItem('rememberedCredentials')
    if (savedCredentials) {
      try {
        const { email, password } = JSON.parse(savedCredentials)
        setValue('email', email)
        setValue('password', password)
        setValue('remember', true)
      } catch (e) {
        localStorage.removeItem('rememberedCredentials')
      }
    }
  }, [setValue])

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const { email, password, remember } = data

      if (remember) {
        localStorage.setItem('rememberedCredentials', JSON.stringify({ email, password }))
      } else {
        localStorage.removeItem('rememberedCredentials')
      }

      await login(email, password)
      toast.success("Welcome back!")
      router.push('/dashboard')
    } catch (error) {
      setValue('password', '')
      if (error instanceof Error) {
        setError('root', { type: 'manual', message: error.message })
      } else {
        setError('root', { type: 'manual', message: 'An unexpected error occurred' })
      }
    } finally {
      setIsLoading(false)
    }
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
            <Zap className="h-6 w-6 text-indigo-600 dark:text-indigo-400 fill-indigo-600/10" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome back</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Manage your sales pipeline with <span className="text-indigo-600 dark:text-indigo-400 font-semibold tracking-tight uppercase italic text-xs">LeadBajaar</span>
            </p>
          </div>
        </div>

        <Card className="border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-[24px]">
          <CardHeader className="space-y-1 pb-6 pt-8 px-8">
            <CardTitle className="text-lg font-semibold tracking-tight">Sign in</CardTitle>
            <CardDescription className="text-xs text-slate-500">Enter your workspace credentials</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-0.5">Work Email</Label>
                <div className="relative group transition-all">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    className="h-11 pl-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                    {...register('email', { required: 'Email is required' })}
                  />
                </div>
                {errors.email && <p className="text-[11px] text-red-500 font-medium mt-1 ml-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-0.5">
                  <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</Label>
                  <Link href="#" className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Forgot password?</Link>
                </div>
                <div className="relative group transition-all">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-11 pl-10 pr-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                    {...register('password', { required: 'Password is required' })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-lg"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-[11px] text-red-500 font-medium mt-1 ml-1">{errors.password.message}</p>}
              </div>

              <div className="flex items-center space-x-2 py-1">
                <Checkbox
                  id="remember"
                  className="rounded border-slate-300 dark:border-slate-700 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                  {...register('remember')}
                />
                <Label htmlFor="remember" className="text-xs text-slate-600 dark:text-slate-400 font-medium cursor-pointer">Stay signed in</Label>
              </div>

              {errors.root && (
                <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl text-[11px] text-red-600 dark:text-red-400 font-medium">
                  {errors.root.message}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-semibold text-sm transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2 group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500 font-medium">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
            Create an account
          </Link>
        </p>

        {/* Footer info */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Secure Login</span>
          <div className="h-1 w-1 bg-slate-300 dark:bg-slate-800 rounded-full" />
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Encrypted Data</span>
        </div>
      </div>
    </div>
  )
}
