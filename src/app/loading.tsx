export default function Loading() {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            #lb-page-loader {
              background: #ffffff;
              color: #0f172a;
            }
            @media (prefers-color-scheme: dark) {
              #lb-page-loader {
                background: var(--crm-bg, #0A0A0B);
                color: #ffffff;
              }
            }
            html.dark #lb-page-loader {
              background: var(--crm-bg, #0A0A0B);
              color: #ffffff;
            }
            html.light #lb-page-loader {
              background: #ffffff;
              color: #0f172a;
            }

            @keyframes lb-spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes lb-pulse-subtle {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.85; transform: scale(0.98); }
            }
            @keyframes lb-shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(200%); }
            }
          `,
        }}
      />

      <div
        id="lb-page-loader"
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none"
      >
        <div className="flex flex-col items-center justify-center">
          
          {/* Logo with clean spinner ring */}
          <div className="relative flex items-center justify-center mb-4">
            {/* Smooth minimal spinner ring */}
            <div
              className="absolute -inset-2.5 rounded-full border-2 border-slate-100 dark:border-slate-800 border-t-[#1e2d6b] dark:border-t-indigo-400"
              style={{ animation: 'lb-spin 0.9s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite' }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-sm.png"
              alt="LeadBajaar"
              width={44}
              height={44}
              className="h-11 w-11 rounded-xl object-contain shadow-xs"
            />
          </div>

          {/* Wordmark */}
          <div className="flex items-center text-[19px] font-bold tracking-tight text-slate-900 dark:text-white font-['Satoshi']">
            <span>Lead</span>
            <span className="text-[#1e2d6b] dark:text-indigo-400">Bajaar</span>
          </div>

          {/* Minimalist Progress Line */}
          <div className="mt-3.5 w-28 h-[2.5px] bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
            <div
              className="absolute top-0 bottom-0 w-14 rounded-full bg-[#1e2d6b] dark:bg-indigo-500"
              style={{ animation: 'lb-shimmer 1.2s ease-in-out infinite' }}
            />
          </div>

          {/* Clean subtitle */}
          <p className="mt-2.5 text-[11px] font-medium text-slate-400 dark:text-slate-500 tracking-wide">
            Loading...
          </p>

        </div>
      </div>
    </>
  );
}
