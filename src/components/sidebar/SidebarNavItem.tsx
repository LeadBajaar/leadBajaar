import Link from 'next/link'
import { cn } from '@/lib/utils'
import { NavItemDef } from './types'

interface SidebarNavItemProps {
  item: NavItemDef
  isCollapsed: boolean
  pathname: string
  pendingHref: string | null
  onClick: (href: string) => void
}

export function SidebarNavItem({ item, isCollapsed, pathname, pendingHref, onClick }: SidebarNavItemProps) {
  const isCurrent = item.exact ? pathname === item.href : (pathname === item.href || pathname.startsWith(`${item.href}/`))
  const isPending = pendingHref === item.href
  const isActive = isCurrent || isPending

  return (
    <Link
      key={item.href}
      href={item.href}
      prefetch={true}
      onClick={() => onClick(item.href)}
      className={cn(
        "group relative flex items-center rounded-lg transition-all duration-150 select-none",
        isCollapsed
          ? "flex-col justify-center text-center px-1 py-2.5 gap-1 min-h-[54px] mx-1.5"
          : "flex-row gap-2.5 px-3 py-[7px] mx-1.5",
        isActive
          ? "bg-[rgba(255,255,255,0.1)] text-white"
          : "text-white hover:bg-[rgba(255,255,255,0.06)]"
      )}
      title={item.name}
    >
      {/* Left accent bar for active item */}
      {isActive && !isCollapsed && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[55%] rounded-r-full bg-[#FE4548]" />
      )}

      {/* Icon */}
      {isPending && !isCurrent ? (
        <i className={cn(
          "ti ti-loader-2 animate-spin shrink-0 text-white",
          isCollapsed ? "text-[18px]" : "text-[17px]"
        )} />
      ) : (
        <i className={cn(
          item.iconClass, "shrink-0 transition-colors",
          isCollapsed ? "text-[18px]" : "text-[17px]",
          isActive
            ? "text-white"
            : "text-white"
        )} />
      )}

      {/* Label */}
      {isCollapsed ? (
        <span style={{
          fontFamily: "'Lexend Deca', sans-serif",
          fontWeight: 300,
          fontSize: '11px',
          lineHeight: 'normal',
          color: 'rgb(255, 255, 255)',
          display: 'block',
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%',
          padding: 0,
        }}>
          {item.name}
        </span>
      ) : (
        <span style={{
          fontFamily: "'Lexend Deca', sans-serif",
          fontWeight: isActive ? 400 : 300,
          fontSize: '14px',
          lineHeight: 'normal',
          color: 'rgb(255, 255, 255)',
          display: 'block',
          padding: 0,
          flex: '1 1 0%',
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          opacity: 1,
        }}>
          {item.name}
        </span>
      )}

      {!isCollapsed && isPending && !isCurrent && (
        <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-ping shrink-0" />
      )}
    </Link>
  )
}
