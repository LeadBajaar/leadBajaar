"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getUser } from '@/lib/api'
import { logger } from '@/utils/logger'

import { User, UserRole, UserType } from '@/lib/api/types/auth.types';

export type { UserRole, UserType, User };

interface UserContextType {
  user: User | null
  isLoading: boolean
  hasRole: (roles: UserRole[]) => boolean
  hasType: (types: UserType[]) => boolean
  hasPlan: (plans: string[]) => boolean
  hasFeature: (feature: string) => boolean
  hasAddon: (addonKey: string) => boolean
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
        logger.error('Failed to fetch user', error)
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

  const hasPlan = (plans: string[]) => {
    if (!user || !user.company?.plan) return false;
    return plans.map(p => p.toLowerCase()).includes(user.company.plan.toLowerCase());
  }

  const hasFeature = (feature: string) => {
    if (!user) return false;
    
    // Super Admin always has all features
    const normalizedRole = user.role?.toLowerCase().replace(/_/g, ' ');
    if (normalizedRole === 'super admin' || user.user_type === 'super_admin') return true;
    
    // Check if feature exists in plan_details
    const planFeatures = user.company?.plan_details?.features;
    
    // Structured format: { display: [], permissions: { key: roles } }
    if (planFeatures && typeof planFeatures === 'object' && !Array.isArray(planFeatures)) {
      const permissions = (planFeatures as any).permissions || {};
      const allowedRoles = permissions[feature];
      
      if (!allowedRoles) return false;
      if (allowedRoles.includes('*')) return true;
      
      // Normalize role for comparison
      const userRole = user.role.toLowerCase().replace(/_/g, ' ');
      return allowedRoles.some((r: string) => r.toLowerCase().replace(/_/g, ' ') === userRole);
    }

    // Fallback for legacy simple array format
    if (Array.isArray(planFeatures)) {
      return planFeatures.includes(feature);
    }
    
    return false;
  }

  const hasAddon = (addonKey: string) => {
    if (!user) return false;

    // Super Admin always has full access to all features and add-ons
    const normalizedRole = user.role?.toLowerCase().replace(/_/g, ' ');
    if (normalizedRole === 'super admin' || user.user_type === 'super_admin') return true;

    // Check company settings or addons for this addon flag (allowed by Admin or purchased)
    const company = user.company;
    if (!company) return false;

    if (addonKey === 'is_email_enabled' || addonKey === 'email_feature') {
      if (company.is_email_enabled !== undefined) {
        return company.is_email_enabled === true;
      }
    }

    if (company.addons && company.addons[addonKey] !== undefined) {
      return company.addons[addonKey] === true;
    }

    const settings = company.settings;
    if (!settings) return false;

    return settings[addonKey] === true || settings.addons?.[addonKey] === true;
  }

  return (
    <UserContext.Provider value={{ user, isLoading, hasRole, hasType, hasPlan, hasFeature, hasAddon }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
