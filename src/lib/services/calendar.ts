import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import { logger } from '@/utils/logger'

interface CalendarProvider {
  type: 'google' | 'outlook' | 'apple'
  connected: boolean
  email?: string
  primaryCalendarId?: string
  selectedCalendarIds?: string[]
}

interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  attendees: string[]
  location?: string
  meetingLink?: string
  calendarId?: string
}

interface CalendarCredentials {
  accessToken: string
  refreshToken?: string
  expiryDate?: number
}

export class CalendarService {
  private providers: Map<string, CalendarProvider> = new Map()
  private googleAuth: OAuth2Client

  constructor() {
    this.googleAuth = new OAuth2Client(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
    )
  }

  async listCalendars(type: 'google' | 'outlook' | 'apple', credentials: CalendarCredentials) {
    try {
      switch (type) {
        case 'google':
          this.googleAuth.setCredentials({
            access_token: credentials.accessToken,
            refresh_token: credentials.refreshToken,
            expiry_date: credentials.expiryDate
          })

          const calendar = google.calendar({ version: 'v3', auth: this.googleAuth })
          const response = await calendar.calendarList.list()
          
          return response.data.items?.map(cal => ({
            id: cal.id,
            name: cal.summary,
            primary: cal.primary || false,
            selected: cal.selected || false,
            timezone: cal.timeZone
          }))

        // Add other calendar providers here
        default:
          throw new Error('Unsupported calendar provider')
      }
    } catch (error) {
      logger.error('Error listing calendars', error)
      throw error
    }
  }

  async checkBusyTimes(
    type: 'google' | 'outlook' | 'apple',
    credentials: CalendarCredentials,
    calendarIds: string[],
    startTime: string,
    endTime: string,
    timezone: string
  ) {
    try {
      switch (type) {
        case 'google':
          this.googleAuth.setCredentials({
            access_token: credentials.accessToken,
            refresh_token: credentials.refreshToken,
            expiry_date: credentials.expiryDate
          })

          const calendar = google.calendar({ version: 'v3', auth: this.googleAuth })
          const response = await calendar.freebusy.query({
            requestBody: {
              timeMin: new Date(startTime).toISOString(),
              timeMax: new Date(endTime).toISOString(),
              timeZone: timezone,
              items: calendarIds.map(id => ({ id }))
            }
          })

          return response.data.calendars

        // Add other calendar providers here
        default:
          throw new Error('Unsupported calendar provider')
      }
    } catch (error) {
      logger.error('Error checking busy times', error)
      throw error
    }
  }

  async createEvent(
    type: 'google' | 'outlook' | 'apple',
    credentials: CalendarCredentials,
    event: Omit<CalendarEvent, 'id'>
  ): Promise<string> {
    try {
      switch (type) {
        case 'google':
          this.googleAuth.setCredentials({
            access_token: credentials.accessToken,
            refresh_token: credentials.refreshToken,
            expiry_date: credentials.expiryDate
          })

          const calendar = google.calendar({ version: 'v3', auth: this.googleAuth })
          const response = await calendar.events.insert({
            calendarId: event.calendarId || 'primary',
            requestBody: {
              summary: event.title,
              description: event.description,
              start: {
                dateTime: new Date(event.startTime).toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
              },
              end: {
                dateTime: new Date(event.endTime).toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
              },
              attendees: event.attendees.map(email => ({ email })),
              location: event.location,
              conferenceData: event.meetingLink ? {
                createRequest: {
                  requestId: Date.now().toString(),
                  conferenceSolutionKey: { type: 'hangoutsMeet' }
                }
              } : undefined
            },
            conferenceDataVersion: event.meetingLink ? 1 : 0
          })

          return response.data.id || ''

        // Add other calendar providers here
        default:
          throw new Error('Unsupported calendar provider')
      }
    } catch (error) {
      logger.error('Error creating event', error)
      throw error
    }
  }

  async updateEvent(
    type: 'google' | 'outlook' | 'apple',
    credentials: CalendarCredentials,
    event: CalendarEvent
  ): Promise<void> {
    try {
      switch (type) {
        case 'google':
          this.googleAuth.setCredentials({
            access_token: credentials.accessToken,
            refresh_token: credentials.refreshToken,
            expiry_date: credentials.expiryDate
          })

          const calendar = google.calendar({ version: 'v3', auth: this.googleAuth })
          await calendar.events.update({
            calendarId: event.calendarId || 'primary',
            eventId: event.id,
            requestBody: {
              summary: event.title,
              description: event.description,
              start: {
                dateTime: new Date(event.startTime).toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
              },
              end: {
                dateTime: new Date(event.endTime).toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
              },
              attendees: event.attendees.map(email => ({ email })),
              location: event.location
            }
          })
          break

        // Add other calendar providers here
        default:
          throw new Error('Unsupported calendar provider')
      }
    } catch (error) {
      logger.error('Error updating event', error)
      throw error
    }
  }

  async deleteEvent(
    type: 'google' | 'outlook' | 'apple',
    credentials: CalendarCredentials,
    eventId: string,
    calendarId?: string
  ): Promise<void> {
    try {
      switch (type) {
        case 'google':
          this.googleAuth.setCredentials({
            access_token: credentials.accessToken,
            refresh_token: credentials.refreshToken,
            expiry_date: credentials.expiryDate
          })

          const calendar = google.calendar({ version: 'v3', auth: this.googleAuth })
          await calendar.events.delete({
            calendarId: calendarId || 'primary',
            eventId
          })
          break

        // Add other calendar providers here
        default:
          throw new Error('Unsupported calendar provider')
      }
    } catch (error) {
      logger.error('Error deleting event', error)
      throw error
    }
  }

  async connectCalendar(type: 'google' | 'outlook' | 'apple'): Promise<boolean> {
    try {
      switch (type) {
        case 'google':
          const response = await fetch('/api/calendar/google');
          const { url } = await response.json();
          window.location.href = url;
          return true;

        // Add other calendar providers here
        default:
          throw new Error('Unsupported calendar provider');
      }
    } catch (error) {
      logger.error('Error connecting calendar', error);
      throw error;
    }
  }

  async disconnectCalendar(type: 'google' | 'outlook' | 'apple'): Promise<boolean> {
    try {
      const response = await fetch(`/api/calendar/${type}/disconnect`, {
        method: 'POST'
      });
      return response.ok;
    } catch (error) {
      logger.error('Error disconnecting calendar', error);
      throw error;
    }
  }
} 