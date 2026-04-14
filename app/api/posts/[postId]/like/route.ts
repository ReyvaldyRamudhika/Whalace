import { NextRequest, NextResponse } from 'next/server'
import { toggleLike } from '@/lib/store'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }
    
    const post = toggleLike(postId, userId)
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    
    return NextResponse.json({ post })
  } catch {
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 })
  }
}
