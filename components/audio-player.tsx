'use client'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useAudio } from '@/lib/audio-context'
import { Volume2, VolumeX, Pause, Play, Droplets, TreesIcon as Trees, Waves } from 'lucide-react'
import type { CandleType } from '@/lib/types'

const SOUND_INFO: Record<CandleType, { icon: typeof Droplets; label: string; color: string }> = {
  rain: { icon: Droplets, label: 'Rain', color: 'text-sky-500' },
  forest: { icon: Trees, label: 'Forest', color: 'text-emerald-500' },
  ocean: { icon: Waves, label: 'Ocean', color: 'text-blue-500' }
}

export function AudioPlayer() {
  const { currentSound, isPlaying, volume, togglePlay, setVolume, stopSound } = useAudio()

  if (!currentSound) return null

  const soundInfo = SOUND_INFO[currentSound]
  const SoundIcon = soundInfo.icon

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-72 bg-card/95 backdrop-blur-md rounded-xl border border-border shadow-lg p-3 z-50">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlay}
          className="shrink-0"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
          <span className="sr-only">{isPlaying ? 'Pause' : 'Play'}</span>
        </Button>
        
        <div className="flex items-center gap-2 min-w-0">
          <SoundIcon className={`w-4 h-4 ${soundInfo.color} shrink-0`} />
          <span className="text-sm font-medium text-foreground truncate">
            {soundInfo.label} Sounds
          </span>
        </div>
        
        <div className="flex items-center gap-2 ml-auto">
          {volume > 0 ? (
            <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
          ) : (
            <VolumeX className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
          <Slider
            value={[volume * 100]}
            onValueChange={([val]) => setVolume(val / 100)}
            max={100}
            step={1}
            className="w-20"
          />
        </div>
        
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={stopSound}
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          <VolumeX className="w-4 h-4" />
          <span className="sr-only">Stop sound</span>
        </Button>
      </div>
    </div>
  )
}
