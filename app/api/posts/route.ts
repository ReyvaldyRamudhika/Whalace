import { NextRequest, NextResponse } from 'next/server'
import { createPost, getPosts } from '@/lib/store'

export async function GET() {
  return NextResponse.json({ posts: getPosts() })
}

export async function POST(request: NextRequest) {
  try {
    const { userId, content } = await request.json()
    
    if (!userId || !content) {
      return NextResponse.json({ error: 'Missing userId or content' }, { status: 400 })
    }
    
    const post = createPost(userId, content)
    return NextResponse.json({ post })
  } catch {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
