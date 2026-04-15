'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2 } from 'lucide-react'
import { useRealtime } from '@/lib/realtime-context'

export function ComposePost() {
  const [content, setContent] = useState('')
  const [mediaData, setMediaData] = useState('')
  const [mediaName, setMediaName] = useState('')
  const [mediaType, setMediaType] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { session, addPost } = useRealtime()

  const handleSubmit = async () => {
    const canSubmit = content.trim() || mediaData
    if (!canSubmit || isSubmitting) return
    
    const media = mediaData
      ? [{
          id: Math.random().toString(36).substring(2) + Date.now().toString(36),
          url: mediaData,
          type: mediaType,
          name: mediaName
        }]
      : []

    setIsSubmitting(true)
    try {
      await addPost(content, media)
      setContent('')
      setMediaData('')
      setMediaName('')
      setMediaType('')
      setIsFocused(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMediaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setMediaData(result)
      setMediaName(file.name)
      setMediaType(file.type)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveMedia = () => {
    setMediaData('')
    setMediaName('')
    setMediaType('')
  }

  if (!session) return null

  const initials = session.user.anonymousName.split(' ').map(n => n[0]).join('')

  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
      <div className="flex gap-3">
        <Avatar className="w-10 h-10 shrink-0">
          <AvatarFallback className={`${session.user.avatarColor} text-white font-semibold`}>
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <Textarea
            placeholder="Share how you are feeling... This is a safe space."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            className={`min-h-12 resize-none border-0 bg-transparent p-0 text-base focus-visible:ring-0 focus-visible:border-0 placeholder:text-muted-foreground/70 ${isFocused ? 'min-h-24' : ''}`}
            rows={isFocused ? 3 : 1}
          />

          {(isFocused || content || mediaData) && (
            <div className="mt-3 space-y-3 pt-3 border-t border-border/50">
              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/50 hover:text-foreground">
                <span>{mediaData ? 'Change photo' : 'Add photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleMediaChange}
                />
              </label>

              {mediaData && (
                <div className="rounded-2xl overflow-hidden border border-border bg-muted">
                  <img src={mediaData} alt={mediaName} className="w-full object-cover" />
                  <div className="flex items-center justify-between gap-3 px-3 py-2 text-sm text-muted-foreground">
                    <span className="truncate">{mediaName}</span>
                    <button
                      type="button"
                      onClick={handleRemoveMedia}
                      className="text-primary hover:text-primary/80"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Posting as <span className="font-medium text-foreground">{session.user.anonymousName}</span>
                </p>
                <Button
                  onClick={handleSubmit}
                  disabled={(!content.trim() && !mediaData) || isSubmitting}
                  size="sm"
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Share
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
