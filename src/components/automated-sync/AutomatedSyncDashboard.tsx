'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Bot, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Activity,
  TrendingUp,
  Users,
  Zap,
  Settings,
  Play,
  Pause,
  BarChart3
} from 'lucide-react'
import { toast } from 'sonner'

interface SyncStatus {
  isRunning: boolean
  lastRun: string | null
  nextRun: string | null
  totalProcessed: number
  newLeads: number
  existingLeads: number
  errors: number
  successRate: number
}

interface SyncStats {
  today: {
    processed: number
    newLeads: number
    existingLeads: number
    errors: number
  }
  thisWeek: {
    processed: number
    newLeads: number
    existingLeads: number
    errors: number
  }
  healthScore: number
}

export function AutomatedSyncDashboard() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isRunning: false,
    lastRun: null,
    nextRun: null,
    totalProcessed: 0,
    newLeads: 0,
    existingLeads: 0,
    errors: 0,
    successRate: 100
  })
  
  const [syncStats, setSyncStats] = useState<SyncStats>({
    today: { processed: 0, newLeads: 0, existingLeads: 0, errors: 0 },
    thisWeek: { processed: 0, newLeads: 0, existingLeads: 0, errors: 0 },
    healthScore: 100
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [isManualSync, setIsManualSync] = useState(false)

  useEffect(() => {
    fetchSyncStatus()
    fetchSyncStats()
    
    // Set up real-time updates
    const interval = setInterval(() => {
      fetchSyncStatus()
    }, 30000) // Update every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  const fetchSyncStatus = async () => {
    try {
      // This would be an API call to get sync status
      // const response = await api.get('/automated-sync/status')
      // setSyncStatus(response.data)
      
      // Mock data for now
      setSyncStatus({
        isRunning: false,
        lastRun: '2024-01-15T10:30:00Z',
        nextRun: '2024-01-15T10:45:00Z',
        totalProcessed: 45,
        newLeads: 12,
        existingLeads: 8,
        errors: 2,
        successRate: 95.6
      })
    } catch (error) {
      console.error('Failed to fetch sync status:', error)
    }
  }

  const fetchSyncStats = async () => {
    try {
      // This would be an API call to get sync stats
      // const response = await api.get('/automated-sync/stats')
      // setSyncStats(response.data)
      
      // Mock data for now
      setSyncStats({
        today: { processed: 45, newLeads: 12, existingLeads: 8, errors: 2 },
        thisWeek: { processed: 234, newLeads: 67, existingLeads: 45, errors: 12 },
        healthScore: 95.6
      })
      
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to fetch sync stats:', error)
      setIsLoading(false)
    }
  }

  const handleManualSync = async () => {
    setIsManualSync(true)
    try {
      // This would trigger a manual sync
      // await api.post('/automated-sync/trigger')
      
      toast.success('Manual sync triggered successfully')
      setTimeout(() => {
        fetchSyncStatus()
        setIsManualSync(false)
      }, 2000)
    } catch (error) {
      toast.error('Failed to trigger manual sync')
      setIsManualSync(false)
    }
  }

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getHealthBadgeVariant = (score: number) => {
    if (score >= 90) return 'default'
    if (score >= 70) return 'secondary'
    return 'destructive'
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            Automated Lead Sync
          </h2>
          <p className="text-gray-600">AI-powered lead synchronization to catch webhook failures</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleManualSync}
            disabled={isManualSync || syncStatus.isRunning}
            className="flex items-center gap-2"
          >
            {isManualSync ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isManualSync ? 'Syncing...' : 'Manual Sync'}
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sync Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {syncStatus.isRunning ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Running
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Pause className="h-3 w-3" />
                  Idle
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {syncStatus.lastRun ? `Last run: ${new Date(syncStatus.lastRun).toLocaleTimeString()}` : 'Never run'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getHealthColor(syncStats.healthScore)}`}>
                {syncStats.healthScore.toFixed(1)}%
              </span>
              <Badge variant={getHealthBadgeVariant(syncStats.healthScore)}>
                {syncStats.healthScore >= 90 ? 'Excellent' : 
                 syncStats.healthScore >= 70 ? 'Good' : 'Needs Attention'}
              </Badge>
            </div>
            <Progress value={syncStats.healthScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{syncStats.today.processed}</div>
            <p className="text-xs text-muted-foreground">
              {syncStats.today.newLeads} new, {syncStats.today.existingLeads} existing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{syncStatus.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {syncStatus.errors} errors today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Weekly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Processed</span>
                <span className="text-lg font-bold">{syncStats.thisWeek.processed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">New Leads</span>
                <span className="text-lg font-bold text-green-600">{syncStats.thisWeek.newLeads}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Existing Leads</span>
                <span className="text-lg font-bold text-primary">{syncStats.thisWeek.existingLeads}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Errors</span>
                <span className="text-lg font-bold text-red-600">{syncStats.thisWeek.errors}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Automation Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Sync Frequency</span>
                <Badge variant="outline">Every 15 minutes</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Lookback Period</span>
                <Badge variant="outline">2 hours</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Next Scheduled Run</span>
                <span className="text-sm text-muted-foreground">
                  {syncStatus.nextRun ? new Date(syncStatus.nextRun).toLocaleTimeString() : 'Not scheduled'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Monitoring</span>
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Sync completed successfully</p>
                  <p className="text-xs text-gray-600">12 new leads, 8 existing leads processed</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">2 minutes ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">High error rate detected</p>
                  <p className="text-xs text-gray-600">3 consecutive sync failures</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">15 minutes ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Bot className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Automated sync started</p>
                  <p className="text-xs text-gray-600">Processing leads from last 2 hours</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">30 minutes ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
