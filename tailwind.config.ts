import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			// ── All colors reference CSS variables defined in globals.css ──
			colors: {
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",

				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				primary: {
					DEFAULT: "hsl(var(--primary))",
					hover: "hsl(var(--primary-hover))",
					light: "hsl(var(--primary-light))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
					// crm-red-soft/-border are the real, theme-reactive tint pair
					// already used by Badge/Button — not an hsl() var, so no wrapper.
					bg: "var(--crm-red-soft)",
					border: "var(--crm-red-border)",
				},
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",

				// ── Text hierarchy ──
				// Corrected: aliases the real, already-wired --crm-text-secondary
				// (used today only via ad-hoc arbitrary-value classes) as a proper
				// Tailwind color token, instead of a separate/dead --text-secondary.
				text: {
					secondary: "var(--crm-text-secondary)",
					tertiary: "var(--crm-text-tertiary)",
				},

				// ── Surface elevation ──
				// Corrected: --crm-surface-2 is the real elevated tier in this
				// system (surface-1 = base card, 2 = hover/elevated, 3 = popover).
				surface: {
					elevated: "var(--crm-surface-2)",
					popover: "var(--crm-surface-3)",
				},

				// ── Semantic: success / warning / info ──
				// Corrected: aliases the pre-existing --crm-green/-amber/-blue
				// (+ -soft/-border) tokens under a semantic naming scheme, instead
				// of inventing a second, parallel color system. Same DEFAULT/bg/
				// border shape as `destructive` above.
				success: {
					DEFAULT: "var(--crm-green)",
					bg: "var(--crm-green-soft)",
					border: "var(--crm-green-border)",
				},
				warning: {
					DEFAULT: "var(--crm-amber)",
					bg: "var(--crm-amber-soft)",
					border: "var(--crm-amber-border)",
				},
				info: {
					DEFAULT: "var(--crm-blue)",
					bg: "var(--crm-blue-soft)",
					border: "var(--crm-blue-border)",
				},

				// ── Chart tokens ─────────────────────────────────
				chart: {
					"1": "hsl(var(--chart-1))",
					"2": "hsl(var(--chart-2))",
					"3": "hsl(var(--chart-3))",
					"4": "hsl(var(--chart-4))",
					"5": "hsl(var(--chart-5))",
				},
				// ── Crm colors ────────────────────────────────
				crm: {
					bg: '#0f0f0f',
					's1': '#161616',
					's2': '#1c1c1c',
					's3': '#242424',
					's4': '#2e2e2e',
					accent: '#6b5ce7',
					green: '#3ecf8e',
					amber: '#f59e0b',
					red: '#ef4444',
					blue: '#3b82f6',
					't1': '#e8e8e6',
					't2': '#8a8a85',
					't3': '#5a5a56',
				}
			},

			// ── Border width ──────────────────────────────────
			borderWidth: {
				'thin': '0.5px',
			},

			// ── Font sizes ────────────────────────────────────
			fontSize: {
				'label': ['10px', { fontWeight: '600', letterSpacing: '0.10em' }],
				'body-sm': ['11px', '1.5'],
				'body-md': ['12px', '1.5'],
				'body-lg': ['13px', '1.5'],
				'heading-sm': ['14px', { fontWeight: '500' }],
				'heading-lg': ['16px', { fontWeight: '500' }],
				'display': ['22px', { fontWeight: '500', letterSpacing: '-0.02em' }],
				// For stat-card figures, which need to outrank their own label
				// without competing with `display`. Mirrors .text-stat-value in
				// styles/globals.css (kept in both places: this one is a Tailwind
				// utility class `text-stat-value`, the CSS class is for non-Tailwind
				// call sites like the plain `.metric-value` pattern already in use).
				'stat-value': ['28px', { fontWeight: '600', letterSpacing: '-0.01em' }],
			},

			// ── Border radius ─────────────────────────────────
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
				xl: "calc(var(--radius) + 4px)",
				"2xl": "calc(var(--radius) + 8px)",
				'crm-xs': '3px',
				'crm-sm': '5px',
				'crm-md': '7px',
				'crm-lg': '10px',
				'crm-xl': '14px',
			},

			// ── Typography ────────────────────────────────────
			fontFamily: {
				sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
			},

			// ── Box shadows ───────────────────────────────────
			// card/card-md now source from CSS vars (styles/globals.css) so both
			// automatically pick up the dark-mode inset-highlight override —
			// rgba-black shadows are invisible against near-black surfaces.
			boxShadow: {
				card: "var(--shadow-card)",
				"card-md": "var(--shadow-card-md)",
				"primary-glow": "0 4px 14px rgba(99,102,241,0.25)",
			},

			// ── Keyframes ─────────────────────────────────────
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
				"fade-in": {
					from: { opacity: "0", transform: "translateY(4px)" },
					to: { opacity: "1", transform: "translateY(0)" },
				},
				"slide-in-right": {
					from: { opacity: "0", transform: "translateX(12px)" },
					to: { opacity: "1", transform: "translateX(0)" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"fade-in": "fade-in 0.25s ease-out",
				"slide-in-right": "slide-in-right 0.2s ease-out",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
