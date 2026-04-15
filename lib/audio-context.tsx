'use client'

import { createContext, useContext, useState, useRef, useEffect, type ReactNode } from 'react'
import type { CandleType } from './types'

interface AudioContextType {
  currentSound: CandleType | null
  isPlaying: boolean
  volume: number
  autoplayBlocked: boolean
  playSound: (type: CandleType) => Promise<void>
  stopSound: () => void
  setVolume: (volume: number) => void
  togglePlay: () => void
  selectTheme: (type: CandleType) => void  // Tambah untuk select tema dengan autoplay
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

const SOUND_URLS: Record<CandleType, string> = {
  rain: '/sound/rain.mp3',
  forest: '/sound/forest.mp3',
  ocean: '/sound/ocean.mp3'
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentSound, setCurrentSound] = useState<CandleType | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolumeState] = useState(0.3)
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // 🔥 PLAY SOUND (autoplay langsung, set state optimis)
  const playSound = async (type: CandleType) => {
    try {
      // stop sebelumnya
      if (audioRef.current) {
        audioRef.current.pause()
      }

      const audio = new Audio(SOUND_URLS[type])
      audio.loop = true
      audio.volume = volume

      audioRef.current = audio

      // Set state optimis sebelum play
      setCurrentSound(type)
      setIsPlaying(true)
      setAutoplayBlocked(false)

      // Coba play, jika gagal revert state
      await audio.play()

    } catch (err) {
      console.log('Audio autoplay failed:', err)
      setAutoplayBlocked(true)
      setIsPlaying(false)  // Revert jika gagal
    }
  }

  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    setIsPlaying(false)
    setCurrentSound(null)
    setAutoplayBlocked(false)
  }

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const togglePlay = async () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      try {
        await audioRef.current.play()
        setIsPlaying(true)
      } catch (err) {
        console.log('Toggle play failed:', err)
        setAutoplayBlocked(true)
      }
    }
  }

  // Fungsi untuk select tema dengan autoplay
  const selectTheme = (type: CandleType) => {
    playSound(type)
  }

  return (
    <AudioContext.Provider value={{ 
      currentSound, 
      isPlaying, 
      volume,
      autoplayBlocked,
      playSound, 
      stopSound,
      setVolume,
      togglePlay,
      selectTheme 
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