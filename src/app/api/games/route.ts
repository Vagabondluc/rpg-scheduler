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

    // Get date range from query params
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

    // Get all games with subscriptions, session days, and user details
    const games = await db.game.findMany({
      include: {
        dm: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        subscriptions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        sessionDays: {
          orderBy: {
            date: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get user availabilities for the date range
    const userAvailabilities = await db.availability.findMany({
      where: {
        date: {
          in: dates
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Format games with availability data
    const formattedGames = games.map(game => {
      // Filter subscriptions based on game date range
      const relevantSubscriptions = game.subscriptions.filter(sub => {
        if (game.isAlwaysAvailable) return true
        
        const gameStart = game.startDate
        const gameEnd = game.endDate
        if (!gameStart || !gameEnd) return true
        
        // Check if subscription overlaps with the selected date range
        return gameStart <= endDate && gameEnd >= startDate
      })

      // Calculate availability for each date in the range
      const availabilityByDate = dates.map(date => {
        const availablePlayers = userAvailabilities
          .filter(avail => avail.date === date && avail.isAvailable)
          .map(avail => avail.user)

        const subscribedPlayers = relevantSubscriptions
          .filter(sub => 
            availablePlayers.some(player => player.id === sub.user.id)
          )
          .map(sub => sub.user)

        // Find any sessionDay scheduled for this game on this date
        const sessionDay = (game.sessionDays || []).find(sd => sd.date === date) || null

        return {
          date,
          totalAvailable: availablePlayers.length,
          subscribedPlayers,
          availablePlayers,
          sessionDay
        }
      })

      return {
        id: game.id,
        name: game.name,
        description: game.description,
        dm: game.dm,
        startDate: game.startDate,
        endDate: game.endDate,
        isAlwaysAvailable: game.isAlwaysAvailable,
        maxPlayers: game.maxPlayers,
        totalSubscriptions: relevantSubscriptions.length,
        availabilityByDate
      }
    })

    return NextResponse.json({
      success: true,
      games: formattedGames,
      dates,
      startDate,
      endDate
    })
  } catch (error) {
    console.error('Error fetching games:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch games' },
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
    const { name, description, startDate, endDate, isAlwaysAvailable, maxPlayers } = body

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Game name is required' },
        { status: 400 }
      )
    }

    // Validate date range
    if (!isAlwaysAvailable && startDate && endDate) {
      if (new Date(startDate) > new Date(endDate)) {
        return NextResponse.json(
          { success: false, error: 'End date must be after start date' },
          { status: 400 }
        )
      }
    }

    const game = await db.game.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        dmId: payload.userId,
        startDate: isAlwaysAvailable ? null : startDate || null,
        endDate: isAlwaysAvailable ? null : endDate || null,
        isAlwaysAvailable: isAlwaysAvailable || false,
        maxPlayers: maxPlayers || null
      },
      include: {
        dm: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Game created successfully',
      game
    })
  } catch (error) {
    console.error('Error creating game:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create game' },
      { status: 500 }
    )
  }
}