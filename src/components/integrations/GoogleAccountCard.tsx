import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { googleIntegrationApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Mail, Calendar, Users, HardDrive, CheckCircle2, XCircle, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';

interface GoogleStatus {
  connected: boolean;
  email: string | null;
  contacts: boolean;
  calendar: boolean;
  gmail: boolean;
  drive: boolean;
}

export function GoogleAccountCard() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<GoogleStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const data = await googleIntegrationApi.getStatus();
      setStatus(data);
    } catch (err) {
      console.error('Failed to fetch Google status', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Check for callback query params
    const googleConnected = searchParams.get('google_connected');
    const googleError = searchParams.get('google_error');
    if (googleConnected === 'true') {
      toast.success('Successfully connected to Google!');
      // Remove query param
      window.history.replaceState({}, '', '/integrations');
    } else if (googleError) {
      toast.error('Failed to connect to Google: ' + googleError);
      window.history.replaceState({}, '', '/integrations');
    }
  }, [searchParams]);

  const handleConnect = async (scope?: string) => {
    try {
      toast.loading('Redirecting to Google...', { id: 'google-connect' });
      const url = await googleIntegrationApi.getConnectUrl(scope);
      toast.dismiss('google-connect');
      window.location.href = url;
    } catch (error: any) {
      toast.error(error.message || 'Failed to start connection');
      toast.dismiss('google-connect');
    }
  };

  const handleDisconnect = async () => {
    try {
      await googleIntegrationApi.disconnect();
      toast.success('Disconnected from Google');
      fetchStatus();
    } catch (error) {
      toast.error('Failed to disconnect');
    }
  };

  if (loading) return <div>Loading Google status...</div>;

  return (
    <Card className="mb-8 border-[var(--crm-border)] bg-[var(--crm-surface-1)]">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google Workspace
        </CardTitle>
        <CardDescription>
          Connect your Google account to sync Contacts, Calendar, and Gmail.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!status?.connected ? (
          <div className="flex flex-col items-start gap-4">
            <p className="text-sm text-[var(--crm-text-secondary)]">
              You are currently not connected to any Google account. Connect now to enable features.
            </p>
            <Button onClick={() => handleConnect()} className="bg-primary hover:bg-primary/90 text-white">
              Continue with Google
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 border border-[var(--crm-border)] rounded-lg bg-[var(--crm-surface-2)]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Connected as</p>
                  <p className="text-[var(--crm-text-secondary)] text-sm">{status.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleDisconnect} className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
                <LogOut className="h-4 w-4 mr-2" /> Disconnect
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contacts */}
              <div className="flex items-center justify-between p-3 border border-[var(--crm-border)] rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-[var(--crm-text-secondary)]" />
                  <span className="font-medium text-sm">Google Contacts</span>
                </div>
                {status.contacts ? (
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Connected</Badge>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => handleConnect('https://www.googleapis.com/auth/contacts')}>
                    Connect
                  </Button>
                )}
              </div>

              {/* Calendar */}
              <div className="flex items-center justify-between p-3 border border-[var(--crm-border)] rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-[var(--crm-text-secondary)]" />
                  <span className="font-medium text-sm">Google Calendar</span>
                </div>
                {status.calendar ? (
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Connected</Badge>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => handleConnect('https://www.googleapis.com/auth/calendar')}>
                    Connect
                  </Button>
                )}
              </div>

              {/* Gmail */}
              <div className="flex items-center justify-between p-3 border border-[var(--crm-border)] rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-[var(--crm-text-secondary)]" />
                  <span className="font-medium text-sm">Gmail</span>
                </div>
                {status.gmail ? (
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Connected</Badge>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => handleConnect('https://www.googleapis.com/auth/gmail.send')}>
                    Connect
                  </Button>
                )}
              </div>

              {/* Drive */}
              <div className="flex items-center justify-between p-3 border border-[var(--crm-border)] rounded-lg opacity-75">
                <div className="flex items-center gap-3">
                  <HardDrive className="h-5 w-5 text-[var(--crm-text-secondary)]" />
                  <span className="font-medium text-sm">Google Drive</span>
                </div>
                {status.drive ? (
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Connected</Badge>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => handleConnect('https://www.googleapis.com/auth/drive.file')}>
                    Connect
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
