import { NextRequest, NextResponse } from 'next/server'
import { addComment } from '@/lib/store'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const { userId, content = '', media } = await request.json()
    
    if (!userId || (!content && !media?.length)) {
      return NextResponse.json({ error: 'Missing userId, content, or media' }, { status: 400 })
    }
    
    const post = addComment(postId, userId, content, Array.isArray(media) ? media : [])
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    
    return NextResponse.json({ post })
  } catch {
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 })
  }
}
