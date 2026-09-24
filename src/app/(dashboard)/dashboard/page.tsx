"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format, differenceInDays, parseISO } from "date-fns";
import {
  Mail,
  Phone,
  Calendar,
  Building2,
  Smartphone,
  QrCode,
  CreditCard,
  Zap,
  MessageCircle,
  MessageSquare,
  BarChart3,
  PieChart,
  ChevronDown,
  Clock,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  getDashboardStats,
  submitTesterRequest,
  integrationApi,
} from "@/lib/api";
import { eventTypeService } from "@/services/event-types";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";
import { ErrorState, SkeletonDashboard, DismissibleCard } from "@/components/state";
import { StatGrid, type DashboardStat } from "./StatGrid";
import { PipelineCard, type PipelineStage } from "./PipelineCard";
import { ActivityCard, type ActivityItem } from "./ActivityCard";
import { MeetingsCard } from "./MeetingsCard";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.leadbajaar";

// v2 design system: coral is reserved for primary CTAs only.
const CORAL_CTA = "bg-[var(--crm-accent)] hover:opacity-90 text-white";

// ── Types ─────────────────────────────────────────────────────
interface DashboardData {
  stats: DashboardStat[];
  monthly_overview: any[];
  pipeline: PipelineStage[];
  recent_activity: ActivityItem[];
}

const CACHE_KEY = "lb_dashboard_cache_v1";

function normalize(raw: any): DashboardData {
  return {
    stats: Array.isArray(raw?.stats)
      ? raw.stats.map((s: any) => ({ ...s, upIsGood: s.key === "response" ? false : true }))
      : [],
    monthly_overview: Array.isArray(raw?.monthly_overview) ? raw.monthly_overview : [],
    pipeline: Array.isArray(raw?.pipeline) ? raw.pipeline : [],
    recent_activity: Array.isArray(raw?.recent_activity) ? raw.recent_activity : [],
  };
}

function readCache(): { data: DashboardData; fetchedAt: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.data || !parsed?.fetchedAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(data: DashboardData) {
  try {
    window.localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data, fetchedAt: new Date().toISOString() })
    );
  } catch {
    // localStorage unavailable — the stale-data pattern just won't survive a refresh.
  }
}

