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
import { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface Integration {
  id: string;
  name: string;
  icon: LucideIcon;
  category: string;
  color: string;
  description: string;
  features: string[];
  allowMultiple: boolean;
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
}

export function IntegrationCard({
  integration,
  connectedIntegrations,
  onAction,
  onDeactivate,
}: IntegrationCardProps) {
  const router = useRouter();
  const isConnected = connectedIntegrations.some(
    (ci) => ci.type === integration.id && ci.is_active
  );
  
  const connectedCount = connectedIntegrations.filter(
    (ci) => ci.type === integration.id && ci.is_active
  ).length;

  return (
    <Card className="flex flex-col h-full border-none shadow-md hover:shadow-xl transition-all duration-300 dark:bg-slate-900 group">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div
            className="p-3 rounded-2xl shadow-sm transition-transform group-hover:scale-110 duration-300"
            style={{ backgroundColor: `${integration.color}15` }}
          >
            <integration.icon
              className="h-6 w-6"
              style={{ color: integration.color }}
            />
          </div>
          {isConnected && (
            <Badge variant="secondary" className="flex gap-1 items-center bg-green-500/10 text-green-600 border-green-500/20">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Connected
              {integration.allowMultiple && (
                <span className="ml-1 text-xs">({connectedCount})</span>
              )}
            </Badge>
          )}
        </div>
        <div className="pt-4">
          <CardTitle className="text-lg font-bold">
            {integration.name}
          </CardTitle>
          <Badge variant="outline" className="mt-1 text-[10px] uppercase tracking-wider font-bold opacity-70">
            {integration.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {integration.description}
        </p>
        <div className="flex flex-wrap gap-1 mb-4">
          {integration.features.map((feature) => (
            <Badge
              key={feature}
              variant="secondary"
              className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800"
            >
              {feature}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex flex-col gap-2">
        {isConnected && (
          <div className="flex gap-2 w-full">
            {integration.id === "whatsapp" && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-primary border-primary/20 hover:bg-primary/5 rounded-xl font-bold h-9"
                onClick={() => router.push("/integrations/whatsapp")}
              >
                Manage Hub
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-red-500 border-red-100 hover:bg-red-50 hover:text-red-600 dark:border-red-900/30 dark:hover:bg-red-900/20 rounded-xl font-bold h-9"
              onClick={() => onDeactivate(integration.id)}
            >
              Deactivate
            </Button>
          </div>
        )}
        <Button
          variant={isConnected ? "secondary" : "default"}
          className={`w-full rounded-xl font-bold h-10 transition-all ${
            !isConnected ? "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none" : ""
          }`}
          onClick={() => onAction(integration)}
        >
          {isConnected ? "Configure Settings" : "Connect Now"}
        </Button>
      </CardFooter>
    </Card>
  );
}
