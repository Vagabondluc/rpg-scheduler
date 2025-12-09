import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

// Generate dates between start and end dates (inclusive)
function generateDateRange(startDate: string, endDate: string): string[] {
  const dates = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    dates.push(date.toISOString().split('T')[0])
  }
  
  return dates
}

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

    // Get date range from query params or use user's saved range
    const { searchParams } = new URL(request.url)
    let startDate = searchParams.get('startDate')
    let endDate = searchParams.get('endDate')

    // If no date range provided, get user's saved range or default
    if (!startDate || !endDate) {
      const userSettings = await db.dateRangeSettings.findUnique({
        where: { userId: payload.userId }
      })

      if (userSettings) {
        startDate = userSettings.startDate
        endDate = userSettings.endDate
      } else {
        // Default to current month
        const now = new Date()
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        startDate = firstDay.toISOString().split('T')[0]
        endDate = lastDay.toISOString().split('T')[0]
      }
    }

    const dates = generateDateRange(startDate, endDate)

    // Get all users with their availabilities for the date range
    const users = await db.user.findMany({
      include: {
        availabilities: {
          where: {
            date: {
              in: dates
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Format the response
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      availabilities: user.availabilities.reduce((acc, avail) => {
        acc[avail.date] = avail.isAvailable
        return acc
      }, {} as Record<string, boolean>)
    }))

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      dates,
      startDate,
      endDate
    })
  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch availability' },
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
    const { availabilities, startDate, endDate } = body

    if (!availabilities || typeof availabilities !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid availability data' },
        { status: 400 }
      )
    }

    // Save date range settings if provided
    if (startDate && endDate) {
      await db.dateRangeSettings.upsert({
        where: { userId: payload.userId },
        update: { startDate, endDate },
        create: { userId: payload.userId, startDate, endDate }
      })
    }

    const dates = generateDateRange(startDate, endDate)
    const validAvailabilities = Object.entries(availabilities).filter(([date]) => 
      dates.includes(date)
    )

    // Update, create, or delete availability records
    await db.$transaction(async (tx) => {
      for (const [date, isAvailable] of validAvailabilities) {
        // If user cleared availability (null), delete any existing record
        if (isAvailable === null) {
          await tx.availability.deleteMany({
            where: { userId: payload.userId, date }
          })
          continue
        }

        // Otherwise upsert with explicit boolean
        await tx.availability.upsert({
          where: {
            userId_date: {
              userId: payload.userId,
              date: date
            }
          },
          update: {
            isAvailable: Boolean(isAvailable)
          },
          create: {
            userId: payload.userId,
            date: date,
            isAvailable: Boolean(isAvailable)
          }
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Availability saved successfully'
    })
  } catch (error) {
    console.error('Error saving availability:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save availability' },
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

    // Get date range from query params or user's saved range
    const { searchParams } = new URL(request.url)
    let startDate = searchParams.get('startDate')
    let endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      const userSettings = await db.dateRangeSettings.findUnique({
        where: { userId: payload.userId }
      })

      if (userSettings) {
        startDate = userSettings.startDate
        endDate = userSettings.endDate
      } else {
        // Default to current month
        const now = new Date()
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        startDate = firstDay.toISOString().split('T')[0]
        endDate = lastDay.toISOString().split('T')[0]
      }
    }

    const dates = generateDateRange(startDate, endDate)

    // Delete all availabilities for the user in the date range
    await db.availability.deleteMany({
      where: {
        userId: payload.userId,
        date: {
          in: dates
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'All availability data cleared'
    })
  } catch (error) {
    console.error('Error clearing availability:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clear availability' },
      { status: 500 }
    )
  }
}