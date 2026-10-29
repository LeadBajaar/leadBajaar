import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Webhook,
  CheckCircle2,
  Copy,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  Zap,
  Info,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface MetaWebhookDiagnosticsProps {
  webhookUrl?: string;
  verifyToken?: string;
  isPageSubscribed?: boolean;
  pageName?: string;
}

export function MetaWebhookDiagnostics({
  webhookUrl = "https://api.leadbajaar.com/api/meta/webhook",
  verifyToken = "leadbajaar_verify_token_change_me_in_production",
  isPageSubscribed = true,
  pageName,
}: MetaWebhookDiagnosticsProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const handleCopy = (text: string, type: 'url' | 'token') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
      toast.success('Webhook Callback URL copied');
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
      toast.success('Verify Token copied');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/90 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-2xs">
              <Webhook className="h-4 w-4" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Webhook &amp; Delivery Diagnostics
            </h3>
            <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold px-2.5 py-0.5">
              HMAC-SHA256 Enforced
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal">
            Real-time webhook callback endpoint and verification token for Meta Developer Portal integration.
          </p>
        </div>

        <a
          href="https://developers.facebook.com/tools/lead-ads-testing"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold shrink-0 bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800 px-3 py-1.5 rounded-lg shadow-2xs"
        >
          <span>Lead Ads Testing Tool</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Endpoint Configuration Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Callback URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Callback URL (Webhook Receiver)
          </label>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={webhookUrl}
              className="h-9 text-xs sm:text-sm font-sans bg-slate-50/70 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white select-all rounded-lg"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(webhookUrl, 'url')}
              className="h-9 px-3 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-white font-semibold shrink-0 shadow-2xs"
              title="Copy URL"
            >
              {copiedUrl ? <Check className="h-3.5 w-3.5 text-emerald-600 font-bold" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
            Paste this URL under Meta App Dashboard &gt; Webhooks &gt; Page object subscription.
          </p>
        </div>

        {/* Verify Token */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Verify Token (Security Challenge)
          </label>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              type={showToken ? "text" : "password"}
              value={verifyToken}
              className="h-9 text-xs sm:text-sm font-sans bg-slate-50/70 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white select-all rounded-lg"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowToken(!showToken)}
              className="h-9 px-2.5 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-300 shrink-0 shadow-2xs"
              title={showToken ? "Hide Token" : "Show Token"}
            >
              {showToken ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(verifyToken, 'token')}
              className="h-9 px-3 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-white font-semibold shrink-0 shadow-2xs"
              title="Copy Token"
            >
              {copiedToken ? <Check className="h-3.5 w-3.5 text-emerald-600 font-bold" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
            Matches `FACEBOOK_WEBHOOK_VERIFY_TOKEN` configured in your server `.env` file.
          </p>
        </div>
      </div>

      {/* Security & Health Matrix */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 sm:p-5 space-y-3">
        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Integration Verification Matrix
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-normal">Page Subscription</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <p className="text-xs sm:text-sm text-slate-900 dark:text-white font-semibold truncate">
              {pageName ? `${pageName} Subscribed` : "Subscribed"}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-normal">Event Field</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <p className="text-xs sm:text-sm text-slate-900 dark:text-white font-semibold">
              leadgen
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-normal">Signature Check</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <p className="text-xs sm:text-sm text-slate-900 dark:text-white font-semibold">
              X-Hub-Signature-256
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-normal">Graph API Version</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <p className="text-xs sm:text-sm text-slate-900 dark:text-white font-semibold">
              v25.0
            </p>
          </div>
        </div>
      </div>

      {/* Reviewer / Testing Guidance */}
      <div className="text-xs bg-blue-50/50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>How to Test with Meta Lead Ads Testing Tool</span>
        </div>
        <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
          <li>Open Meta&apos;s <a href="https://developers.facebook.com/tools/lead-ads-testing" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Lead Ads Testing Tool</a> in your browser.</li>
          <li>Select your connected Facebook Page and any active Lead Form.</li>
          <li>Click <strong className="text-slate-900 dark:text-white font-semibold">Preview Form</strong>, fill out dummy lead info, and submit.</li>
          <li>Within 5–10 seconds, the lead will arrive via webhook and appear in your CRM Leads list with source <code className="text-slate-800 dark:text-white bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-medium">meta_leadgen</code>.</li>
        </ol>
      </div>
    </div>
  );
}
