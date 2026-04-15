'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User, Post, CandleType, Session, Comment, Media } from './types'

interface RealtimeContextType {
  session: Session | null
  posts: Post[]
  users: Record<string, User>
  isLoading: boolean
  isConnected: boolean
  login: (userId: string, candleType: CandleType) => Promise<boolean>
  logout: () => void
  register: (candleType: CandleType) => Promise<User>
  addPost: (content: string, media?: Media[]) => Promise<void>
  likePost: (postId: string) => Promise<void>
  addComment: (postId: string, content: string, media?: Media[]) => Promise<void>
  getUserById: (userId: string) => User
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined)

const DEFAULT_USER: User = { 
  id: 'unknown', 
  anonymousName: 'Anonymous', 
  avatarColor: 'bg-gray-400', 
  createdAt: '' 
}

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [users, setUsers] = useState<Record<string, User>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)

  // Connect to SSE stream
  useEffect(() => {
    const eventSource = new EventSource('/api/stream')
    
    eventSource.onopen = () => {
      setIsConnected(true)
    }
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        switch (data.type) {
          case 'init':
            setPosts(data.posts)
            setUsers(data.users)
            setIsLoading(false)
            break
            
          case 'new_post':
            setPosts(prev => [data.post, ...prev])
            if (data.user) {
              setUsers(prev => ({ ...prev, [data.user.id]: data.user }))
            }
            break
            
          case 'like_update':
            setPosts(prev => prev.map(post => 
              post.id === data.postId 
                ? { ...post, likes: data.likes }
                : post
            ))
            break
            
          case 'new_comment':
            setPosts(prev => prev.map(post => 
              post.id === data.postId 
                ? { ...post, comments: [...post.comments, data.comment as Comment] }
                : post
            ))
            if (data.user) {
              setUsers(prev => ({ ...prev, [data.user.id]: data.user }))
            }
            break
            
          case 'heartbeat':
            // Connection is alive
            break
        }
      } catch {
        // Ignore parse errors
      }
    }
    
    eventSource.onerror = () => {
      setIsConnected(false)
      // EventSource will auto-reconnect
    }
    
    // Load session from localStorage
    const storedSession = localStorage.getItem('serenity_session')
    if (storedSession) {
      setSession(JSON.parse(storedSession))
    }
    
    return () => {
      eventSource.close()
    }
  }, [])

  const register = useCallback(async (candleType: CandleType): Promise<User> => {
    const response = await fetch('/api/users', { method: 'POST' })
    const { user } = await response.json()
    
    setUsers(prev => ({ ...prev, [user.id]: user }))
    
    const newSession: Session = {
      user,
      candleType,
      isAuthenticated: true
    }
    setSession(newSession)
    localStorage.setItem('serenity_session', JSON.stringify(newSession))
    
    return user
  }, [])

  const login = useCallback(async (userId: string, candleType: CandleType): Promise<boolean> => {
    // First check local users state
    let user = users[userId]
    
    // If not found locally, try to fetch from server
    if (!user) {
      try {
        const response = await fetch(`/api/users?id=${userId}`)
        if (response.ok) {
          const data = await response.json()
          user = data.user
          setUsers(prev => ({ ...prev, [user.id]: user }))
        }
      } catch {
        // User not found
      }
    }
    
    if (user) {
      const newSession: Session = {
        user,
        candleType,
        isAuthenticated: true
      }
      setSession(newSession)
      localStorage.setItem('serenity_session', JSON.stringify(newSession))
      return true
    }
    
    return false
  }, [users])

  const logout = useCallback(() => {
    setSession(null)
    localStorage.removeItem('serenity_session')
  }, [])

  const addPost = useCallback(async (content: string, media: Media[] = []) => {
    if (!session) return
    
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: session.user.id, content, media })
    })
    // Post will be added via SSE
  }, [session])

  const likePost = useCallback(async (postId: string) => {
    if (!session) return
    
    await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: session.user.id })
    })
    // Like update will come via SSE
  }, [session])

  const addComment = useCallback(async (postId: string, content: string, media: Media[] = []) => {
    if (!session) return
    
    await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: session.user.id, content, media })
    })
    // Comment will be added via SSE
  }, [session])

  const getUserById = useCallback((userId: string): User => {
    return users[userId] || DEFAULT_USER
  }, [users])

  return (
    <RealtimeContext.Provider value={{
      session,
      posts,
      users,
      isLoading,
      isConnected,
      login,
      logout,
      register,
      addPost,
      likePost,
      addComment,
      getUserById
    }}>
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtime() {
  const context = useContext(RealtimeContext)
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider')
  }
  return context
}
