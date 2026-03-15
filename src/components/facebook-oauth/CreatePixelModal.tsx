'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Loader2, CheckCircle2, AlertCircle, Copy, Plus,
    ChevronRight, Zap, Code2, ArrowRight, ExternalLink
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { integrationApi } from '@/lib/api'

interface AdAccount {
    id: string        // "act_1234567890"
    name: string
    account_id: string
}

interface CreatedPixel {
    pixel_id: string
    name: string
    ad_account_id: string
}

interface CreatePixelModalProps {
    open: boolean
    onClose: () => void
    adAccounts: AdAccount[]
    onPixelCreated: (pixel: CreatedPixel) => void
}

// Steps for the wizard
type Step = 'select-account' | 'name-pixel' | 'success'

export function CreatePixelModal({ open, onClose, adAccounts, onPixelCreated }: CreatePixelModalProps) {
    const { toast } = useToast()
    const [step, setStep] = useState<Step>('select-account')
    const [selectedAccount, setSelectedAccount] = useState<AdAccount | null>(null)
    const [pixelName, setPixelName] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [createdPixel, setCreatedPixel] = useState<CreatedPixel | null>(null)
    const [scriptCopied, setScriptCopied] = useState(false)

    const handleClose = () => {
        setStep('select-account')
        setSelectedAccount(null)
        setPixelName('')
        setCreatedPixel(null)
        setScriptCopied(false)
        onClose()
    }

    const handleSelectAccount = (account: AdAccount) => {
        setSelectedAccount(account)
        setStep('name-pixel')
    }

    const handleCreate = async () => {
        if (!selectedAccount || !pixelName.trim()) return
        setIsCreating(true)

        try {
            const result = await integrationApi.createMetaPixel({
                name: pixelName.trim(),
                ad_account_id: selectedAccount.id,  // e.g. "act_1234567890"
            })

            if (result.status === 'success' && result.pixel) {
                const px: CreatedPixel = {
                    pixel_id: result.pixel.pixel_id,
                    name: result.pixel.name,
                    ad_account_id: result.pixel.ad_account_id,
                }
                setCreatedPixel(px)
                setStep('success')
                onPixelCreated(px)
                toast({ title: '🎉 Pixel Created!', description: `"${px.name}" is ready to use.` })
            } else {
                toast({
                    title: 'Creation Failed',
                    description: result.message || 'Meta returned an unexpected response.',
                    variant: 'destructive'
                })
            }
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' })
        } finally {
            setIsCreating(false)
        }
    }

    const getInstallScript = () => {
        if (!createdPixel) return ''
        return `<!-- LeadBajaar Pixel: ${createdPixel.name} -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', '${createdPixel.pixel_id}');
  fbq('track', 'PageView');

  // LeadBajaar CAPI Bridge — sends server-side events for max accuracy
  window.lbTrack = function(eventName, userData, customData) {
    var eventId = 'lb_' + Math.random().toString(36).substr(2,9) + '_' + Date.now();
    fbq('track', eventName, Object.assign({}, customData, { event_id: eventId }));
    fetch('https://api.leadbajaar.com/api/tracking/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pixel_id: '${createdPixel.pixel_id}',
        event_name: eventName,
        event_id: eventId,
        user_data: userData || {},
        custom_data: customData || {},
        source_url: window.location.href
      })
    }).catch(function(e) { console.warn('LB CAPI:', e); });
    return eventId;
  };
</script>
<noscript>
  <img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=${createdPixel.pixel_id}&ev=PageView&noscript=1"/>
</noscript>`
    }

    const copyScript = () => {
        navigator.clipboard.writeText(getInstallScript()).then(() => {
            setScriptCopied(true)
            toast({ title: '📋 Copied!', description: 'Paste this in the <head> of your website.' })
            setTimeout(() => setScriptCopied(false), 3000)
        })
    }

    // ─── Step Indicator ───────────────────────────────────────────────
    const StepDot = ({ idx, label, active, done }: { idx: number; label: string; active: boolean; done: boolean }) => (
        <div className="flex items-center gap-1.5">
            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                ${done ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-200 text-slate-400'}`}>
                {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx}
            </div>
            <span className={`text-xs font-semibold hidden sm:block ${active ? 'text-slate-800' : done ? 'text-green-600' : 'text-slate-400'}`}>{label}</span>
        </div>
    )

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-white flex items-center gap-2 text-lg">
                            <Plus className="h-5 w-5" /> Create New Pixel
                        </DialogTitle>
                        <DialogDescription className="text-blue-100 text-sm mt-1">
                            Follow the steps below to create a Meta Pixel and get your install script.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mt-4">
                        <StepDot idx={1} label="Ad Account" active={step === 'select-account'} done={step !== 'select-account'} />
                        <div className="flex-1 h-px bg-blue-400/40 mx-1" />
                        <StepDot idx={2} label="Name Pixel" active={step === 'name-pixel'} done={step === 'success'} />
                        <div className="flex-1 h-px bg-blue-400/40 mx-1" />
                        <StepDot idx={3} label="Install Script" active={step === 'success'} done={false} />
                    </div>
                </div>

                <div className="p-6 space-y-5">

                    {/* ─── STEP 1: Select Ad Account ─────────────────────── */}
                    {step === 'select-account' && (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-600">
                                Pixels are created inside an Ad Account. Select the Ad Account where this pixel should live.
                            </p>

                            {adAccounts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <AlertCircle className="h-8 w-8 text-amber-400" />
                                    <div>
                                        <p className="font-semibold text-slate-700">No Ad Accounts Found</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Sync your Meta assets first, or check your OAuth permissions
                                            (<code className="bg-slate-100 px-1 rounded">ads_management</code>).
                                        </p>
                                    </div>
                                    <a
                                        href="https://business.facebook.com/settings/ad-accounts"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline"
                                    >
                                        Open Business Manager <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                    {adAccounts.map(account => (
                                        <button
                                            key={account.id}
                                            onClick={() => handleSelectAccount(account)}
                                            className="w-full flex items-center justify-between p-3.5 rounded-xl  border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left group"
                                        >
                                            <div>
                                                <p className="font-semibold text-sm text-slate-800">{account.name}</p>
                                                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{account.id}</p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── STEP 2: Name the Pixel ────────────────────────── */}
                    {step === 'name-pixel' && selectedAccount && (
                        <div className="space-y-5">
                            {/* Selected account pill */}
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                                <div className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-slate-500">Ad Account</p>
                                    <p className="font-semibold text-sm text-slate-800 truncate">{selectedAccount.name}</p>
                                    <p className="text-[10px] font-mono text-slate-400">{selectedAccount.id}</p>
                                </div>
                                <button onClick={() => setStep('select-account')} className="text-xs text-blue-500 hover:underline shrink-0">Change</button>
                            </div>

                            {/* Pixel name input */}
                            <div className="space-y-1.5">
                                <Label className="text-sm font-bold text-slate-700">Pixel Name</Label>
                                <Input
                                    id="create-pixel-name"
                                    placeholder="e.g. LeadBajaar Main Pixel"
                                    value={pixelName}
                                    onChange={e => setPixelName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && pixelName.trim() && !isCreating && handleCreate()}
                                    className="h-10"
                                    autoFocus
                                />
                                <p className="text-[11px] text-slate-400">This name appears in Meta Events Manager.</p>
                            </div>

                            {/* Hierarchy reminder */}
                            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-[11px] text-blue-700 space-y-1">
                                <p className="font-bold text-xs">Pixel Hierarchy</p>
                                <div className="flex items-center gap-1 flex-wrap">
                                    <span className="bg-blue-100 px-2 py-0.5 rounded-full">Business Manager</span>
                                    <ArrowRight className="h-3 w-3" />
                                    <span className="bg-blue-100 px-2 py-0.5 rounded-full">{selectedAccount.name}</span>
                                    <ArrowRight className="h-3 w-3" />
                                    <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full">{pixelName || 'New Pixel'}</span>
                                </div>
                            </div>

                            <Button
                                id="create-pixel-submit"
                                onClick={handleCreate}
                                disabled={!pixelName.trim() || isCreating}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11"
                            >
                                {isCreating ? (
                                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating in Meta...</>
                                ) : (
                                    <><Zap className="h-4 w-4 mr-2" /> Create Pixel</>
                                )}
                            </Button>
                        </div>
                    )}

                    {/* ─── STEP 3: Success + Install Script ──────────────── */}
                    {step === 'success' && createdPixel && (
                        <div className="space-y-5">
                            {/* Success header */}
                            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                                <CheckCircle2 className="h-7 w-7 text-green-500 shrink-0" />
                                <div>
                                    <p className="font-bold text-green-800">{createdPixel.name}</p>
                                    <p className="text-[11px] text-green-600 font-mono mt-0.5">ID: {createdPixel.pixel_id}</p>
                                    <p className="text-[11px] text-green-600">Account: {createdPixel.ad_account_id}</p>
                                </div>
                            </div>

                            {/* Install instructions */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                                        <Code2 className="h-4 w-4" /> Install Script
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={copyScript}
                                        className={`h-7 text-xs gap-1.5 transition-all ${scriptCopied ? 'bg-green-600 text-white border-green-600' : ''}`}
                                    >
                                        {scriptCopied
                                            ? <><CheckCircle2 className="h-3 w-3" /> Copied!</>
                                            : <><Copy className="h-3 w-3" /> Copy Script</>}
                                    </Button>
                                </div>

                                {/* Code block */}
                                <div className="bg-slate-950 rounded-xl overflow-hidden">
                                    <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-900">
                                        <div className="h-2.5 w-2.5 rounded-full bg-red-400 opacity-70" />
                                        <div className="h-2.5 w-2.5 rounded-full bg-amber-400 opacity-70" />
                                        <div className="h-2.5 w-2.5 rounded-full bg-green-400 opacity-70" />
                                        <span className="ml-2 text-slate-500 text-[10px] font-mono">tracking-script.html</span>
                                    </div>
                                    <pre className="p-4 text-[10px] font-mono text-slate-300 overflow-auto max-h-56 leading-relaxed">
                                        {getInstallScript()}
                                    </pre>
                                </div>

                                {/* Steps */}
                                <div className="mt-3 space-y-1.5">
                                    {[
                                        'Copy the script above',
                                        'Paste it inside <head> on every page of your website',
                                        'Call lbTrack(\'Lead\', { email, phone }) on form submissions',
                                        'Verify in Meta Events Manager → Test Events tab',
                                    ].map((s, i) => (
                                        <div key={i} className="flex items-start gap-2 text-[11px] text-slate-500">
                                            <span className="h-4 w-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center shrink-0 font-bold mt-0.5">{i + 1}</span>
                                            <span>{s}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button variant="outline" onClick={handleClose} className="flex-1">Done</Button>
                                <Button onClick={() => { setStep('select-account'); setPixelName(''); setCreatedPixel(null) }} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                                    <Plus className="h-4 w-4 mr-1" /> Create Another
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
