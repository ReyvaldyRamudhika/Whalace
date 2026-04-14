import { NextRequest, NextResponse } from 'next/server'
import { addComment } from '@/lib/store'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const { userId, content } = await request.json()
    
    if (!userId || !content) {
      return NextResponse.json({ error: 'Missing userId or content' }, { status: 400 })
    }
    
    const post = addComment(postId, userId, content)
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    
    return NextResponse.json({ post })
  } catch {
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 })
  }
}
