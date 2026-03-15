"use client"

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, UserRole } from '../contexts/UserContext'
import { Skeleton } from '@/components/ui/skeleton'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  fallbackPath?: string
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallbackPath = '/dashboard' 
}: RoleGuardProps) {
  const { user, isLoading, hasRole } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/signin')
    } else if (!isLoading && user && !hasRole(allowedRoles)) {
      router.push(fallbackPath)
    }
  }, [user, isLoading, allowedRoles, router, fallbackPath, hasRole])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (!user || !hasRole(allowedRoles)) {
    return null
  }

  return <>{children}</>
}
