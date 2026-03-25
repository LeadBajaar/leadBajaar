'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, Facebook, CheckCircle2, AlertCircle, RefreshCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FacebookRetrievalDialogProps {
  showFacebookRetrieval: boolean;
  setShowFacebookRetrieval: (show: boolean) => void;
  facebookForms: any[];
  selectedForm: string;
  setSelectedForm: (id: string) => void;
  dateFrom: string;
  setDateFrom: (date: string) => void;
  dateTo: string;
  setDateTo: (date: string) => void;
  isRetrievingLeads: boolean;
  handleRetrieveLeads: () => void;
  retrievalResults: any;
  showResults: boolean;
  showProgress: boolean;
  progress: number;
  progressMessage: string;
  setShowResults: (show: boolean) => void;
  fetchLeads: () => void;
}

export const FacebookRetrievalDialog: React.FC<FacebookRetrievalDialogProps> = ({
  showFacebookRetrieval,
  setShowFacebookRetrieval,
  facebookForms,
  selectedForm,
  setSelectedForm,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  isRetrievingLeads,
  handleRetrieveLeads,
  retrievalResults,
  showResults,
  showProgress,
  progress,
  progressMessage,
  setShowResults,
  fetchLeads
}) => {
  return (
    <>
      <Dialog open={showFacebookRetrieval} onOpenChange={setShowFacebookRetrieval}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
              <Facebook className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold">Sync Facebook Leads</DialogTitle>
            <DialogDescription>
              Retrieve leads directly from your Facebook Lead Forms.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Form</Label>
              <Select value={selectedForm} onValueChange={setSelectedForm}>
                <SelectTrigger className="h-11 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Chose a lead form" />
                </SelectTrigger>
                <SelectContent>
                  {facebookForms.map((form) => (
                    <SelectItem key={form.id} value={form.id} className="py-2">
                      <div className="flex flex-col">
                        <span className="font-medium">{form.name}</span>
                        <span className="text-[10px] text-slate-500">{form.page_id}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">From Date</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-11 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">To Date</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-11 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            {showProgress && (
              <div className="space-y-3 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/30 dark:bg-indigo-900/10">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-indigo-600 dark:text-indigo-400">{progressMessage}</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="border-t pt-4">
            <Button variant="ghost" onClick={() => setShowFacebookRetrieval(false)}>
              Cancel
            </Button>
            <Button
              className="min-w-[140px] bg-blue-600 hover:bg-blue-700 h-10 shadow-lg shadow-blue-200 dark:shadow-none font-bold"
              onClick={handleRetrieveLeads}
              disabled={isRetrievingLeads || !selectedForm}
            >
              {isRetrievingLeads ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                'Start Sync'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Results View */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-[600px] h-[80vh] flex flex-col p-0 overflow-hidden">
          <div className="shrink-0 border-b p-6 bg-white dark:bg-slate-900 shadow-sm">
             <div className="flex items-center gap-4 mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <div>
                   <h3 className="text-xl font-bold">Sync Completed</h3>
                   <p className="text-sm text-slate-500 font-medium font-inter">Successfully processed Facebook leads</p>
                </div>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30 dark:bg-slate-950/30 no-scrollbar">
             <div className="grid grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:scale-105">
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Processed</div>
                   <div className="text-2xl font-black text-slate-900 dark:text-white">{retrievalResults?.total_processed || 0}</div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-900/30 shadow-sm transition-all hover:scale-105">
                   <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">New</div>
                   <div className="text-2xl font-black text-emerald-600">{retrievalResults?.new_leads || 0}</div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/30 shadow-sm transition-all hover:scale-105">
                   <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Existing</div>
                   <div className="text-2xl font-black text-blue-600">{retrievalResults?.existing_leads || 0}</div>
                </div>
             </div>

             <div className="space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2 text-slate-600 dark:text-slate-400">
                   Recent Operations
                </h4>
                <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm overflow-hidden">
                   <div className="max-h-[300px] overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
                      {retrievalResults?.processed_leads.map((log: any, index: number) => (
                         <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <div className="flex items-center gap-3">
                               <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs">
                                  {log.name.charAt(0)}
                               </div>
                               <div>
                                  <div className="text-xs font-bold">{log.name}</div>
                                  <div className="text-[10px] text-slate-400">ID: {log.facebook_lead_id}</div>
                               </div>
                            </div>
                            <Badge variant="secondary" className={cn(
                               "text-[10px] sm:text-[11px] font-bold border-none px-2 rounded-full",
                               log.status === 'created' ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                            )}>
                               {log.status === 'created' ? 'NEW LEAD' : 'EXISTING'}
                            </Badge>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>

          <DialogFooter className="shrink-0 border-t p-6 bg-white dark:bg-slate-900">
             <Button
                onClick={() => {
                   setShowResults(false);
                   fetchLeads();
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-11"
             >
                Awesome, Done!
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
