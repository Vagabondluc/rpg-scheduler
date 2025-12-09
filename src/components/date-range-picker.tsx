'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, RotateCcw } from 'lucide-react'

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onApplyRange: () => void
}

export function DateRangePicker({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange, 
  onApplyRange 
}: DateRangePickerProps) {
  const getToday = () => {
    return new Date().toISOString().split('T')[0]
  }

  const getMaxFutureDate = (yearsAhead = 10) => {
    const now = new Date()
    const max = new Date(now.getFullYear() + yearsAhead, 11, 31)
    return max.toISOString().split('T')[0]
  }

  const getThisMonth = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return {
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0]
    }
  }

  const getNextMonth = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 2, 0)
    return {
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0]
    }
  }

  const getThisYear = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), 0, 1)
    const lastDay = new Date(now.getFullYear(), 11, 31)
    return {
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0]
    }
  }

  const applyPreset = (preset: { start: string; end: string }) => {
    onStartDateChange(preset.start)
    onEndDateChange(preset.end)
  }

  const isValidRange = () => {
    return startDate && endDate && new Date(startDate) <= new Date(endDate)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="w-5 h-5" />
          Date Range Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              max={endDate || getMaxFutureDate(10)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              min={startDate}
              max={getMaxFutureDate(10)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Quick Presets</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset(getThisMonth())}
            >
              This Month
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset(getNextMonth())}
            >
              Next Month
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset(getThisYear())}
            >
              This Year
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = getToday()
                onStartDateChange(today)
                onEndDateChange(today)
              }}
            >
              Today
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={onApplyRange}
            disabled={!isValidRange()}
            className="flex-1"
          >
            Apply Date Range
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyPreset(getThisMonth())}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {!isValidRange() && startDate && endDate && (
          <p className="text-sm text-red-500">
            Invalid date range: End date must be after or equal to start date
          </p>
        )}

        {startDate && endDate && isValidRange() && (
          <p className="text-sm text-muted-foreground">
            Selected: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
            {(() => {
              const start = new Date(startDate)
              const end = new Date(endDate)
              const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
              return ` (${days} days)`
            })()}
          </p>
        )}
      </CardContent>
    </Card>
  )
}