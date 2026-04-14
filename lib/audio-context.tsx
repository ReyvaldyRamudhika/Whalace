'use client'

import { createContext, useContext, useState, useRef, useEffect, type ReactNode } from 'react'
import type { CandleType } from './types'

interface AudioContextType {
  currentSound: CandleType | null
  isPlaying: boolean
  volume: number
  playSound: (type: CandleType) => void
  stopSound: () => void
  setVolume: (volume: number) => void
  togglePlay: () => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

// Using free ambient sounds from pixabay-style URLs (placeholder)
const SOUND_URLS: Record<CandleType, string> = {
  rain: 'https://cdn.freesound.org/previews/531/531947_5765487-lq.mp3',
  forest: 'https://cdn.freesound.org/previews/586/586541_12534774-lq.mp3', 
  ocean: 'https://cdn.freesound.org/previews/527/527424_11265837-lq.mp3'
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentSound, setCurrentSound] = useState<CandleType | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolumeState] = useState(0.3)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const playSound = (type: CandleType) => {
    if (audioRef.current) {
      audioRef.current.pause()
    }

    const audio = new Audio(SOUND_URLS[type])
    audio.loop = true
    audio.volume = volume
    audioRef.current = audio
    
    audio.play().then(() => {
      setCurrentSound(type)
      setIsPlaying(true)
    }).catch(err => {
      console.log('Audio playback failed:', err)
    })
  }

  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setIsPlaying(false)
    setCurrentSound(null)
  }

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const togglePlay = () => {
    if (!audioRef.current || !currentSound) return
    
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  return (
    <AudioContext.Provider value={{ 
      currentSound, 
      isPlaying, 
      volume,
      playSound, 
      stopSound, 
      setVolume,
      togglePlay 
    }}>
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return context
}
