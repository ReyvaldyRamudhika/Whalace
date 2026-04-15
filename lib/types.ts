export interface User {
  id: string
  anonymousName: string
  avatarColor: string
  createdAt: string
}

export interface Media {
  id: string
  url: string
  type: string
  name: string
}

export interface Post {
  id: string
  userId: string
  content: string
  createdAt: string
  likes: string[]
  media?: Media[]
  comments: Comment[]
}

export interface Comment {
  id: string
  userId: string
  content: string
  createdAt: string
  media?: Media[]
}

export type CandleType = 'rain' | 'forest' | 'ocean'

export interface Session {
  user: User
  candleType: CandleType
  isAuthenticated: boolean
}
