import { setSession } from '@/lib/auth'

interface SidebarImpersonationBannerProps {
  isCollapsed: boolean
}

export function SidebarImpersonationBanner({ isCollapsed }: SidebarImpersonationBannerProps) {
  const handleReturnToAdmin = () => {
    const adminToken = localStorage.getItem('admin_token')
    if (adminToken) {
      setSession(adminToken)
      localStorage.removeItem('admin_token')
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="px-2 mb-3">
      <button
        onClick={handleReturnToAdmin}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12.5px] font-medium text-amber-400 hover:bg-amber-500/10 transition-colors border border-amber-400/20"
      >
        <i className="ti ti-corner-up-left text-[14px]" />
        {!isCollapsed && "Return to Admin"}
      </button>
    </div>
  )
}
