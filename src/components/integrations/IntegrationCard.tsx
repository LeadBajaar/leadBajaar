"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, Trash2, Settings, Plus, Play, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
interface Integration {
  id: string;
  name: string;
  icon: LucideIcon;
  category: string;
  color: string;
  description: string;
  features: string[];
  allowMultiple: boolean;
  price?: string;
  isPremium?: boolean;
}

interface ConnectedIntegration {
  id: number;
  type: string;
  is_active: boolean;
  config: any;
}

interface IntegrationCardProps {
  integration: Integration;
  connectedIntegrations: ConnectedIntegration[];
  onAction: (integration: Integration) => void;
  onDeactivate: (integrationId: string) => void;
  isConnecting?: boolean;
}

export function IntegrationCard({
  integration,
  connectedIntegrations,
  onAction,
  onDeactivate,
  isConnecting = false,
}: IntegrationCardProps) {
  const router = useRouter();
  const isConnected = connectedIntegrations.some(
    (ci) => ci.type === integration.id && ci.is_active
  );
  
  const connectedCount = connectedIntegrations.filter(
    (ci) => ci.type === integration.id && ci.is_active
  ).length;

  return (
    <Card className="flex flex-col group p-4 gap-3">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${integration.color}15` }}
          >
            <integration.icon
              className="h-5 w-5"
              style={{ color: integration.color }}
            />
          </div>
          <div>
            <h3 className="text-sm font-bold leading-none flex items-center gap-2">
              {integration.name}
              {integration.isPremium && <Badge variant="secondary" className="h-4 text-[9px] px-1.5 bg-amber-100 text-amber-700 hover:bg-amber-100 border-none font-black tracking-widest">PRO</Badge>}
            </h3>
            <p className="text-[11px] text-[var(--crm-text-secondary)] mt-1.5 line-clamp-2 leading-relaxed">{integration.description}</p>
          </div>
        </div>
        
        {isConnected && (
          <div className="flex items-center gap-1.5 bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full text-[10px] font-bold border border-green-500/20 shrink-0">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            {integration.allowMultiple && connectedCount > 1 ? `(${connectedCount})` : null}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-2 pt-3 border-t border-[var(--crm-border)]">
        {isConnected ? (
          <>
            {integration.id === "whatsapp" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-primary hover:bg-primary/10 rounded-lg"
                onClick={() => router.push("/integrations/whatsapp")}
                title="Manage WhatsApp"
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
            )}
            {integration.id === "facebook_conversion_api" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-primary hover:bg-primary/10 rounded-lg"
                onClick={() => router.push("/integrations/meta-capi")}
                title="Manage CAPI"
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-500 hover:bg-red-500/10 hover:text-red-600 rounded-lg"
              onClick={() => onDeactivate(integration.id)}
              title="Deactivate"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            
            <div className="flex-1" />
            
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[11px] px-3 rounded-lg font-semibold"
              onClick={() => onAction(integration)}
            >
              <Settings className="h-3 w-3 mr-1.5" /> Configure
            </Button>
          </>
        ) : (
          <>
            {integration.price && (
              <span className="text-[11px] font-black text-foreground mr-auto bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                {integration.price}
              </span>
            )}
            <div className="flex-1" />
            <Button
              variant={integration.isPremium ? "default" : "secondary"}
              size="sm"
              className={cn("h-7 text-[11px] px-4 rounded-lg font-bold shadow-sm", integration.isPremium ? "bg-primary hover:bg-primary/90 text-white" : "")}
              onClick={() => onAction(integration)}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
              ) : null}
              {isConnecting ? "Connecting..." : (integration.isPremium ? "Purchase" : "Connect")}
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
