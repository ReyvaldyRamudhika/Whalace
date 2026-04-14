export interface User {
  id: string
  anonymousName: string
  avatarColor: string
  createdAt: string
}

export interface Post {
  id: string
  userId: string
  content: string
  createdAt: string
  likes: string[]
  comments: Comment[]
}

export interface Comment {
  id: string
  userId: string
  content: string
  createdAt: string
}

export type CandleType = 'rain' | 'forest' | 'ocean'

export interface Session {
  user: User
  candleType: CandleType
  isAuthenticated: boolean
}
