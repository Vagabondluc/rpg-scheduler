'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  Gamepad2, 
  Users, 
  Calendar, 
  UserPlus, 
  UserMinus,
  Crown,
  CheckCircle,
  XCircle,
  Clock,
  CalendarDays
} from 'lucide-react'
import { SessionDayManager } from './session-day-manager'

interface Player {
  id: string
  name?: string
  email: string
}

interface Game {
  id: string
  name: string
  description?: string
  dm: {
    id: string
    name?: string
    email: string
  }
  startDate?: string
  endDate?: string
  isAlwaysAvailable: boolean
  maxPlayers?: number
  totalSubscriptions: number
  availabilityByDate: Array<{
    date: string
    totalAvailable: number
    subscribedPlayers: Array<{
      id: string
      name?: string
      email: string
    }>
    availablePlayers: Array<{
      id: string
      name?: string
      email: string
    }>
    sessionDay?: {
      date: string
      startTime?: string
      endTime?: string
      notes?: string
      isConfirmed: boolean
    }
  }>
}

interface GameStatsProps {
  games: Game[]
  currentUserId: string
  onSubscribe: (gameId: string) => void
  onUnsubscribe: (gameId: string) => void
  onRefresh: () => void
  dateRange: { start: string; end: string }
}

export function GameStats({ games, currentUserId, onSubscribe, onUnsubscribe, onRefresh, dateRange }: GameStatsProps) {
  const [expandedGames, setExpandedGames] = useState<Set<string>>(new Set())
  const [subscribedGames, setSubscribedGames] = useState<Set<string>>(new Set())
  const [sessionManagerOpen, setSessionManagerOpen] = useState<string | null>(null)
  const [sessionDays, setSessionDays] = useState<any[]>([])

  const toggleGameExpansion = (gameId: string) => {
    setExpandedGames(prev => {
      const newSet = new Set(prev)
      if (newSet.has(gameId)) {
        newSet.delete(gameId)
      } else {
        newSet.add(gameId)
      }
      return newSet
    })
  }

  const loadSessionDays = async (gameId: string) => {
    try {
      const response = await fetch(`/api/session-days?gameId=${gameId}`)
      const data = await response.json()
      if (data.success) {
        setSessionDays(data.sessionDays || [])
      }
    } catch (error) {
      console.error('Error loading session days:', error)
    }
  }

  const saveSessionDays = async (gameId: string, newSessionDays: any[]) => {
    try {
      const response = await fetch('/api/session-days', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameId, sessionDays: newSessionDays }),
      })
      
      const data = await response.json()
      if (data.success) {
        setSessionDays(newSessionDays)
        onRefresh()
      }
    } catch (error) {
      console.error('Error saving session days:', error)
      alert('Error saving session days')
    }
  }

  const handleSubscribe = async (gameId: string) => {
    try {
      const response = await fetch('/api/games/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameId }),
      })

      const data = await response.json()
      if (data.success) {
        setSubscribedGames(prev => new Set(prev).add(gameId))
        onRefresh()
      } else {
        alert(data.error || 'Failed to subscribe to game')
      }
    } catch (error) {
      console.error('Error subscribing to game:', error)
      alert('Network error')
    }
  }

  const handleUnsubscribe = async (gameId: string) => {
    try {
      const response = await fetch(`/api/games/subscribe?gameId=${gameId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (data.success) {
        setSubscribedGames(prev => {
          const newSet = new Set(prev)
          newSet.delete(gameId)
          return newSet
        })
        onRefresh()
      } else {
        alert(data.error || 'Failed to unsubscribe from game')
      }
    } catch (error) {
      console.error('Error unsubscribing from game:', error)
      alert('Network error')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    })
  }

  const isUserSubscribed = (gameId: string) => {
    return subscribedGames.has(gameId)
  }

  const isUserDM = (game: Game) => {
    return game.dm.id === currentUserId
  }

  if (games.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No games created yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {games.map((game) => (
        <Card key={game.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Gamepad2 className="w-5 h-5" />
                  {game.name}
                  {isUserDM(game) && (
                    <Badge variant="secondary" className="ml-2">
                      <Crown className="w-3 h-3 mr-1" />
                      Your Game
                    </Badge>
                  )}
                </CardTitle>
                {game.description && (
                  <p className="text-sm text-muted-foreground mt-1">{game.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Crown className="w-4 h-4" />
                    DM: {game.dm.name || game.dm.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {game.totalSubscriptions}
                    {game.maxPlayers && `/${game.maxPlayers}`} players
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {game.isAlwaysAvailable ? (
                      <span>Always available</span>
                    ) : (
                      <span>
                        {game.startDate && formatDate(game.startDate)} - {game.endDate && formatDate(game.endDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {!isUserDM(game) && (
                  <Button
                    size="sm"
                    variant={isUserSubscribed(game.id) ? "destructive" : "default"}
                    onClick={() => 
                      isUserSubscribed(game.id) 
                        ? handleUnsubscribe(game.id)
                        : handleSubscribe(game.id)
                    }
                    disabled={game.maxPlayers && game.totalSubscriptions >= game.maxPlayers && !isUserSubscribed(game.id)}
                  >
                    {isUserSubscribed(game.id) ? (
                      <>
                        <UserMinus className="w-4 h-4 mr-1" />
                        Leave
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-1" />
                        Join
                      </>
                    )}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleGameExpansion(game.id)}
                >
                  {expandedGames.has(game.id) ? 'Hide' : 'Show'} Details
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {expandedGames.has(game.id) && (
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {game.availabilityByDate.map((dayData) => {
                    const subscribedCount = dayData.subscribedPlayers.length
                    const availableCount = dayData.totalAvailable
                    const percentage = availableCount > 0 ? (subscribedCount / availableCount) * 100 : 0
                    
                    return (
                      <TooltipProvider key={dayData.date}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={`
                              border rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer
                              ${dayData.sessionDay ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'}
                              ${dayData.sessionDay?.isConfirmed ? 'bg-green-100 border-green-300' : ''}
                            `}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm">
                                  {formatDate(dayData.date)}
                                </span>
                                <div className="flex items-center gap-1">
                                  {dayData.sessionDay?.isConfirmed && (
                                    <Badge className="text-xs bg-green-100 text-green-800">
                                      <CalendarDays className="w-3 h-3 mr-1" />
                                      Session Day
                                    </Badge>
                                  )}
                                  {dayData.sessionDay && !dayData.sessionDay.isConfirmed && (
                                    <Badge className="text-xs bg-blue-100 text-blue-800">
                                      <Clock className="w-3 h-3 mr-1" />
                                      Planned
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span>Available:</span>
                                  <span className="font-medium">{availableCount}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span>Subscribed:</span>
                                  <span className="font-medium text-green-600">{subscribedCount}</span>
                                </div>
                                
                                {availableCount > 0 && (
                                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                    <div 
                                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${Math.min(percentage, 100)}%` }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <div className="space-y-2">
                              <p className="font-medium">{formatDate(dayData.date)}</p>
                              <div className="space-y-1">
                                <p className="text-sm">
                                  <strong>Available Players ({availableCount}):</strong>
                                </p>
                                {dayData.availablePlayers.length > 0 ? (
                                  <ul className="text-xs space-y-1">
                                    {dayData.availablePlayers.map((player) => (
                                      <li key={player.id} className="flex items-center gap-1">
                                        {dayData.subscribedPlayers.some(sub => sub.id === player.id) ? (
                                          <CheckCircle className="w-3 h-3 text-green-500" />
                                        ) : (
                                          <div className="w-3 h-3 rounded-full border border-gray-300" />
                                        )}
                                        {player.name || player.email}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-xs text-gray-500">No available players</p>
                                )}
                              </div>
                              
                              {subscribedCount > 0 && (
                                <div className="pt-2 border-t">
                                  <p className="text-sm">
                                    <strong>Subscribed Players ({subscribedCount}):</strong>
                                  </p>
                                  <ul className="text-xs space-y-1">
                                    {dayData.subscribedPlayers.map((player) => (
                                      <li key={player.id} className="flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                        {player.name || player.email}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {dayData.sessionDay && (
                                <div className="pt-2 border-t">
                                  <p className="text-sm font-medium text-purple-800">
                                    🎲 {dayData.sessionDay.isConfirmed ? 'Confirmed' : 'Planned'} Session
                                  </p>
                                  {dayData.sessionDay.startTime && (
                                    <p className="text-xs text-purple-700">
                                      Time: {dayData.sessionDay.startTime} - {dayData.sessionDay.endTime}
                                    </p>
                                  )}
                                  {dayData.sessionDay.notes && (
                                    <p className="text-xs text-purple-700">
                                      Notes: {dayData.sessionDay.notes}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}