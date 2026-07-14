export default function Loading() {
  return (
    <>
      {/* Theme-aware backdrop, applied before hydration to avoid a white flash */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            #lb-loader { background: var(--crm-bg, #f0f2f8); }
            @media (prefers-color-scheme: dark) { #lb-loader { background: #0A0A0B; } }
            html.dark #lb-loader { background: #0A0A0B; }
            html.light #lb-loader { background: var(--crm-bg, #f0f2f8); }

            @keyframes lb-shimmer {
              0% { background-position: 200% center; }
              100% { background-position: -200% center; }
            }
            @keyframes lb-breathe {
              0%, 100% { transform: translateY(0) scale(1); }
              50% { transform: translateY(-4px) scale(1.02); }
            }
            @keyframes lb-halo {
              0%, 100% { opacity: 0.3; transform: scale(1); }
              50% { opacity: 0.55; transform: scale(1.1); }
            }
          `,
        }}
      />

      <div
        id="lb-loader"
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      >
        <div className="relative flex flex-col items-center">

          {/* Logo with soft breathing halo */}
          <div className="relative mb-5">
            <span
              className="absolute -inset-3 rounded-[28px] bg-[#1e2d6b]/15 dark:bg-indigo-400/15 blur-xl"
              style={{ animation: 'lb-halo 2.6s ease-in-out infinite' }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-sm.png"
              alt="LeadBajaar"
              width={72}
              height={72}
              className="relative h-[72px] w-[72px] rounded-[20px] shadow-[0_20px_45px_-14px_rgba(30,45,107,0.5)]"
              style={{ animation: 'lb-breathe 2.6s ease-in-out infinite' }}
            />
          </div>

          {/* Wordmark */}
          <h1 className="text-slate-900 dark:text-white font-bold text-[22px] tracking-tight leading-none">
            Lead<span className="text-[#1e2d6b] dark:text-indigo-300">Bajaar</span>
          </h1>
          <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-[0.28em] uppercase">
            CRM Platform
          </p>

          {/* Slim indeterminate progress bar in brand colors */}
          <div className="mt-8 w-44 h-[3px] bg-slate-900/[0.06] dark:bg-white/[0.08] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #1e2d6b, #e8503a, #1e2d6b)',
                backgroundSize: '200% 100%',
                animation: 'lb-shimmer 1.6s ease-in-out infinite',
              }}
            />
          </div>
        </div>

        {/* Faint centered vignette */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] bg-[#1e2d6b]/[0.04] dark:bg-indigo-500/[0.06] rounded-full blur-[130px] pointer-events-none" />
      </div>
    </>
  )
}
