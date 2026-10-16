"use client"
import { useEffect, useState } from "react"
import { Pause, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
export function VoiceNotePlayer({ duration = 18 }: { duration?: number }) {
  const [playing, setPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [speed, setSpeed] = useState(1)
  useEffect(() => { if (!playing) return; const id = setInterval(() => setPosition(p => { if (p + .2 * speed >= duration) { setPlaying(false); return duration } return p + .2 * speed }), 200); return () => clearInterval(id) }, [playing, speed, duration])
  return <div className="voice-player"><Button size="icon" variant="secondary" aria-label={playing ? "Pause voice note" : "Play simulated voice note"} onClick={() => { if (position >= duration) setPosition(0); setPlaying(!playing) }}>{playing ? <Pause /> : <Play />}</Button><div className="flex min-w-0 flex-1 flex-col gap-1"><div className="waveform" aria-hidden="true">{Array.from({ length: 30 }, (_, i) => <i key={i} className={i / 30 <= position / duration ? "played" : ""} style={{ height: `${7 + ((i * 17 + 13) % 24)}px` }} />)}</div><span className="text-[10px] opacity-70">{Math.floor((playing ? position : duration) / 60)}:{String(Math.floor(playing ? position : duration) % 60).padStart(2, "0")} · Simulated audio</span></div><Button variant="ghost" size="xs" aria-label="Playback speed" onClick={() => setSpeed(speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1)}>{speed}×</Button></div>
}
