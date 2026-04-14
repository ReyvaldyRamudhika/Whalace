'use client'

import { RealtimeProvider } from '@/lib/realtime-context'
import { AudioProvider } from '@/lib/audio-context'
import { SerenityApp } from '@/components/serenity-app'

export default function HomePage() {
  return (
    <RealtimeProvider>
      <AudioProvider>
        <SerenityApp />
      </AudioProvider>
    </RealtimeProvider>
  )
}
