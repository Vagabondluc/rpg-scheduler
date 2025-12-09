import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

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
    const { gameId } = body

    if (!gameId) {
      return NextResponse.json(
        { success: false, error: 'Game ID is required' },
        { status: 400 }
      )
    }

    // Check if game exists
    const game = await db.game.findUnique({
      where: { id: gameId }
    })

    if (!game) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      )
    }

    // Check if user is already subscribed
    const existingSubscription = await db.gameSubscription.findUnique({
      where: {
        gameId_userId: {
          gameId: gameId,
          userId: payload.userId
        }
      }
    })

    if (existingSubscription) {
      return NextResponse.json(
        { success: false, error: 'Already subscribed to this game' },
        { status: 409 }
      )
    }

    // Check if game has max players limit
    if (game.maxPlayers) {
      const currentSubscriptions = await db.gameSubscription.count({
        where: { gameId: gameId }
      })

      if (currentSubscriptions >= game.maxPlayers) {
        return NextResponse.json(
          { success: false, error: 'Game is full' },
          { status: 409 }
        )
      }
    }

    // Create subscription
    const subscription = await db.gameSubscription.create({
      data: {
        gameId: gameId,
        userId: payload.userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        game: {
          select: {
            id: true,
            name: true,
            dm: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Subscribed to game successfully',
      subscription
    })
  } catch (error) {
    console.error('Error subscribing to game:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to subscribe to game' },
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
    const gameId = searchParams.get('gameId')

    if (!gameId) {
      return NextResponse.json(
        { success: false, error: 'Game ID is required' },
        { status: 400 }
      )
    }

    // Delete subscription
    const deletedSubscription = await db.gameSubscription.deleteMany({
      where: {
        gameId: gameId,
        userId: payload.userId
      }
    })

    if (deletedSubscription.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Unsubscribed from game successfully'
    })
  } catch (error) {
    console.error('Error unsubscribing from game:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to unsubscribe from game' },
      { status: 500 }
    )
  }
}