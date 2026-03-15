'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Loader2, CheckCircle2, AlertCircle, Send, Copy, Zap,
    Terminal, RefreshCw, Info, Play, Globe, User, ShoppingCart, Eye, Plus
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { integrationApi } from '@/lib/api'
import { CreatePixelModal } from './CreatePixelModal'

interface Pixel {
    id: number
    pixel_id: string
    name: string
    ad_account_id: string
    is_active: boolean
}

interface TestLog {
    id: string
    timestamp: string
    event_name: string
    pixel_id: string
    status: 'success' | 'failed' | 'pending'
    event_id: string
    meta_response?: any
    error?: string
    is_browser?: boolean
    is_capi?: boolean
}

const EVENT_TYPES = [
    { value: 'Lead', label: 'Lead', icon: User, description: 'When someone submits a form' },
    { value: 'PageView', label: 'Page View', icon: Globe, description: 'When someone views a page' },
    { value: 'Purchase', label: 'Purchase', icon: ShoppingCart, description: 'When a purchase is made' },
    { value: 'ViewContent', label: 'View Content', icon: Eye, description: 'When someone views content' },
    { value: 'CompleteRegistration', label: 'Registration', icon: CheckCircle2, description: 'When someone registers' },
]

interface PixelTestConsoleProps {
    pixels: Pixel[]
    adAccounts: { id: string; name: string; account_id: string }[]  // for Create Pixel wizard
    onRefreshPixels: () => void
    isSyncingPixels: boolean
}

