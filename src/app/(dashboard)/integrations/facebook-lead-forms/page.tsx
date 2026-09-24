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
import { PageHeader } from "@/components/page-header/PageHeader";

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
    routingOnly: false,
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
    if (!config.routingOnly) {
      if (!config.formId.trim()) newErrors.formId = "Form ID is required";
      if (!selectedFormId && !config.accessToken.trim()) newErrors.accessToken = "Access Token is required";
    }
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
          leadFormName: config.leadFormName,
          pageId: config.pageId,
          formId: config.formId,
          accessToken: config.accessToken,
          routingOnly: config.routingOnly,
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
      setConfig({ leadFormName: "", pageId: "", formId: "", accessToken: "", routingOnly: false });
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
      <div className="flex flex-1 min-h-[350px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400 dark:text-slate-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 gap-4 sm:gap-5">
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <PageHeader
        title="Facebook Lead Forms"
        description="Configure and sync Facebook Lead Form submissions automatically."
        icon={<Globe className="h-6 w-6 text-primary" />}
        actions={
          <Button
            className="bg-primary hover:bg-primary/90 text-white rounded-md font-semibold h-9 px-4 shadow-sm"
            onClick={() => {
              setConfig({ leadFormName: "", pageId: "", formId: "", accessToken: "", routingOnly: false });
              setErrors({});
              setSelectedFormId(null);
              setIsCreatingNew(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add New Form
          </Button>
        }
      />

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="w-full">
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ── Main Column: Connected Forms ───────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-semibold text-[var(--crm-text-primary)] px-1">Connected Forms</h2>
            {forms.length === 0 ? (
              <div className="text-center py-12 text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                No forms connected yet. Click "Add New Form" to get started.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {forms.map((form) => (
                  <div key={form.id} className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-200 gap-4 shadow-sm">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/30 shadow-sm text-blue-600 dark:text-blue-400">
                        <Globe className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[15px] font-bold text-slate-900 dark:text-white truncate">
                            {form.config?.project_name || form.config?.leadFormName || "Unnamed Form"}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-semibold tracking-wide px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 truncate max-w-[200px]">
                            PAGE: {form.config?.page_id || form.config?.pageId}
                          </span>
                          {form.config?.routingOnly ? (
                            <span className="text-[11px] font-semibold tracking-wide px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 text-purple-600 dark:text-purple-400 truncate max-w-[200px]">
                              ROUTING ONLY
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold tracking-wide px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 truncate max-w-[200px]">
                              FORM: {form.config?.form_id || form.config?.formId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto mt-2 sm:mt-0 justify-between sm:justify-end">
                      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className={cn("text-[11px] font-bold tracking-wider", form.is_active ? "text-emerald-600 dark:text-emerald-500" : "text-slate-400")}>
                          {form.is_active ? "ACTIVE" : "INACTIVE"}
                        </span>
                        <Switch
                          checked={form.is_active}
                          onCheckedChange={() => toggleStatus(form.id, form.is_active)}
                          className="scale-90 data-[state=checked]:bg-emerald-500"
                        />
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setConfig({
                              leadFormName: form.config?.project_name || form.config?.leadFormName || "",
                              pageId: form.config?.page_id || form.config?.pageId || "",
                              formId: form.config?.form_id || form.config?.formId || "",
                              accessToken: form.config?.page_access_token || form.config?.accessToken || "",
                              routingOnly: form.config?.routingOnly || false,
                            });
                            setErrors({});
                            setSelectedFormId(form.id);
                            setIsCreatingNew(true); // Open modal
                          }}
                          className="h-9 w-9 rounded-xl border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-xl border-rose-200 dark:border-rose-900/50 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
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
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white px-1">Meta Configuration</h2>
            <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <Label className="text-[13px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-500" /> Webhook Setup
                </Label>
                <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-none font-bold text-[10px] px-2 py-0.5 rounded-md">
                  REQUIRED
                </Badge>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">
                    Webhook URL
                  </Label>
                  <div className="relative flex items-center group">
                    <input 
                      readOnly 
                      value={`https://api.leadbajaar.com/api/webhook/leadform?id=${user?.id || 1}`}
                      className="w-full text-[13px] pl-4 pr-12 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-700 dark:text-slate-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1.5 h-8 w-8 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
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
                  <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">
                    Verify Token
                  </Label>
                  <div className="relative flex items-center group">
                    <input 
                      readOnly 
                      value="123abc"
                      className="w-full text-[13px] pl-4 pr-12 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-700 dark:text-slate-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1.5 h-8 w-8 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
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

              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 flex items-start gap-3">
                <Globe className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[13px] text-blue-900 dark:text-blue-200 leading-relaxed">
                  Copy these values into your Meta Developer Dashboard under{" "}
                  <strong className="font-bold">Webhooks → Leadgen</strong> to enable real-time
                  lead capture from your forms.
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

            <div className="flex items-center justify-between border border-[var(--crm-border)] rounded-md p-3 bg-[var(--crm-surface-1)]">
              <div className="space-y-0.5">
                <Label className="text-[var(--crm-text-primary)] text-xs font-semibold">HubSpot Routing Only</Label>
                <p className="text-[10px] text-[var(--crm-text-secondary)]">Use this only for routing HubSpot webhook leads (No Access Token or Form ID required).</p>
              </div>
              <Switch
                checked={config.routingOnly}
                onCheckedChange={(checked) => setConfig({ ...config, routingOnly: checked, formId: "", accessToken: "" })}
              />
            </div>

            {!config.routingOnly && (
              <>
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
              </>
            )}
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
              className="bg-primary hover:bg-primary/90 text-white font-semibold"
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