function getLeadsCount(data: DashboardData | null): number | null {
  if (!data) return null;
  const stat = data.stats.find((s) => s.key === "leads");
  if (!stat) return null;
  const n = typeof stat.value === "number" ? stat.value : parseInt(String(stat.value).replace(/[,\s]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

// ── Main Dashboard ─────────────────────────────────────────────
export default function DashboardPage() {
  const { user, isLoading: userLoading } = useUser();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [data, setData] = useState<DashboardData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);



  const [showQRModal, setShowQRModal] = useState(false);
  const [showTesterModal, setShowTesterModal] = useState(false);
  const [isSubmittingTester, setIsSubmittingTester] = useState(false);
  const [testerForm, setTesterForm] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    if (user) {
      setTesterForm({ name: user.name || "", email: user.email || "", phone: (user as any).phone || "" });
    }
  }, [user]);

  // Cache is only used as a silent fallback when the live fetch fails —
  // we do NOT hydrate it immediately so the user always sees the skeleton
  // (fresh load feel) rather than stale data + "Showing data from X:XX PM".

  const fetchDashboard = useCallback(async () => {
    setStatus("loading");
    try {
      const raw = await getDashboardStats();
      const normalized = normalize(raw);
      setData(normalized);
      const now = new Date().toISOString();
      setLastUpdated(now);
      setIsStale(false);
      setFetchFailed(false);
      setStatus("success");
      writeCache(normalized);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      setFetchFailed(true);
      // Try to fall back to cached data silently
      const cached = readCache();
      if (cached) {
        setData(cached.data);
        setLastUpdated(cached.fetchedAt);
        setIsStale(true);
        setStatus("success");
      } else {
        setStatus("error");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!userLoading && user) {
      fetchDashboard();
    } else if (!userLoading && !user) {
      setStatus("error");
    }
    // Only run on user-readiness change, not on every `data` identity change
    // that `fetchDashboard` itself causes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoading, user]);



  const handleTesterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingTester(true);
    try {
      await submitTesterRequest(testerForm);
      toast.success("Request sent", {
        description: "We've received your request and will add you to the Play Store tester list shortly.",
      });
      setShowTesterModal(false);
    } catch (error: any) {
      toast.error("Submission failed", { description: error?.message || "Please try again." });
    } finally {
      setIsSubmittingTester(false);
    }
  };

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good night';

  return (
    <div className="flex flex-col gap-5 px-6 sm:px-8 pb-8 pt-6 overflow-x-hidden">
      
      {/* ── Dashboard Header ─────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-2">
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-[28px] font-extrabold text-[var(--crm-text-primary)] tracking-tight satoshi-heading flex items-center gap-2 whitespace-nowrap leading-tight">
              {greeting}, {user?.name?.split(' ')[0] || 'Super'}! <span className="text-[28px]">👋</span>
            </h1>
            <p className="text-[13px] font-semibold text-slate-500 mt-1">
              Here's what's happening with your business today.
            </p>
          </div>
          
          {/* Premium Date Selector Button */}
          <div className="flex items-center gap-2 px-3 py-1.5 w-fit rounded-lg border border-gray-200/80 bg-white hover:bg-gray-50 text-[13px] font-bold text-slate-700 shadow-sm transition-all cursor-pointer select-none">
            <Calendar className="h-4 w-4 text-slate-500 shrink-0" />
            <span>{format(new Date(), "MMM d, yyyy")}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          </div>
        </div>
        
        {/* Right side stats */}
        <div className="flex-1 w-full xl:w-auto xl:max-w-3xl flex justify-start xl:justify-end">
          <StatGrid isLoading={status === "loading"} stats={data?.stats || []} compact />
        </div>
      </div>

      {/* ── Stale / refresh-failed banner ────────────────── */}
      {isStale && data && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center justify-between gap-3 rounded-[var(--r-md)] border border-warning-border bg-warning-bg px-3 py-2 text-[12px] text-warning"
        >
          <span>
            {fetchFailed ? "Couldn't refresh — showing" : "Showing"} data from{" "}
            {lastUpdated ? format(new Date(lastUpdated), "h:mm a") : "earlier"}
          </span>
          <Button size="sm" variant="ghost" onClick={fetchDashboard} className="h-6 px-2 text-[12px]">
            Retry
          </Button>
        </div>
      )}

      {/* ── Loading (no cached data to show yet) ─────────── */}
      {status === "loading" && !data && (
        <div className="animate-in fade-in duration-300 motion-reduce:animate-none">
          <SkeletonDashboard />
        </div>
      )}

      {/* ── Error (no cached data to fall back to) ───────── */}
      {status === "error" && !data && (
        <ErrorState
          variant="page"
          title="We couldn't load your dashboard"
          description="Check your connection and try again."
          onRetry={fetchDashboard}
        />
      )}

      {/* ── Loaded (fresh or stale-dimmed) ───────────────── */}
      {status === "success" && data && (
        <div
          className={cn(
            "flex flex-col gap-5 transition-opacity duration-150 motion-reduce:transition-none animate-in fade-in duration-300",
            isStale && "opacity-70"
          )}
        >
          {/* Top Row: Promo Card & Account Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-2">
            <div className="lg:col-span-2">
              <MobileAppPromoCard onShowQR={() => setShowQRModal(true)} />
            </div>
            <div className="lg:col-span-1">
              <AccountInfoCard user={user} />
            </div>
          </div>

          {/* Bottom Row: Pipeline, Meetings & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-1">
              <PipelineCard pipeline={data.pipeline} />
            </div>
            <div className="lg:col-span-1">
              <MeetingsCard />
            </div>
            <div className="lg:col-span-1">
              <ActivityCard activities={data.recent_activity} />
            </div>
          </div>
        </div>
      )}

      {/* ── QR Code Modal ────────────────────────────────── */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan to download</DialogTitle>
            <DialogDescription>Scan this QR code with your phone's camera to open LeadBajaar on the Google Play Store.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-8 bg-[var(--crm-surface-2)] rounded-[var(--r-lg)] border border-[var(--crm-border)]">
            <div className="relative bg-white p-4 rounded-[var(--r-md)] shadow-sm border border-[var(--crm-border)] min-w-[200px] min-h-[200px] flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(PLAY_STORE_URL)}`}
                alt="QR code linking to the LeadBajaar Google Play Store listing"
                className="w-[200px] h-[200px]"
              />
            </div>
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-[12px] font-medium text-[var(--crm-accent)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--crm-accent)] rounded-[var(--r-sm)] px-1"
            >
              <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
              Open in Google Play
            </a>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Become a Tester Modal ─────────────────────────── */}
      <Dialog open={showTesterModal} onOpenChange={setShowTesterModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Become a beta tester</DialogTitle>
            <DialogDescription>Submit your details to get early access via the Google Play Store.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTesterSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="tester-name">Full name</Label>
              <Input
                id="tester-name"
                placeholder="Enter your name"
                value={testerForm.name}
                onChange={(e) => setTesterForm({ ...testerForm, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tester-email">Email address (Play Store account)</Label>
              <Input
                id="tester-email"
                type="email"
                placeholder="Enter your Google email"
                value={testerForm.email}
                onChange={(e) => setTesterForm({ ...testerForm, email: e.target.value })}
                required
              />
              <p className="text-[11px] text-[var(--crm-text-tertiary)]">
                This must be the email you use for the Google Play Store.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tester-phone">Phone number</Label>
              <Input
                id="tester-phone"
                placeholder="Enter your phone number"
                value={testerForm.phone}
                onChange={(e) => setTesterForm({ ...testerForm, phone: e.target.value })}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowTesterModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmittingTester}>
                {isSubmittingTester ? "Submitting…" : "Request access"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Mobile App Promo Card ──────────────────────────────────
function MobileAppPromoCard({ onShowQR }: { onShowQR: () => void }) {
  return (
    <div 
      className="relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between min-h-[280px] h-auto md:h-[280px] p-6 md:p-8 bg-gradient-to-br from-[#EBF3FF] via-[#EAE9FC] to-[#F1F3FE] rounded-xl border border-gray-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] cursor-pointer select-none" 
      onClick={onShowQR}
    >
      
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none opacity-50">
        <div className="absolute -bottom-32 -right-10 w-96 h-96 bg-[#E0E2F8] rounded-full blur-3xl opacity-60" />
        <div className="absolute top-10 right-32 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-40" />
      </div>
      
      {/* Left side text content */}
      <div className="flex-1 flex flex-col justify-center relative z-10 pl-0 md:pl-2 w-full md:max-w-[55%]">
        <span className="text-[14px] md:text-[16px] font-extrabold text-slate-800 tracking-tight mb-2 leading-none">
          All your leads. All your conversations.
        </span>
        <h2 className="text-[28px] md:text-[36px] font-black text-slate-900 satoshi-heading mb-3 md:mb-4 tracking-tight leading-[1.1]">
          All in one place.
        </h2>
        <p className="text-[13px] md:text-[14px] text-slate-500 leading-relaxed w-full max-w-[420px] font-semibold mb-5 md:mb-6">
          Manage leads, live chat, meetings and more — all from the LeadBajaar mobile app.
        </p>
        
        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
          <Button variant="ghost" 
            onClick={(e) => {
              e.stopPropagation();
              window.open(PLAY_STORE_URL, "_blank");
            }}
            className="w-full sm:w-[160px] justify-center bg-gradient-to-r from-[#2A3ED6] to-[#4054E6] hover:opacity-95 text-white text-[13px] font-extrabold h-[44px] px-6 rounded-xl flex items-center gap-2.5 shadow-md shadow-blue-600/10 transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Smartphone className="h-4.5 w-4.5 shrink-0" />
            Get the App
          </Button>
          
          <Button variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onShowQR();
            }}
            className="w-full sm:w-[160px] justify-center bg-white hover:bg-gray-50 text-slate-850 border border-gray-200 text-[13px] font-extrabold h-[44px] px-6 rounded-xl flex items-center gap-2.5 shadow-sm transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98]"
          >
            <QrCode className="h-4.5 w-4.5 text-slate-500 shrink-0" />
            Scan QR Code
          </Button>
        </div>
      </div>

      {/* Right side Illustration (Tilted Phone + 3D Floating Elements) */}
      <div className="absolute right-4 top-0 bottom-0 w-[42%] hidden md:flex items-center justify-end pr-4 pointer-events-none z-10">
        <img 
          src="/android-mockup.png" 
          alt="LeadBajaar Mobile App & 3D illustrations" 
          className="h-[265px] w-auto object-contain drop-shadow-[0_15px_35px_rgba(30,27,75,0.06)]" 
        />
      </div>
    </div>
  );
}

function AccountInfoCard({ user }: { user: any }) {
  const router = useRouter();

  // ── Plan Calculation ──
  const rawPlan = user?.company?.plan || user?.company?.plan_details?.name || 'Free';
  const planName = rawPlan.charAt(0).toUpperCase() + rawPlan.slice(1);
  const planLower = rawPlan.toLowerCase();

  // ── Expiry / Remaining Days Calculation ──
  const isSuperAdmin = user?.role === 'Super Admin' || user?.user_type === 'super_admin';
  const expiresAtStr = user?.company?.expires_at;

  let expiryBadge = {
    text: 'Active',
    className: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    iconColor: 'text-emerald-600',
    isUrgent: false,
  };

  if (isSuperAdmin && !expiresAtStr) {
    expiryBadge = {
      text: 'Lifetime Access',
      className: 'text-purple-600 bg-purple-50 border-purple-100',
      iconColor: 'text-purple-600',
      isUrgent: false,
    };
  } else if (expiresAtStr) {
    const expiresAt = new Date(expiresAtStr);
    const now = new Date();
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      expiryBadge = {
        text: 'Expired',
        className: 'text-rose-600 bg-rose-50 border-rose-100',
        iconColor: 'text-rose-600',
        isUrgent: true,
      };
    } else if (diffDays === 0) {
      expiryBadge = {
        text: 'Expires today',
        className: 'text-red-600 bg-red-50 border-red-100',
        iconColor: 'text-red-600',
        isUrgent: true,
      };
    } else if (diffDays === 1) {
      expiryBadge = {
        text: '1d left',
        className: 'text-red-600 bg-red-50 border-red-100',
        iconColor: 'text-red-600',
        isUrgent: true,
      };
    } else if (diffDays <= 7) {
      expiryBadge = {
        text: `${diffDays}d left`,
        className: 'text-amber-600 bg-amber-50 border-amber-100',
        iconColor: 'text-amber-600',
        isUrgent: true,
      };
    } else {
      expiryBadge = {
        text: `${diffDays}d left`,
        className: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        iconColor: 'text-emerald-600',
        isUrgent: false,
      };
    }
  }

  // ── Plan Badge Color ──
  const planBadgeClass =
    planLower === 'enterprise'
      ? 'text-blue-600 bg-blue-50 border-blue-100'
      : planLower === 'pro'
      ? 'text-indigo-600 bg-indigo-50 border-indigo-100'
      : planLower === 'agency'
      ? 'text-purple-600 bg-purple-50 border-purple-100'
      : 'text-slate-700 bg-slate-100 border-slate-200';

  // ── User Initials & Data ──
  const initials = (user?.name || 'User')
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0].toUpperCase())
    .slice(0, 2)
    .join('');

  const companyName = user?.company?.name || user?.company_name || (user?.name ? `${user.name}'s Workspace` : 'My Workspace');
  const phone = user?.phone || user?.mobile || 'Not set';
  const email = user?.email || 'No email';

  // ── Member Since ──
  const memberDate = user?.company?.subscription_started_at || user?.created_at;
  let sinceText = 'Active Member';
  if (memberDate) {
    try {
      sinceText = `Since ${format(new Date(memberDate), 'MMM yyyy')}`;
    } catch {
      sinceText = 'Active Member';
    }
  }

  // ── Plan Limits ──
  const leadLimitText = 'No limit';

  const companyStatus = user?.company?.status || 'Active';

  return (
    <div className="flex flex-col h-full min-h-[280px] bg-white rounded-xl border border-gray-200/80 shadow-sm p-6 relative overflow-hidden">
      
      {/* Top section: Identity & Badges */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3.5 w-full min-w-0">
          <div className="h-12 w-12 rounded-[12px] bg-[#0F172A] text-white flex items-center justify-center text-[16px] font-bold shadow-sm shrink-0">
            {initials || 'SA'}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <h3 className="text-[16px] font-bold text-slate-900 leading-tight flex items-center gap-2 mb-1 flex-wrap">
              <span className="truncate">{user?.name || 'Super Admin'}</span>
              <span className={cn("px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-bold rounded-md border shadow-sm shrink-0", planBadgeClass)}>
                {planName}
              </span>
            </h3>
            <p className="text-[12.5px] font-medium text-slate-500 leading-none truncate">{email}</p>
          </div>
        </div>
        
        {/* Actions / Expiry */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto gap-2 shrink-0 border-t sm:border-0 pt-3 sm:pt-0 border-slate-100">
           <span className={cn("text-[11px] font-bold flex items-center gap-1", expiryBadge.isUrgent ? "text-rose-600" : "text-emerald-600")}>
              <Clock className="w-3.5 h-3.5" />
              {expiryBadge.text}
           </span>
           {expiryBadge.isUrgent ? (
             <Button variant="ghost" onClick={() => router.push('/settings')} className="px-3 py-1.5 bg-[#EF4444] hover:bg-[#DC2626] text-white text-[11px] font-bold rounded-md transition-all shadow-sm active:scale-95 h-auto w-auto">
                Renew Now
             </Button>
           ) : (
             <Button variant="ghost" onClick={() => router.push('/settings')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-md transition-all shadow-sm active:scale-95 border border-slate-200/60 h-auto w-auto">
                Manage
             </Button>
           )}
        </div>
      </div>

      {/* Middle section: Key Details */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-[13px]">
         <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Workspace</span>
            <span className="text-slate-700 font-semibold flex items-center gap-1.5 truncate">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0"/> 
              <span className="truncate">{companyName}</span>
            </span>
         </div>
         <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Member Since</span>
            <span className="text-slate-700 font-semibold flex items-center gap-1.5 truncate">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0"/> 
              <span className="truncate">{sinceText.replace('Since ', '')}</span>
            </span>
         </div>
      </div>

      {/* Bottom section: Limits & Status */}
      <div className="mt-auto bg-[#F8FAFC]/80 rounded-xl p-4 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
         <div className="flex flex-col gap-1 w-full sm:w-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lead Limits</span>
            <span className="text-[16px] font-bold text-slate-900 leading-none">{leadLimitText}</span>
         </div>
         <div className="flex flex-col items-start sm:items-end gap-1 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Platform Status</span>
            <span className={cn(
              "text-[12px] font-bold leading-none",
              companyStatus.toLowerCase() === 'active' ? "text-indigo-600" : "text-amber-600"
            )}>
              {companyStatus.toLowerCase() === 'active' ? "All systems normal" : `${companyStatus} status`}
            </span>
         </div>
      </div>
    </div>
  );
}
