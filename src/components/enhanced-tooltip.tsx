'use client'

import { useState } from 'react'
import { 
  Tooltip as ShadcnTooltip,
  TooltipContent as ShadcnTooltipContent,
  TooltipProvider as ShadcnTooltipProvider,
  TooltipTrigger as ShadcnTooltipTrigger,
} from '@/components/ui/tooltip'

interface EnhancedTooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  className?: string
}

export function EnhancedTooltip({ 
  children, 
  content, 
  side = 'top', 
  delay = 500,
  className = ''
}: EnhancedTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <ShadcnTooltipProvider delayDuration={delay}>
      <ShadcnTooltip open={isOpen} onOpenChange={setIsOpen}>
        <ShadcnTooltipTrigger asChild>
          {children}
        </ShadcnTooltipTrigger>
        <ShadcnTooltipContent 
          side={side} 
          className={`max-w-sm z-50 ${className}`}
          avoidCollisions={true}
        >
          {content}
        </ShadcnTooltipContent>
      </ShadcnTooltip>
    </ShadcnTooltipProvider>
  )
}

// Specific tooltip components for different contexts
interface CalendarTooltipProps {
  date: string
  availability: 'available' | 'unavailable' | null
  hasGames?: boolean
  gameCount?: number
}

export function CalendarTooltip({ date, availability, hasGames, gameCount }: CalendarTooltipProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <EnhancedTooltip content={
      <div className="space-y-2">
        <div className="font-medium">{formatDate(date)}</div>
        <div className="text-sm space-y-1">
          {availability === 'available' && (
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>You're available to play</span>
            </div>
          )}
          {availability === 'unavailable' && (
            <div className="flex items-center gap-2 text-red-600">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>You're unavailable</span>
            </div>
          )}
          {availability === null && (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-3 h-3 border-2 border-gray-300 rounded-full"></div>
              <span>Not marked yet</span>
            </div>
          )}
          {hasGames && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>{gameCount} game{gameCount !== 1 ? 's' : ''} scheduled</span>
            </div>
          )}
          <div className="text-xs text-muted-foreground pt-1 border-t">
            Click to cycle: Unmarked → Available → Unavailable → Clear
          </div>
        </div>
      </div>
    }>
      <div className="w-full h-full" />
    </EnhancedTooltip>
  )
}

interface GameButtonTooltipProps {
  isSubscribed: boolean
  isFull: boolean
  isDM: boolean
  currentPlayers: number
  maxPlayers?: number
}

export function GameButtonTooltip({ 
  isSubscribed, 
  isFull, 
  isDM, 
  currentPlayers, 
  maxPlayers 
}: GameButtonTooltipProps) {
  return (
    <EnhancedTooltip content={
      <div className="space-y-2 text-sm">
        {isDM && (
          <div className="flex items-center gap-2 text-purple-600">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>This is your game (you're the DM)</span>
          </div>
        )}
        {isSubscribed && !isDM && (
          <div className="flex items-center gap-2 text-green-600">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>You're subscribed to this game</span>
          </div>
        )}
        {!isSubscribed && !isFull && !isDM && (
          <div className="flex items-center gap-2 text-blue-600">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Click to join this game</span>
          </div>
        )}
        {isFull && !isSubscribed && !isDM && (
          <div className="flex items-center gap-2 text-red-600">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Game is full ({maxPlayers} players max)</span>
          </div>
        )}
        <div className="text-xs text-muted-foreground pt-1 border-t">
          Players: {currentPlayers}{maxPlayers && `/${maxPlayers}`}
        </div>
      </div>
    }>
      <div className="w-full h-full" />
    </EnhancedTooltip>
  )
}

interface StatBadgeTooltipProps {
  type: 'total' | 'available' | 'unavailable' | 'undecided'
  count: number
  total?: number
}

export function StatBadgeTooltip({ type, count, total }: StatBadgeTooltipProps) {
  const getTooltipContent = () => {
    switch (type) {
      case 'total':
        return {
          title: 'Total Days',
          description: 'Total number of days in the selected date range',
          color: 'text-gray-600'
        }
      case 'available':
        return {
          title: 'Available Days',
          description: 'Days you marked as available to play D&D',
          color: 'text-green-600'
        }
      case 'unavailable':
        return {
          title: 'Unavailable Days',
          description: 'Days you marked as unavailable for D&D',
          color: 'text-red-600'
        }
      case 'undecided':
        return {
          title: 'Undecided Days',
          description: 'Days you haven\'t marked yet (click to set availability)',
          color: 'text-gray-600'
        }
      default:
        return {
          title: 'Unknown',
          description: 'Statistical information',
          color: 'text-gray-600'
        }
    }
  }

  const tooltip = getTooltipContent()

  return (
    <EnhancedTooltip content={
      <div className="space-y-1">
        <div className={`font-medium ${tooltip.color}`}>{tooltip.title}</div>
        <div className="text-xs text-muted-foreground">{tooltip.description}</div>
        {total && (
          <div className="text-xs text-muted-foreground">
            {Math.round((count / total) * 100)}% of total days
          </div>
        )}
      </div>
    }>
      <div className="w-full h-full" />
    </EnhancedTooltip>
  )
}