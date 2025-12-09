'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  Plus, 
  X, 
  ChevronDown,
  Calendar
} from 'lucide-react'

interface TimeRange {
  dayOfWeek: number // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string
  endTime: string
}

interface TimeRangeMenuProps {
  userId: string
  currentDayOfWeek?: number
  onTimeRangeUpdate: (dayOfWeek: number, timeRange: Omit<TimeRange, 'dayOfWeek'>) => void
  onTimeRangeDelete: (dayOfWeek: number) => void
  existingTimeRanges?: TimeRange[]
}

export function TimeRangeMenu({ 
  userId, 
  currentDayOfWeek,
  onTimeRangeUpdate, 
  onTimeRangeDelete,
  existingTimeRanges = []
}: TimeRangeMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [timeRanges, setTimeRanges] = useState<TimeRange[]>(existingTimeRanges)
  const [newRange, setNewRange] = useState<Partial<TimeRange>>({
    startTime: '19:00',
    endTime: '22:00'
  })
  const [editingDay, setEditingDay] = useState<number | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleAddTimeRange = () => {
    if (editingDay !== null && newRange.startTime && newRange.endTime) {
      onTimeRangeUpdate(editingDay, {
        startTime: newRange.startTime,
        endTime: newRange.endTime
      })
      
      setNewRange({
        startTime: '19:00',
        endTime: '22:00'
      })
      setEditingDay(null)
    }
  }

  const handleDeleteTimeRange = (dayOfWeek: number) => {
    if (confirm(`Remove time range for ${dayNames[dayOfWeek]}?`)) {
      onTimeRangeDelete(dayOfWeek)
    }
  }

  const handleEditTimeRange = (dayOfWeek: number, timeRange: TimeRange) => {
    setEditingDay(dayOfWeek)
    setNewRange({
      startTime: timeRange.startTime,
      endTime: timeRange.endTime
    })
  }

  const formatTimeRange = (timeRange: TimeRange) => {
    return `${timeRange.startTime} - ${timeRange.endTime}`
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Time Availability</span>
          {timeRanges.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {timeRanges.length} range{timeRanges.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-gray-200 rounded-md shadow-lg w-80 max-h-96 overflow-y-auto">
          <div className="p-4">
            <div className="space-y-4">
              {/* Current Day Highlight */}
              {currentDayOfWeek !== undefined && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-900">
                      Currently viewing: {dayNames[currentDayOfWeek]}
                    </span>
                  </div>
                </div>
              )}

              {/* Add New Time Range */}
              <div className="border-b pb-4">
                <h4 className="font-medium mb-3">Add Time Range</h4>
                {editingDay === null ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-7 gap-2">
                      {dayNames.map((day, index) => (
                        <Button
                          key={day}
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingDay(index)}
                          className={`h-8 text-xs ${currentDayOfWeek === index ? 'ring-2 ring-blue-500' : ''}`}
                        >
                          {day.substring(0, 3)}
                        </Button>
                      ))}
                    </div>
                    
                    {editingDay !== null && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium mb-2">
                          Set hours for {dayNames[editingDay]}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Start Time</Label>
                            <Input
                              type="time"
                              value={newRange.startTime}
                              onChange={(e) => setNewRange(prev => ({ ...prev, startTime: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>End Time</Label>
                            <Input
                              type="time"
                              value={newRange.endTime}
                              onChange={(e) => setNewRange(prev => ({ ...prev, endTime: e.target.value }))}
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={handleAddTimeRange}
                            disabled={!newRange.startTime || !newRange.endTime}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Range
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingDay(null)
                              setNewRange({
                                startTime: '19:00',
                                endTime: '22:00'
                              })
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Clock className="w-4 h-4" />
                    Adding range for {dayNames[editingDay]}...
                  </div>
                )}
              </div>

              {/* Existing Time Ranges */}
              {timeRanges.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium mb-3">Current Time Ranges</h4>
                  <div className="space-y-2">
                    {timeRanges
                      .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                      .map((timeRange) => (
                        <div
                          key={timeRange.dayOfWeek}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-800">
                              {dayNames[timeRange.dayOfWeek].substring(0, 3)}
                            </div>
                            <div>
                              <div className="font-medium text-sm">
                                {dayNames[timeRange.dayOfWeek]}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatTimeRange(timeRange)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditTimeRange(timeRange.dayOfWeek, timeRange)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteTimeRange(timeRange.dayOfWeek)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Help Text */}
              <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                <p className="mb-2">
                  <strong>How time ranges work:</strong>
                </p>
                <ul className="space-y-1 ml-4">
                  <li>• Set your available hours for each day of the week</li>
                  <li>• These ranges apply to all weeks unless specified otherwise</li>
                  <li>• DMs can see your availability when planning sessions</li>
                  <li>• More specific ranges help with session scheduling</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}