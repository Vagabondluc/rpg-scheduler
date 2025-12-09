'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Users, 
  UserPlus, 
  LogOut, 
  Gamepad2,
  HelpCircle,
  Crown,
  ArrowRight,
  Info,
  Clock
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { DateRangePicker } from '@/components/date-range-picker'
import { GameCreator } from '@/components/game-creator'
import { GameStats } from '@/components/game-stats'
import { HelpGuide } from '@/components/help-guide'
import { ContextualHints, OnboardingProgress } from '@/components/contextual-hints'
import { 
  EnhancedTooltip, 
  CalendarTooltip, 
  GameButtonTooltip, 
  StatBadgeTooltip 
} from '@/components/enhanced-tooltip'
import { SessionDayManager } from '@/components/session-day-manager'
import { TimeRangeMenu } from '@/components/time-range-menu'

interface User {
  id: string
  email: string
  name?: string
  availabilities: Record<string, boolean>
}

interface AvailabilityData {
  users: User[]
  dates: string[]
  startDate: string
  endDate: string
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
  }>
}

interface GamesData {
  games: Game[]
  dates: string[]
  startDate: string
  endDate: string
}

export default function AvailabilityCalendar() {
  const { user, login, register, logout, isLoading: authLoading } = useAuth()
  const [availabilities, setAvailabilities] = useState<Record<string, boolean | null>>({})
  const [allUsersData, setAllUsersData] = useState<AvailabilityData | null>(null)
  const [gamesData, setGamesData] = useState<GamesData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '', name: '' })
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState('')
  
  // Guidance and help state
  const [showHelp, setShowHelp] = useState(false)
  const [activeTab, setActiveTab] = useState('my-availability')
  const [dismissedHints, setDismissedHints] = useState<Set<string>>(new Set())
  const [currentStep, setCurrentStep] = useState<string | undefined>()
  const [timeRanges, setTimeRanges] = useState<any[]>([])
  const [showTimeRangeManager, setShowTimeRangeManager] = useState(false)
  
  // Date range state
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Onboarding tracking
  const [hasMarkedAvailability, setHasMarkedAvailability] = useState(false)
  const [hasCreatedGames, setHasCreatedGames] = useState(false)
  const [hasSubscribedGames, setHasSubscribedGames] = useState(false)
  const [hasSetTimeRanges, setHasSetTimeRanges] = useState(false)
  const [isFirstTime, setIsFirstTime] = useState(true)

  // Initialize date range to current month
  useEffect(() => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    setStartDate(firstDay.toISOString().split('T')[0])
    setEndDate(lastDay.toISOString().split('T')[0])
    
    // Check if user has completed key actions
    const savedData = localStorage.getItem('dnd-onboarding')
    if (savedData) {
      const data = JSON.parse(savedData)
      setHasMarkedAvailability(data.hasMarkedAvailability || false)
      setHasCreatedGames(data.hasCreatedGames || false)
      setHasSubscribedGames(data.hasSubscribedGames || false)
      setHasSetTimeRanges(data.hasSetTimeRanges || false)
      setIsFirstTime(data.isFirstTime !== false)
    }
  }, [])

  // Track user interactions for onboarding
  useEffect(() => {
    if (Object.values(availabilities).some(v => v !== null)) {
      setHasMarkedAvailability(true)
    }
  }, [availabilities])

  useEffect(() => {
    if (gamesData && gamesData.games.length > 0) {
      const userCreatedGame = gamesData.games.some(game => game.dm.id === user?.id)
      if (userCreatedGame) {
        setHasCreatedGames(true)
      }
      const userSubscribedGame = gamesData.games.some(game => 
        (game.subscriptions || []).some(sub => sub.user.id === user?.id)
      )
      if (userSubscribedGame) {
        setHasSubscribedGames(true)
      }
    }
  }, [gamesData, user])

  // Save onboarding progress
  useEffect(() => {
    const onboardingData = {
      hasMarkedAvailability,
      hasCreatedGames,
      hasSubscribedGames,
      isFirstTime: false
    }
    localStorage.setItem('dnd-onboarding', JSON.stringify(onboardingData))
  }, [hasMarkedAvailability, hasCreatedGames, hasSubscribedGames])

  const generateDates = () => {
    if (!startDate || !endDate) return []
    
    const dates = []
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      dates.push(date.toISOString().split('T')[0])
    }
    
    return dates
  }

  const dates = generateDates()

  const toggleAvailability = (date: string) => {
    if (!user) return
    
    setAvailabilities(prev => {
      const current = prev[date]
      let newValue: boolean | null
      
      if (current === null) {
        newValue = true // First click: available (green)
      } else if (current === true) {
        newValue = false // Second click: unavailable (red)
      } else {
        newValue = null // Third click: clear
      }
      
      return { ...prev, [date]: newValue }
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    })
  }

  const getMonthYear = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric'
    })
  }

  const clearAll = () => {
    setAvailabilities({})
  }

  const getStats = () => {
    const total = dates.length
    const available = Object.values(availabilities).filter(v => v === true).length
    const unavailable = Object.values(availabilities).filter(v => v === false).length
    const undecided = total - available - unavailable
    
    return { total, available, unavailable, undecided }
  }

  const stats = getStats()

  const saveAvailability = async () => {
    if (!user || !startDate || !endDate) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          availabilities, 
          startDate, 
          endDate 
        }),
      })
      
      const data = await response.json()
      if (data.success) {
        await loadAvailability()
        await loadGames()
        alert('Availability saved successfully!')
      } else {
        alert(data.error || 'Error saving availability')
      }
    } catch (error) {
      console.error('Error saving availability:', error)
      alert('Error saving availability')
    } finally {
      setIsLoading(false)
    }
  }

  const loadAvailability = async () => {
    if (!user || !startDate || !endDate) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/availability?startDate=${startDate}&endDate=${endDate}`)
      if (response.ok) {
        const data = await response.json()
        setAllUsersData(data)
        
        // Set current user's availabilities for editing
        const currentUserData = data.users.find((u: User) => u.id === user.id)
        if (currentUserData) {
          const userAvailabilities: Record<string, boolean | null> = {}
          dates.forEach(date => {
            userAvailabilities[date] = currentUserData.availabilities[date] ?? null
          })
          setAvailabilities(userAvailabilities)
        }
      }
    } catch (error) {
      console.error('Error loading availability:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadGames = async () => {
    if (!user || !startDate || !endDate) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/games?startDate=${startDate}&endDate=${endDate}`)
      if (response.ok) {
        const data = await response.json()
        setGamesData(data)
      }
    } catch (error) {
      console.error('Error loading games:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuth = async () => {
    setError('')
    const result = isLogin 
      ? await login(loginForm.email, loginForm.password)
      : await register(loginForm.email, loginForm.password, loginForm.name)
    
    if (!result.success) {
      setError(result.error || 'Authentication failed')
    }
  }

  const handleDismissHint = (hintId: string) => {
    setDismissedHints(prev => new Set(prev).add(hintId))
  }

  // Load data when date range or user changes
  useEffect(() => {
    if (user && startDate && endDate) {
      loadAvailability()
      loadGames()
    }
  }, [user, startDate, endDate])

  // Update current step based on tab and progress
  useEffect(() => {
    const onboardingSteps = [
      'Mark Your Availability',
      'Create or Join a Game', 
      'View Group Calendar'
    ]
    
    if (hasMarkedAvailability && !hasCreatedGames && !hasSubscribedGames) {
      setCurrentStep(onboardingSteps[1])
    } else if (hasCreatedGames || hasSubscribedGames) {
      setCurrentStep(onboardingSteps[2])
    } else if (!hasMarkedAvailability) {
      setCurrentStep(onboardingSteps[0])
    } else {
      setCurrentStep(undefined)
    }
  }, [hasMarkedAvailability, hasCreatedGames, hasSubscribedGames, activeTab])

  // Group dates by month
  const datesByMonth = dates.reduce((acc, date) => {
    const monthYear = getMonthYear(date)
    if (!acc[monthYear]) {
      acc[monthYear] = []
    }
    acc[monthYear].push(date)
    return acc
  }, {} as Record<string, string[]>)

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2">Loading D&D Game Manager...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Gamepad2 className="w-6 h-6" />
              D&D Game Manager
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Coordinate campaigns and manage your gaming group
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={isLogin ? 'login' : 'register'} onValueChange={(value) => setIsLogin(value === 'login')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <div className="space-y-2">
                  <EnhancedTooltip content={
                    <div className="space-y-1">
                      <div className="font-medium">Email Address</div>
                      <div className="text-xs text-muted-foreground">Use the email you registered with</div>
                    </div>
                  }>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </EnhancedTooltip>
                  <EnhancedTooltip content={
                    <div className="space-y-1">
                      <div className="font-medium">Password</div>
                      <div className="text-xs text-muted-foreground">Case-sensitive. Keep it secure!</div>
                    </div>
                  }>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </EnhancedTooltip>
                </div>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4">
                <div className="space-y-2">
                  <EnhancedTooltip content={
                    <div className="space-y-1">
                      <div className="font-medium">Display Name</div>
                      <div className="text-xs text-muted-foreground">Optional - helps other players recognize you</div>
                    </div>
                  }>
                    <Input
                      type="text"
                      placeholder="Your name (optional)"
                      value={loginForm.name}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </EnhancedTooltip>
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <Input
                    type="password"
                    placeholder="Create a password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
              </TabsContent>
            </Tabs>
            
            {error && (
              <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded">
                {error}
              </div>
            )}
            
            <Button onClick={handleAuth} className="w-full">
              {isLogin ? 'Login to Your Account' : 'Create New Account'}
            </Button>
            
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelp(true)}
                className="text-muted-foreground"
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                How does this work?
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Help Button */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="text-center flex-1">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Gamepad2 className="w-6 h-6" />
                D&D Game Manager
              </CardTitle>
              <p className="text-muted-foreground">
                Create games, manage availability, and coordinate with your group
              </p>
            </div>
            <div className="flex items-center gap-2">
              <EnhancedTooltip content={
                <div className="space-y-1">
                  <div className="font-medium">Help & Guide</div>
                  <div className="text-xs text-muted-foreground">Learn how to use all features</div>
                </div>
              }>
                <Button variant="outline" size="sm" onClick={() => setShowHelp(true)}>
                  <HelpCircle className="w-4 h-4" />
                </Button>
              </EnhancedTooltip>
              <EnhancedTooltip content={
                <div className="space-y-1">
                  <div className="font-medium">Logged in as</div>
                  <div className="text-xs text-muted-foreground">{user.name || user.email}</div>
                  <div className="text-xs text-muted-foreground">Click to logout</div>
                </div>
              }>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </EnhancedTooltip>
            </div>
          </CardHeader>
        </Card>

        {/* Onboarding Progress for First-Time Users */}
        {isFirstTime && (
          <OnboardingProgress
            completedSteps={[
              ...(hasMarkedAvailability ? ['Mark Your Availability'] : []),
              ...(hasCreatedGames || hasSubscribedGames ? ['Create or Join a Game'] : []),
              ...(activeTab === 'group-view' ? ['View Group Calendar'] : [])
            ]}
            totalSteps={['Mark Your Availability', 'Create or Join a Game', 'View Group Calendar']}
            currentStep={currentStep}
          />
        )}

        {/* Contextual Hints */}
        <ContextualHints
          currentTab={activeTab}
          isFirstTime={isFirstTime}
          hasMarkedAvailability={hasMarkedAvailability}
          hasCreatedGames={hasCreatedGames}
          hasSubscribedGames={hasSubscribedGames}
          onDismiss={handleDismissHint}
        />

        {/* Date Range Picker */}
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onApplyRange={() => {
            loadAvailability()
            loadGames()
          }}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <EnhancedTooltip content={
              <div className="space-y-1">
                <div className="font-medium">My Availability</div>
                <div className="text-xs text-muted-foreground">Mark when you can play D&D</div>
                <div className="text-xs text-muted-foreground">Click dates: Green=Available, Red=Unavailable</div>
              </div>
            }>
              <TabsTrigger value="my-availability" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                My Availability
              </TabsTrigger>
            </EnhancedTooltip>
            <EnhancedTooltip content={
              <div className="space-y-1">
                <div className="font-medium">Games</div>
                <div className="text-xs text-muted-foreground">Create games as DM or join as player</div>
                <div className="text-xs text-muted-foreground">Manage subscriptions and view statistics</div>
              </div>
            }>
              <TabsTrigger value="games" className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4" />
                Games
              </TabsTrigger>
            </EnhancedTooltip>
            <EnhancedTooltip content={
              <div className="space-y-1">
                <div className="font-medium">Group View</div>
                <div className="text-xs text-muted-foreground">See everyone's availability</div>
                <div className="text-xs text-muted-foreground">Perfect for planning group sessions</div>
              </div>
            }>
              <TabsTrigger value="group-view" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Group View
              </TabsTrigger>
            </EnhancedTooltip>
          </TabsList>

          <TabsContent value="my-availability" className="space-y-6">
            {/* Legend with Enhanced Tooltips */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                  <EnhancedTooltip content={
                    <div className="space-y-1">
                      <div className="font-medium">Not Marked</div>
                      <div className="text-xs text-muted-foreground">Click once to set as available</div>
                    </div>
                  }>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full border-2 border-gray-300"></div>
                      <span>Not marked</span>
                    </div>
                  </EnhancedTooltip>
                  <EnhancedTooltip content={
                    <div className="space-y-1">
                      <div className="font-medium">Available</div>
                      <div className="text-xs text-muted-foreground">You can play D&D on this day</div>
                    </div>
                  }>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                      <span>Available</span>
                    </div>
                  </EnhancedTooltip>
                  <EnhancedTooltip content={
                    <div className="space-y-1">
                      <div className="font-medium">Unavailable</div>
                      <div className="text-xs text-muted-foreground">You cannot play D&D on this day</div>
                    </div>
                  }>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-8 h-8 text-red-500" />
                      <span>Unavailable</span>
                    </div>
                  </EnhancedTooltip>
                </div>
              </CardContent>
            </Card>

            {/* Statistics with Enhanced Tooltips */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <StatBadgeTooltip type="total" count={stats.total} />
                  <StatBadgeTooltip type="available" count={stats.available} total={stats.total} />
                  <StatBadgeTooltip type="unavailable" count={stats.unavailable} total={stats.total} />
                  <StatBadgeTooltip type="undecided" count={stats.undecided} total={stats.total} />
                </div>
              </CardContent>
            </Card>

            {/* Calendar Grid with Enhanced Tooltips */}
            {dates.length > 0 && (
              <div className="space-y-8">
                {Object.entries(datesByMonth).map(([monthYear, monthDates]) => (
                  <Card key={monthYear}>
                    <CardHeader>
                      <CardTitle className="text-lg">{monthYear}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {monthDates.map((date) => {
                          const availability = availabilities[date]
                          
                          return (
                            <CalendarTooltip
                              key={date}
                              date={date}
                              availability={
                                availability === true ? 'available' : 
                                availability === false ? 'unavailable' : null
                              }
                            >
                              <Button
                                variant="outline"
                                className={`
                                  h-20 flex flex-col items-center justify-center p-2 gap-1
                                  transition-all duration-200 hover:scale-105
                                  ${availability === true ? 'bg-green-50 border-green-300 hover:bg-green-100' : ''}
                                  ${availability === false ? 'bg-red-50 border-red-300 hover:bg-red-100' : ''}
                                  ${availability === null ? 'hover:bg-gray-50' : ''}
                                `}
                                onClick={() => toggleAvailability(date)}
                              >
                                <div className="text-xs font-medium text-center">
                                  {formatDate(date).split(',')[0]}
                                </div>
                                <div className="text-xs text-muted-foreground text-center">
                                  {formatDate(date).split(',')[1]}
                                </div>
                                {availability === true && (
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                )}
                                {availability === false && (
                                  <XCircle className="w-5 h-5 text-red-500" />
                                )}
                                {availability === null && (
                                  <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                                )}
                              </Button>
                            </CalendarTooltip>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4 justify-center">
                  <EnhancedTooltip content={
                    <div className="space-y-1">
                      <div className="font-medium">Save Availability</div>
                      <div className="text-xs text-muted-foreground">Stores your availability so others can see it</div>
                    </div>
                  }>
                    <Button
                      onClick={saveAvailability}
                      disabled={isLoading || dates.length === 0}
                      className="bg-blue-600 hover:bg-blue-700 save-button"
                    >
                      {isLoading ? 'Saving...' : 'Save Availability'}
                    </Button>
                  </EnhancedTooltip>
                  <EnhancedTooltip content={
                    <div className="space-y-1">
                      <div className="font-medium">Reload</div>
                      <div className="text-xs text-muted-foreground">Refresh data from server</div>
                    </div>
                  }>
                    <Button
                      variant="outline"
                      onClick={loadAvailability}
                      disabled={isLoading || dates.length === 0}
                    >
                      {isLoading ? 'Loading...' : 'Reload'}
                    </Button>
                  </EnhancedTooltip>
                  <EnhancedTooltip content={
                    <div className="space-y-1">
                      <div className="font-medium">Clear All</div>
                      <div className="text-xs text-muted-foreground">Reset all availability marks</div>
                    </div>
                  }>
                    <Button
                      variant="destructive"
                      onClick={clearAll}
                      className="flex items-center gap-2"
                      disabled={dates.length === 0}
                    >
                      <RotateCcw className="w-4 h-4" />
                      Clear All
                    </Button>
                  </EnhancedTooltip>
                </div>
              </CardContent>
            </Card>

            {/* Time Range Menu for Players */}
            <TimeRangeMenu
              userId={user.id}
              onTimeRangeUpdate={() => {}} // Placeholder - not used in availability tab
              existingTimeRanges={[]}
            />
          </TabsContent>

          <TabsContent value="games" className="space-y-6">
            <EnhancedTooltip content={
              <div className="space-y-1">
                <div className="font-medium">Create New Game</div>
                <div className="text-xs text-muted-foreground">Start a new campaign as Dungeon Master</div>
              </div>
            }>
              <div className="create-game-button">
                <GameCreator 
                  onGameCreated={() => loadGames()}
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>
            </EnhancedTooltip>
            
            {/* Time Range Menu for Players */}
            <TimeRangeMenu
              userId={user.id}
              currentDayOfWeek={new Date(startDate).getDay()}
              onTimeRangeUpdate={() => {}} // Placeholder - not used in games tab
              existingTimeRanges={[]}
            />
            
            {gamesData && (
              <div className="space-y-6">
                {gamesData.games.map((game) => {
                  const isUserDM = game.dm.id === user.id
                  
                  return (
                    <Card key={game.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <Gamepad2 className="w-5 h-5" />
                              {game.name}
                              {isUserDM && (
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
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Session Day Manager for DMs */}
                        {isUserDM && (
                          <SessionDayManager
                            gameId={game.id}
                            gameName={game.name}
                            sessionDays={game.sessionDays || []}
                            onSessionDayCreate={(sessionDay) => {
                              const newSessionDays = [...(game.sessionDays || []), sessionDay]
                              handleGameSessionUpdate(game.id, { sessionDays: newSessionDays })
                            }}
                            onSessionDayUpdate={(sessionId, updates) => {
                              const updatedSessionDays = (game.sessionDays || []).map(session => 
                                session.id === sessionId ? { ...session, ...updates } : session
                              )
                              handleGameSessionUpdate(game.id, { sessionDays: updatedSessionDays })
                            }}
                            onSessionDayDelete={(sessionId) => {
                              const updatedSessionDays = (game.sessionDays || []).filter(session => session.id !== sessionId)
                              handleGameSessionUpdate(game.id, { sessionDays: updatedSessionDays })
                            }}
                            onSessionDayConfirm={(sessionId) => {
                              const updatedSessionDays = (game.sessionDays || []).map(session => 
                                session.id === sessionId ? { ...session, isConfirmed: true } : session
                              )
                              handleGameSessionUpdate(game.id, { sessionDays: updatedSessionDays })
                            }}
                            dates={dates}
                          />
                        )}
                        
                        {/* Game Statistics */}
                        <GameStats
                          games={[game]}
                          currentUserId={user.id}
                          onSubscribe={() => loadGames()}
                          onUnsubscribe={() => loadGames()}
                          onRefresh={() => loadGames()}
                          dateRange={{ start: startDate, end: endDate }}
                        />
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="group-view" className="space-y-6">
            {allUsersData && allUsersData.dates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    All Users' Availability
                  </CardTitle>
                              <EnhancedTooltip content={
                                <div className="space-y-1">
                                  <div className="font-medium">Group Overview</div>
                                  <div className="text-xs text-muted-foreground">See everyone's availability at a glance</div>
                                  <div className="text-xs text-muted-foreground">Green = Available, Red = Unavailable</div>
                                </div>
                              }>
                                <Info className="w-4 h-4 text-muted-foreground" />
                              </EnhancedTooltip>
                  <p className="text-sm text-muted-foreground">
                    {new Date(allUsersData.startDate).toLocaleDateString()} - {new Date(allUsersData.endDate).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {allUsersData.users.map((userData) => (
                      <div key={userData.id} className="border rounded-lg p-4">
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                          {userData.name || userData.email}
                          {userData.id === user.id && (
                            <Badge variant="secondary" className="ml-2">You</Badge>
                          )}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                          {allUsersData.dates.map((date) => {
                            const isAvailable = userData.availabilities[date]
                            
                            return (
                              <EnhancedTooltip key={date} content={
                                <div className="space-y-1">
                                  <div className="font-medium">{formatDate(date)}</div>
                                  <div className="text-sm">
                                    {isAvailable === true ? (
                                      <span className="text-green-600">✓ Available</span>
                                    ) : isAvailable === false ? (
                                      <span className="text-red-600">✗ Unavailable</span>
                                    ) : (
                                      <span className="text-gray-600">? Not marked</span>
                                    )}
                                  </div>
                                </div>
                              }>
                                <div
                                  key={date}
                                  className={`
                                    h-12 flex flex-col items-center justify-center p-1 rounded text-xs cursor-pointer
                                    ${isAvailable === true ? 'bg-green-100 border border-green-300' : ''}
                                    ${isAvailable === false ? 'bg-red-100 border border-red-300' : ''}
                                    ${isAvailable === undefined ? 'bg-gray-50 border border-gray-200' : ''}
                                  `}
                                >
                                  <div className="font-medium">{formatDate(date).split(',')[0]}</div>
                                  {isAvailable === true && (
                                    <CheckCircle className="w-3 h-3 text-green-600" />
                                  )}
                                  {isAvailable === false && (
                                    <XCircle className="w-3 h-3 text-red-600" />
                                  )}
                                  {isAvailable === undefined && (
                                    <div className="w-3 h-3 rounded-full border border-gray-300"></div>
                                  )}
                                </div>
                              </EnhancedTooltip>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Time Range Manager Modal */}
        {showTimeRangeManager && (
          <TimeRangeManager
            timeRanges={timeRanges}
            onTimeRangesChange={setTimeRanges}
            onSave={() => {
              setHasSetTimeRanges(true)
              setShowTimeRangeManager(false)
            }}
          />
        )}
      </div>
    </div>
  )
}