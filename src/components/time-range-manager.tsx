'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Clock, 
  Plus, 
  X, 
  Calendar,
  Info,
  Save
} from 'lucide-react'

interface TimeRange {
  dayOfWeek: number
  dayName: string
  startTime: string
  endTime: string
}

interface TimeRangeManagerProps {
  timeRanges: TimeRange[]
  onTimeRangesChange: (timeRanges: TimeRange[]) => void
  onSave: () => void
}

export function TimeRangeManager({ timeRanges, onTimeRangesChange, onSave }: TimeRangeManagerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const daysOfWeek = [
    { value: 0, name: 'Sunday' },
    { value: 1, name: 'Monday' },
    { value: 2, name: 'Tuesday' },
    { value: 3, name: 'Wednesday' },
    { value: 4, name: 'Thursday' },
    { value: 5, name: 'Friday' },
    { value: 6, name: 'Saturday' }
  ]

  const updateTimeRange = (dayOfWeek: number, field: 'startTime' | 'endTime', value: string) => {
    const newTimeRanges = timeRanges.map(range => 
      range.dayOfWeek === dayOfWeek 
        ? { ...range, [field]: value }
        : range
    )
    onTimeRangesChange(newTimeRanges)
  }

  const toggleDay = (dayOfWeek: number) => {
    const existingRange = timeRanges.find(range => range.dayOfWeek === dayOfWeek)
    
    if (existingRange) {
      // Remove the time range
      const newTimeRanges = timeRanges.filter(range => range.dayOfWeek !== dayOfWeek)
      onTimeRangesChange(newTimeRanges)
    } else {
      // Add a new time range with default values
      const newTimeRanges = [...timeRanges, {
        dayOfWeek,
        dayName: daysOfWeek.find(d => d.value === dayOfWeek)?.name || '',
        startTime: '19:00',
        endTime: '22:00'
      }]
      onTimeRangesChange(newTimeRanges)
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  const validateTimeRange = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    
    return endMinutes > startMinutes
  }

  const hasInvalidRanges = timeRanges.some(range => 
    range.startTime && range.endTime && !validateTimeRange(range.startTime, range.endTime)
  )

  if (!isOpen) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Button 
            onClick={() => setIsOpen(true)}
            className="w-full"
            variant="outline"
          >
            <Clock className="w-4 h-4 mr-2" />
            Manage Playing Hours
            {timeRanges.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {timeRanges.length} days
              </Badge>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Manage Playing Hours
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
      <CardContent className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">⏰ What are Playing Hours?</h4>
          <p className="text-sm text-blue-800 mb-3">
            Set your available time ranges for each day of the week. This helps DMs know when you're available to play, 
            even if you mark a whole day as available.
          </p>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• <strong>For example:</strong> Available Mondays 6PM-10PM, Saturdays 2PM-6PM</p>
            <p>• <strong>Benefits:</strong> More precise scheduling for DMs</p>
            <p>• <strong>Flexible:</strong> Set different hours for different days</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {daysOfWeek.map((day) => {
              const timeRange = timeRanges.find(range => range.dayOfWeek === day.value)
              
              return (
                <Card key={day.value} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="flex items-center gap-2 cursor-pointer" onClick={() => toggleDay(day.value)}>
                        <Checkbox
                          checked={!!timeRange}
                          onCheckedChange={() => toggleDay(day.value)}
                        />
                        <span className="font-medium">{day.name}</span>
                      </Label>
                      {timeRange && (
                        <Badge variant="outline" className="text-xs">
                          {formatTime(timeRange.startTime)} - {formatTime(timeRange.endTime)}
                        </Badge>
                      )}
                    </div>
                    
                    {timeRange && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label htmlFor={`start-${day.value}`} className="text-xs">Start Time</Label>
                            <Input
                              id={`start-${day.value}`}
                              type="time"
                              value={timeRange.startTime}
                              onChange={(e) => updateTimeRange(day.value, 'startTime', e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`end-${day.value}`} className="text-xs">End Time</Label>
                            <Input
                              id={`end-${day.value}`}
                              type="time"
                              value={timeRange.endTime}
                              onChange={(e) => updateTimeRange(day.value, 'endTime', e.target.value)}
                              className="text-sm"
                            />
                          </div>
                        </div>
                        
                        {!validateTimeRange(timeRange.startTime, timeRange.endTime) && (
                          <div className="text-xs text-red-500 bg-red-50 p-2 rounded">
                            End time must be after start time
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {hasInvalidRanges && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              ⚠️ Please fix invalid time ranges before saving
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={onSave}
            disabled={hasInvalidRanges || timeRanges.length === 0}
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Time Ranges
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const newTimeRanges = daysOfWeek.map(day => ({
                dayOfWeek: day.value,
                dayName: day.name,
                startTime: '19:00',
                endTime: '22:00'
              }))
              onTimeRangesChange(newTimeRanges)
            }}
          >
            Reset to Default
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 <strong>Tip:</strong> Set your typical gaming hours for each day</p>
          <p>💡 <strong>DMs can see:</strong> Your general availability + specific time preferences</p>
          <p>💡 <strong>Better scheduling:</strong> Helps avoid conflicts and plan better sessions</p>
        </div>
      </CardContent>
    </Card>
  )
}