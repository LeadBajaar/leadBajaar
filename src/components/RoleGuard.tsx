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
  allowedFeatures?: string[]
  fallbackPath?: string
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  allowedTypes,
  allowedPlans,
  allowedFeatures,
  fallbackPath = '/unauthorized' 
}: RoleGuardProps) {
  const { user, isLoading, hasRole, hasType, hasPlan, hasFeature } = useUser()
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
      const featureMatch = !allowedFeatures || allowedFeatures.every(f => hasFeature(f))

      if (!roleMatch || !typeMatch || !planMatch || !featureMatch) {
         router.push(fallbackPath)
      }
    }
  }, [user, isLoading, allowedRoles, allowedTypes, allowedPlans, allowedFeatures, router, fallbackPath, hasRole, hasType, hasPlan, hasFeature])

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
  const featureMatch = !allowedFeatures || (user && allowedFeatures.every(f => hasFeature(f)))

  if (!user || !roleMatch || !typeMatch || !planMatch || !featureMatch) {
    return null
  }

  return <>{children}</>
}
