export default function Loading() {
  return (
    <>
      {/* Inline script to sync theme BEFORE paint — prevents white flash */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            #lb-loader {
              background: var(--crm-bg, #f8fafc);
            }
            @media (prefers-color-scheme: dark) {
              #lb-loader {
                background: #0f172a;
              }
            }
            html.dark #lb-loader {
              background: #0f172a;
            }
            html.light #lb-loader {
              background: #f8fafc;
            }
          `,
        }}
      />
      <div
        id="lb-loader"
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      >
        <div className="relative flex flex-col items-center gap-6">

          {/* Brand mark */}
          <div className="flex flex-col items-center gap-1">
            {/* Icon lockup */}
            <div className="relative mb-1">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              {/* Ping effect */}
              <span className="absolute inset-0 rounded-2xl bg-indigo-400/20 animate-ping" />
            </div>

            {/* Brand name */}
            <h1 className="text-slate-900 dark:text-white font-black text-2xl tracking-tight">
              Lead<span className="text-indigo-600 dark:text-indigo-400">Bajaar</span>
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium tracking-widest uppercase">
              CRM Platform
            </p>
          </div>

          {/* Animated loading bar */}
          <div className="w-48 h-1 bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]"
              style={{ backgroundSize: '200% 100%' }}
            />
          </div>
        </div>

        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes shimmer {
              0% { background-position: 200% center; }
              100% { background-position: -200% center; }
            }
          `,
        }}
      />
    </>
  )
}
