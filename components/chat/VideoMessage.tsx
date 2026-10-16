"use client"
import { useRef, useState } from "react"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
export function VideoMessage({ url, name }: { url: string; name: string }) {
  const video = useRef<HTMLVideoElement>(null)
  const [duration, setDuration] = useState(0)
  const [started, setStarted] = useState(false)
  const [error, setError] = useState(false)
  return <div className="video-frame"><video ref={video} src={url} controls={started} playsInline preload="metadata" className="video-message" aria-label={name} onLoadedMetadata={e => setDuration(e.currentTarget.duration)} onPlay={() => setStarted(true)} onError={() => setError(true)} />{!started && !error && <Button className="video-play" variant="secondary" size="icon" aria-label={`Play ${name}`} onClick={() => { setStarted(true); video.current?.play().catch(() => setError(true)) }}><Play /></Button>}{!started && duration > 0 && Number.isFinite(duration) && <span className="video-duration">{Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, "0")}</span>}{error && <p className="text-xs">This browser cannot play this video. <a className="underline" href={url} download={name}>Download instead</a>.</p>}</div>
}
