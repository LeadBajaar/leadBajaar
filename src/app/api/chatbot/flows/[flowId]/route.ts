import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const API_URL = process.env.API_URL || 'http://localhost:8000/api'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

type RouteProps = {
  params: {
    flowId: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: any
) {
  try {
    const { flowId } = params;
    const response = await fetch(`${API_URL}/chatbot/flows/${flowId}`, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 0 }
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch flow' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: any
) {
  try {
    const body = await request.json()

    const response = await fetch(`${API_URL}/chatbot/flows/${params.flowId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to update flow' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: any
) {
  try {
    const response = await fetch(`${API_URL}/chatbot/flows/${params.flowId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to delete flow' },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 