'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User, Post, CandleType, Session } from './types'

interface AuthContextType {
  session: Session | null
  posts: Post[]
  isLoading: boolean
  login: (userId: string, candleType: CandleType) => void
  logout: () => void
  register: (candleType: CandleType) => User
  addPost: (content: string) => void
  likePost: (postId: string) => void
  addComment: (postId: string, content: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const ANONYMOUS_NAMES = [
  'Gentle Wave', 'Quiet Storm', 'Soft Breeze', 'Calm River', 
  'Peaceful Cloud', 'Silent Moon', 'Warm Sun', 'Kind Star',
  'Tender Heart', 'Brave Soul', 'Hopeful Spirit', 'Serene Mind',
  'Caring Light', 'Patient Dawn', 'Loving Dusk', 'Honest Echo'
]

const AVATAR_COLORS = [
  'bg-teal-400', 'bg-sky-400', 'bg-emerald-400', 'bg-cyan-400',
  'bg-blue-400', 'bg-indigo-300', 'bg-rose-300', 'bg-amber-300'
]

function generateAnonymousName(): string {
  return ANONYMOUS_NAMES[Math.floor(Math.random() * ANONYMOUS_NAMES.length)]
}

function generateAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

const SAMPLE_POSTS: Post[] = [
  {
    id: 'sample-1',
    userId: 'system-1',
    content: 'Today was really hard, but I managed to get out of bed and take a short walk. Small wins matter.',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    likes: ['system-2', 'system-3'],
    comments: [
      {
        id: 'comment-1',
        userId: 'system-2',
        content: 'So proud of you! Every step counts.',
        createdAt: new Date(Date.now() - 3000000).toISOString()
      }
    ]
  },
  {
    id: 'sample-2',
    userId: 'system-2',
    content: 'Feeling overwhelmed with everything lately. Just needed somewhere safe to say that.',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    likes: ['system-1'],
    comments: [
      {
        id: 'comment-2',
        userId: 'system-3',
        content: 'You are not alone. We are here with you.',
        createdAt: new Date(Date.now() - 6000000).toISOString()
      }
    ]
  },
  {
    id: 'sample-3',
    userId: 'system-3',
    content: 'Therapy session went well today. Learning to be kinder to myself.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    likes: ['system-1', 'system-2'],
    comments: []
  }
]

const SAMPLE_USERS: Record<string, User> = {
  'system-1': { id: 'system-1', anonymousName: 'Gentle Wave', avatarColor: 'bg-teal-400', createdAt: new Date().toISOString() },
  'system-2': { id: 'system-2', anonymousName: 'Quiet Storm', avatarColor: 'bg-sky-400', createdAt: new Date().toISOString() },
  'system-3': { id: 'system-3', anonymousName: 'Soft Breeze', avatarColor: 'bg-emerald-400', createdAt: new Date().toISOString() }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [users, setUsers] = useState<Record<string, User>>(SAMPLE_USERS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedSession = localStorage.getItem('serenity_session')
    const storedPosts = localStorage.getItem('serenity_posts')
    const storedUsers = localStorage.getItem('serenity_users')
    
    if (storedPosts) {
      setPosts(JSON.parse(storedPosts))
    } else {
      setPosts(SAMPLE_POSTS)
      localStorage.setItem('serenity_posts', JSON.stringify(SAMPLE_POSTS))
    }
    
    if (storedUsers) {
      setUsers({ ...SAMPLE_USERS, ...JSON.parse(storedUsers) })
    }
    
    if (storedSession) {
      setSession(JSON.parse(storedSession))
    }
    
    setIsLoading(false)
  }, [])

  const register = (candleType: CandleType): User => {
    const newUser: User = {
      id: generateId(),
      anonymousName: generateAnonymousName(),
      avatarColor: generateAvatarColor(),
      createdAt: new Date().toISOString()
    }
    
    const updatedUsers = { ...users, [newUser.id]: newUser }
    setUsers(updatedUsers)
    localStorage.setItem('serenity_users', JSON.stringify(updatedUsers))
    
    const newSession: Session = {
      user: newUser,
      candleType,
      isAuthenticated: true
    }
    setSession(newSession)
    localStorage.setItem('serenity_session', JSON.stringify(newSession))
    
    return newUser
  }

  const login = (userId: string, candleType: CandleType) => {
    const user = users[userId]
    if (user) {
      const newSession: Session = {
        user,
        candleType,
        isAuthenticated: true
      }
      setSession(newSession)
      localStorage.setItem('serenity_session', JSON.stringify(newSession))
    }
  }

  const logout = () => {
    setSession(null)
    localStorage.removeItem('serenity_session')
  }

  const addPost = (content: string) => {
    if (!session) return
    
    const newPost: Post = {
      id: generateId(),
      userId: session.user.id,
      content,
      createdAt: new Date().toISOString(),
      likes: [],
      comments: []
    }
    
    const updatedPosts = [newPost, ...posts]
    setPosts(updatedPosts)
    localStorage.setItem('serenity_posts', JSON.stringify(updatedPosts))
  }

  const likePost = (postId: string) => {
    if (!session) return
    
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const hasLiked = post.likes.includes(session.user.id)
        return {
          ...post,
          likes: hasLiked 
            ? post.likes.filter(id => id !== session.user.id)
            : [...post.likes, session.user.id]
        }
      }
      return post
    })
    
    setPosts(updatedPosts)
    localStorage.setItem('serenity_posts', JSON.stringify(updatedPosts))
  }

  const addComment = (postId: string, content: string) => {
    if (!session) return
    
    const newComment = {
      id: generateId(),
      userId: session.user.id,
      content,
      createdAt: new Date().toISOString()
    }
    
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment]
        }
      }
      return post
    })
    
    setPosts(updatedPosts)
    localStorage.setItem('serenity_posts', JSON.stringify(updatedPosts))
  }

  return (
    <AuthContext.Provider value={{ 
      session, 
      posts, 
      isLoading, 
      login, 
      logout, 
      register, 
      addPost, 
      likePost, 
      addComment 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function getUserById(userId: string): User {
  const storedUsers = localStorage.getItem('serenity_users')
  const users = storedUsers ? { ...SAMPLE_USERS, ...JSON.parse(storedUsers) } : SAMPLE_USERS
  return users[userId] || { id: userId, anonymousName: 'Anonymous', avatarColor: 'bg-gray-400', createdAt: '' }
}
