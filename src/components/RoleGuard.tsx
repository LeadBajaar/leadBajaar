"use client"

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, UserRole, UserType } from '../contexts/UserContext'
import { Skeleton } from '@/components/ui/skeleton'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  allowedTypes?: UserType[]
  allowedPlans?: string[]
  fallbackPath?: string
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  allowedTypes,
  allowedPlans,
  fallbackPath = '/dashboard' 
}: RoleGuardProps) {
  const { user, isLoading, hasRole, hasType, hasPlan } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/signin')
        return
      }

      const roleMatch = !allowedRoles || hasRole(allowedRoles)
      const typeMatch = !allowedTypes || hasType(allowedTypes)
      const planMatch = !allowedPlans || hasPlan(allowedPlans)

      if (!roleMatch || !typeMatch || !planMatch) {
         router.push(fallbackPath)
      }
    }
  }, [user, isLoading, allowedRoles, allowedTypes, allowedPlans, router, fallbackPath, hasRole, hasType, hasPlan])

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
  const planMatch = !allowedPlans || (user && hasPlan(allowedPlans))

  if (!user || !roleMatch || !typeMatch || !planMatch) {
    return null
  }

  return <>{children}</>
}
