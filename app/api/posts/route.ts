import { NextRequest, NextResponse } from 'next/server'
import { createPost, getPosts } from '@/lib/store'

export async function GET() {
  return NextResponse.json({ posts: getPosts() })
}

export async function POST(request: NextRequest) {
  try {
    const { userId, content = '', media } = await request.json()
    
    if (!userId || (!content && !media?.length)) {
      return NextResponse.json({ error: 'Missing userId, content, or media' }, { status: 400 })
    }
    
    const post = createPost(userId, content, Array.isArray(media) ? media : [])
    return NextResponse.json({ post })
  } catch {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
