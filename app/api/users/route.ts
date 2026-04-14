import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserById, getUsers } from '@/lib/store'

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('id')
  
  if (userId) {
    const user = getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json({ user })
  }
  
  return NextResponse.json({ users: getUsers() })
}

export async function POST() {
  const user = createUser()
  return NextResponse.json({ user })
}
