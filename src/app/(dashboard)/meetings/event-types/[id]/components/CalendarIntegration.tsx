import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { CalendarService } from '@/lib/services/calendar'
import { toast } from 'sonner'

interface Props {
  eventType: any
  updateEventType: (updates: any) => void
}

export const CalendarIntegration = ({ eventType, updateEventType }: Props) => {
  const calendarService = new CalendarService()

  const handleConnect = async (type: 'google' | 'outlook' | 'apple') => {
    try {
      const success = await calendarService.connectCalendar(type)
      if (success) {
        toast.success("Calendar Connected", {
          description: `Successfully connected ${type} calendar`,
        })
        updateEventType({
          ...eventType,
          calendar: {
            ...eventType.calendar,
            [type]: { connected: true }
          }
        })
      }
    } catch (error) {
      toast.error("Error", {
        description: `Failed to connect ${type} calendar`,
      })
    }
  }

  const handleDisconnect = async (type: 'google' | 'outlook' | 'apple') => {
    try {
      const success = await calendarService.disconnectCalendar(type)
      if (success) {
        toast.success("Calendar Disconnected", {
          description: `Successfully disconnected ${type} calendar`,
        })
        updateEventType({
          ...eventType,
          calendar: {
            ...eventType.calendar,
            [type]: { connected: false }
          }
        })
      }
    } catch (error) {
      toast.error("Error", {
        description: `Failed to disconnect ${type} calendar`,
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar Integration</CardTitle>
        <CardDescription>
          Connect your calendars to automatically check availability and create events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Google Calendar</h3>
            <p className="text-sm text-muted-foreground">
              {eventType.calendar?.google?.connected ? 
                'Connected' : 'Not connected'}
            </p>
          </div>
          {eventType.calendar?.google?.connected ? (
            <Button 
              variant="outline" 
              onClick={() => handleDisconnect('google')}
            >
              Disconnect
            </Button>
          ) : (
            <Button 
              variant="default" 
              onClick={() => handleConnect('google')}
            >
              Connect
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Outlook Calendar</h3>
            <p className="text-sm text-muted-foreground">
              {eventType.calendar?.outlook?.connected ? 
                'Connected' : 'Not connected'}
            </p>
          </div>
          {eventType.calendar?.outlook?.connected ? (
            <Button 
              variant="outline" 
              onClick={() => handleDisconnect('outlook')}
            >
              Disconnect
            </Button>
          ) : (
            <Button 
              variant="default" 
              onClick={() => handleConnect('outlook')}
            >
              Connect
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Apple Calendar</h3>
            <p className="text-sm text-muted-foreground">
              {eventType.calendar?.apple?.connected ? 
                'Connected' : 'Not connected'}
            </p>
          </div>
          {eventType.calendar?.apple?.connected ? (
            <Button 
              variant="outline" 
              onClick={() => handleDisconnect('apple')}
            >
              Disconnect
            </Button>
          ) : (
            <Button 
              variant="default" 
              onClick={() => handleConnect('apple')}
            >
              Connect
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Check for Conflicts</h3>
              <p className="text-sm text-muted-foreground">
                Automatically check connected calendars for conflicts
              </p>
            </div>
            <Switch
              checked={eventType.calendar?.checkConflicts}
              onCheckedChange={(checked) => 
                updateEventType({
                  ...eventType,
                  calendar: {
                    ...eventType.calendar,
                    checkConflicts: checked
                  }
                })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 