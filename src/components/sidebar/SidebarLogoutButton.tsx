import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { logout } from '@/lib/api'
import { clearSession } from '@/lib/auth'

interface SidebarLogoutButtonProps {
  isCollapsed: boolean
}

export function SidebarLogoutButton({ isCollapsed }: SidebarLogoutButtonProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      clearSession()
      localStorage.removeItem('admin_token')
      router.push('/signin')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return (
    <button
      onClick={handleLogout}
      className={cn(
        "w-full flex items-center rounded-lg text-white hover:text-rose-400 hover:bg-rose-500/10 transition-colors",
        isCollapsed
          ? "flex-col justify-center text-center px-1 py-2 gap-1"
          : "flex-row gap-3 px-2 py-2"
      )}
      title="Logout"
    >
      <i className={cn(
        "ti ti-logout-2 shrink-0",
        isCollapsed ? "text-[18px]" : "text-[17px]"
      )} />
      {isCollapsed ? (
        <span style={{
          fontFamily: "'Lexend Deca', sans-serif",
          fontWeight: 300,
          fontSize: '10px',
          lineHeight: 'normal',
          color: 'inherit',
        }}>Logout</span>
      ) : (
        <span style={{
          fontFamily: "'Lexend Deca', sans-serif",
          fontWeight: 300,
          fontSize: '13px',
          lineHeight: 'normal',
          color: 'inherit',
          display: 'block',
          padding: 0,
          flex: '1 1 0%',
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          textAlign: 'left',
        }}>Logout</span>
      )}
    </button>
  )
}
