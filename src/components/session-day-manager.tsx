'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Trash2,
  Settings
} from 'lucide-react'

interface GameSessionDay {
  id: string
  date: string
  startTime?: string
  endTime?: string
  notes?: string
  isConfirmed: boolean
}

interface SessionDayManagerProps {
  gameId: string
  gameName: string
  sessionDays: GameSessionDay[]
  onSessionDayCreate: (sessionDay: Omit<GameSessionDay, 'id' | 'gameId' | 'createdAt' | 'updatedAt'>) => void
  onSessionDayUpdate: (id: string, updates: Partial<GameSessionDay>) => void
  onSessionDayDelete: (id: string) => void
  onSessionDayConfirm: (id: string) => void
  dates: string[]
}

export function SessionDayManager({ 
  gameId, 
  gameName, 
  sessionDays, 
  onSessionDayCreate, 
  onSessionDayUpdate, 
  onSessionDayDelete, 
  onSessionDayConfirm,
  dates 
}: SessionDayManagerProps) {
  const [isAddingSession, setIsAddingSession] = useState(false)
  const [editingSession, setEditingSession] = useState<string | null>(null)
  const [newSession, setNewSession] = useState({
    date: '',
    startTime: '19:00',
    endTime: '22:00',
    notes: ''
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    })
  }

  const handleAddSession = () => {
    if (!newSession.date) return

    onSessionDayCreate({
      date: newSession.date,
      startTime: newSession.startTime,
      endTime: newSession.endTime,
      notes: newSession.notes || null
    })

    setNewSession({
      date: '',
      startTime: '19:00',
      endTime: '22:00',
      notes: ''
    })
    setIsAddingSession(false)
  }

  const handleConfirmSession = (sessionId: string) => {
    onSessionDayConfirm(sessionId)
  }

  const handleDeleteSession = (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session day?')) {
      onSessionDayDelete(sessionId)
    }
  }

  const getSessionStatus = (session: GameSessionDay) => {
    if (session.isConfirmed) {
      return { status: 'confirmed', color: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle className="w-4 h-4" /> }
    } else {
      return { status: 'planned', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <Clock className="w-4 h-4" /> }
    }
  }

  const getSessionDaysByDate = () => {
    const sessionMap = new Map<string, GameSessionDay>()
    sessionDays.forEach(session => {
      sessionMap.set(session.date, session)
    })
    return sessionMap
  }

  const sessionDaysByDate = getSessionDaysByDate()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Session Days for "{gameName}"
          <Badge variant="outline" className="ml-2">
            {sessionDays.length} session{sessionDays.length !== 1 ? 's' : ''} planned
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Session Day */}
        {!isAddingSession ? (
          <Button
            variant="outline"
            onClick={() => setIsAddingSession(true)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Session Day
          </Button>
        ) : (
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">Schedule New Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session-date">Session Date *</Label>
                  <Input
                    id="session-date"
                    type="date"
                    value={newSession.date}
                    onChange={(e) => setNewSession(prev => ({ ...prev, date: e.target.value }))}
                    min={dates[0]}
                    max={dates[dates.length - 1]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-notes">Session Notes</Label>
                  <Textarea
                    id="session-notes"
                    placeholder="Adventure summary, location, special requirements..."
                    value={newSession.notes}
                    onChange={(e) => setNewSession(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Session Time Range (Optional)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Start Time</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={newSession.startTime}
                      onChange={(e) => setNewSession(prev => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-time">End Time</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={newSession.endTime}
                      onChange={(e) => setNewSession(prev => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleAddSession}
                  disabled={!newSession.date}
                  className="flex-1"
                >
                  Create Session
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingSession(false)
                    setNewSession({
                      date: '',
                      startTime: '19:00',
                      endTime: '22:00',
                      notes: ''
                    })
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Session Days List */}
        {sessionDays.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-medium">Scheduled Sessions</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Confirmed</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-500" />
                  <span>Planned</span>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              {sessionDays
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((session) => {
                  const status = getSessionStatus(session)
                  const isEditing = editingSession === session.id

                  return (
                    <Card 
                      key={session.id} 
                      className={`${status.color} ${isEditing ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {status.icon}
                            <div>
                              <h4 className="font-medium">{formatDate(session.date)}</h4>
                              <div className="text-sm text-muted-foreground">
                                {status.status === 'confirmed' ? 'Confirmed Session Day' : 'Planned Session Day'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            {!session.isConfirmed && (
                              <Button
                                size="sm"
                                onClick={() => handleConfirmSession(session.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Confirm
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingSession(isEditing ? null : session.id)}
                            >
                              <Settings className="w-3 h-3 mr-1" />
                              {isEditing ? 'Cancel' : 'Edit'}
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteSession(session.id)}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>

                        {/* Session Details */}
                        <div className="space-y-2 text-sm">
                          {session.startTime && session.endTime && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-500" />
                              <span>{session.startTime} - {session.endTime}</span>
                            </div>
                          )}
                          
                          {session.notes && (
                            <div className="bg-white/50 p-2 rounded text-sm">
                              <strong>Notes:</strong> {session.notes}
                            </div>
                          )}
                        </div>

                        {/* Edit Mode */}
                        {isEditing && (
                          <div className="mt-4 pt-4 border-t space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Start Time</Label>
                                <Input
                                  type="time"
                                  defaultValue={session.startTime}
                                  onBlur={(e) => onSessionDayUpdate(session.id, { startTime: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>End Time</Label>
                                <Input
                                  type="time"
                                  defaultValue={session.endTime}
                                  onBlur={(e) => onSessionDayUpdate(session.id, { endTime: e.target.value })}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Session Notes</Label>
                              <Textarea
                                defaultValue={session.notes || ''}
                                onBlur={(e) => onSessionDayUpdate(session.id, { notes: e.target.value })}
                                rows={3}
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => setEditingSession(null)}>
                                Done
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4" />
            <p>No session days scheduled yet</p>
            <p className="text-sm">Add session days to let players know when you're planning to run games.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}