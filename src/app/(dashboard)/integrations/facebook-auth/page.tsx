"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FacebookOAuthButton } from "@/components/facebook-oauth/FacebookOAuthButton";
import { FacebookDashboard } from "@/components/facebook-oauth/FacebookDashboard";
import { RoleGuard } from "@/components/RoleGuard";
import { toast } from "sonner";

export default function FacebookAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const metaStatus = searchParams.get("meta_connected");
    const errorMsg   = searchParams.get("message");

    // Case 1: This page was opened as a popup by window.open() in FacebookOAuthButton.
    // Signal parent and close ourselves.
    if (window.opener && !window.opener.closed) {
      if (metaStatus === "success") {
        window.opener.postMessage({ type: "META_OAUTH_SUCCESS" }, window.location.origin);
      } else if (errorMsg) {
        window.opener.postMessage({ type: "META_OAUTH_ERROR", message: errorMsg }, window.location.origin);
      }
      // Small delay so the message is sent before close
      setTimeout(() => window.close(), 300);
      return;
    }

    // Case 2: Page was NOT a popup (e.g. user was redirected here directly).
    // Just show a toast notification.
    if (metaStatus === "success") {
      toast.success("Facebook Connected!", {
        description: "Your Meta account has been connected successfully.",
      });
      // Clean the URL without reloading
      window.history.replaceState({}, "", "/integrations/facebook-auth");
    } else if (errorMsg) {
      toast.error("Connection Failed", { description: decodeURIComponent(errorMsg) });
      window.history.replaceState({}, "", "/integrations/facebook-auth");
    }
  }, [searchParams]);

  return (
    <RoleGuard allowedRoles={['Super Admin', 'Admin']} allowedPlans={['pro', 'enterprise']}>
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
            <div>
              <h1 className="text-2xl font-bold text-[var(--crm-text-primary)]">Facebook OAuth</h1>
              <p className="text-sm text-[var(--crm-text-secondary)] mt-1">
                Connect your Facebook accounts to manage pages and services.
              </p>
            </div>
          </div>
        </div>

        {/* ── Content ──────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-8">
            <FacebookOAuthButton
              onConnect={() => {
                window.location.reload();
              }}
            />
            <FacebookDashboard />
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}

