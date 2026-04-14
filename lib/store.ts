import type { Post, User } from './types'

// In-memory store for real-time updates
// This will reset on server restart, but provides real-time functionality

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

// Initial sample data
const SAMPLE_USERS: Record<string, User> = {
  'system-1': { id: 'system-1', anonymousName: 'Gentle Wave', avatarColor: 'bg-teal-400', createdAt: new Date().toISOString() },
  'system-2': { id: 'system-2', anonymousName: 'Quiet Storm', avatarColor: 'bg-sky-400', createdAt: new Date().toISOString() },
  'system-3': { id: 'system-3', anonymousName: 'Soft Breeze', avatarColor: 'bg-emerald-400', createdAt: new Date().toISOString() }
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

// Global store
declare global {
  // eslint-disable-next-line no-var
  var __store: {
    posts: Post[]
    users: Record<string, User>
    subscribers: Set<(data: string) => void>
  } | undefined
}

function getStore() {
  if (!global.__store) {
    global.__store = {
      posts: [...SAMPLE_POSTS],
      users: { ...SAMPLE_USERS },
      subscribers: new Set()
    }
  }
  return global.__store
}

export function getPosts(): Post[] {
  return getStore().posts
}

export function getUsers(): Record<string, User> {
  return getStore().users
}

export function getUserById(userId: string): User | null {
  return getStore().users[userId] || null
}

export function createUser(): User {
  const store = getStore()
  const id = Math.random().toString(36).substring(2) + Date.now().toString(36)
  const user: User = {
    id,
    anonymousName: ANONYMOUS_NAMES[Math.floor(Math.random() * ANONYMOUS_NAMES.length)],
    avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    createdAt: new Date().toISOString()
  }
  store.users[id] = user
  return user
}

export function createPost(userId: string, content: string): Post {
  const store = getStore()
  const post: Post = {
    id: Math.random().toString(36).substring(2) + Date.now().toString(36),
    userId,
    content,
    createdAt: new Date().toISOString(),
    likes: [],
    comments: []
  }
  store.posts.unshift(post)
  broadcast({ type: 'new_post', post, user: store.users[userId] })
  return post
}

export function toggleLike(postId: string, userId: string): Post | null {
  const store = getStore()
  const post = store.posts.find(p => p.id === postId)
  if (!post) return null
  
  const hasLiked = post.likes.includes(userId)
  if (hasLiked) {
    post.likes = post.likes.filter(id => id !== userId)
  } else {
    post.likes.push(userId)
  }
  
  broadcast({ type: 'like_update', postId, likes: post.likes, userId })
  return post
}

export function addComment(postId: string, userId: string, content: string): Post | null {
  const store = getStore()
  const post = store.posts.find(p => p.id === postId)
  if (!post) return null
  
  const comment = {
    id: Math.random().toString(36).substring(2) + Date.now().toString(36),
    userId,
    content,
    createdAt: new Date().toISOString()
  }
  post.comments.push(comment)
  
  broadcast({ type: 'new_comment', postId, comment, user: store.users[userId] })
  return post
}

// Real-time subscription management
export function subscribe(callback: (data: string) => void): () => void {
  const store = getStore()
  store.subscribers.add(callback)
  return () => {
    store.subscribers.delete(callback)
  }
}

function broadcast(data: object) {
  const store = getStore()
  const message = JSON.stringify(data)
  store.subscribers.forEach(callback => {
    try {
      callback(message)
    } catch {
      // Subscriber disconnected
    }
  })
}
