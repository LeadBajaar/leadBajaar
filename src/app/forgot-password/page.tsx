'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { forgotPassword } from '@/lib/api'
import { toast } from 'sonner'
import { ArrowRight, Mail, Zap, Loader2, AlertCircle } from 'lucide-react'

type ForgotPasswordFormData = {
  email: string
}

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>()

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    setApiError(null)
    try {
      await forgotPassword(data.email)
      setIsSuccess(true)
      toast.success("Reset link sent to your email!")
    } catch (error: any) {
      console.error('Failed to send reset link:', error.message)
      setApiError(error.message || "Failed to send reset link")
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
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Reset Password</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold tracking-tight uppercase italic text-xs">LeadBajaar</span>
            </p>
          </div>
        </div>

        <Card className="border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-[24px]">
          <CardHeader className="space-y-1 pb-6 pt-8 px-8 text-center">
            <CardTitle className="text-lg font-semibold tracking-tight">Forgot your password?</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              {isSuccess 
                ? "We've sent a password reset link to your email."
                : "Enter your email address and we'll send you a link to reset your password."}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            {apiError && (
              <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-500/10 p-3 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p className="text-xs font-medium">{apiError}</p>
              </div>
            )}
            
            {!isSuccess ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-0.5">Email Address</Label>
                  <div className="relative group transition-all">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      className="h-11 pl-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /\S+@\S+\.\S+/,
                          message: "Invalid email format"
                        }
                      })}
                    />
                  </div>
                  {errors.email && <p className="text-[10px] text-red-500 font-medium ml-1">{errors.email.message}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-semibold text-sm transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <Button
                type="button"
                onClick={() => router.push('/signin')}
                className="w-full h-11 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-semibold text-sm transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 group"
              >
                Back to Login
              </Button>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500 font-medium">
          Remember your password?{' '}
          <Link href="/signin" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}
