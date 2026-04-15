'use client'

import { useState, useEffect } from 'react'
import { ScannerView } from './scanner-view'
import { AuthForm } from './auth-form'
import { Feed } from './feed'
import { useRealtime } from '@/lib/realtime-context'
import { useAudio } from '@/lib/audio-context'
import type { CandleType } from '@/lib/types'

type AppState = 'scanner' | 'auth' | 'feed'

export function SerenityApp() {
  const [appState, setAppState] = useState<AppState>('scanner')
  const [selectedCandle, setSelectedCandle] = useState<CandleType | null>(null)
  const { session, isLoading } = useRealtime()
  const { stopSound, selectTheme } = useAudio()

  useEffect(() => {
    // If user is already logged in, they still need to scan first
    // This is the app's core mechanic - scanning the candle each time
  }, [session])

  const handleScan = (candleType: CandleType) => {
    selectTheme(candleType)
    setSelectedCandle(candleType)
    // Always show auth form after scanning candle
    setAppState('auth')
  }

  const handleAuthComplete = () => {
    setAppState('feed')
  }

  const handleBack = () => {
    setSelectedCandle(null)
    setAppState('scanner')
  }

  const handleLogout = () => {
    stopSound()
    setSelectedCandle(null)
    setAppState('scanner')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Preparing your safe space...</p>
        </div>
      </div>
    )
  }

  switch (appState) {
    case 'scanner':
      return <ScannerView onScan={handleScan} />
    case 'auth':
      return selectedCandle ? (
        <AuthForm 
          candleType={selectedCandle} 
          onComplete={handleAuthComplete} 
          onBack={handleBack}
        />
      ) : null
    case 'feed':
      return <Feed onLogout={handleLogout} />
    default:
      return <ScannerView onScan={handleScan} />
  }
}
