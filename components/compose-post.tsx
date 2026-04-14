'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2 } from 'lucide-react'
import { useRealtime } from '@/lib/realtime-context'

export function ComposePost() {
  const [content, setContent] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { session, addPost } = useRealtime()

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    try {
      await addPost(content)
      setContent('')
      setIsFocused(false)
    } finally {
      setIsSubmitting(false)
    }
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
          
          {(isFocused || content) && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Posting as <span className="font-medium text-foreground">{session.user.anonymousName}</span>
              </p>
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting}
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
          )}
        </div>
      </div>
    </div>
  )
}
