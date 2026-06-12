"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Globe, ClipboardCopy, ShieldCheck, Loader2, Save, ArrowLeft, Plus, Settings, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { integrationApi } from "@/lib/api";
import { useErrorHandler } from "@/utils/useErrorHandler";
import { useUser } from "@/contexts/UserContext";
import { cn } from "@/lib/utils";

export default function FacebookLeadFormsPage() {
  const router = useRouter();
  const { user } = useUser();
  const { handleError } = useErrorHandler();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [forms, setForms] = useState<any[]>([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [showToken, setShowToken] = useState(false);

  const [config, setConfig] = useState({
    leadFormName: "",
    pageId: "",
    formId: "",
    accessToken: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setIsLoading(true);
      const integrations = await integrationApi.getConnectedIntegrations();
      const leadForms = integrations.filter((i: any) => i.type === "leadform");
      setForms(leadForms);
    } catch (error) {
      console.error("Failed to fetch lead forms", error);
    } finally {
      setIsLoading(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!config.leadFormName.trim()) newErrors.leadFormName = "Lead Form Name is required";
    if (!config.pageId.trim()) newErrors.pageId = "Page ID is required";
    if (!config.formId.trim()) newErrors.formId = "Form ID is required";
    if (!config.accessToken.trim()) newErrors.accessToken = "Access Token is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      const payload = {
        type: "leadform",
        config: {
          project_name: config.leadFormName,
          page_id: config.pageId,
          form_id: config.formId,
          page_access_token: config.accessToken,
        },
        isActive: true,
        environment: "production" as "sandbox" | "production",
      };

      if (selectedFormId) {
        await (integrationApi as any).updateIntegration(selectedFormId, payload);
        toast.success("Facebook Lead Form updated!");
      } else {
        await integrationApi.saveIntegration(payload);
        toast.success("New Facebook Lead Form connected!");
      }
      
      window.dispatchEvent(new Event('integrationsUpdated'));
      setIsCreatingNew(false);
      setSelectedFormId(null);
      setConfig({ leadFormName: "", pageId: "", formId: "", accessToken: "" });
      fetchForms();
    } catch (error: any) {
      handleError(error, { title: "Failed to save configuration" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this lead form connection?")) return;
    try {
      await integrationApi.deleteIntegration(id.toString());
      toast.success("Form connection removed");
      fetchForms();
      window.dispatchEvent(new Event('integrationsUpdated'));
    } catch (error) {
      handleError(error, { title: "Failed to delete integration" });
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await integrationApi.updateIntegrationStatus(id.toString(), !currentStatus);
      fetchForms();
      window.dispatchEvent(new Event('integrationsUpdated'));
    } catch (error) {
      handleError(error, { title: "Failed to update status" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--crm-bg)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--crm-text-tertiary)]" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-[var(--crm-bg)] z-10 overflow-hidden">
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-[var(--crm-border)] bg-[var(--crm-surface-1)]">
        <div className="flex items-center gap-4 p-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-[8px] text-[var(--crm-text-secondary)] hover:bg-[var(--crm-surface-3)]"
            onClick={() => router.push('/integrations')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[var(--crm-text-primary)]">Facebook Lead Forms</h1>
            <p className="text-sm text-[var(--crm-text-secondary)] mt-1">
              Configure and sync Facebook Lead Form submissions automatically.
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold h-9 px-4 shadow-sm"
            onClick={() => {
              setConfig({ leadFormName: "", pageId: "", formId: "", accessToken: "" });
              setErrors({});
              setSelectedFormId(null);
              setIsCreatingNew(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add New Form
          </Button>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ── Main Column: Connected Forms ───────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-semibold text-[var(--crm-text-primary)] px-1">Connected Forms</h2>
            {forms.length === 0 ? (
              <div className="text-center py-12 text-[var(--crm-text-secondary)] border border-[var(--crm-border)] rounded-xl bg-[var(--crm-surface-1)]">
                No forms connected yet. Click "Add New Form" to get started.
              </div>
            ) : (
              <div className="border border-[var(--crm-border)] rounded-xl bg-[var(--crm-surface-1)] overflow-hidden divide-y divide-[var(--crm-border)] shadow-sm">
                {forms.map((form) => (
                  <div key={form.id} className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-[var(--crm-surface-2)] transition-colors gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
                        <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-[var(--crm-text-primary)] truncate">
                            {form.config?.project_name || form.config?.leadFormName || "Unnamed Form"}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-[var(--crm-bg)] border border-[var(--crm-border)] text-[var(--crm-text-secondary)] truncate max-w-[200px]">
                            PAGE: {form.config?.page_id || form.config?.pageId}
                          </span>
                          <span className="text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-[var(--crm-bg)] border border-[var(--crm-border)] text-[var(--crm-text-secondary)] truncate max-w-[200px]">
                            FORM: {form.config?.form_id || form.config?.formId}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-[10px] font-bold tracking-wider", form.is_active ? "text-green-600 dark:text-green-500" : "text-[var(--crm-text-tertiary)]")}>
                          {form.is_active ? "ACTIVE" : "INACTIVE"}
                        </span>
                        <Switch
                          checked={form.is_active}
                          onCheckedChange={() => toggleStatus(form.id, form.is_active)}
                          className="scale-90"
                        />
                      </div>
                      <div className="h-6 w-[1px] bg-[var(--crm-border)] hidden sm:block" />
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setConfig({
                              leadFormName: form.config?.project_name || form.config?.leadFormName || "",
                              pageId: form.config?.page_id || form.config?.pageId || "",
                              formId: form.config?.form_id || form.config?.formId || "",
                              accessToken: form.config?.page_access_token || form.config?.accessToken || "",
                            });
                            setErrors({});
                            setSelectedFormId(form.id);
                            setIsCreatingNew(true); // Open modal
                          }}
                          className="h-8 w-8 rounded-md text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-surface-3)]"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-md text-[var(--crm-text-tertiary)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleDelete(form.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Side Column: Meta Config ───────────────────────────────────────── */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-sm font-semibold text-[var(--crm-text-primary)] px-1">Meta Configuration</h2>
            <div className="p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10 space-y-5">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold uppercase text-blue-600 dark:text-blue-400 flex items-center gap-2 tracking-wider">
                  <Globe className="h-4 w-4" /> Webhook Info
                </Label>
                <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                  Dashboard Setup
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-[var(--crm-text-secondary)] uppercase font-bold ml-1">
                    Webhook URL
                  </Label>
                  <div className="flex items-center gap-2">
                    <code className="text-[13px] p-3 bg-[var(--crm-surface-1)] border border-[var(--crm-border)] rounded-xl flex-1 font-mono break-all text-[var(--crm-text-primary)] shadow-sm">
                      {`https://api.leadbajaar.com/api/webhook/leadform?id=${user?.id || 1}`}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0 h-11 w-11 rounded-xl bg-[var(--crm-surface-1)] border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)]"
                      onClick={() => {
                        navigator.clipboard.writeText(`https://api.leadbajaar.com/api/webhook/leadform?id=${user?.id || 1}`);
                        toast.success("Webhook URL Copied!");
                      }}
                    >
                      <ClipboardCopy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-[var(--crm-text-secondary)] uppercase font-bold ml-1">
                    Verify Token
                  </Label>
                  <div className="flex items-center gap-2">
                    <code className="text-[13px] p-3 bg-[var(--crm-surface-1)] border border-[var(--crm-border)] rounded-xl flex-1 font-mono text-[var(--crm-text-primary)] shadow-sm">
                      123abc
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0 h-11 w-11 rounded-xl bg-[var(--crm-surface-1)] border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)]"
                      onClick={() => {
                        navigator.clipboard.writeText("123abc");
                        toast.success("Verify Token Copied!");
                      }}
                    >
                      <ClipboardCopy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-[13px] text-[var(--crm-text-secondary)] leading-relaxed pt-0.5">
                  Copy these values into your Meta Developer Dashboard under{" "}
                  <strong className="text-[var(--crm-text-primary)]">Webhooks → Leadgen</strong> to enable real-time
                  lead capture.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Configuration Modal ──────────────────────────────────────────────── */}
      <Dialog 
        open={isCreatingNew} 
        onOpenChange={(open) => {
          if (!open) {
            setIsCreatingNew(false);
            setSelectedFormId(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px] bg-[var(--crm-bg)] border-[var(--crm-border)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--crm-text-primary)]">
              {selectedFormId ? "Edit Form Connection" : "Add New Form"}
            </DialogTitle>
            <DialogDescription className="text-[var(--crm-text-secondary)]">
              Enter your Facebook Page ID and Form ID to sync leads into LeadBajaar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[var(--crm-text-primary)] text-xs font-semibold">Lead Form Name / Project Name</Label>
              <Input
                placeholder="E.g., Summer Campaign Leads"
                value={config.leadFormName}
                onChange={(e) => setConfig({ ...config, leadFormName: e.target.value })}
                className={errors.leadFormName ? "border-red-500 bg-[var(--crm-surface-1)] text-[var(--crm-text-primary)] h-9" : "bg-[var(--crm-surface-1)] text-[var(--crm-text-primary)] border-[var(--crm-border)] h-9"}
              />
              {errors.leadFormName && <p className="text-[10px] text-red-500 font-medium">{errors.leadFormName}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-[var(--crm-text-primary)] text-xs font-semibold">Page ID</Label>
              <Input
                placeholder="Enter your Facebook Page ID"
                value={config.pageId}
                onChange={(e) => setConfig({ ...config, pageId: e.target.value })}
                className={errors.pageId ? "border-red-500 bg-[var(--crm-surface-1)] text-[var(--crm-text-primary)] h-9 font-mono text-sm" : "bg-[var(--crm-surface-1)] text-[var(--crm-text-primary)] border-[var(--crm-border)] h-9 font-mono text-sm"}
              />
              {errors.pageId && <p className="text-[10px] text-red-500 font-medium">{errors.pageId}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-[var(--crm-text-primary)] text-xs font-semibold">Form ID</Label>
              <Input
                placeholder="Enter your Lead Form ID"
                value={config.formId}
                onChange={(e) => setConfig({ ...config, formId: e.target.value })}
                className={errors.formId ? "border-red-500 bg-[var(--crm-surface-1)] text-[var(--crm-text-primary)] h-9 font-mono text-sm" : "bg-[var(--crm-surface-1)] text-[var(--crm-text-primary)] border-[var(--crm-border)] h-9 font-mono text-sm"}
              />
              {errors.formId && <p className="text-[10px] text-red-500 font-medium">{errors.formId}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-[var(--crm-text-primary)] text-xs font-semibold">Page Access Token</Label>
              <div className="relative">
                <Input
                  type={showToken ? "text" : "password"}
                  placeholder="Enter Long-lived Page Access Token"
                  value={config.accessToken}
                  onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                  className={errors.accessToken ? "border-red-500 bg-[var(--crm-surface-1)] text-[var(--crm-text-primary)] h-9 font-mono text-sm pr-10" : "bg-[var(--crm-surface-1)] text-[var(--crm-text-primary)] border-[var(--crm-border)] h-9 font-mono text-sm pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)]"
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.accessToken && <p className="text-[10px] text-red-500 font-medium">{errors.accessToken}</p>}
            </div>
          </div>

          <DialogFooter className="border-t border-[var(--crm-border)] pt-4 mt-2">
            <Button 
              variant="ghost" 
              onClick={() => {
                setIsCreatingNew(false);
                setSelectedFormId(null);
              }}
              className="text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {selectedFormId ? "Update Configuration" : "Save Configuration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
