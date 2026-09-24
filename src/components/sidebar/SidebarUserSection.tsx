import Link from 'next/link'
import { cn } from '@/lib/utils'

interface SidebarUserSectionProps {
  user: any
  pathname: string
  isCollapsed: boolean
  onClick: (href: string) => void
}

export function SidebarUserSection({ user, pathname, isCollapsed, onClick }: SidebarUserSectionProps) {
  return (
    <Link
      href="/settings"
      prefetch={true}
      onClick={() => onClick('/settings')}
      className={cn(
        "flex items-center rounded-xl transition-all duration-200 w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] shadow-sm",
        isCollapsed
          ? "flex-col justify-center text-center px-1 py-2 gap-1 mx-0.5"
          : "flex-row gap-3 p-2.5 mx-1",
        pathname.startsWith('/settings') && "bg-[rgba(255,255,255,0.08)] border-[rgba(255,255,255,0.15)]"
      )}
      title={user?.name || 'Settings'}
    >
      {/* Avatar */}
      <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[rgba(255,255,255,0.2)] to-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[13px] font-bold text-white uppercase shadow-inner">
        {user?.name?.[0]?.toUpperCase() || 'U'}
      </div>

      {isCollapsed ? (
        <span style={{
          fontFamily: "'Lexend Deca', sans-serif",
          fontWeight: 300,
          fontSize: '10px',
          lineHeight: 'normal',
          color: 'rgb(255, 255, 255)',
          display: 'block',
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%',
        }}>
          Settings
        </span>
      ) : (
        <div className="flex flex-col min-w-0 flex-1 text-left">
          <span style={{
            fontFamily: "'Lexend Deca', sans-serif",
            fontWeight: 500,
            fontSize: '13px',
            lineHeight: '1.2',
            color: 'rgb(255, 255, 255)',
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {user?.name || 'User'}
          </span>
          <span style={{
            fontFamily: "'Lexend Deca', sans-serif",
            fontWeight: 300,
            fontSize: '11px',
            lineHeight: '1.4',
            color: 'rgba(255,255,255,0.45)',
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {user?.email || ''}
          </span>
        </div>
      )}
    </Link>
  )
}