export function PixelTestConsole({ pixels, adAccounts, onRefreshPixels, isSyncingPixels }: PixelTestConsoleProps) {
    const { toast } = useToast()
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [selectedPixelId, setSelectedPixelId] = useState<string>('')
    const [selectedEvent, setSelectedEvent] = useState('Lead')
    const [testEmail, setTestEmail] = useState('test@example.com')
    const [testPhone, setTestPhone] = useState('+919876543210')
    const [testFirstName, setTestFirstName] = useState('Test')
    const [testValue, setTestValue] = useState('100')
    const [testCurrency, setTestCurrency] = useState('INR')
    const [testEventCode, setTestEventCode] = useState('')
    const [isTesting, setIsTesting] = useState(false)
    const [logs, setLogs] = useState<TestLog[]>([])
    const logsEndRef = useRef<HTMLDivElement>(null)

    // Script display state
    const [selectedPixelForScript, setSelectedPixelForScript] = useState<Pixel | null>(null)
    const [scriptCopied, setScriptCopied] = useState(false)

    useEffect(() => {
        if (pixels.length > 0 && !selectedPixelId) {
            setSelectedPixelId(pixels[0].pixel_id)
            setSelectedPixelForScript(pixels[0])
        }
    }, [pixels])

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [logs])

    const handlePixelSelect = (pixelId: string) => {
        setSelectedPixelId(pixelId)
        const px = pixels.find(p => p.pixel_id === pixelId)
        setSelectedPixelForScript(px || null)
    }

    const addLog = (log: Omit<TestLog, 'id' | 'timestamp'>) => {
        const newLog: TestLog = {
            ...log,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false })
        }
        setLogs(prev => [...prev.slice(-49), newLog]) // Keep last 50 logs
        return newLog.id
    }

    const updateLog = (id: string, updates: Partial<TestLog>) => {
        setLogs(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l))
    }

    const handleSendTestEvent = async () => {
        if (!selectedPixelId) {
            toast({ title: 'No Pixel Selected', description: 'Please select or sync a pixel first.', variant: 'destructive' })
            return
        }

        const eventId = `test_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`
        setIsTesting(true)

        // 1. Log the CAPI attempt
        const logId = addLog({
            event_name: selectedEvent,
            pixel_id: selectedPixelId,
            status: 'pending',
            event_id: eventId,
            is_capi: true,
        })

        try {
            const userData = {
                email: testEmail,
                phone: testPhone,
                first_name: testFirstName,
            }

            const customData: Record<string, any> = {
                event_source_url: 'https://leadbajaar.com/test-console',
                content_name: `Test ${selectedEvent} from LeadBajaar Console`,
                currency: testCurrency,
                value: parseFloat(testValue) || 0,
            }

            // Call our backend tracking endpoint (which forwards to CAPI)
            const result = await integrationApi.sendTestConversionEvent({
                pixel_id: selectedPixelId,
                test_event_code: testEventCode || 'TEST12345',
                event_name: selectedEvent,
                event_data: customData,
                user_data: userData,
            })

            if (result.success) {
                updateLog(logId, {
                    status: 'success',
                    meta_response: result,
                })
                toast({
                    title: '✅ CAPI Event Sent!',
                    description: `"${selectedEvent}" event sent to Meta. Events received: ${result.events_received ?? 1}`,
                })
            } else {
                updateLog(logId, {
                    status: 'failed',
                    error: result.error || 'Unknown error from Meta',
                    meta_response: result,
                })
                toast({
                    title: 'Event Failed',
                    description: result.error || 'Unknown error',
                    variant: 'destructive',
                })
            }
        } catch (error: any) {
            updateLog(logId, {
                status: 'failed',
                error: error.message,
            })
            toast({
                title: 'Request Failed',
                description: error.message,
                variant: 'destructive',
            })
        } finally {
            setIsTesting(false)
        }
    }

    const getTrackingScript = (pixel: Pixel | null) => {
        if (!pixel) return '// Select a pixel to generate script'
        return `<!-- LeadBajaar Meta Pixel + CAPI Bridge for: ${pixel.name} -->
<script>
  // =====================================================
  // Step 1: Standard Meta Pixel Base Code
  // =====================================================
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', '${pixel.pixel_id}');
  fbq('track', 'PageView');

  // =====================================================
  // Step 2: LeadBajaar CAPI Bridge (Server-Side)
  // The bridge automatically fires a server-side event
  // alongside every browser pixel event for accuracy.
  // =====================================================
  window.lbTrack = function(eventName, userData, customData) {
    userData = userData || {};
    customData = customData || {};
    
    // Generate a shared event_id for deduplication
    var eventId = 'lb_' + Math.random().toString(36).substr(2,9) + '_' + Date.now();
    
    // Fire browser-side Pixel event
    fbq('track', eventName, Object.assign({}, customData, { event_id: eventId }));
    
    // Fire server-side CAPI event via LeadBajaar
    fetch('https://api.leadbajaar.com/api/tracking/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pixel_id: '${pixel.pixel_id}',
        event_name: eventName,
        event_id: eventId,
        user_data: userData,
        custom_data: customData,
        source_url: window.location.href
      })
    }).catch(function(e) { console.warn('LB CAPI error:', e); });
    
    return eventId; // Return event_id for reference
  };

  // =====================================================
  // Step 3: Usage Examples
  // =====================================================
  // Track a Lead (e.g. on form submit):
  // lbTrack('Lead', { email: 'user@email.com', phone: '+919876543210' });
  //
  // Track a Purchase:
  // lbTrack('Purchase', { email: 'user@email.com' }, { value: 999, currency: 'INR' });
  //
  // Track Page View (already tracked above automatically)
</script>
<noscript>
  <img height="1" width="1" style="display:none" 
    src="https://www.facebook.com/tr?id=${pixel.pixel_id}&ev=PageView&noscript=1"/>
</noscript>`
    }

    const copyScript = () => {
        const script = getTrackingScript(selectedPixelForScript)
        navigator.clipboard.writeText(script).then(() => {
            setScriptCopied(true)
            toast({ title: '📋 Copied!', description: 'Tracking script copied to clipboard.' })
            setTimeout(() => setScriptCopied(false), 3000)
        })
    }

    const clearLogs = () => setLogs([])

    return (
        <div className="space-y-6">
            {/* ─── Top action bar ───────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-base font-bold text-slate-800">Pixel Manager</h3>
                    <p className="text-xs text-slate-500">{pixels.length} pixel{pixels.length !== 1 ? 's' : ''} connected</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRefreshPixels}
                        disabled={isSyncingPixels}
                        className="h-8 text-xs"
                    >
                        {isSyncingPixels
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                            : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
                        Sync from Meta
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => setShowCreateModal(true)}
                        className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Plus className="h-3.5 w-3.5 mr-1.5" /> Create Pixel
                    </Button>
                </div>
            </div>

            {/* ─── Create Pixel Modal ───────────────────────────── */}
            <CreatePixelModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                adAccounts={adAccounts}
                onPixelCreated={() => {
                    setShowCreateModal(false)
                    onRefreshPixels() // Refresh pixel list after creation
                }}
            />

            <Tabs defaultValue="tester">
                <TabsList className="grid grid-cols-2 max-w-sm">
                    <TabsTrigger value="tester" className="flex items-center gap-2">
                        <Terminal className="h-4 w-4" /> Test Console
                    </TabsTrigger>
                    <TabsTrigger value="script" className="flex items-center gap-2">
                        <Zap className="h-4 w-4" /> Get Script
                    </TabsTrigger>
                </TabsList>

                {/* ============ TEST CONSOLE TAB ============ */}
                <TabsContent value="tester" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left: Config Panel */}
                        <div className="space-y-4 min-w-0">
                            <Card className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden min-w-0">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                        <Terminal className="h-4 w-4" /> Event Configuration
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Pixel Selector */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-slate-600">Target Pixel</Label>
                                        {pixels.length > 0 ? (
                                            <Select value={selectedPixelId} onValueChange={handlePixelSelect}>
                                                <SelectTrigger className="bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                                                    <SelectValue placeholder="Select pixel..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {pixels.map(px => (
                                                        <SelectItem key={px.id} value={px.pixel_id}>
                                                            <div className="flex items-center gap-2">
                                                                <div className={`h-2 w-2 rounded-full ${px.is_active ? 'bg-green-500' : 'bg-slate-300'}`} />
                                                                <span className="font-medium">{px.name}</span>
                                                                <span className="text-[10px] text-slate-400 font-mono">{px.pixel_id}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
                                                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                                                <p className="text-xs text-amber-700">No pixels synced yet. Use "Sync from Meta" above.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Event Type */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-slate-600">Event Type</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {EVENT_TYPES.map(evt => (
                                                <button
                                                    key={evt.value}
                                                    onClick={() => setSelectedEvent(evt.value)}
                                                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all text-xs font-semibold ${selectedEvent === evt.value
                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50 dark:bg-slate-800 dark:border-slate-700'
                                                        }`}
                                                >
                                                    <evt.icon className="h-3.5 w-3.5 shrink-0" />
                                                    {evt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* User Data */}
                                    <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">User Data (will be hashed)</p>
                                        <div className="space-y-2">
                                            <Input
                                                placeholder="Email"
                                                value={testEmail}
                                                onChange={e => setTestEmail(e.target.value)}
                                                className="h-8 text-xs bg-white dark:bg-slate-800"
                                            />
                                            <Input
                                                placeholder="Phone (e.g. +919876543210)"
                                                value={testPhone}
                                                onChange={e => setTestPhone(e.target.value)}
                                                className="h-8 text-xs bg-white dark:bg-slate-800"
                                            />
                                            <Input
                                                placeholder="First Name"
                                                value={testFirstName}
                                                onChange={e => setTestFirstName(e.target.value)}
                                                className="h-8 text-xs bg-white dark:bg-slate-800"
                                            />
                                        </div>
                                    </div>

                                    {/* Custom Data */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-500">Value</Label>
                                            <Input
                                                type="number"
                                                value={testValue}
                                                onChange={e => setTestValue(e.target.value)}
                                                className="h-8 text-xs"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-500">Currency</Label>
                                            <Select value={testCurrency} onValueChange={setTestCurrency}>
                                                <SelectTrigger className="h-8 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="INR">INR</SelectItem>
                                                    <SelectItem value="USD">USD</SelectItem>
                                                    <SelectItem value="EUR">EUR</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Test Event Code */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-slate-500">
                                            Meta Test Event Code <span className="text-slate-400">(from Events Manager)</span>
                                        </Label>
                                        <Input
                                            placeholder="e.g. TEST12345"
                                            value={testEventCode}
                                            onChange={e => setTestEventCode(e.target.value)}
                                            className="h-8 text-xs font-mono"
                                        />
                                    </div>

                                    <Button
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md"
                                        onClick={handleSendTestEvent}
                                        disabled={isTesting || !selectedPixelId}
                                    >
                                        {isTesting ? (
                                            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending to Meta...</>
                                        ) : (
                                            <><Send className="h-4 w-4 mr-2" /> Fire Test Event</>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right: Live Log Panel */}
                        <div className="space-y-3 min-w-0">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Live Event Log</h4>
                                <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={clearLogs}>
                                    Clear
                                </Button>
                            </div>

                            <div className="bg-slate-950 rounded-2xl p-4 h-[480px] overflow-x-hidden overflow-y-auto font-mono text-xs space-y-2 border border-slate-800 theme-scrollbar break-all">
                                {logs.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-600">
                                        <Terminal className="h-8 w-8 mb-3 opacity-30" />
                                        <p className="text-center opacity-50">Configure and fire an event to see live results here.</p>
                                    </div>
                                ) : (
                                    logs.map(log => (
                                        <div key={log.id} className={`p-2.5 rounded-lg border ${log.status === 'pending' ? 'border-slate-700 bg-slate-900' :
                                            log.status === 'success' ? 'border-green-800/50 bg-green-950/30' :
                                                'border-red-800/50 bg-red-950/30'
                                            }`}>
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    {log.status === 'pending' && <Loader2 className="h-3 w-3 animate-spin text-blue-400" />}
                                                    {log.status === 'success' && <CheckCircle2 className="h-3 w-3 text-green-400" />}
                                                    {log.status === 'failed' && <AlertCircle className="h-3 w-3 text-red-400" />}
                                                    <span className={`font-bold ${log.status === 'success' ? 'text-green-400' :
                                                        log.status === 'failed' ? 'text-red-400' : 'text-blue-400'
                                                        }`}>{log.event_name}</span>
                                                    <span className="text-slate-500">[CAPI]</span>
                                                </div>
                                                <span className="text-slate-600 text-[10px]">{log.timestamp}</span>
                                            </div>
                                            <div className="text-slate-500 space-y-0.5 pl-5">
                                                <div>pixel: <span className="text-slate-400">{log.pixel_id}</span></div>
                                                <div>event_id: <span className="text-slate-400">{log.event_id}</span></div>
                                                {log.status === 'success' && log.meta_response && (
                                                    <div className="text-green-500 mt-1">
                                                        ✓ Meta received: {log.meta_response.events_received ?? 1} event(s)
                                                        {log.meta_response.fbtrace_id && <span className="text-slate-500"> · fbtrace: {log.meta_response.fbtrace_id}</span>}
                                                    </div>
                                                )}
                                                {log.status === 'failed' && log.error && (
                                                    <div className="text-red-400 mt-1">✗ {log.error}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={logsEndRef} />
                            </div>

                            {/* How it works */}
                            <Alert className="bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30">
                                <Info className="h-4 w-4 text-blue-500" />
                                <AlertTitle className="text-blue-700 dark:text-blue-400 font-bold text-xs">How Test Events Work</AlertTitle>
                                <AlertDescription className="text-[11px] text-blue-600/80 dark:text-blue-400/80 space-y-1 mt-1">
                                    <p>1. Test events use a <strong>Test Event Code</strong> so they appear in Meta Events Manager → Test Events tab without polluting real data.</p>
                                    <p>2. LeadBajaar sends the event server-side via CAPI and automatically hashes all PII.</p>
                                    <p>3. Check your Meta Events Manager to see the event appear within ~30 seconds.</p>
                                </AlertDescription>
                            </Alert>
                        </div>
                    </div>
                </TabsContent>

                {/* ============ SCRIPT TAB ============ */}
                <TabsContent value="script" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Pixel Selector */}
                        <div className="lg:col-span-1 min-w-0">
                            <Card className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden min-w-0">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
                                        Select Pixel
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {pixels.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-slate-400">
                                            No pixels synced. Sync from Meta first.
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {pixels.map(px => (
                                                <button
                                                    key={px.id}
                                                    onClick={() => { setSelectedPixelForScript(px); setSelectedPixelId(px.pixel_id); }}
                                                    className={`w-full p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all ${selectedPixelForScript?.id === px.id ? 'bg-blue-50/60 dark:bg-blue-900/20 border-r-2 border-blue-500' : ''
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <div className={`h-2 w-2 rounded-full shrink-0 ${px.is_active ? 'bg-green-500' : 'bg-slate-300'}`} />
                                                        <p className="font-bold text-sm truncate">{px.name}</p>
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 font-mono pl-4">{px.pixel_id}</p>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="mt-4 space-y-3 p-4 bg-slate-900 rounded-2xl text-slate-400 text-[11px] leading-relaxed">
                                <p className="text-slate-300 font-bold uppercase tracking-wider text-[10px]">Installation Steps</p>
                                <div className="space-y-2">
                                    {['Copy the script on the right', 'Paste it inside <head> on every page', 'Call lbTrack() on form submits', 'Check Meta Events Manager → Test Events'].map((step, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <span className="h-4 w-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center shrink-0 mt-0.5 font-bold">{i + 1}</span>
                                            <span>{step}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Script Panel */}
                        <div className="lg:col-span-2 min-w-0">
                            <Card className="border-none shadow-md bg-white dark:bg-slate-900 h-full flex flex-col overflow-hidden min-w-0">
                                <CardHeader className="border-b pb-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-base">Tracking Script</CardTitle>
                                            <CardDescription className="text-xs mt-0.5">
                                                {selectedPixelForScript
                                                    ? `For pixel: ${selectedPixelForScript.name} (${selectedPixelForScript.pixel_id})`
                                                    : 'Select a pixel to generate your script'}
                                            </CardDescription>
                                        </div>
                                        <Button
                                            onClick={copyScript}
                                            disabled={!selectedPixelForScript}
                                            className={`transition-all ${scriptCopied ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700'}`}
                                        >
                                            {scriptCopied ? (
                                                <><CheckCircle2 className="h-4 w-4 mr-2" /> Copied!</>
                                            ) : (
                                                <><Copy className="h-4 w-4 mr-2" /> Copy Script</>
                                            )}
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0 flex-1">
                                    <div className="relative h-full min-h-[520px] bg-slate-950 rounded-b-xl overflow-hidden">
                                        {/* Syntax-highlighted header bar */}
                                        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 border-b border-slate-800">
                                            <div className="h-3 w-3 rounded-full bg-red-500 opacity-70" />
                                            <div className="h-3 w-3 rounded-full bg-amber-500 opacity-70" />
                                            <div className="h-3 w-3 rounded-full bg-green-500 opacity-70" />
                                            <span className="ml-2 text-slate-500 text-[10px] font-mono">tracking-script.html</span>
                                        </div>
                                        <pre className="p-5 text-[11px] font-mono leading-relaxed overflow-auto h-[calc(100%-36px)] text-slate-300 theme-scrollbar">
                                            {getTrackingScript(selectedPixelForScript)
                                                .split('\n')
                                                .map((line, i) => {
                                                    // Simple syntax highlighting
                                                    let className = 'text-slate-300'
                                                    if (line.trimStart().startsWith('//')) className = 'text-slate-500 italic'
                                                    else if (line.includes('<!--') || line.includes('-->')) className = 'text-slate-500'
                                                    else if (line.includes('<script') || line.includes('</script>') || line.includes('<noscript>') || line.includes('</noscript>')) className = 'text-blue-400'
                                                    else if (line.includes('window.lbTrack') || line.includes('fbq(')) className = 'text-yellow-300'
                                                    else if (line.includes("'")) className = 'text-green-300'
                                                    else if (line.includes('fetch(') || line.includes('function') || line.includes('var ')) className = 'text-purple-300'

                                                    return (
                                                        <div key={i} className={className}>
                                                            {line || ' '}
                                                        </div>
                                                    )
                                                })
                                            }
                                        </pre>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
