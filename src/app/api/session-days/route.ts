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

    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get('gameId')

    if (!gameId) {
      return NextResponse.json(
        { success: false, error: 'Game ID is required' },
        { status: 400 }
      )
    }

    // Verify user owns this game
    const game = await db.game.findUnique({
      where: { id: gameId },
      select: { dmId: true }
    })

    if (!game || game.dmId !== payload.userId) {
      return NextResponse.json(
        { success: false, error: 'Game not found or access denied' },
        { status: 404 }
      )
    }

    // Get session days for this game
    const sessionDays = await db.gameSessionDay.findMany({
      where: { gameId },
      orderBy: { date: 'asc' }
    })

    return NextResponse.json({
      success: true,
      sessionDays
    })
  } catch (error) {
    console.error('Error fetching session days:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch session days' },
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
    const { gameId, sessionDays } = body

    if (!gameId || !Array.isArray(sessionDays)) {
      return NextResponse.json(
        { success: false, error: 'Game ID and session days array are required' },
        { status: 400 }
      )
    }

    // Verify user owns this game
    const game = await db.game.findUnique({
      where: { id: gameId },
      select: { dmId: true }
    })

    if (!game || game.dmId !== payload.userId) {
      return NextResponse.json(
        { success: false, error: 'Game not found or access denied' },
        { status: 404 }
      )
    }

    // Create session days
    const createdSessionDays = await db.$transaction(async (tx) => {
      const results = []
      for (const sessionDay of sessionDays) {
        const created = await tx.gameSessionDay.create({
          data: {
            gameId,
            date: sessionDay.date,
            startTime: sessionDay.startTime || null,
            endTime: sessionDay.endTime || null,
            notes: sessionDay.notes || null
          }
        })
        results.push(created)
      }
      return results
    })

    return NextResponse.json({
      success: true,
      message: 'Session days created successfully',
      sessionDays: createdSessionDays
    })
  } catch (error) {
    console.error('Error creating session days:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create session days' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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
    const { sessionId, updates } = body

    if (!sessionId || !updates) {
      return NextResponse.json(
        { success: false, error: 'Session ID and updates are required' },
        { status: 400 }
      )
    }

    // Verify session belongs to user's game
    const sessionDay = await db.gameSessionDay.findFirst({
      where: {
        id: sessionId
      },
      include: {
        game: {
          select: { dmId: true }
        }
      }
    })

    if (!sessionDay || sessionDay.game.dmId !== payload.userId) {
      return NextResponse.json(
        { success: false, error: 'Session day not found or access denied' },
        { status: 404 }
      )
    }

    // Update session day
    const updatedSessionDay = await db.gameSessionDay.update({
      where: { id: sessionId },
      data: updates
    })

    return NextResponse.json({
      success: true,
      message: 'Session day updated successfully',
      sessionDay: updatedSessionDay
    })
  } catch (error) {
    console.error('Error updating session day:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update session day' },
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
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Verify session belongs to user's game
    const sessionDay = await db.gameSessionDay.findFirst({
      where: {
        id: sessionId
      },
      include: {
        game: {
          select: { dmId: true }
        }
      }
    })

    if (!sessionDay || sessionDay.game.dmId !== payload.userId) {
      return NextResponse.json(
        { success: false, error: 'Session day not found or access denied' },
        { status: 404 }
      )
    }

    // Delete session day
    await db.gameSessionDay.delete({
      where: { id: sessionId }
    })

    return NextResponse.json({
      success: true,
      message: 'Session day deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting session day:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete session day' },
      { status: 500 }
    )
  }
}