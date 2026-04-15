'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useRealtime } from '@/lib/realtime-context'
import { useAudio } from '@/lib/audio-context'
import type { CandleType } from '@/lib/types'
import { Droplets, TreesIcon as Trees, Waves, Sparkles, ArrowRight, Clipboard, Check } from 'lucide-react'

interface AuthFormProps {
  candleType: CandleType
  onComplete: () => void
  onBack: () => void
}

const CANDLE_INFO: Record<CandleType, { icon: typeof Droplets; label: string; color: string; bg: string }> = {
  rain: { icon: Droplets, label: 'Rain Candle', color: 'text-sky-500', bg: 'bg-sky-100 dark:bg-sky-900/30' },
  forest: { icon: Trees, label: 'Forest Candle', color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  ocean: { icon: Waves, label: 'Ocean Candle', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' }
}

export function AuthForm({ candleType, onComplete, onBack }: AuthFormProps) {
  const [isNewUser, setIsNewUser] = useState(true)
  const [existingUserId, setExistingUserId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showTokenDialog, setShowTokenDialog] = useState(false)
  const [createdUserId, setCreatedUserId] = useState('')
  const [copied, setCopied] = useState(false)
  const { register, login, session } = useRealtime()
  const { playSound } = useAudio()

  const candleInfo = CANDLE_INFO[candleType]
  const CandleIcon = candleInfo.icon

  useEffect(() => {
    // Check if there's an existing user for quick login
    if (session) {
      setExistingUserId(session.user.id)
      setIsNewUser(false)
    }
  }, [session])

  const handleNewUser = async () => {
    setIsLoading(true)
    try {
      const user = await register(candleType)
      setCreatedUserId(user.id)
      setShowTokenDialog(true)
      playSound(candleType)
    } catch {
      setIsLoading(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTokenDialogChange = (open: boolean) => {
    setShowTokenDialog(open)
    if (!open && createdUserId) {
      onComplete()
    }
  }

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(createdUserId)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      alert('Unable to copy token. Please copy it manually.')
    }
  }

  const handleExistingUser = async () => {
    if (!existingUserId.trim()) return
    setIsLoading(true)
    try {
      const success = await login(existingUserId, candleType)
      if (success) {
        playSound(candleType)
        onComplete()
      } else {
        setIsLoading(false)
        alert('User not found. Please check your ID or create a new account.')
      }
    } catch {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${candleInfo.bg} mb-4`}>
            <CandleIcon className={`w-8 h-8 ${candleInfo.color}`} />
          </div>
          <h2 className="text-xl font-medium text-foreground">{candleInfo.label} Detected</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Ambient sounds will play when you enter
          </p>
        </div>

        <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Welcome to Serenity</CardTitle>
            <CardDescription>
              {isNewUser 
                ? 'Create your anonymous identity to begin sharing and supporting'
                : 'Welcome back! Continue to your safe space'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {isNewUser ? (
              <>
                <div className="bg-secondary/50 rounded-xl p-4 text-center">
                  <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm text-foreground font-medium">You will receive</p>
                  <p className="text-muted-foreground text-sm">
                    A random anonymous name and avatar to protect your identity
                  </p>
                </div>

                <Button 
                  onClick={handleNewUser} 
                  size="lg" 
                  className="w-full h-14 text-lg gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="animate-pulse">Creating your space...</span>
                  ) : (
                    <>
                      Create Anonymous Identity
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      already have an account?
                    </span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  onClick={() => setIsNewUser(false)}
                  className="w-full"
                >
                  I have been here before
                </Button>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">
                    Your Secret ID
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your user ID"
                    value={existingUserId}
                    onChange={(e) => setExistingUserId(e.target.value)}
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    This is the ID shown in your profile settings
                  </p>
                </div>

                <Button 
                  onClick={handleExistingUser} 
                  size="lg" 
                  className="w-full h-14 text-lg gap-2"
                  disabled={isLoading || !existingUserId.trim()}
                >
                  {isLoading ? (
                    <span className="animate-pulse">Entering your space...</span>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>

                <Button 
                  variant="ghost" 
                  onClick={() => setIsNewUser(true)}
                  className="w-full"
                >
                  Create new anonymous account
                </Button>
              </>
            )}

            <Button 
              variant="link" 
              onClick={onBack}
              className="text-muted-foreground"
            >
              Scan a different candle
            </Button>
          </CardContent>
        </Card>

        <Dialog open={showTokenDialog} onOpenChange={handleTokenDialogChange}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Save your login token</DialogTitle>
              <DialogDescription>
                Make sure this code is saved by you. It is required to log in again later.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-2xl border border-border bg-muted p-4 shadow-sm">
              <p className="text-xs text-muted-foreground mb-2">Your anonymous login token</p>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-3">
                <span className="truncate text-foreground">{createdUserId}</span>
                <button
                  type="button"
                  onClick={copyToken}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button className="w-full">Continue</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Your identity is completely anonymous. We do not collect any personal information.
          </p>
        </div>
      </div>
    </div>
  )
}
