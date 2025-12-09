import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Get user's time ranges
    const timeRanges = await db.timeRange.findMany({
      where: { userId: payload.userId },
      orderBy: { dayOfWeek: 'asc' }
    })

    return NextResponse.json({
      success: true,
      timeRanges
    })
  } catch (error) {
    console.error('Error fetching time ranges:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch time ranges' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { dayOfWeek, startTime, endTime } = body

    if (dayOfWeek === undefined || startTime === undefined || endTime === undefined) {
      return NextResponse.json(
        { success: false, error: 'Day of week, start time, and end time are required' },
        { status: 400 }
      )
    }

    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json(
        { success: false, error: 'Day of week must be between 0 (Sunday) and 6 (Saturday)' },
        { status: 400 }
      )
    }

    // Create or update time range
    const timeRange = await db.timeRange.upsert({
      where: {
        userId_dayOfWeek: {
          userId: payload.userId,
          dayOfWeek: dayOfWeek
        }
      },
      update: {
        startTime,
        endTime
      },
      create: {
        userId: payload.userId,
        dayOfWeek,
        startTime,
        endTime
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Time range saved successfully',
      timeRange
    })
  } catch (error) {
    console.error('Error saving time range:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save time range' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const dayOfWeek = searchParams.get('dayOfWeek')

    if (dayOfWeek === null) {
      return NextResponse.json(
        { success: false, error: 'Day of week is required' },
        { status: 400 }
      )
    }

    const dayOfWeekNum = parseInt(dayOfWeek)
    if (isNaN(dayOfWeekNum) || dayOfWeekNum < 0 || dayOfWeekNum > 6) {
      return NextResponse.json(
        { success: false, error: 'Day of week must be between 0 (Sunday) and 6 (Saturday)' },
        { status: 400 }
      )
    }

    // Delete time range
    const deletedTimeRange = await db.timeRange.deleteMany({
      where: {
        userId: payload.userId,
        dayOfWeek: dayOfWeekNum
      }
    })

    if (deletedTimeRange.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Time range not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Time range deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting time range:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete time range' },
      { status: 500 }
    )
  }
}