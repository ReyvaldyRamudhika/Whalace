import { subscribe, getPosts, getUsers } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function GET() {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial data
      const initialData = JSON.stringify({
        type: 'init',
        posts: getPosts(),
        users: getUsers()
      })
      controller.enqueue(encoder.encode(`data: ${initialData}\n\n`))
      
      // Subscribe to updates
      const unsubscribe = subscribe((data) => {
        try {
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))
        } catch {
          unsubscribe()
        }
      })
      
      // Heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`data: {"type":"heartbeat"}\n\n`))
        } catch {
          clearInterval(heartbeat)
          unsubscribe()
        }
      }, 30000)
      
      // Cleanup on close
      return () => {
        clearInterval(heartbeat)
        unsubscribe()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  })
}
