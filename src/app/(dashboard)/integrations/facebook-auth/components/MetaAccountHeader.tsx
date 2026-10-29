import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircle2, 
  RefreshCw, 
  Loader2, 
  Unlink, 
  Building2,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetaAccountHeaderProps {
  isConnected: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  userName?: string;
  metaUserId?: string;
  businesses: Array<{ business_id: string; name: string }>;
  selectedBusinessId?: string;
  onSelectBusiness: (businessId: string) => void;
  onConnect: () => void;
  onSync: () => void;
  onDisconnectClick: () => void;
}

export function MetaAccountHeader({
  isConnected,
  isLoading,
  isSyncing,
  userName,
  metaUserId,
  businesses,
  selectedBusinessId,
  onSelectBusiness,
  onConnect,
  onSync,
  onDisconnectClick,
}: MetaAccountHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Main Connection Banner Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Identity & Status */}
          <div className="flex items-start gap-4">
            {/* Meta Brand Circle Logo */}
            <div className="h-11 w-11 rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/20 flex items-center justify-center shrink-0 shadow-2xs">
              <svg 
                className="h-6 w-6 fill-[#1877F2]" 
                viewBox="0 0 24 24" 
                aria-hidden="true"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Meta Lead Ads Integration
                </h1>
                
                {isLoading ? (
                  <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-0.5">
                    <Loader2 className="h-3 w-3 animate-spin mr-1.5 text-slate-600" />
                    Checking status...
                  </span>
                ) : isConnected ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold px-2.5 py-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Active · Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[11px] font-semibold px-2.5 py-0.5">
                    Not Connected
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal leading-normal max-w-2xl">
                Automatically capture and sync leads from Facebook Lead Ads directly into LeadBajaar CRM using verified webhooks and Graph API v25.0.
              </p>

              {isConnected && userName && (
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-normal text-slate-600 dark:text-slate-300">
                    Connected Account: <strong className="text-slate-900 dark:text-slate-100 font-semibold">{userName}</strong>
                  </span>
                  {metaUserId && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="font-sans text-slate-500 dark:text-slate-400">ID: {metaUserId}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions & Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {/* Business Portfolio Selector */}
            {businesses && businesses.length > 0 && (
              <div className="w-full sm:w-auto">
                <Select
                  value={selectedBusinessId || businesses[0]?.business_id}
                  onValueChange={onSelectBusiness}
                >
                  <SelectTrigger className="h-9 text-xs font-medium w-full sm:w-[210px] rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-2xs">
                    <div className="flex items-center gap-2 truncate">
                      <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <SelectValue placeholder="Select Business Portfolio" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {businesses.map((biz) => (
                      <SelectItem 
                        key={biz.business_id} 
                        value={biz.business_id} 
                        className="text-xs font-medium cursor-pointer text-slate-900 dark:text-slate-100"
                      >
                        {biz.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {isConnected ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSync}
                  disabled={isSyncing || isLoading}
                  className="h-9 text-xs px-3.5 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-semibold shadow-2xs"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5 text-slate-500 dark:text-slate-400", isSyncing && "animate-spin text-blue-600")} />
                  {isSyncing ? "Syncing..." : "Sync Assets"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onConnect}
                  disabled={isLoading}
                  className="h-9 text-xs px-3.5 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-semibold shadow-2xs"
                >
                  Reconnect
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDisconnectClick}
                  disabled={isLoading}
                  className="h-9 text-xs px-3 rounded-lg border-rose-200 dark:border-rose-900 bg-rose-50/50 hover:bg-rose-100/60 text-rose-700 dark:text-rose-400 font-semibold transition-colors shadow-2xs"
                  title="Disconnect Meta Account"
                >
                  <Unlink className="h-3.5 w-3.5 mr-1" />
                  Disconnect
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={onConnect}
                disabled={isLoading}
                className="h-9 text-xs px-4 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold shadow-xs"
              >
                Connect Facebook Account
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
