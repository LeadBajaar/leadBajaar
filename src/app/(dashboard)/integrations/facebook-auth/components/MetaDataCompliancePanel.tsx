import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, 
  Trash2, 
  Unlink, 
  ExternalLink, 
  RefreshCw, 
  Loader2, 
  AlertTriangle 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

interface MetaDataCompliancePanelProps {
  onRefreshStatus: () => Promise<void>;
  onRequestDataDeletion: () => Promise<string | void>;
  onDisconnectAccount: () => Promise<void>;
}

export function MetaDataCompliancePanel({
  onRefreshStatus,
  onRequestDataDeletion,
  onDisconnectAccount,
}: MetaDataCompliancePanelProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const [isDeletionDialogOpen, setIsDeletionDialogOpen] = useState(false);
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState<string | null>(null);

  const handleRefreshClick = async () => {
    try {
      setIsRefreshing(true);
      await onRefreshStatus();
      toast.success('Connection status refreshed');
    } catch (e: any) {
      toast.error('Failed to refresh status', { description: e.message });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleConfirmDeletion = async () => {
    try {
      setIsDeleting(true);
      const code = await onRequestDataDeletion();
      if (code) {
        setConfirmationCode(code);
      }
      setIsDeletionDialogOpen(false);
      toast.success('Data deletion request registered', {
        description: code ? `Confirmation Code: ${code}` : 'Request submitted successfully.',
      });
    } catch (e: any) {
      toast.error('Deletion request failed', { description: e.message });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDisconnect = async () => {
    try {
      setIsDisconnecting(true);
      await onDisconnectAccount();
      setIsDisconnectDialogOpen(false);
      toast.success('Account disconnected');
    } catch (e: any) {
      toast.error('Failed to disconnect', { description: e.message });
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/90 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Data Privacy, Compliance &amp; Deletion
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal">
            Manage data retention, Meta App Platform compliance, and account disconnection.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshClick}
          disabled={isRefreshing}
          className="h-9 text-xs px-3.5 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-semibold shrink-0 shadow-2xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? "animate-spin text-blue-600" : "text-slate-500 dark:text-slate-400"}`} />
          Refresh Connection Health
        </Button>
      </div>

      {/* Compliance Information & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        {/* Left: Meta Platform Terms Card */}
        <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3 shadow-2xs">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            Meta Data Rights &amp; Privacy Policy
          </h4>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-normal leading-relaxed">
            LeadBajaar processes lead data received from Facebook Lead Ads strictly in accordance with Meta Platform Terms. Tokens and personal data are encrypted at rest. Lead submissions are retained only as long as required for CRM processing.
          </p>
          <div className="pt-2 flex items-center gap-3 text-xs font-semibold">
            <a
              href="https://leadbajaar.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              Privacy Policy <ExternalLink className="h-3 w-3" />
            </a>
            <span className="text-slate-300">·</span>
            <a
              href="https://developers.facebook.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              Meta Terms <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Right: Data Control Actions */}
        <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between space-y-4 shadow-2xs">
          <div className="space-y-1.5">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              User Data Deletion &amp; Revocation
            </h4>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-normal leading-relaxed">
              You can trigger a verified Meta data deletion callback or revoke all Facebook permissions and disconnect this CRM integration at any time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeletionDialogOpen(true)}
              className="h-9 text-xs px-3.5 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-white shadow-2xs"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5 text-slate-500 dark:text-slate-400" />
              Request Data Deletion
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDisconnectDialogOpen(true)}
              className="h-9 text-xs px-3.5 rounded-lg text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900 bg-rose-50/60 hover:bg-rose-100 font-semibold shadow-2xs"
            >
              <Unlink className="h-3.5 w-3.5 mr-1.5" />
              Disconnect Integration
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Code Notice if deletion was requested */}
      {confirmationCode && (
        <div className="p-4 rounded-xl border border-emerald-400 bg-emerald-100 text-xs text-emerald-950 font-bold flex items-center justify-between shadow-xs">
          <span>Deletion Request Active: Confirmation Code <strong>{confirmationCode}</strong></span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmationCode(null)}
            className="h-7 text-xs px-2.5 text-emerald-900 hover:bg-emerald-200 font-bold"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Data Deletion Dialog */}
      <Dialog open={isDeletionDialogOpen} onOpenChange={setIsDeletionDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-950 dark:text-white">Request Data Deletion</DialogTitle>
            <DialogDescription className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              This initiates a formal Meta GDPR Data Deletion Callback request. All synced Meta tokens, forms metadata, and leads will be purged according to policy.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 text-xs text-slate-800 dark:text-slate-200 font-semibold space-y-2">
            <p>Are you sure you want to proceed with requesting permanent data deletion?</p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeletionDialogOpen(false)}
              disabled={isDeleting}
              className="text-xs h-9 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDeletion}
              disabled={isDeleting}
              className="text-xs h-9 bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
              Confirm Deletion Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disconnect Dialog */}
      <Dialog open={isDisconnectDialogOpen} onOpenChange={setIsDisconnectDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-950 dark:text-white">Disconnect Meta Integration</DialogTitle>
            <DialogDescription className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Disconnecting will revoke the Meta access token, stop incoming webhooks, and deactivate lead ads synchronization.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 text-xs space-y-2">
            <div className="p-3.5 rounded-lg bg-amber-100 border border-amber-300 text-amber-950 font-bold flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-800" />
              <span>You can reconnect at any time. Existing leads previously saved in your CRM will remain untouched.</span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDisconnectDialogOpen(false)}
              disabled={isDisconnecting}
              className="text-xs h-9 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDisconnect}
              disabled={isDisconnecting}
              className="text-xs h-9 bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              {isDisconnecting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
              Disconnect Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
