import { UserRole, UserType } from '@/contexts/UserContext'

export type NavItemDef = {
  name: string
  href: string
  iconClass: string
  roles: UserRole[]
  types?: UserType[]
  plans?: string[]
  feature?: string
  exact?: boolean
}

export type NavSection = {
  label: string
  items: NavItemDef[]
}
