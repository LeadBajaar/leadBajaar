"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, ArrowRight, Check, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { getAdAccounts, createCampaign, createAdSet, createAd, uploadAdImage } from "@/lib/api/ads.api";
import { integrationApi } from "@/lib/api/integrations.api";
import { AdAccount } from "@/lib/api/types/ads.types";

export default function CreateCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Data
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  
  // Form State
  const [adAccountId, setAdAccountId] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [category, setCategory] = useState("NONE");
  
  const [adSetName, setAdSetName] = useState("");
  const [dailyBudget, setDailyBudget] = useState(500); // UI amount
  const [pageId, setPageId] = useState("");
  const [formId, setFormId] = useState("");
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(65);
  
  const [adName, setAdName] = useState("");
  const [primaryText, setPrimaryText] = useState("");
  const [headline, setHeadline] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const accs = await getAdAccounts();
        setAdAccounts(accs);
        if (accs.length > 0) setAdAccountId(accs[0].id);
        
        const pgs = await integrationApi.getMetaPages();
        if (pgs?.data) setPages(pgs.data);
      } catch (err: any) {
        toast.error(err.message || "Failed to load initial data");
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!pageId) return;
    async function loadForms() {
      try {
        const result = await integrationApi.getMetaPageForms(pageId);
        if (result?.data) setForms(result.data);
      } catch (err: any) {
        toast.error("Failed to load forms");
      }
    }
    loadForms();
  }, [pageId]);

  const handleSubmit = async () => {
    if (!adAccountId) return toast.error("Select an Ad Account");
    if (!campaignName || !adSetName || !adName || !pageId || !formId || !imageFile) {
      return toast.error("Please fill in all required fields and upload an image");
    }

    setIsLoading(true);
    try {
      // 1. Create Campaign
      toast.loading("Creating Campaign...", { id: "create-progress" });
      const campResult = await createCampaign(adAccountId, {
        name: campaignName,
        objective: "LEAD_GENERATION",
        status: "PAUSED"
      });
      const campaignId = campResult.campaign_id || campResult.id;

      // 2. Create Ad Set
      toast.loading("Creating Ad Set...", { id: "create-progress" });
      const adSetResult = await createAdSet(adAccountId, {
        campaign_id: campaignId,
        name: adSetName,
        daily_budget: dailyBudget, // Backend will multiply by 100 for minor units if it's coded to do so
        billing_event: "IMPRESSIONS",
        destination_type: "ON_AD",
        promoted_object: { page_id: pageId },
        targeting: {
          age_min: ageMin,
          age_max: ageMax
        }
      });
      const adSetId = adSetResult.adset_id || adSetResult.id;

      // 3. Upload Image
      toast.loading("Uploading Ad Image...", { id: "create-progress" });
      const imageResult = await uploadAdImage(adAccountId, imageFile);
      const imageHash = imageResult.images ? (Object.values(imageResult.images)[0] as any)?.hash : imageResult.hash;

      if (!imageHash) throw new Error("Failed to get image hash");

      // 4. Create Ad (and Creative)
      toast.loading("Generating Creative and Ad...", { id: "create-progress" });
      await createAd(adAccountId, {
        adset_id: adSetId,
        name: adName,
        creative: {
          name: `${adName} - Creative`,
          page_id: pageId,
          image_hash: imageHash,
          body: primaryText,
          title: headline,
          call_to_action_type: "SIGN_UP",
          lead_gen_form_id: formId
        }
      });

      toast.success("Campaign created successfully!", { id: "create-progress" });
      router.push("/ads/campaigns");
    } catch (err: any) {
      toast.error(err.message || "Failed to create campaign", { id: "create-progress" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-full p-6 space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Create Lead Campaign"
        description="Launch a new lead generation campaign on Meta"
        breadcrumbs={
          <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-1 text-sm text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] transition-colors p-0 h-auto w-auto hover:bg-transparent">
            <ArrowLeft className="h-4 w-4" /> Back to Campaigns
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Steps */}
        <div className="col-span-1 space-y-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex items-center gap-3 p-3 rounded-lg border ${step === s ? "border-violet-200 bg-violet-50 text-violet-700" : step > s ? "border-green-200 bg-green-50 text-green-700" : "border-slate-100 bg-slate-50 text-slate-400"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === s ? "bg-violet-600 text-white" : step > s ? "bg-green-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                {step > s ? <Check className="w-3 h-3" /> : s}
              </div>
              <span className="font-semibold text-sm">
                {s === 1 ? "Campaign" : s === 2 ? "Ad Set" : "Ad & Creative"}
              </span>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="col-span-3 rounded-[var(--r-lg)] border border-[var(--crm-border)] bg-[var(--crm-surface-1)] shadow-sm p-6">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <h2 className="text-lg font-bold text-[var(--crm-text-primary)]">Campaign Details</h2>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Ad Account</label>
                <select value={adAccountId} onChange={e => setAdAccountId(e.target.value)} className="w-full rounded-md border border-[var(--crm-border)] p-2 text-sm focus:border-violet-500 focus:ring-violet-500 bg-white">
                  {adAccounts.map(a => <option key={a.id} value={a.id}>{a.name || a.id}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Campaign Name</label>
                <Input value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder="e.g. Summer Lead Gen" className="border-[var(--crm-border)] focus-visible:ring-violet-500 bg-white" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Special Ad Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-md border border-[var(--crm-border)] p-2 text-sm focus:border-violet-500 focus:ring-violet-500 bg-white">
                  <option value="NONE">None</option>
                  <option value="CREDIT">Credit</option>
                  <option value="EMPLOYMENT">Employment</option>
                  <option value="HOUSING">Housing</option>
                </select>
                <p className="text-xs text-slate-500">Required if advertising credit, employment, housing, or social issues.</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <h2 className="text-lg font-bold text-[var(--crm-text-primary)]">Ad Set Details</h2>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Ad Set Name</label>
                <Input value={adSetName} onChange={e => setAdSetName(e.target.value)} placeholder="e.g. US 18-65+" className="border-[var(--crm-border)] focus-visible:ring-violet-500 bg-white" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Daily Budget (amount in local currency, e.g. INR)</label>
                <Input type="number" value={dailyBudget} onChange={e => setDailyBudget(Number(e.target.value))} min={100} className="border-[var(--crm-border)] focus-visible:ring-violet-500 bg-white" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Min Age</label>
                  <Input type="number" value={ageMin} onChange={e => setAgeMin(Number(e.target.value))} min={18} max={65} className="border-[var(--crm-border)] focus-visible:ring-violet-500 bg-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Max Age</label>
                  <Input type="number" value={ageMax} onChange={e => setAgeMax(Number(e.target.value))} min={18} max={65} className="border-[var(--crm-border)] focus-visible:ring-violet-500 bg-white" />
                </div>
              </div>

              <div className="space-y-1 pt-4 border-t border-[var(--crm-border)]">
                <label className="text-sm font-semibold text-slate-700">Facebook Page</label>
                <select value={pageId} onChange={e => setPageId(e.target.value)} className="w-full rounded-md border border-[var(--crm-border)] p-2 text-sm focus:border-violet-500 focus:ring-violet-500 bg-white">
                  <option value="">Select a Page...</option>
                  {pages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              {pageId && (
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Lead Form</label>
                  <select value={formId} onChange={e => setFormId(e.target.value)} className="w-full rounded-md border border-[var(--crm-border)] p-2 text-sm focus:border-violet-500 focus:ring-violet-500 bg-white">
                    <option value="">Select a Form...</option>
                    {forms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                  {forms.length === 0 && <p className="text-xs text-amber-600">No forms found for this page. Create one in Meta Business Suite.</p>}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <h2 className="text-lg font-bold text-[var(--crm-text-primary)]">Ad & Creative</h2>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Ad Name</label>
                <Input value={adName} onChange={e => setAdName(e.target.value)} placeholder="e.g. Lead Gen Ad 1" className="border-[var(--crm-border)] focus-visible:ring-violet-500 bg-white" />
              </div>
              
              <div className="space-y-1 pt-2">
                <label className="text-sm font-semibold text-slate-700">Primary Text</label>
                <textarea 
                  value={primaryText} onChange={e => setPrimaryText(e.target.value)} 
                  placeholder="Tell people what you're offering..." 
                  className="w-full rounded-md border border-[var(--crm-border)] p-2 text-sm focus:border-violet-500 focus:ring-violet-500 min-h-[80px] bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Headline</label>
                <Input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="e.g. Get a Free Quote" className="border-[var(--crm-border)] focus-visible:ring-violet-500 bg-white" />
              </div>

              <div className="space-y-1 pt-2">
                <label className="text-sm font-semibold text-slate-700">Image Upload</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[var(--crm-border)] rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {imageFile ? (
                        <>
                          <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                          <p className="text-sm text-slate-500">{imageFile.name}</p>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                          <p className="text-sm text-slate-500"><span className="font-semibold">Click to upload</span></p>
                          <p className="text-xs text-slate-400">PNG, JPG or JPEG</p>
                        </>
                      )}
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                      if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
                    }} />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-[var(--crm-border)]">
            <Button variant="outline" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1 || isLoading}>
              Previous
            </Button>
            {step < 3 ? (
              <Button className="bg-violet-600 hover:bg-violet-700 text-white" onClick={() => setStep(s => Math.min(3, s + 1))}>
                Next Step <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Launch Campaign"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
