"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Loader2, 
  Users, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Mail,
  AlertCircle
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CreateCampaignDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  templates: any[];
  stages: any[];
  onCampaignCreated: () => void;
}

export function CreateCampaignDialog({
  isOpen,
  onOpenChange,
  templates,
  stages,
  onCampaignCreated,
}: CreateCampaignDialogProps) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [templateId, setTemplateId] = useState<string>("");
  const [audienceType, setAudienceType] = useState<"all" | "stage" | "custom">("all");
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [customEmails, setCustomEmails] = useState<string>("");

  const [leads, setLeads] = useState<any[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchLeads();
      if (templates.length > 0 && !templateId) {
        setTemplateId(templates[0].id.toString());
        setSubject(templates[0].subject || "");
      }
    }
  }, [isOpen]);

  const fetchLeads = async () => {
    try {
      setIsLoadingLeads(true);
      const res = await api.get('/leads', { params: { per_page: 500 } });
      const rawLeads = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setLeads(rawLeads);
    } catch (e) {
      console.warn("Failed to load leads for campaign targeting", e);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  const handleTemplateChange = (val: string) => {
    setTemplateId(val);
    const chosen = templates.find((t) => t.id.toString() === val);
    if (chosen && (!subject || subject === "")) {
      setSubject(chosen.subject || "");
    }
  };

  // Compute recipients based on audience type
  const computeRecipients = () => {
    if (audienceType === "custom") {
      const parsed = customEmails
        .split(/[\n,;]+/)
        .map((e) => e.trim())
        .filter((e) => e.length > 3 && e.includes("@"));
      return parsed.map((e) => ({
        email: e,
        data: { name: e.split("@")[0] }
      }));
    }

    let filtered = leads.filter((l) => l.email && l.email.includes("@"));
    if (audienceType === "stage" && selectedStage) {
      filtered = filtered.filter(
        (l) => (l.stage_id?.toString() === selectedStage) || (l.stage?.toLowerCase() === selectedStage.toLowerCase())
      );
    }

    return filtered.map((l) => ({
      email: l.email,
      data: {
        name: l.name || l.contact_name || "Valued Customer",
        phone: l.phone || "",
        company: l.company || l.company_name || ""
      }
    }));
  };

  const estimatedRecipients = computeRecipients();

  const handleCreateAndSend = async (sendImmediately: boolean) => {
    if (!name.trim()) {
      toast.error("Please enter a campaign name");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter an email subject line");
      return;
    }
    if (!templateId) {
      toast.error("Please select an email template");
      return;
    }

    const recipients = computeRecipients();
    if (sendImmediately && recipients.length === 0) {
      toast.error("No valid recipient emails found for the selected audience");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create campaign
      const campaignRes = await api.post('/email/campaigns', {
        name: name.trim(),
        subject: subject.trim(),
        template_id: parseInt(templateId, 10),
      });

      const newCampaignId = campaignRes.data?.id;

      // 2. If immediate dispatch requested
      if (sendImmediately && newCampaignId) {
        await api.post(`/email/campaigns/${newCampaignId}/send`, {
          recipients: recipients
        });
        toast.success(`Campaign launched! Queued dispatch to ${recipients.length} recipients.`);
      } else {
        toast.success("Campaign saved as draft successfully.");
      }

      onCampaignCreated();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setSubject("");
    setTemplateId(templates.length > 0 ? templates[0].id.toString() : "");
    setAudienceType("all");
    setSelectedStage("");
    setCustomEmails("");
  };

  const selectedTemplateObj = templates.find((t) => t.id.toString() === templateId);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[700px] w-full max-h-[90vh] overflow-y-auto rounded-2xl p-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-2xl">
        <DialogHeader className="space-y-1 text-left pb-4 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#2A3ED6]/10 text-[#2A3ED6]">
              <Send className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle className="text-xl font-black text-slate-900 dark:text-white satoshi-heading">
                Create Email Campaign
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 font-medium">
                Broadcast marketing emails, updates, and offers directly to your CRM contacts.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Campaign Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Campaign Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                placeholder="e.g. Q4 Festive Offer Blast"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 text-sm font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Email Subject Line <span className="text-rose-500">*</span>
              </Label>
              <Input
                placeholder="e.g. Exclusive 20% off for you, {{name}}!"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-10 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 text-sm font-semibold"
              />
            </div>
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Select Email Template <span className="text-rose-500">*</span>
              </Label>
              {selectedTemplateObj && (
                <span className="text-[11px] text-blue-600 dark:text-indigo-400 font-bold">
                  Using: {selectedTemplateObj.name}
                </span>
              )}
            </div>

            {templates.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
                <span>No email templates found yet. Please create a template first!</span>
              </div>
            ) : (
              <Select value={templateId} onValueChange={handleTemplateChange}>
                <SelectTrigger className="h-11 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 text-xs font-semibold">
                  <SelectValue placeholder="Choose a template..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {templates.map((tpl) => (
                    <SelectItem key={tpl.id} value={tpl.id.toString()} className="text-xs font-semibold">
                      {tpl.name} {tpl.subject ? `— "${tpl.subject}"` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Template Preview Snippet */}
            {selectedTemplateObj?.content && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-300 max-h-24 overflow-y-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Template Preview:
                </span>
                <p className="line-clamp-3 whitespace-pre-wrap font-sans">
                  {selectedTemplateObj.content.replace(/<[^>]*>?/gm, "")}
                </p>
              </div>
            )}
          </div>

          {/* Target Audience */}
          <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Target Audience & Recipients
              </Label>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-lg text-[11px] font-bold border border-emerald-200/60">
                <Users className="h-3.5 w-3.5" />
                <span>
                  {isLoadingLeads ? "Counting..." : `${estimatedRecipients.length} Recipient(s) Targeted`}
                </span>
              </div>
            </div>

            {/* Audience Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAudienceType("all")}
                className={cn(
                  "p-2.5 rounded-xl border text-xs font-bold text-center transition-all",
                  audienceType === "all"
                    ? "bg-[#2A3ED6]/10 text-[#2A3ED6] border-[#2A3ED6]/40 shadow-2xs"
                    : "bg-white dark:bg-slate-800 text-slate-600 border-gray-200 dark:border-slate-700 hover:bg-slate-50"
                )}
              >
                All CRM Leads
              </button>

              <button
                type="button"
                onClick={() => setAudienceType("stage")}
                className={cn(
                  "p-2.5 rounded-xl border text-xs font-bold text-center transition-all",
                  audienceType === "stage"
                    ? "bg-[#2A3ED6]/10 text-[#2A3ED6] border-[#2A3ED6]/40 shadow-2xs"
                    : "bg-white dark:bg-slate-800 text-slate-600 border-gray-200 dark:border-slate-700 hover:bg-slate-50"
                )}
              >
                Filter by Stage
              </button>

              <button
                type="button"
                onClick={() => setAudienceType("custom")}
                className={cn(
                  "p-2.5 rounded-xl border text-xs font-bold text-center transition-all",
                  audienceType === "custom"
                    ? "bg-[#2A3ED6]/10 text-[#2A3ED6] border-[#2A3ED6]/40 shadow-2xs"
                    : "bg-white dark:bg-slate-800 text-slate-600 border-gray-200 dark:border-slate-700 hover:bg-slate-50"
                )}
              >
                Custom Email List
              </button>
            </div>

            {/* Stage filter dropdown */}
            {audienceType === "stage" && (
              <div className="space-y-1.5 pt-1">
                <Label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  Select Stage
                </Label>
                <Select value={selectedStage} onValueChange={setSelectedStage}>
                  <SelectTrigger className="h-10 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 text-xs font-semibold">
                    <SelectValue placeholder="Choose a lead stage..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {stages.map((st: any) => (
                      <SelectItem key={st.id || st.name} value={(st.id || st.name).toString()} className="text-xs">
                        {st.name || st}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Custom Emails Textarea */}
            {audienceType === "custom" && (
              <div className="space-y-1.5 pt-1">
                <Label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  Paste Email Addresses (comma or line separated)
                </Label>
                <Textarea
                  placeholder="alex@acme.com, sarah@company.org, contact@brand.com"
                  value={customEmails}
                  onChange={(e) => setCustomEmails(e.target.value)}
                  className="rounded-xl bg-[#F8FAFC] dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 text-xs font-mono min-h-[80px]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Dialog Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 mt-4 border-t border-gray-100 dark:border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto text-xs font-bold text-slate-500 hover:text-slate-800"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleCreateAndSend(false)}
              className="flex-1 sm:flex-none h-10 px-4 rounded-xl border-gray-200 text-xs font-bold text-slate-700"
            >
              Save as Draft
            </Button>

            <Button
              type="button"
              disabled={isSubmitting || templates.length === 0}
              onClick={() => handleCreateAndSend(true)}
              className="flex-1 sm:flex-none h-10 px-5 rounded-xl bg-gradient-to-r from-[#2A3ED6] to-[#4054E6] hover:opacity-95 text-white text-xs font-extrabold flex items-center gap-2 shadow-md shadow-blue-600/10"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Launch & Send Now</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
