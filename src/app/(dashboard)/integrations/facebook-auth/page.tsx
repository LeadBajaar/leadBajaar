"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { RoleGuard } from "@/components/RoleGuard";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { MetaAuthContainer } from "./components/MetaAuthContainer";

export default function FacebookAuthPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const metaStatus = searchParams.get("meta_connected");
    const errorMsg   = searchParams.get("message");

    // Case 1: This page was opened as a popup by window.open().
    // Because of Cross-Origin Opener Policy (COOP), window.opener is often null after returning from facebook.com.
    // We use localStorage to reliably broadcast success back to the main window.
    if (metaStatus === "success") {
      localStorage.setItem('META_OAUTH_SUCCESS', Date.now().toString());
      window.dispatchEvent(new Event('integrationsUpdated'));
      
      // Close the popup automatically
      setTimeout(() => {
        window.close();
        if (!window.closed) {
          toast.success("Facebook Connected", {
            description: "Your Meta account has been linked successfully.",
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

  const metaStatus = searchParams.get("meta_connected");
  const errorMsg   = searchParams.get("message");

  // Bypass RoleGuard if we are in the OAuth callback popup window,
  // to prevent it from redirecting to /signin before window.close() can run.
  if (metaStatus === "success" || errorMsg) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-background">
        <div className="text-center p-6 space-y-2">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
          <h2 className="text-base font-semibold text-foreground">Finalizing Meta Connection...</h2>
          <p className="text-xs text-muted-foreground">Please wait, this window will close automatically.</p>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard allowedFeatures={['integrations']}>
      <div className="flex flex-col flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <MetaAuthContainer />
      </div>
    </RoleGuard>
  );
}
