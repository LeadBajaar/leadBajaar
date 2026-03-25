"use client"

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, UserRole, UserType } from '../contexts/UserContext'
import { Skeleton } from '@/components/ui/skeleton'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  allowedTypes?: UserType[]
  fallbackPath?: string
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  allowedTypes,
  fallbackPath = '/dashboard' 
}: RoleGuardProps) {
  const { user, isLoading, hasRole, hasType } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/signin')
        return
      }

      const roleMatch = !allowedRoles || hasRole(allowedRoles)
      const typeMatch = !allowedTypes || hasType(allowedTypes)

      if (!roleMatch || !typeMatch) {
         router.push(fallbackPath)
      }
    }
  }, [user, isLoading, allowedRoles, allowedTypes, router, fallbackPath, hasRole, hasType])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  const roleMatch = !allowedRoles || (user && hasRole(allowedRoles))
  const typeMatch = !allowedTypes || (user && hasType(allowedTypes))

  if (!user || !roleMatch || !typeMatch) {
    return null
  }

  return <>{children}</>
}
