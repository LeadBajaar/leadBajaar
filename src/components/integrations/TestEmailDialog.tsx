"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Loader2 } from "lucide-react";

interface TestEmailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  setEmail: (email: string) => void;
  onSend: () => Promise<void>;
  isConnecting: boolean;
}

export function TestEmailDialog({
  isOpen,
  onOpenChange,
  email,
  setEmail,
  onSend,
  isConnecting,
}: TestEmailDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl dark:bg-slate-900">
        <div className="p-8 space-y-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-2">
            <Mail className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-xl font-black">Dispatch Test Email</DialogTitle>
            <DialogDescription className="text-sm font-medium">
              Enter an address to verify your delivery pipeline.
            </DialogDescription>
          </div>
          <div className="space-y-4">
            <Input
              placeholder="recipient@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-2xl text-center bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1 h-12 rounded-2xl font-bold"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold text-white shadow-lg shadow-indigo-200 dark:shadow-none"
                onClick={onSend}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Send Now"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
