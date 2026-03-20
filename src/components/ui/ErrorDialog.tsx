import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, ExternalLink, Info, Globe } from 'lucide-react'

interface ErrorDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  action?: string
  refId?: string
  url?: string
}

export function ErrorDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  action,
  refId,
  url
}: ErrorDialogProps) {
  
  const renderTextWithLinks = (text: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline break-all font-semibold inline-flex items-center group"
          >
            {part}
            <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        );
      }
      return part;
    });
  };

  const handleAction = () => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    onOpenChange(false);
  };

  const actualRefId = refId || Math.random().toString(36).substring(7).toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-white dark:bg-slate-950">
        {/* Header with gradient strip */}
        <div className="h-2 w-full bg-gradient-to-r from-red-500 via-pink-500 to-orange-500" />
        
        <div className="p-6 md:p-8">
          <DialogHeader className="space-y-4 text-left">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0 shadow-inner">
                <AlertCircle className="h-8 w-8 text-red-500 animate-pulse" />
              </div>
              <div>
                <DialogTitle className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                  {title}
                </DialogTitle>
                <p className="text-xs font-bold uppercase tracking-widest text-red-500 mt-2 opacity-80">
                  Action Required
                </p>
              </div>
            </div>
            
            <DialogDescription className="text-base md:text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed pt-2">
              {renderTextWithLinks(description)}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-8 space-y-6">
            {/* "What to do" Section */}
            {action && (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-6 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                      <Info className="h-3.5 w-3.5 text-red-600" />
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Step-by-Step Resolution:
                    </h4>
                  </div>
                  <p className="text-base font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                    {renderTextWithLinks(action)}
                  </p>
                </div>
              </div>
            )}

            {/* Support Info */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-2">
              <div className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                <span>Error Console v2.0</span>
              </div>
              <span>Ref ID: {actualRefId}</span>
            </div>
          </div>

          <DialogFooter className="mt-8 sm:justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="order-2 sm:order-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold"
            >
              Dismiss
            </Button>
            <Button
              onClick={handleAction}
              className="order-1 sm:order-2 px-8 py-6 rounded-2xl bg-slate-900 hover:bg-black dark:bg-white dark:text-black dark:hover:bg-slate-200 text-white font-black text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0"
            >
              Got it, fixing now
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
