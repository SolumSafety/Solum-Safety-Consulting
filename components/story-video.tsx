"use client"

import { useRef, useState } from "react"
import { Volume2, VolumeX, Play } from "lucide-react"

export function StoryVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const [ended, setEnded] = useState(false)

  function toggleSound() {
    const video = videoRef.current
    if (!video) return
    const next = !muted
    video.muted = next
    if (!next) video.play().catch(() => {})
    setMuted(next)
  }

  function replay() {
    const video = videoRef.current
    if (!video) return
    video.currentTime = 0
    setEnded(false)
    video.play().catch(() => {})
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border shadow-sm">
      <video
        ref={videoRef}
        className="aspect-[4/3] w-full object-cover"
        src="/foundation-team.mp4"
        poster="/why-we-started.png"
        autoPlay
        muted
        playsInline
        onEnded={() => setEnded(true)}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent" />

      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Our story, in motion</div>
          <div className="text-sm text-primary-foreground/80">{muted ? "Tap for sound" : "Sound on"}</div>
        </div>
        <div className="flex items-center gap-2">
          {ended && (
            <button
              type="button"
              onClick={replay}
              aria-label="Replay video"
              className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary-foreground/90 text-primary transition-transform hover:scale-105"
            >
              <Play className="h-5 w-5" />
            </button>
          )}
          <button
            type="button"
            onClick={toggleSound}
            aria-label={muted ? "Unmute video" : "Mute video"}
            className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform hover:scale-105"
          >
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
