'use client'

import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import { integrationApi } from '@/lib/api'

interface ManualPixelDialogProps {
    open: boolean
    onClose: () => void
    onSuccess: () => void
}

export function ManualPixelDialog({ open, onClose, onSuccess }: ManualPixelDialogProps) {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [name, setName] = useState('')
    const [pixelId, setPixelId] = useState('')
    const [accessToken, setAccessToken] = useState('')
    const [testEventCode, setTestEventCode] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !pixelId || !accessToken) {
            toast({ title: 'Validation Error', description: 'Name, Pixel ID, and Access Token are required.', variant: 'destructive' })
            return
        }

        setIsLoading(true)
        try {
            await integrationApi.saveIntegration({
                type: 'facebook_conversion_api',
                environment: 'production',
                isActive: true,
                config: {
                    pageName: name,
                    pixelId: pixelId,
                    accessToken: accessToken,
                    testEventCode: testEventCode
                }
            })
            
            toast({ title: 'Success', description: 'Meta Pixel added successfully!' })
            
            // Reset state
            setName('')
            setPixelId('')
            setAccessToken('')
            setTestEventCode('')
            
            onSuccess()
            onClose()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to save pixel details',
                variant: 'destructive'
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add Meta Pixel Manually</DialogTitle>
                        <DialogDescription>
                            Enter your Meta Pixel details to enable the Conversions API.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Pixel Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Main Website Pixel"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="pixelId">Pixel ID</Label>
                            <Input
                                id="pixelId"
                                value={pixelId}
                                onChange={(e) => setPixelId(e.target.value)}
                                placeholder="e.g. 1234567890"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="accessToken">Access Token</Label>
                            <Input
                                id="accessToken"
                                type="password"
                                value={accessToken}
                                onChange={(e) => setAccessToken(e.target.value)}
                                placeholder="Paste your CAPI access token"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="testEventCode">Test Event Code (Optional)</Label>
                            <Input
                                id="testEventCode"
                                value={testEventCode}
                                onChange={(e) => setTestEventCode(e.target.value)}
                                placeholder="e.g. TEST12345"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-white">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Pixel
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
