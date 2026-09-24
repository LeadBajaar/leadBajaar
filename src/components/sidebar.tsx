"use client"

import { cn } from '@/lib/utils'
import { useSidebarState } from './sidebar/useSidebarState'
import { SidebarNavItem } from './sidebar/SidebarNavItem'
import { SidebarUserSection } from './sidebar/SidebarUserSection'
import { SidebarLogoutButton } from './sidebar/SidebarLogoutButton'
import { SidebarImpersonationBanner } from './sidebar/SidebarImpersonationBanner'

interface SidebarProps {
  mobileOpen?: boolean
  setMobileOpen?: (open: boolean) => void
  isCollapsed?: boolean
  setIsCollapsed?: (collapsed: boolean) => void
}

export function Sidebar({ mobileOpen, setMobileOpen, isCollapsed = false, setIsCollapsed }: SidebarProps) {
  const {
    pathname,
    user,
    isAdminImpersonating,
    pendingHref,
    handleLinkClick,
    visibleMain,
    visibleSections
  } = useSidebarState(setMobileOpen)

  return (
    <>
      <aside
        style={{ width: isCollapsed ? '72px' : '216px' }}
        className={cn(
          "sidebar fixed lg:relative z-[100] h-screen transition-all duration-300 flex flex-col bg-[var(--crm-sidebar-bg)]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Collapse toggle */}
        {setIsCollapsed && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute -right-3 top-[22px] items-center justify-center text-[rgba(255,255,255,0.45)] hover:bg-[rgba(255,255,255,0.08)] hover:text-white transition-colors shrink-0 bg-[var(--crm-bg)] border border-[rgba(255,255,255,0.1)] shadow-sm rounded-full w-6 h-6 z-50"
          >
            <i className={cn("ti", isCollapsed ? "ti-chevron-right text-[11px]" : "ti-chevron-left text-[11px]")} />
          </button>
        )}

        {/* Scrollable nav */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-3">

          {/* Admin impersonating banner */}
          {isAdminImpersonating && (
            <SidebarImpersonationBanner isCollapsed={isCollapsed} />
          )}

          {/* Main nav */}
          <div className="space-y-0.5">
            {visibleMain.map(item => (
              <SidebarNavItem 
                key={item.href} 
                item={item} 
                isCollapsed={isCollapsed}
                pathname={pathname}
                pendingHref={pendingHref}
                onClick={handleLinkClick}
              />
            ))}
          </div>

          {/* Sectioned nav */}
          {visibleSections.map(section => (
            <div key={section.label} className="mt-5 space-y-0.5">
              {/* Section label */}
              <div className={cn(
                "flex items-center mb-1",
                isCollapsed ? "justify-center px-2" : "px-4"
              )}>
                {isCollapsed ? (
                  <div className="w-5 h-px bg-[rgba(255,255,255,0.1)]" />
                ) : (
                  <span style={{
                    fontFamily: "'Lexend Deca', sans-serif",
                    fontWeight: 300,
                    fontSize: '10.5px',
                    lineHeight: 'normal',
                    color: 'rgba(255,255,255,0.55)',
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {section.label}
                  </span>
                )}
              </div>
              {section.items.map(item => (
                <SidebarNavItem 
                  key={item.href} 
                  item={item} 
                  isCollapsed={isCollapsed}
                  pathname={pathname}
                  pendingHref={pendingHref}
                  onClick={handleLinkClick}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={cn(
          "border-t border-[rgba(255,255,255,0.08)] shrink-0 pb-[76px]",
          isCollapsed ? "p-1.5 space-y-1.5" : "px-2 pt-3 space-y-1.5"
        )}>
          {/* User / Settings */}
          <SidebarUserSection 
            user={user}
            pathname={pathname}
            isCollapsed={isCollapsed}
            onClick={handleLinkClick}
          />

          {/* Logout */}
          <SidebarLogoutButton isCollapsed={isCollapsed} />
        </div>
      </aside>
    </>
  )
}
