'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { evolutionApi } from '@/lib/api'
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation'
import { ChevronLeft, QrCode, Loader2, CheckCircle2, Phone, Trash2 } from 'lucide-react'

export default function EvolutionIntegrationPage() {
  const { toast } = useToast()
  const router = useRouter()
  
  const [phoneNumber, setPhoneNumber] = useState('')
  const [instanceName, setInstanceName] = useState('')
  const [profilePic, setProfilePic] = useState<string | null>(null)
  const [profileName, setProfileName] = useState<string | null>(null)
  const [step, setStep] = useState<'loading' | 'input' | 'creating' | 'qr' | 'connected' | 'disconnected'>('loading')
  const [qrBase64, setQrBase64] = useState<string | null>(null)
  
  // Refs for polling intervals
  const qrPollRef = useRef<NodeJS.Timeout | null>(null)
  const statusPollRef = useRef<NodeJS.Timeout | null>(null)

  const stopPolling = () => {
    if (qrPollRef.current) clearInterval(qrPollRef.current)
    if (statusPollRef.current) clearInterval(statusPollRef.current)
  }

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await evolutionApi.getAccounts();
        if (res?.data && res.data.length > 0) {
          // Find first connected account, or just fall back to the first one
          const connectedAccount = res.data.find((a: any) => a.status === 'connected' || a.status === 'open');
          const account = connectedAccount || res.data[0];
          
          setInstanceName(account.instance_name);
          
          if (account.whatsapp) {
            setPhoneNumber(account.whatsapp.owner?.split('@')[0] || account.whatsapp.ownerJid?.split('@')[0] || account.phone_number);
            setProfilePic(account.whatsapp.profilePictureUrl || account.whatsapp.profilePicUrl || null);
            setProfileName(account.whatsapp.profileName || account.whatsapp.name || null);
          } else {
            setPhoneNumber(account.phone_number || '');
          }
          
          if (account.status === 'connected' || account.status === 'open') {
            setStep('connected');
          } else if (account.status === 'disconnected') {
            setStep('disconnected');
          } else {
            // Still connecting, let's resume polling
            setStep('qr');
            startQrPolling(account.instance_name);
            startStatusPolling(account.instance_name);
          }
        } else {
          setStep('input');
        }
      } catch (error) {
        console.error('Failed to fetch Evolution accounts', error);
        setStep('input');
      }
    };

    fetchAccounts();

    return () => stopPolling()
  }, [])

  const handleConnect = async () => {
    setStep('creating')

    try {
      // 1. Create DB record (no phone number required now)
      const accountRes = await evolutionApi.createAccount('')
      const newInstanceName = accountRes?.data?.instance_name || accountRes?.instance_name
      
      setInstanceName(newInstanceName)

      // 2. Connect instance in Evolution API
      await evolutionApi.connectInstance(newInstanceName)

      toast({ title: 'Instance ready', description: 'Generating QR code...' })
      setStep('qr')
      startQrPolling(newInstanceName)
      startStatusPolling(newInstanceName)
    } catch (error: any) {
      toast({ 
        title: 'Connection Failed', 
        description: error.message || 'Could not connect to Evolution API', 
        variant: 'destructive' 
      })
      setStep('input')
    }
  }

  const handleDisconnect = async () => {
    try {
      await evolutionApi.disconnectInstance(instanceName);
      setStep('disconnected');
      setQrBase64(null);
      toast({ title: 'Disconnected', description: 'WhatsApp disconnected.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Could not disconnect properly.', variant: 'destructive' });
    }
  }

  const handleReconnect = async () => {
    setStep('creating')
    try {
      await evolutionApi.connectInstance(instanceName)
      toast({ title: 'Instance ready', description: 'Generating QR code...' })
      setStep('qr')
      startQrPolling(instanceName)
      startStatusPolling(instanceName)
    } catch (error: any) {
      toast({ 
        title: 'Connection Failed', 
        description: error.message || 'Could not connect to Evolution API', 
        variant: 'destructive' 
      })
      setStep('disconnected')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this WhatsApp account? You will be able to connect a different account.')) return
    try {
      await evolutionApi.deleteAccount(instanceName)
      toast({ title: 'Account Deleted', description: 'You can now connect a new WhatsApp account.' })
      // Reset all state so the user can connect a fresh account
      setInstanceName('')
      setProfileName(null)
      setProfilePic(null)
      setPhoneNumber('')
      setQrBase64(null)
      setStep('input')
    } catch (error) {
      toast({ title: 'Error', description: 'Could not delete the account.', variant: 'destructive' })
    }
  }

  const startQrPolling = (instance: string) => {
    if (qrPollRef.current) clearInterval(qrPollRef.current)
    qrPollRef.current = setInterval(async () => {
      try {
        const res = await evolutionApi.getQrCode(instance)
        if (res && res.data && res.data.qrcode) {
          setQrBase64(res.data.qrcode)
          // Once we have the QR, we can stop polling for it
          if (qrPollRef.current) clearInterval(qrPollRef.current)
        }
      } catch (e) {
        console.error('QR poll error', e)
      }
    }, 3000)
  }

  const startStatusPolling = (instance: string) => {
    if (statusPollRef.current) clearInterval(statusPollRef.current)
    statusPollRef.current = setInterval(async () => {
      try {
        const res = await evolutionApi.getStatus(instance)
        const status = res?.data?.state || 'connecting'
        
        if (status === 'connected') {
          setStep('connected')
          stopPolling()
          toast({ title: 'Success', description: 'WhatsApp connected successfully!' })
          // Re-fetch to get profile info
          const accounts = await evolutionApi.getAccounts()
          if (accounts?.data) {
            const acc = accounts.data.find((a: any) => a.instance_name === instance)
            if (acc && acc.whatsapp) {
              setPhoneNumber(acc.whatsapp.owner?.split('@')[0] || acc.whatsapp.ownerJid?.split('@')[0] || acc.phone_number)
              setProfilePic(acc.whatsapp.profilePictureUrl || acc.whatsapp.profilePicUrl || null)
              setProfileName(acc.whatsapp.profileName || acc.whatsapp.name || null)
            }
          }
        }
      } catch (e) {
        console.error('Status poll error', e)
      }
    }, 4000)
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => { stopPolling(); router.push('/integrations'); }}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Evolution WhatsApp</h1>
          <p className="text-muted-foreground">Connect your personal WhatsApp number</p>
        </div>
      </div>

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>Connect Device</CardTitle>
          <CardDescription>
            {step === 'connected' 
              ? 'Your WhatsApp account is successfully connected to the platform.'
              : step === 'disconnected'
              ? 'Your WhatsApp account is disconnected. Please reconnect to continue.'
              : 'A QR code will be generated for you to scan in your WhatsApp app under "Linked Devices".'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Checking connection...</p>
            </div>
          )}

          {step === 'input' && (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <div className="p-4 bg-muted/30 rounded-full mb-2">
                <Phone className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-center text-muted-foreground max-w-sm">
                Click the button below to generate a secure QR code. You'll scan this with your WhatsApp app to link your account.
              </p>
            </div>
          )}

          {step === 'creating' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Initializing connection...</p>
            </div>
          )}

          {step === 'qr' && (
            <div className="flex flex-col items-center justify-center py-6 space-y-6">
              {qrBase64 ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-white rounded-xl shadow-sm border">
                    <img src={qrBase64} alt="WhatsApp QR Code" className="w-64 h-64" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="font-medium text-lg">Scan QR Code</p>
                    <p className="text-sm text-muted-foreground">Open WhatsApp &gt; Linked Devices &gt; Link a Device</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-12 space-y-4">
                  <QrCode className="h-12 w-12 animate-pulse text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Generating QR code...</p>
                </div>
              )}
            </div>
          )}

          {step === 'connected' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              <div className="relative">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="h-24 w-24 rounded-full border-4 border-background shadow-md object-cover" />
                ) : (
                  <div className="h-24 w-24 rounded-full border-4 border-background shadow-md bg-muted flex items-center justify-center">
                    <Phone className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1.5 border-4 border-background shadow-sm">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              </div>
              
              <div className="text-center space-y-1">
                <p className="text-xl font-semibold text-foreground">
                  {profileName || 'WhatsApp Connected'}
                </p>
                {phoneNumber && (
                  <p className="text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full inline-block mt-2">
                    +{phoneNumber}
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 'disconnected' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              <div className="relative opacity-50 grayscale">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="h-24 w-24 rounded-full border-4 border-background shadow-md object-cover" />
                ) : (
                  <div className="h-24 w-24 rounded-full border-4 border-background shadow-md bg-muted flex items-center justify-center">
                    <Phone className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div className="text-center space-y-1">
                <p className="text-xl font-semibold text-foreground">
                  {profileName || 'WhatsApp Disconnected'}
                </p>
                {phoneNumber && (
                  <p className="text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full inline-block mt-2">
                    +{phoneNumber}
                  </p>
                )}
                <p className="text-sm text-destructive mt-2">This connection is offline</p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t bg-muted/20 px-6 py-4">
          <Button variant="outline" onClick={() => { stopPolling(); router.push('/integrations'); }}>
            Cancel
          </Button>
          
          {step === 'input' && (
            <Button onClick={handleConnect}>
              Generate QR Code
            </Button>
          )}

          {step === 'connected' && (
            <div className="flex gap-4 w-full justify-end">
              <Button variant="destructive" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </div>
          )}

          {step === 'disconnected' && (
            <div className="flex gap-3 w-full justify-end">
              <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-white" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
              <Button onClick={handleReconnect}>
                Reconnect Device
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
