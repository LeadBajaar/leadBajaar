"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Mail, 
  Send, 
  Loader2, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Info
} from "lucide-react";

interface TestEmailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  setEmail: (email: string) => void;
  onSend?: () => Promise<void>;
  onSendTest?: () => Promise<void>;
  isConnecting?: boolean;
}

export function TestEmailDialog({
  isOpen,
  onOpenChange,
  email,
  setEmail,
  onSend,
  onSendTest,
  isConnecting = false,
}: TestEmailDialogProps) {
  const handleSend = onSend || onSendTest || (async () => {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    handleSend();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] w-full rounded-2xl p-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-2xl">
        <DialogHeader className="space-y-1 text-left pb-4 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#2A3ED6] dark:text-indigo-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40 shadow-2xs">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-slate-900 dark:text-white satoshi-heading">
                Dispatch Test Email
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 font-medium">
                Verify inbox reach, DKIM, and delivery handshake in real-time.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-3">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Recipient Email Address <span className="text-rose-500">*</span>
            </Label>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                className="pl-10 h-11 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-blue-500/20"
              />
            </div>
            
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              We'll send an authentication handshake message with custom headers to verify your mail pipeline.
            </p>
          </div>

          {/* Diagnostic Features Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Automated Diagnostic Checks Included:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>DKIM Signature</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>SPF Alignment</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>TLS Encryption</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Queue Latency Check</span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-slate-800 sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-10 px-4 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isConnecting || !email.trim()}
              className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#2A3ED6] to-[#4054E6] hover:opacity-95 text-white text-xs font-extrabold flex items-center gap-2 shadow-md shadow-blue-600/10 transition-all"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Send Test Email</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
