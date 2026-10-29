import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Globe, 
  Search, 
  Check, 
  Copy, 
  ChevronRight, 
  Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface FacebookPageItem {
  id: string;
  name: string;
  access_token?: string;
  tasks?: string[];
  category?: string;
  connected_at?: string;
  webhook_subscribed?: boolean;
}

interface MetaPagesPanelProps {
  pages: FacebookPageItem[];
  selectedPage: FacebookPageItem | null;
  onSelectPage: (page: FacebookPageItem) => void;
  onSubscribePage?: (pageId: string) => Promise<void>;
  isSubscribing?: boolean;
  isLoading: boolean;
}

export function MetaPagesPanel({
  pages,
  selectedPage,
  onSelectPage,
  onSubscribePage,
  isSubscribing,
  isLoading,
}: MetaPagesPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredPages = pages.filter((page) =>
    page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.id.includes(searchQuery)
  );

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success('Page ID copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl flex flex-col h-full min-h-[480px] shadow-xs">
      {/* Panel Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200/90 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-2xs">
              <Globe className="h-4 w-4" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Facebook Pages
            </h2>
          </div>
          <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium px-2.5 py-0.5">
            {pages.length} {pages.length === 1 ? 'Page' : 'Pages'}
          </span>
        </div>

        {/* Search Bar */}
        {pages.length > 3 && (
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search pages by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 text-xs pl-8.5 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 font-normal"
            />
          </div>
        )}
      </div>

      {/* Pages List */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Loading Facebook pages...</span>
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
              <Globe className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">No pages found</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs font-normal">
              {searchQuery ? "No pages match your search." : "Grant permissions for your Facebook Pages during the OAuth connect step."}
            </p>
          </div>
        ) : (
          filteredPages.map((page) => {
            const isSelected = selectedPage?.id === page.id;
            const isSubscribed = Boolean(page.webhook_subscribed);

            return (
              <div
                key={page.id}
                onClick={() => onSelectPage(page)}
                className={cn(
                  "group relative flex items-center justify-between p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer",
                  isSelected
                    ? "bg-blue-50/60 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-2xs"
                    : "bg-white dark:bg-slate-800/90 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60 dark:hover:bg-slate-800"
                )}
              >
                {/* Left: Avatar & Info */}
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  {/* LeadBajaar Page Avatar */}
                  <div className="h-9 w-9 rounded-lg bg-[#E84C3A] text-white flex items-center justify-center text-sm font-bold shrink-0 uppercase shadow-2xs">
                    {page.name.charAt(0)}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate leading-snug">
                      {page.name}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-normal">
                      <span>ID: {page.id}</span>
                      <button
                        type="button"
                        onClick={(e) => handleCopyId(e, page.id)}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors p-0.5"
                        title="Copy Page ID"
                      >
                        {copiedId === page.id ? (
                          <Check className="h-3 w-3 text-emerald-600 font-bold" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: Webhook Indicator & Chevron */}
                <div className="flex items-center gap-2.5 shrink-0">
                  {isSubscribed ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold px-2.5 py-0.5">
                      Webhook Active
                    </span>
                  ) : null}

                  <ChevronRight className={cn(
                    "h-4 w-4 transition-transform",
                    isSelected ? "text-blue-600 dark:text-blue-400 translate-x-0.5" : "text-slate-300 group-hover:text-slate-500"
                  )} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
