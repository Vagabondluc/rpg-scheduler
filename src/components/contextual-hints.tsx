'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lightbulb, X, ArrowRight, ArrowLeft, ArrowUp } from 'lucide-react'

interface Hint {
  id: string
  title: string
  content: string
  type: 'tip' | 'warning' | 'info' | 'success'
  position: { x: number; y: number }
  target?: string
  action?: {
    text: string
    onClick: () => void
  }
  dismissible: boolean
}

interface ContextualHintsProps {
  currentTab: string
  isFirstTime: boolean
  hasMarkedAvailability: boolean
  hasCreatedGames: boolean
  hasSubscribedGames: boolean
  onDismiss: (hintId: string) => void
}

export function ContextualHints({ 
  currentTab, 
  isFirstTime, 
  hasMarkedAvailability, 
  hasCreatedGames, 
  hasSubscribedGames,
  onDismiss 
}: ContextualHintsProps) {
  const [dismissedHints, setDismissedHints] = useState<Set<string>>(new Set())
  const [visibleHints, setVisibleHints] = useState<Hint[]>([])

  useEffect(() => {
    const hints: Hint[] = []

    // First-time user hints
    if (isFirstTime) {
      hints.push({
        id: 'welcome',
        title: '🎉 Welcome to D&D Game Manager!',
        content: 'This tool helps you coordinate D&D sessions with your group. Start by marking your availability, then create or join games!',
        type: 'success',
        position: { x: 50, y: 20 },
        dismissible: true
      })
    }

    // Tab-specific hints
    if (currentTab === 'my-availability') {
      if (!hasMarkedAvailability) {
        hints.push({
          id: 'mark-availability',
          title: '💡 Start with Your Availability',
          content: 'Click on calendar dates to mark when you can play. Green = available, Red = unavailable, Gray = not decided.',
          type: 'tip',
          position: { x: 50, y: 40 },
          target: '.calendar-grid',
          dismissible: true
        })
      } else {
        hints.push({
          id: 'save-availability',
          title: '👍 Great! Now Save Your Progress',
          content: 'Don\'t forget to save your availability so others can see it and DMs can plan sessions.',
          type: 'info',
          position: { x: 50, y: 80 },
          target: '.save-button',
          action: {
            text: 'Save Now',
            onClick: () => {
              const saveButton = document.querySelector('.save-button') as HTMLButtonElement
              saveButton?.click()
            }
          },
          dismissible: true
        })
      }
    }

    if (currentTab === 'games') {
      if (!hasCreatedGames) {
        hints.push({
          id: 'create-game',
          title: '🎮 Create Your First Game',
          content: 'As a DM, you can create campaigns with custom schedules. Players can then join your games!',
          type: 'tip',
          position: { x: 50, y: 30 },
          target: '.create-game-button',
          dismissible: true
        })
      }
      
      if (!hasSubscribedGames && hasCreatedGames) {
        hints.push({
          id: 'join-games',
          title: '👥 Join Other Games',
          content: 'While waiting for players to join your game, explore what others are running. Great way to meet the community!',
          type: 'info',
          position: { x: 50, y: 50 },
          dismissible: true
        })
      }
    }

    if (currentTab === 'group-view') {
      hints.push({
        id: 'group-coordination',
        title: '👁️ Coordinate with Your Group',
        content: 'See everyone\'s availability at a glance. Perfect for finding the best days for group sessions.',
        type: 'tip',
        position: { x: 50, y: 30 },
        dismissible: true
      })
    }

    // Filter out dismissed hints
    const activeHints = hints.filter(hint => !dismissedHints.has(hint.id))
    setVisibleHints(activeHints)
  }, [currentTab, isFirstTime, hasMarkedAvailability, hasCreatedGames, hasSubscribedGames, dismissedHints])

  const handleDismiss = (hintId: string) => {
    setDismissedHints(prev => new Set(prev).add(hintId))
    onDismiss(hintId)
  }

  const getHintIcon = (type: Hint['type']) => {
    switch (type) {
      case 'success':
        return '🎉'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      case 'tip':
        return '💡'
      default:
        return '💡'
    }
  }

  const getHintColors = (type: Hint['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'tip':
        return 'bg-purple-50 border-purple-200 text-purple-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  if (visibleHints.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-40 space-y-2 max-w-sm">
      {visibleHints.map((hint, index) => (
        <Card 
          key={hint.id} 
          className={`${getHintColors(hint.type)} shadow-lg animate-in slide-in-from-bottom-2 duration-300`}
          style={{
            maxWidth: '300px',
            animation: `slideInUp 0.3s ease-out ${index * 0.1}s both`
          }}
        >
          <CardContent className="p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getHintIcon(hint.type)}</span>
                <h4 className="font-medium text-sm">{hint.title}</h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismiss(hint.id)}
                className="h-6 w-6 p-0 hover:bg-black/10"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            
            <p className="text-xs leading-relaxed">{hint.content}</p>
            
            {hint.action && (
              <Button
                size="sm"
                onClick={hint.action.onClick}
                className="w-full text-xs"
              >
                {hint.action.text}
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Progress indicator for user onboarding
interface OnboardingProgressProps {
  completedSteps: string[]
  totalSteps: string[]
  currentStep?: string
}

export function OnboardingProgress({ completedSteps, totalSteps, currentStep }: OnboardingProgressProps) {
  const progress = (completedSteps.length / totalSteps.length) * 100

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm">Getting Started</h3>
          <Badge variant="outline" className="text-xs">
            {completedSteps.length}/{totalSteps.length} Complete
          </Badge>
        </div>
        
        <div className="space-y-2">
          {totalSteps.map((step, index) => {
            const isCompleted = completedSteps.includes(step)
            const isCurrent = currentStep === step
            
            return (
              <div 
                key={step}
                className={`flex items-center gap-2 p-2 rounded text-xs ${
                  isCompleted ? 'bg-green-50 text-green-700' : 
                  isCurrent ? 'bg-blue-50 text-blue-700 border border-blue-200' : 
                  'bg-gray-50 text-gray-500'
                }`}
              >
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-white ${
                  isCompleted ? 'bg-green-500' : 
                  isCurrent ? 'bg-blue-500' : 
                  'bg-gray-300'
                }`}>
                  {isCompleted ? '✓' : index + 1}
                </div>
                <span className="flex-1">{step}</span>
              </div>
            )
          })}
        </div>
        
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-center">
            {Math.round(progress)}% Complete
          </p>
        </div>
      </CardContent>
    </Card>
  )
}