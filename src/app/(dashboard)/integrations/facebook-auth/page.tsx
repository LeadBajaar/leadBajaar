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
    // Because of Cross-Origin Opener Policy (COOP), window.opener is often null after returning from facebook.com.
    // We use localStorage to reliably broadcast success back to the main window.
    if (metaStatus === "success") {
      // Broadcast via localStorage (Bulletproof for COOP)
      localStorage.setItem('META_OAUTH_SUCCESS', Date.now().toString());
      
      // Close the popup automatically
      setTimeout(() => {
        window.close();
        // If window.close is blocked, fallback to normal toast
        if (!window.closed) {
          toast.success("Facebook Connected!", {
            description: "Your Meta account has been connected successfully. You may close this window.",
          });
          window.history.replaceState({}, "", "/integrations/facebook-auth");
        }
      }, 300);
      return;
    } else if (errorMsg) {
      localStorage.setItem('META_OAUTH_ERROR', Date.now().toString());
      setTimeout(() => window.close(), 300);
      return;
    }
  }, [searchParams]);

  return (
    <RoleGuard allowedRoles={['Super Admin', 'Admin']} allowedPlans={['pro', 'enterprise']}>
      <div className="absolute inset-0 flex flex-col bg-[var(--crm-bg)] z-10 overflow-hidden">
        {/* ── Header ────────────────────────────────────────────────────────────── */}
        <div className="shrink-0 border-b border-[var(--crm-border)] bg-[var(--crm-surface-1)] px-6 py-3">
          <div>
            <h1 className="text-[18px] font-medium text-[var(--crm-text-primary)] flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 rounded-[6px] text-[var(--crm-text-secondary)] hover:bg-[var(--crm-surface-3)]"
                onClick={() => router.push('/integrations')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              Facebook Integration
            </h1>
            <p className="text-[12px] text-[var(--crm-text-secondary)] mt-0.5 ml-9">
              Connect your Facebook accounts to manage pages and services.
            </p>
          </div>
        </div>

        {/* ── Content ──────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="w-full space-y-6">
            <div className="w-full">
              <FacebookOAuthButton
                onConnect={() => {
                  window.dispatchEvent(new CustomEvent('TRIGGER_META_SYNC'));
                }}
              />
            </div>
            
            <div className="w-full">
              <FacebookDashboard />
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}

