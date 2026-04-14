'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRealtime } from '@/lib/realtime-context'
import { Waves, LogOut, User, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface AppHeaderProps {
  onLogout: () => void
}

export function AppHeader({ onLogout }: AppHeaderProps) {
  const { session, logout } = useRealtime()
  const [copied, setCopied] = useState(false)

  if (!session) return null

  const initials = session.user.anonymousName.split(' ').map(n => n[0]).join('')

  const handleCopyId = () => {
    navigator.clipboard.writeText(session.user.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLogout = () => {
    logout()
    onLogout()
  }

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Waves className="w-6 h-6 text-primary" />
          <span className="font-semibold text-lg text-foreground">Serenity</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback className={`${session.user.avatarColor} text-white font-semibold`}>
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground">
                  {session.user.anonymousName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Anonymous Identity
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleCopyId} className="cursor-pointer">
              {copied ? (
                <Check className="w-4 h-4 mr-2 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copied ? 'Copied!' : 'Copy your secret ID'}
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <User className="w-4 h-4 mr-2" />
              Your ID: {session.user.id.slice(0, 8)}...
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
