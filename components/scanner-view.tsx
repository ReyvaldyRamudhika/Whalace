'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, Droplets, TreesIcon as Trees, Waves, X } from 'lucide-react'
import type { CandleType } from '@/lib/types'

interface ScannerViewProps {
  onScan: (candleType: CandleType) => void
}

export function ScannerView({ onScan }: ScannerViewProps) {
  const [showCamera, setShowCamera] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setHasPermission(true)
      setShowCamera(true)
    } catch (err) {
      console.log('Camera access denied:', err)
      setHasPermission(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setShowCamera(false)
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const handleCandleSelect = (type: CandleType) => {
    stopCamera()
    onScan(type)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Waves className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-semibold text-foreground text-balance">Serenity</h1>
          <p className="text-muted-foreground mt-2 text-balance">
            Your safe space for anonymous mental health support
          </p>
        </div>

        {!showCamera ? (
          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Scan Your Candle</CardTitle>
              <CardDescription>
                Point your camera at the barcode on your candle to begin
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button 
                onClick={startCamera} 
                size="lg" 
                className="w-full h-14 text-lg gap-3"
              >
                <Camera className="w-5 h-5" />
                Open Camera
              </Button>
              
              {hasPermission === false && (
                <p className="text-sm text-destructive text-center">
                  Camera access was denied. Please enable camera permissions to scan.
                </p>
              )}

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    or select your candle type
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleCandleSelect('rain')}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-background/50 hover:bg-secondary/50 hover:border-primary/50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Droplets className="w-6 h-6 text-sky-500" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Rain</span>
                </button>

                <button
                  onClick={() => handleCandleSelect('forest')}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-background/50 hover:bg-secondary/50 hover:border-primary/50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Trees className="w-6 h-6 text-emerald-500" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Forest</span>
                </button>

                <button
                  onClick={() => handleCandleSelect('ocean')}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-background/50 hover:bg-secondary/50 hover:border-primary/50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Waves className="w-6 h-6 text-blue-500" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Ocean</span>
                </button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="relative aspect-[3/4] bg-black">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white/50 rounded-lg">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={stopCamera}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <CardContent className="py-4">
              <p className="text-center text-sm text-muted-foreground mb-4">
                Position the barcode within the frame
              </p>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleCandleSelect('rain')}
                  className="gap-1"
                >
                  <Droplets className="w-4 h-4 text-sky-500" />
                  Rain
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleCandleSelect('forest')}
                  className="gap-1"
                >
                  <Trees className="w-4 h-4 text-emerald-500" />
                  Forest
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleCandleSelect('ocean')}
                  className="gap-1"
                >
                  <Waves className="w-4 h-4 text-blue-500" />
                  Ocean
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground mt-6">
          A safe, anonymous space to share and support
        </p>
      </div>
    </div>
  )
}
