'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Heart, MessageCircle, Send, Loader2 } from 'lucide-react'
import { useRealtime } from '@/lib/realtime-context'
import type { Post } from '@/lib/types'
import { formatDistanceToNow } from '@/lib/format-time'

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isLiking, setIsLiking] = useState(false)
  const [isCommenting, setIsCommenting] = useState(false)
  const { session, likePost, addComment, getUserById } = useRealtime()
  
  const author = getUserById(post.userId)
  const hasLiked = session ? post.likes.includes(session.user.id) : false

  const handleLike = async () => {
    if (isLiking) return
    setIsLiking(true)
    try {
      await likePost(post.id)
    } finally {
      setIsLiking(false)
    }
  }

  const handleComment = async () => {
    if (!commentText.trim() || isCommenting) return
    setIsCommenting(true)
    try {
      await addComment(post.id, commentText)
      setCommentText('')
    } finally {
      setIsCommenting(false)
    }
  }

  return (
    <article className="bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex gap-3">
        <Avatar className="w-10 h-10 shrink-0">
          <AvatarFallback className={`${author.avatarColor} text-white font-semibold`}>
            {author.anonymousName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground">{author.anonymousName}</span>
            <span className="text-muted-foreground text-sm">
              {formatDistanceToNow(post.createdAt)}
            </span>
          </div>
          
          <p className="mt-2 text-foreground whitespace-pre-wrap break-words leading-relaxed">
            {post.content}
          </p>
          
          <div className="flex items-center gap-4 mt-3 pt-2 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLiking}
              className={`gap-2 transition-all ${hasLiked ? 'text-rose-500 hover:text-rose-600' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Heart className={`w-4 h-4 transition-transform ${hasLiked ? 'fill-current scale-110' : ''} ${isLiking ? 'animate-pulse' : ''}`} />
              <span className="tabular-nums">{post.likes.length > 0 ? post.likes.length : ''}</span>
              <span className="sr-only">{hasLiked ? 'Unlike' : 'Like'} this post</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="tabular-nums">{post.comments.length > 0 ? post.comments.length : ''}</span>
              <span className="sr-only">View comments</span>
            </Button>
          </div>
          
          {showComments && (
            <div className="mt-3 pt-3 border-t border-border/50">
              {post.comments.length > 0 && (
                <div className="flex flex-col gap-3 mb-3">
                  {post.comments.map(comment => {
                    const commentAuthor = getUserById(comment.userId)
                    return (
                      <div key={comment.id} className="flex gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <Avatar className="w-7 h-7 shrink-0">
                          <AvatarFallback className={`${commentAuthor.avatarColor} text-white text-xs font-semibold`}>
                            {commentAuthor.anonymousName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-secondary/50 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-foreground">
                              {commentAuthor.anonymousName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-foreground mt-0.5">{comment.content}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              
              <div className="flex gap-2">
                <Avatar className="w-7 h-7 shrink-0">
                  <AvatarFallback className={`${session?.user.avatarColor || 'bg-muted'} text-white text-xs font-semibold`}>
                    {session?.user.anonymousName.split(' ').map(n => n[0]).join('') || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Textarea
                    placeholder="Send some support..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="min-h-9 py-2 text-sm resize-none"
                    rows={1}
                  />
                  <Button
                    size="icon"
                    onClick={handleComment}
                    disabled={!commentText.trim() || isCommenting}
                    className="shrink-0"
                  >
                    {isCommenting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span className="sr-only">Send comment</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
