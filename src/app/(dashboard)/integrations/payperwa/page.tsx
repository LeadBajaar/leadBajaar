"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Key, Save, Loader2, CheckCircle2, Wallet, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface PayperwaTemplate {
  name: string;
  language: string;
  status: string;
  category: string;
}

export default function PayperwaIntegrationPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [integrationId, setIntegrationId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  
  const [templates, setTemplates] = useState<PayperwaTemplate[]>([]);
  const [balance, setBalance] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    fetchIntegration();
  }, []);

  const fetchIntegration = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/integrations');
      const integration = res.data.integrations?.find((i: any) => i.type === 'payperwa');
      if (integration) {
        setIsConfigured(true);
        setIntegrationId(integration.id);
        setApiKey(integration.config?.api_key || "");
        await fetchPayperwaDetails(integration.id);
      }
    } catch (error: any) {
      toast.error("Failed to fetch PayPerWA integration status");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPayperwaDetails = async (id: number) => {
    try {
      setIsLoadingDetails(true);
      const res = await api.get(`/integrations/payperwa/${id}/details`);
      setTemplates(res.data.templates || []);
      setBalance(res.data.balance || null);
    } catch (error) {
      console.error("Failed to fetch PayPerWA details");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey) {
      toast.error("API Key is required");
      return;
    }

    try {
      setIsSaving(true);
      let newId = integrationId;
      if (isConfigured && integrationId) {
        await api.put(`/integrations/${integrationId}`, {
          config: { api_key: apiKey },
          is_active: true,
        });
      } else {
        const res = await api.post('/integrations', {
          type: 'payperwa',
          config: { api_key: apiKey },
          isActive: true,
          environment: 'production'
        });
        newId = res.data.data.id;
        setIntegrationId(newId);
      }
      toast.success("PayPerWA connected successfully!");
      setIsConfigured(true);
      if (newId) fetchPayperwaDetails(newId);
    } catch (error) {
      toast.error("Failed to connect PayPerWA. Check your API key.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!integrationId) return;
    try {
      setIsSaving(true);
      await api.delete(`/integrations/${integrationId}`);
      toast.success("PayPerWA disconnected successfully");
      setIsConfigured(false);
      setIntegrationId(null);
      setApiKey("");
      setTemplates([]);
      setBalance(null);
    } catch (error) {
      toast.error("Failed to disconnect PayPerWA");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">PayPerWA Integration</h1>
          <p className="text-slate-500">Send WhatsApp messages using PayPerWA Cloud API.</p>
        </div>
      </div>

      <Tabs defaultValue={isConfigured ? "details" : "settings"} className="space-y-6">
        <TabsList>
          <TabsTrigger value="details" disabled={!isConfigured}>Account Details</TabsTrigger>
          <TabsTrigger value="templates" disabled={!isConfigured}>Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold mb-1">Wallet Balance</h2>
              {isLoadingDetails ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <p className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  {balance ? `₹${balance.amount}` : 'N/A'}
                </p>
              )}
            </div>
            <Button variant="outline" onClick={() => integrationId && fetchPayperwaDetails(integrationId)}>
              <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Synced Templates</h2>
              <Button variant="outline" size="sm" onClick={() => integrationId && fetchPayperwaDetails(integrationId)}>
                <RefreshCcw className="h-4 w-4 mr-2" /> Sync
              </Button>
            </div>
            {isLoadingDetails ? (
              <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-slate-500 py-8">No templates found in PayPerWA.</TableCell>
                    </TableRow>
                  ) : (
                    templates.map((t, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{t.name}</TableCell>
                        <TableCell>{t.category}</TableCell>
                        <TableCell>{t.language}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            t.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {t.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="space-y-6 max-w-2xl">
              <div className="space-y-2">
                <Label htmlFor="api_key">PayPerWA API Key</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="api_key"
                    type="password"
                    placeholder="ppw_live_sk_..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Get this from your PayPerWA Dashboard → Settings → API tab.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                {isConfigured ? (
                  <>
                    <Button 
                      onClick={handleSave} 
                      disabled={isSaving}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Update Key
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDisconnect}
                      disabled={isSaving}
                    >
                      Disconnect
                    </Button>
                    <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium ml-auto">
                      <CheckCircle2 className="h-4 w-4" />
                      Connected
                    </div>
                  </>
                ) : (
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving || !apiKey}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Connect PayPerWA
                  </Button>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
