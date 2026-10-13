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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Sparkles, 
  Loader2, 
  Eye, 
  Code, 
  HelpCircle,
  Tag
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TemplateEditorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  templateToEdit?: any | null;
  onTemplateSaved: () => void;
}

const PRESET_TEMPLATES = [
  {
    name: "Warm Introduction & Welcome",
    subject: "Welcome to LeadBajaar, {{name}}! Here's how to get started",
    content: `Hi {{name}},

Thank you for reaching out to {{company}}! We received your details and wanted to introduce ourselves.

We specialize in helping businesses scale their customer acquisition with verified leads and automated engagement pipelines.

Would you have 10 minutes this week for a quick introductory call?

Best regards,
The {{company}} Team`
  },
  {
    name: "High-Converting Follow-Up",
    subject: "Following up on your inquiry, {{name}}",
    content: `Hello {{name}},

I wanted to quickly check in and see if you had a chance to review our previous message.

Our team has put together a custom growth package specifically tailored for {{company}}. You can reply directly to this email or reach us on WhatsApp at any time.

Looking forward to hearing your thoughts!

Best,
Sales & Customer Success`
  },
  {
    name: "Limited-Time Special Offer",
    subject: "⚡ Special 25% Discount for {{name}}",
    content: `Hi {{name}},

Exclusive offer alert! For the next 48 hours, we are providing a 25% discount on all our premium lead packages.

Use code GROWTH25 upon checkout or reach out to your account manager to activate this promotion immediately.

Don't miss out on boosting your pipeline this month!

Warm regards,
Marketing Team`
  }
];

export function TemplateEditorDialog({
  isOpen,
  onOpenChange,
  templateToEdit,
  onTemplateSaved,
}: TemplateEditorDialogProps) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [activeView, setActiveView] = useState<"edit" | "preview">("edit");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (templateToEdit) {
        setName(templateToEdit.name || "");
        setSubject(templateToEdit.subject || "");
        setContent(templateToEdit.content || "");
      } else {
        setName("");
        setSubject("");
        setContent("");
      }
      setActiveView("edit");
    }
  }, [isOpen, templateToEdit]);

  const insertVariable = (tag: string) => {
    setContent((prev) => prev + ` ${tag} `);
  };

  const loadPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    setName(preset.name);
    setSubject(preset.subject);
    setContent(preset.content);
    toast.success(`Loaded preset: "${preset.name}"`);
  };

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Template name is required");
    if (!subject.trim()) return toast.error("Subject line is required");
    if (!content.trim()) return toast.error("Template content is required");

    setIsSubmitting(true);
    try {
      if (templateToEdit?.id) {
        await api.put(`/email/templates/${templateToEdit.id}`, {
          name: name.trim(),
          subject: subject.trim(),
          content: content.trim(),
        });
        toast.success("Email template updated successfully");
      } else {
        await api.post('/email/templates', {
          name: name.trim(),
          subject: subject.trim(),
          content: content.trim(),
          type: "custom"
        });
        toast.success("New email template created");
      }

      onTemplateSaved();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to save template");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render dummy preview replacing tags
  const renderPreview = () => {
    return content
      .replace(/{{name}}/gi, "Alex Johnson")
      .replace(/{{company}}/gi, "Acme Enterprises")
      .replace(/{{email}}/gi, "alex@example.com")
      .replace(/{{phone}}/gi, "+91 98765 43210");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[720px] w-full max-h-[90vh] overflow-y-auto rounded-2xl p-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-2xl">
        <DialogHeader className="space-y-1 text-left pb-4 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle className="text-xl font-black text-slate-900 dark:text-white satoshi-heading">
                  {templateToEdit ? "Edit Email Template" : "Design Email Template"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 font-medium">
                  Create rich reusable templates for drip sequences and marketing broadcasts.
                </DialogDescription>
              </div>
            </div>

            {/* View Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveView("edit")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                  activeView === "edit"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                <Code className="h-3.5 w-3.5" /> Edit
              </button>
              <button
                type="button"
                onClick={() => setActiveView("preview")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                  activeView === "preview"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                <Eye className="h-3.5 w-3.5" /> Preview
              </button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-3">
          {/* Quick Preset Buttons (if creating new) */}
          {!templateToEdit && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Quick Starters (1-Click Fill):
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_TEMPLATES.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => loadPreset(p)}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:text-blue-600 transition-all shadow-2xs"
                  >
                    + {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Template Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                placeholder="e.g. Lead Welcome & Booking Link"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 text-sm font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Default Subject Line <span className="text-rose-500">*</span>
              </Label>
              <Input
                placeholder="e.g. Welcome {{name}}, let's get you set up!"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-10 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 text-sm font-semibold"
              />
            </div>
          </div>

          {/* Variable Pills Toolbar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-blue-600" /> Insert Dynamic Tags
              </Label>
              <span className="text-[10px] text-slate-400 font-semibold">
                Click to insert into email body
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { label: "Lead Name", token: "{{name}}" },
                { label: "Company", token: "{{company}}" },
                { label: "Email", token: "{{email}}" },
                { label: "Phone", token: "{{phone}}" },
              ].map((v) => (
                <button
                  key={v.token}
                  type="button"
                  onClick={() => insertVariable(v.token)}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 text-[11px] font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  + {v.label} <code className="text-[10px] opacity-75 font-mono ml-0.5">{v.token}</code>
                </button>
              ))}
            </div>
          </div>

          {/* Editor vs Preview Content Area */}
          {activeView === "edit" ? (
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Email Body Content <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                rows={9}
                placeholder="Write your email copy or HTML here... Dynamic tags like {{name}} will be automatically replaced with the recipient's details."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="rounded-xl bg-[#F8FAFC] dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 font-sans text-xs leading-relaxed"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Sample Live Preview (Rendered for Alex Johnson)
              </Label>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 min-h-[220px] max-h-[300px] overflow-y-auto">
                <div className="border-b border-slate-200 pb-2 mb-3 text-xs">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    Subject: {subject.replace(/{{name}}/gi, "Alex Johnson")}
                  </div>
                  <div className="text-[11px] text-slate-400">To: Alex Johnson &lt;alex@example.com&gt;</div>
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {renderPreview() || "No content entered yet."}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dialog Actions */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100 dark:border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-xs font-bold text-slate-500 hover:text-slate-800"
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleSave}
            className="h-10 px-6 rounded-xl bg-gradient-to-r from-[#2A3ED6] to-[#4054E6] text-white text-xs font-extrabold shadow-md shadow-blue-600/10 hover:opacity-95"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              templateToEdit ? "Update Template" : "Save Template"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
