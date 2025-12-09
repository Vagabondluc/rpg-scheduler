'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  HelpCircle, 
  Calendar, 
  Users, 
  Gamepad2, 
  CheckCircle, 
  XCircle,
  UserPlus,
  Crown,
  Clock,
  Target,
  Lightbulb
} from 'lucide-react'

interface HelpGuideProps {
  isOpen: boolean
  onClose: () => void
}

export function HelpGuide({ isOpen, onClose }: HelpGuideProps) {
  const [activeTab, setActiveTab] = useState('getting-started')

  if (!isOpen) return null

  const guides = {
    'getting-started': {
      title: 'Getting Started',
      icon: <Lightbulb className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">🎯 Quick Start (3 Steps)</h4>
            <ol className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                <span><strong>Mark Your Availability:</strong> Click dates in the calendar - green for available, red for unavailable</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                <span><strong>Browse or Create Games:</strong> Join existing games or create your own as a DM</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                <span><strong>Coordinate with Your Group:</strong> See who's available and subscribed to each game</span>
              </li>
            </ol>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium">📋 Key Concepts</h4>
            <div className="grid gap-3">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <strong>Availability Calendar:</strong>
                  <p className="text-sm text-muted-foreground">Mark when you can play D&D. Click dates to cycle: Unmarked → Available → Unavailable → Clear</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Gamepad2 className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <strong>Games:</strong>
                  <p className="text-sm text-muted-foreground">DMs create games with specific dates or "always available". Players join these games.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <strong>Group View:</strong>
                  <p className="text-sm text-muted-foreground">See everyone's availability and game subscriptions in one place.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    'availability': {
      title: 'Managing Availability',
      icon: <Calendar className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium">📅 How to Mark Availability</h4>
            <div className="bg-gray-50 border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <div className="w-12 h-12 mx-auto border-2 border-gray-300 rounded-full"></div>
                  <p className="font-medium">Unmarked</p>
                  <p className="text-xs text-muted-foreground">Click once to mark as available</p>
                </div>
                <div className="space-y-2">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                  <p className="font-medium">Available</p>
                  <p className="text-xs text-muted-foreground">Click again to mark as unavailable</p>
                </div>
                <div className="space-y-2">
                  <XCircle className="w-12 h-12 mx-auto text-red-500" />
                  <p className="font-medium">Unavailable</p>
                  <p className="text-xs text-muted-foreground">Click again to clear</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">📊 Understanding Statistics</h4>
            <div className="grid gap-2">
              <Badge variant="outline" className="justify-start">
                <span className="w-20">Total:</span>
                <span>All days in selected range</span>
              </Badge>
              <Badge className="bg-green-100 text-green-800 justify-start">
                <span className="w-20">Available:</span>
                <span>Days you can play</span>
              </Badge>
              <Badge className="bg-red-100 text-red-800 justify-start">
                <span className="w-20">Unavailable:</span>
                <span>Days you can't play</span>
              </Badge>
              <Badge variant="secondary" className="justify-start">
                <span className="w-20">Undecided:</span>
                <span>Days you haven't marked</span>
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">💡 Pro Tips</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Use the Date Range Picker to focus on specific campaign periods</li>
              <li>• Save your availability frequently to avoid losing changes</li>
              <li>• Mark your availability early so DMs can plan accordingly</li>
              <li>• Use "This Month" preset for quick session planning</li>
            </ul>
          </div>
        </div>
      )
    },
    'games': {
      title: 'Creating & Joining Games',
      icon: <Gamepad2 className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium">🎮 For Dungeon Masters (DMs)</h4>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="font-medium text-green-900 mb-3">Creating Your Game</h5>
              <ol className="space-y-2 text-sm text-green-800">
                <li><strong>Game Name:</strong> Give your campaign a memorable title</li>
                <li><strong>Description:</strong> Explain the adventure, level, or style</li>
                <li><strong>Schedule:</strong> Choose specific dates OR "Always Available"</li>
                <li><strong>Player Limit:</strong> Set max players (optional)</li>
              </ol>
            </div>
            
            <div className="space-y-2">
              <h5 className="font-medium">Game Types</h5>
              <div className="grid gap-3">
                <div className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <strong>Date-Ranged Games</strong>
                  </div>
                  <p className="text-sm">Perfect for limited campaigns or one-shot adventures with specific schedules.</p>
                </div>
                <div className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-green-500" />
                    <strong>Always Available Games</strong>
                  </div>
                  <p className="text-sm">Great for ongoing campaigns where players join whenever they're available.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">👥 For Players</h4>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-3">Joining Games</h5>
              <ol className="space-y-2 text-sm text-blue-800">
                <li><strong>Browse Games:</strong> Look for interesting campaigns in the Games tab</li>
                <li><strong>Check Details:</strong> Review game info, DM, and player count</li>
                <li><strong>Click "Join":</strong> Subscribe to games you want to play</li>
                <li><strong>Mark Availability:</strong> Update your personal calendar for those dates</li>
              </ol>
            </div>
            
            <div className="space-y-2">
              <h5 className="font-medium">Understanding Game Stats</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Available Players:</strong> People who marked themselves as available</li>
                <li>• <strong>Subscribed Players:</strong> People who joined the game</li>
                <li>• <strong>Progress Bar:</strong> Shows what percentage of available players have joined</li>
                <li>• <strong>Hover over dates:</strong> See detailed player lists and availability</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    'group-view': {
      title: 'Group Coordination',
      icon: <Users className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium">👁️ Understanding Group View</h4>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-800 mb-3">
                Group View shows everyone's availability and game subscriptions in one comprehensive calendar. Perfect for DMs to plan sessions and players to see group availability.
              </p>
              
              <div className="grid gap-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <strong>Green:</strong> Player is available and/or subscribed to games
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                  <div>
                    <strong>Red:</strong> Player is unavailable
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full mt-0.5"></div>
                  <div>
                    <strong>Gray:</strong> Player hasn't marked availability yet
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">🎯 Planning Sessions</h4>
            <div className="space-y-2 text-sm">
              <div className="border-l-4 border-blue-500 pl-4">
                <strong>For DMs:</strong> Look for dates with many green checkmarks - these are ideal for scheduling sessions
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <strong>For Players:</strong> Keep your availability updated to help DMs plan better
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">💡 Coordination Tips</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Use the Date Range Picker to focus on specific campaign periods</li>
              <li>• DMs should create games 1-2 weeks before planned sessions</li>
              <li>• Players should update availability at least 1 week in advance</li>
              <li>• Check game tooltips to see exactly who's available each day</li>
              <li>• Use the statistics to find the best days for group sessions</li>
            </ul>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            How to Use D&D Game Manager
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 border-b pb-4">
              {Object.entries(guides).map(([key, guide]) => (
                <Button
                  key={key}
                  variant={activeTab === key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(key)}
                  className="flex items-center gap-2"
                >
                  {guide.icon}
                  {guide.title}
                </Button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              {guides[activeTab as keyof typeof guides].content}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}