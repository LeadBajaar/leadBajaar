"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getUser } from '@/lib/api'

export type UserRole = 'Super Admin' | 'Admin' | 'Manager' | 'Agent'
export type UserType = 'agency' | 'individual' | 'super_admin'

interface User {
  id: number
  name: string
  email: string
  role: UserRole
  user_type: UserType
  company_id: number | null
}

interface UserContextType {
  user: User | null
  isLoading: boolean
  hasRole: (roles: UserRole[]) => boolean
  hasType: (types: UserType[]) => boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUser()
        setUser(data)
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  const hasRole = (roles: UserRole[]) => {
    if (!user) return false
    
    // Normalize user role from backend
    const normalizedUserRole = user.role.toLowerCase().replace(/_/g, ' ')
    
    return roles.some(role => {
      const normalizedAllowedRole = role.toLowerCase().replace(/_/g, ' ')
      return normalizedUserRole === normalizedAllowedRole
    })
  }

  const hasType = (types: UserType[]) => {
    if (!user) return false
    return types.includes(user.user_type)
  }

  return (
    <UserContext.Provider value={{ user, isLoading, hasRole, hasType }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
