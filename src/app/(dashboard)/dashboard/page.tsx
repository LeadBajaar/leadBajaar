"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.leadbajaar";

// v2 design system: coral is reserved for primary CTAs only.
const CORAL_CTA = "bg-[#E84C3A] hover:bg-[#d8402f] text-white";

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

  return (
    <div className="flex flex-col gap-3 px-3 sm:px-4 pb-3 pt-2 overflow-x-hidden">

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
            "flex flex-col gap-3 transition-opacity duration-150 motion-reduce:transition-none animate-in fade-in duration-300",
            isStale && "opacity-70"
          )}
        >
              <StatGrid isLoading={false} stats={data.stats} />

              {/* ── Promo (left) + Account (right) — side-by-side on desktop ── */}
              <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-3">
                <PlayStorePromo onScanQR={() => setShowQRModal(true)} />
                {user && <AccountCard user={user} />}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <PipelineCard pipeline={data.pipeline} />
                <ActivityCard activity={data.recent_activity} />
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

function AccountCard({ user }: { user: any }) {
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  // ── Plan / validity logic (was in AccountInfoBanner) ──
  const plan = user?.company?.plan;
  const expiresAt = user?.company?.expires_at;

  let daysLeft: number | null = null;
  let validityLabel = "";
  let urgency: "ok" | "warn" | "critical" = "ok";

  if (expiresAt) {
    try {
      daysLeft = differenceInDays(parseISO(expiresAt), new Date());
      if (daysLeft <= 0) {
        validityLabel = "Expired";
        urgency = "critical";
      } else if (daysLeft <= 7) {
        validityLabel = `${daysLeft}d left`;
        urgency = "critical";
      } else if (daysLeft <= 30) {
        validityLabel = `${daysLeft}d left`;
        urgency = "warn";
      } else {
        validityLabel = `Till ${format(parseISO(expiresAt), "dd MMM yyyy")}`;
        urgency = "ok";
      }
    } catch {
      validityLabel = "";
    }
  }

  const isExpired = daysLeft !== null && daysLeft <= 0;

  const rows = [
    { key: "email",   icon: Mail,      text: user.email },
    { key: "phone",   icon: Phone,     text: user.phone || "Not provided" },
    { key: "company", icon: Building2, text: user.company?.name || "Not provided" },
    {
      key: "member",
      icon: Calendar,
      text: `Since ${format(new Date(user.created_at || new Date()), "MMM yyyy")}`,
    },
  ];

  return (
    <div className={cn(
      "rounded-[var(--r-lg)] border bg-[var(--crm-surface-1)] shadow-card transition-colors",
      urgency === "critical"
        ? "border-[var(--crm-red-border)]"
        : "border-[var(--crm-border)]"
    )}>
      {/* Header: title + plan pill + validity + renew */}
      <div className={cn(
        "px-4 py-2.5 border-b flex flex-wrap items-center gap-2",
        urgency === "critical"
          ? "border-[var(--crm-red-border)] bg-[var(--crm-red-soft)]"
          : "border-[var(--crm-border)]"
      )}>
        <h2 className="text-[13px] font-semibold text-[var(--crm-text-primary)] mr-auto">Account</h2>
        {plan && (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20 bg-primary/10 text-primary capitalize">
            <Zap className="h-2.5 w-2.5" />{plan} Plan
          </span>
        )}
        {validityLabel && (
          <span className={cn(
            "text-[12px] font-semibold px-2 py-0.5 rounded-full",
            urgency === "critical" && "bg-[var(--crm-red)] text-white",
            urgency === "warn"     && "bg-[var(--crm-amber-soft)] text-[var(--crm-amber)]",
            urgency === "ok"       && "bg-[var(--crm-green-soft)] text-[var(--crm-green)]"
          )}>
            {urgency === "critical" ? "⚠ " : urgency === "warn" ? "▷ " : "✓ "}{validityLabel}
          </span>
        )}
        {urgency === "critical" && (
          <Button
            size="sm"
            onClick={() => { window.location.href = "/settings?tab=billing"; }}
            className={cn("h-6 px-2 rounded-[var(--r-md)] text-[11px] font-bold shadow-sm", CORAL_CTA)}
          >
            <CreditCard className="h-3 w-3 mr-1" />
            {isExpired ? "Renew" : "Renew Now"}
          </Button>
        )}
      </div>
      <div className="p-3.5 space-y-3">
        {/* Avatar + name row */}
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 rounded-[var(--r-md)] shadow-[0_4px_10px_-2px_rgba(30,45,107,0.35)] ring-1 ring-black/[0.04] dark:ring-white/[0.06] shrink-0">
            <AvatarImage src={user.avatar || ""} />
            <AvatarFallback className="rounded-[var(--r-md)] bg-gradient-to-br from-[var(--crm-accent)] to-[#3a4d99] text-white font-semibold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-[var(--crm-text-primary)] text-[13px] truncate">{user.name}</p>
            <Badge variant="secondary" className="text-[10px] mt-0.5">
              {user.role}
            </Badge>
          </div>
        </div>
        {/* Details — 2-column compact grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {rows.map(({ key, icon: Icon, text }) => (
            <div key={key} className="flex items-center gap-2 text-[11px] rounded-[var(--r-md)] px-1.5 py-1 hover:bg-[var(--crm-surface-2)] transition-colors min-w-0">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--r-sm)] bg-[var(--crm-surface-2)]">
                <Icon className="h-3 w-3 text-[var(--crm-text-secondary)]" aria-hidden="true" />
              </div>
              <span className="text-[var(--crm-text-secondary)] truncate">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Mobile App Promo card ───────────────────────────────────
function PlayStorePromo({ onScanQR }: { onScanQR: () => void }) {
  return (
    <DismissibleCard
      id="dashboard-playstore-promo"
      className="rounded-[var(--r-lg)] border-[var(--crm-border)] bg-white dark:bg-[var(--crm-surface-1)] px-5 py-4 shadow-card"
    >
      <div className="flex items-center gap-5 flex-wrap">
        <img
          src="/android-mockup.png"
          alt="LeadBajaar Android app"
          className="hidden sm:block h-24 w-auto drop-shadow-lg shrink-0 self-center"
        />
        <div className="flex-1 min-w-[220px] py-1">
          <p className="text-[14px] font-bold text-[var(--crm-text-primary)] tracking-tight flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-[var(--crm-accent)]" aria-hidden="true" />
            Take LeadBajaar with you
          </p>
          <p className="text-[12px] text-[var(--crm-text-secondary)] mt-1 leading-relaxed">
            Manage leads, live chat, and meetings on the go — the LeadBajaar app is available on the Google Play Store.
          </p>
          <div className="flex items-center gap-2 flex-wrap mt-3">
            <Button asChild size="sm" className={cn("h-8 px-3 rounded-[var(--r-md)] text-[12px] font-bold shadow-sm", CORAL_CTA)}>
              <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 mr-1.5 fill-current" aria-hidden="true">
                  <path d="M3.6 1.8 13.7 12 3.6 22.2c-.4-.2-.6-.6-.6-1.1V2.9c0-.5.2-.9.6-1.1zm11.5 8.8 2.6-2.6 -11-6.3c-.2-.1-.4-.2-.6-.2l9 9.1zm3.9-1.3 2.6 1.5c.9.5.9 1.9 0 2.4l-2.6 1.5L16.5 12l2.5-2.7zM6.1 22.5c.2 0 .4-.1.6-.2l11-6.3-2.6-2.6-9 9.1z"/>
                </svg>
                Get it on Google Play
              </a>
            </Button>
            <Button size="sm" variant="outline" onClick={onScanQR} className="h-8 px-3 rounded-[var(--r-md)] text-[12px] font-semibold border-[var(--crm-border)] hover:bg-[var(--crm-surface-2)]">
              <QrCode className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
              Scan QR
            </Button>
          </div>
        </div>
      </div>
    </DismissibleCard>
  );
}
