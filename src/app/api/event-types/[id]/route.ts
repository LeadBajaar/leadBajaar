import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: any
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Call Laravel backend API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/event-types/${params.id}`,
      {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch event type')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching event type:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event type' },
      { status: 500 }
    )
  }
} 