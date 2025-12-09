'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Gamepad2, Plus, X } from 'lucide-react'

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
}

interface GameCreatorProps {
  onGameCreated: (game: Game) => void
  startDate: string
  endDate: string
}

export function GameCreator({ onGameCreated, startDate, endDate }: GameCreatorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isAlwaysAvailable: false,
    gameStartDate: startDate,
    gameEndDate: endDate,
    maxPlayers: ''
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          startDate: formData.isAlwaysAvailable ? null : formData.gameStartDate,
          endDate: formData.isAlwaysAvailable ? null : formData.gameEndDate,
          isAlwaysAvailable: formData.isAlwaysAvailable,
          maxPlayers: formData.maxPlayers ? parseInt(formData.maxPlayers) : null
        }),
      })

      const data = await response.json()
      if (data.success) {
        onGameCreated(data.game)
        setIsOpen(false)
        setFormData({
          name: '',
          description: '',
          isAlwaysAvailable: false,
          gameStartDate: startDate,
          gameEndDate: endDate,
          maxPlayers: ''
        })
      } else {
        setError(data.error || 'Failed to create game')
      }
    } catch (error) {
      console.error('Error creating game:', error)
      setError('Network error')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Button 
            onClick={() => setIsOpen(true)}
            className="w-full"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Game
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5" />
            Create New Game
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="game-name">Game Name *</Label>
            <Input
              id="game-name"
              placeholder="Enter your game name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="game-description">Description</Label>
            <Textarea
              id="game-description"
              placeholder="Describe your game (optional)"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="always-available"
              checked={formData.isAlwaysAvailable}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, isAlwaysAvailable: checked as boolean }))
              }
            />
            <Label htmlFor="always-available" className="text-sm">
              Always available (no date restrictions)
            </Label>
          </div>

          {!formData.isAlwaysAvailable && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="game-start-date">Start Date</Label>
                <Input
                  id="game-start-date"
                  type="date"
                  value={formData.gameStartDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, gameStartDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="game-end-date">End Date</Label>
                <Input
                  id="game-end-date"
                  type="date"
                  value={formData.gameEndDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, gameEndDate: e.target.value }))}
                  min={formData.gameStartDate}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="max-players">Maximum Players (optional)</Label>
            <Input
              id="max-players"
              type="number"
              placeholder="Leave empty for no limit"
              min="1"
              value={formData.maxPlayers}
              onChange={(e) => setFormData(prev => ({ ...prev, maxPlayers: e.target.value }))}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="flex-1"
            >
              {isLoading ? 'Creating...' : 'Create Game'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}