'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, CheckCircle2 } from 'lucide-react'
import { API_BASE_URL } from '@/lib/api'

type FieldType = 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'date' | 'checkbox' | 'radio' | 'select'

interface FormField {
  id: string
  type: FieldType
  label: string
  required: boolean
  options?: string[]
  placeholder?: string
}

interface PublicForm {
  id: number
  title: string
  description: string
  fields: FormField[]
  theme_color: string
  redirect_url: string
}

export default function PublicFormPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const isEmbed = searchParams.get('embed') === 'true'

  const [form, setForm] = useState<PublicForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetchForm()
  }, [slug])

  const fetchForm = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/lb-forms/${slug}/public`, {
        headers: { 'Accept': 'application/json' }
      })
      if (!response.ok) {
        if (response.status === 404) throw new Error('Form not found or is inactive')
        throw new Error('Failed to load form')
      }
      const data = await response.json()
      setForm(data)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Error loading form')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (fieldLabel: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldLabel]: value
    }))
  }

  const handleCheckboxChange = (fieldLabel: string, option: string, checked: boolean) => {
    setFormData(prev => {
      const currentArr = prev[fieldLabel] || []
      if (checked) {
        return { ...prev, [fieldLabel]: [...currentArr, option] }
      } else {
        return { ...prev, [fieldLabel]: currentArr.filter((o: string) => o !== option) }
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return

    // Simple validation
    for (const field of form.fields) {
      if (field.required) {
        const val = formData[field.label]
        if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
          alert(`Please fill out the required field: ${field.label}`)
          return
        }
      }
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/lb-forms/${slug}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Submission failed')

      const result = await response.json()
      
      setSubmitted(true)

      if (result.redirect_url) {
        setTimeout(() => {
          window.location.href = result.redirect_url
        }, 2000)
      }

    } catch (err) {
      console.error(err)
      alert('Failed to submit form. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isEmbed ? 'bg-transparent' : 'bg-[var(--crm-bg)]'}`}>
        <Loader2 className="h-8 w-8 animate-spin text-[var(--crm-text-secondary)]" />
      </div>
    )
  }

  if (error || !form) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${isEmbed ? 'bg-transparent' : 'bg-[var(--crm-bg)]'}`}>
        <div className={`max-w-[400px] w-full border border-[var(--crm-border)] bg-[var(--crm-surface-1)] shadow-sm rounded-2xl text-center py-10 px-6 ${isEmbed ? 'border-none shadow-none bg-transparent' : ''}`}>
          <div className="h-12 w-12 rounded-xl bg-[var(--crm-surface-2)] flex items-center justify-center mx-auto mb-4 border border-[var(--crm-border)]">
            <span className="text-xl">😕</span>
          </div>
          <h2 className="text-[15px] font-semibold text-[var(--crm-text-primary)] mb-1">Unavailable</h2>
          <p className="text-[var(--crm-text-secondary)] text-[13px]">{error || "This form could not be found."}</p>
        </div>
      </div>
    )
  }

  const themeColor = form.theme_color || 'var(--crm-blue)'

  if (submitted) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${isEmbed ? 'bg-transparent' : 'bg-[var(--crm-bg)]'}`}>
        <div className={`max-w-[400px] w-full border border-[var(--crm-border)] bg-[var(--crm-surface-1)] shadow-xl rounded-2xl text-center py-12 px-6 animate-in fade-in zoom-in duration-500 ${isEmbed ? 'border-none shadow-none bg-transparent' : ''}`}>
          <div className="flex flex-col items-center">
            <div 
              className="h-14 w-14 rounded-full flex items-center justify-center mb-5 border"
              style={{ backgroundColor: `${themeColor}10`, color: themeColor, borderColor: `${themeColor}30` }}
            >
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h2 className="text-[17px] font-semibold text-[var(--crm-text-primary)] mb-2">Thank You!</h2>
            <p className="text-[13px] text-[var(--crm-text-secondary)]">Your submission has been received.</p>
            {form.redirect_url && (
              <p className="text-[11px] font-mono text-[var(--crm-text-tertiary)] mt-6 animate-pulse uppercase tracking-wider">Redirecting...</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 ${isEmbed ? 'bg-transparent py-4' : 'bg-[var(--crm-bg)]'}`}>
      <div className={`max-w-[500px] w-full mx-auto relative ${isEmbed ? 'bg-transparent' : 'border border-[var(--crm-border)] shadow-xl bg-[var(--crm-surface-1)] rounded-[20px] overflow-hidden'}`}>
        {/* Subtle Top Glow */}
        {!isEmbed && (
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: themeColor, opacity: 0.8 }} />
        )}
        
        <div className={`${isEmbed ? 'px-2 pt-2 pb-6' : 'px-8 pt-8 pb-6'} border-b border-[var(--crm-border)] bg-[var(--crm-surface-1)]/50`}>
          <h1 className="text-xl font-bold text-[var(--crm-text-primary)] leading-tight tracking-tight">
            {form.title}
          </h1>
          {form.description && (
            <p className="text-[13px] text-[var(--crm-text-secondary)] mt-2 whitespace-pre-wrap leading-relaxed">
              {form.description}
            </p>
          )}
        </div>

        <div className={`${isEmbed ? 'px-2 pt-6' : 'px-8 pt-8'} pb-8`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {form.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label className="text-[13px] font-medium text-[var(--crm-text-primary)] flex items-center">
                  {field.label}
                  {field.required && <span className="text-[var(--crm-red)] ml-1 leading-none">*</span>}
                </Label>
                
                {field.type === 'textarea' ? (
                  <Textarea
                    required={field.required}
                    placeholder={field.placeholder || ''}
                    className="min-h-[80px] text-[13px] resize-y bg-[var(--crm-surface-2)] border border-[var(--crm-border)] text-[var(--crm-text-primary)] focus:bg-[var(--crm-surface-1)] focus:border-[var(--crm-accent)] focus:ring-1 focus:ring-[var(--crm-accent)] rounded-[8px] transition-colors"
                    value={formData[field.label] || ''}
                    onChange={(e) => handleInputChange(field.label, e.target.value)}
                  />
                ) : field.type === 'select' ? (
                  <select
                    required={field.required}
                    className="flex h-10 w-full rounded-[8px] border border-[var(--crm-border)] bg-[var(--crm-surface-2)] text-[var(--crm-text-primary)] focus:bg-[var(--crm-surface-1)] focus:border-[var(--crm-accent)] focus:ring-1 focus:ring-[var(--crm-accent)] px-3 py-2 text-[13px] ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                    value={formData[field.label] || ''}
                    onChange={(e) => handleInputChange(field.label, e.target.value)}
                  >
                    <option value="" disabled className="text-[var(--crm-text-tertiary)]">{field.placeholder || 'Select an option'}</option>
                    {field.options?.map((opt, i) => (
                      <option key={i} value={opt} className="text-[var(--crm-text-primary)]">{opt}</option>
                    ))}
                  </select>
                ) : field.type === 'radio' ? (
                  <div className="space-y-2.5 pt-1">
                    {field.options?.map((opt, i) => (
                      <label key={i} className="flex items-center space-x-2.5 cursor-pointer group">
                        <input
                          type="radio"
                          name={field.label}
                          value={opt}
                          required={field.required}
                          checked={formData[field.label] === opt}
                          onChange={(e) => handleInputChange(field.label, e.target.value)}
                          className="h-3.5 w-3.5 border-[var(--crm-border)] bg-[var(--crm-surface-2)] focus:ring-[var(--crm-accent)] cursor-pointer"
                          style={{ accentColor: themeColor }}
                        />
                        <span className="text-[13px] text-[var(--crm-text-primary)] group-hover:opacity-80 transition-opacity">{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : field.type === 'checkbox' ? (
                  <div className="space-y-2.5 pt-1">
                    {field.options?.map((opt, i) => (
                      <label key={i} className="flex items-center space-x-2.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          value={opt}
                          checked={(formData[field.label] || []).includes(opt)}
                          onChange={(e) => handleCheckboxChange(field.label, opt, e.target.checked)}
                          className="h-3.5 w-3.5 rounded-[4px] border-[var(--crm-border)] bg-[var(--crm-surface-2)] focus:ring-[var(--crm-accent)] cursor-pointer"
                          style={{ accentColor: themeColor }}
                        />
                        <span className="text-[13px] text-[var(--crm-text-primary)] group-hover:opacity-80 transition-opacity">{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <Input
                    type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                    required={field.required}
                    placeholder={field.placeholder || ''}
                    className="h-10 text-[13px] bg-[var(--crm-surface-2)] border border-[var(--crm-border)] text-[var(--crm-text-primary)] focus:bg-[var(--crm-surface-1)] focus:border-[var(--crm-accent)] focus:ring-1 focus:ring-[var(--crm-accent)] rounded-[8px] transition-colors"
                    value={formData[field.label] || ''}
                    onChange={(e) => handleInputChange(field.label, e.target.value)}
                    style={field.type === 'phone' ? { fontFamily: 'monospace' } : {}}
                  />
                )}
              </div>
            ))}

            <div className="pt-6 mt-2">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-10 text-[13px] font-semibold tracking-wide shadow-sm hover:opacity-90 transition-all border-none rounded-full"
                style={{ backgroundColor: themeColor, color: '#fff' }}
              >
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</>
                ) : (
                  'Submit'
                )}
              </Button>
            </div>
            
            <div className="text-center mt-6">
              <span className="text-[10px] text-[var(--crm-text-tertiary)] font-mono uppercase tracking-widest opacity-60">
                Powered by LeadBajaar
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
