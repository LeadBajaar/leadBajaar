/**
 * ============================================================
 *  LeadBajaar — Centralized Theme Configuration
 * ============================================================
 *  All design tokens live here. To retheme the app, only
 *  edit this file + the matching CSS variables in globals.css.
 * ============================================================
 */

export const theme = {
    // ── Brand ────────────────────────────────────────────────
    brand: {
        name: 'LeadBajaar',
        shortName: 'LB',
    },

    // ── Color Palette ────────────────────────────────────────
    colors: {
        // Primary – Indigo/Violet accent
        primary: 'hsl(var(--primary))',        // #6366F1
        primaryHover: 'hsl(var(--primary-hover))',  // #4F46E5
        primaryLight: 'hsl(var(--primary-light))',  // subtle bg tint

        // Secondary – slate
        secondary: 'hsl(var(--secondary))',

        // Semantic
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',

        // Backgrounds
        background: 'hsl(var(--background))',     // main page bg
        surface: 'hsl(var(--card))',            // card / panel bg
        surfaceMuted: 'hsl(var(--muted))',

        // Text
        textPrimary: 'hsl(var(--foreground))',
        textSecondary: 'hsl(var(--muted-foreground))',

        // Border
        border: 'hsl(var(--border))',
    },

    // ── Gradients ────────────────────────────────────────────
    gradients: {
        brand: 'from-indigo-600 to-violet-600',
        brandBg: 'from-indigo-50 to-violet-50',
        header: 'from-slate-900 to-slate-700 dark:from-white dark:to-slate-300',
        hero: 'from-indigo-600 via-violet-600 to-purple-600',
    },

    // ── Sidebar ──────────────────────────────────────────────
    sidebar: {
        bg: 'bg-white dark:bg-slate-900',
        border: 'border-slate-200 dark:border-slate-800',
        activeItem: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
        hoverItem: 'hover:bg-slate-100 dark:hover:bg-slate-800/60',
        text: 'text-slate-600 dark:text-slate-400',
        activeText: 'text-indigo-700 dark:text-indigo-300',
        icon: 'text-slate-500 dark:text-slate-400',
        activeIcon: 'text-indigo-600 dark:text-indigo-400',
        logo: 'from-indigo-600 to-violet-600',
        logoBg: 'bg-gradient-to-br from-indigo-600 to-violet-600',
    },

    // ── Header ───────────────────────────────────────────────
    header: {
        bg: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl',
        border: 'border-slate-200/60 dark:border-slate-800/60',
    },

    // ── Cards ────────────────────────────────────────────────
    card: {
        base: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm',
        hover: 'hover:shadow-md hover:border-indigo-200/60 dark:hover:border-indigo-700/40 transition-all duration-200',
        padding: 'p-5',
    },

    // ── Badges / Stage colors ────────────────────────────────
    stages: {
        'Lead': 'bg-blue-50 text-blue-700 border border-blue-200/50 dark:bg-blue-900/30 dark:text-blue-300',
        'Appointment Booked': 'bg-purple-50 text-purple-700 border border-purple-200/50 dark:bg-purple-900/30 dark:text-purple-300',
        'Qualified': 'bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-900/30 dark:text-emerald-300',
        'Disqualified': 'bg-red-50 text-red-700 border border-red-200/50 dark:bg-red-900/30 dark:text-red-300',
        'Not Connected': 'bg-slate-100 text-slate-600 border border-slate-200/50 dark:bg-slate-800 dark:text-slate-400',
        'Deal Closed': 'bg-green-50 text-green-700 border border-green-200/50 dark:bg-green-900/30 dark:text-green-300',
        'Closed Won': 'bg-green-50 text-green-700 border border-green-200/50 dark:bg-green-900/30 dark:text-green-300',
        'DNP': 'bg-orange-50 text-orange-700 border border-orange-200/50 dark:bg-orange-900/30 dark:text-orange-300',
        'Follow Up': 'bg-cyan-50 text-cyan-700 border border-cyan-200/50 dark:bg-cyan-900/30 dark:text-cyan-300',
        'Call Back': 'bg-indigo-50 text-indigo-700 border border-indigo-200/50 dark:bg-indigo-900/30 dark:text-indigo-300',
        'Consultation': 'bg-violet-50 text-violet-700 border border-violet-200/50 dark:bg-violet-900/30 dark:text-violet-300',
        'Not Interested': 'bg-rose-50 text-rose-700 border border-rose-200/50 dark:bg-rose-900/30 dark:text-rose-300',
        'Broadcast Done': 'bg-teal-50 text-teal-700 border border-teal-200/50 dark:bg-teal-900/30 dark:text-teal-300',
        'Wrong Number': 'bg-red-50 text-red-600 border border-red-200/50 dark:bg-red-900/30 dark:text-red-300',
        'Payment Received': 'bg-green-50 text-green-700 border border-green-200/50 dark:bg-green-900/30 dark:text-green-300',
    } as Record<string, string>,

    // ── Temperature / Status ─────────────────────────────────
    temperature: {
        Hot: 'bg-red-50 text-red-700 border border-red-200/50 dark:bg-red-900/30 dark:text-red-300',
        Warm: 'bg-amber-50 text-amber-700 border border-amber-200/50 dark:bg-amber-900/30 dark:text-amber-300',
        Cold: 'bg-sky-50 text-sky-700 border border-sky-200/50 dark:bg-sky-900/30 dark:text-sky-300',
    } as Record<string, string>,

    // ── Layout ───────────────────────────────────────────────
    layout: {
        pageBg: 'bg-slate-50 dark:bg-slate-950',
        mainPad: 'p-6',
    },

    // ── Typography ───────────────────────────────────────────
    typography: {
        pageTitle: 'text-2xl font-bold text-slate-900 dark:text-white',
        sectionTitle: 'text-base font-semibold text-slate-800 dark:text-slate-100',
        label: 'text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide',
        body: 'text-sm text-slate-700 dark:text-slate-300',
        muted: 'text-sm text-slate-400 dark:text-slate-500',
    },

    // ── Shadows ──────────────────────────────────────────────
    shadows: {
        sm: 'shadow-sm',
        md: 'shadow-md',
        card: 'shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]',
    },
} as const;

// ── Convenience helpers ───────────────────────────────────
export const getStageClass = (stage: string): string =>
    theme.stages[stage] ?? 'bg-slate-100 text-slate-600 border border-slate-200/50';

export const getTemperatureClass = (temp: string): string =>
    theme.temperature[temp] ?? 'bg-slate-100 text-slate-600 border border-slate-200/50';
