'use client'

import { useRealtime } from '@/lib/realtime-context'
import { ComposePost } from './compose-post'
import { PostCard } from './post-card'
import { AppHeader } from './app-header'
import { AudioPlayer } from './audio-player'
import { Heart, Wifi, WifiOff } from 'lucide-react'

interface FeedProps {
  onLogout: () => void
}

export function Feed({ onLogout }: FeedProps) {
  const { posts, isLoading, isConnected } = useRealtime()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading your safe space...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader onLogout={onLogout} />
      
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-foreground text-balance">
              Welcome to your safe space
            </h1>
            <div className="flex items-center gap-1.5 text-xs">
              {isConnected ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-amber-600">Reconnecting...</span>
                </>
              )}
            </div>
          </div>
          <p className="text-muted-foreground mt-1">
            Share your thoughts anonymously. Support others on their journey.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <ComposePost />
          
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                No posts yet. Be the first to share.
              </p>
            </div>
          ) : (
            posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </div>
      </main>

      <AudioPlayer />
    </div>
  )
}
