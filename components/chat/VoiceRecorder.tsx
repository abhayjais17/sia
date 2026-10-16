"use client"
import { useEffect, useRef } from "react"
import { ArrowUp, LockKeyhole, Mic, Square, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useVoiceRecorder } from "@/hooks/use-voice-recorder"
import { VoiceNotePlayer } from "./VoiceNotePlayer"
export function VoiceRecorder({ disabled, send }: { disabled: boolean; send: (duration: number) => void }) {
  const recorder = useVoiceRecorder()
  const gesture = useRef({ x: 0, y: 0, active: false, locked: false })
  const cancel = recorder.cancel
  useEffect(() => { if (disabled) cancel() }, [disabled])
  const active = recorder.state !== "idle"
  const time = `${Math.floor(recorder.seconds / 60)}:${String(recorder.seconds % 60).padStart(2, "0")}`
  return <div className={active ? "voice-recorder active" : "voice-recorder"}>
    {active && <div className="recording-preview" role="group" aria-label="Simulated voice recording">
      <div className="flex flex-wrap items-center gap-2"><span className="recording-dot" /><span className="text-sm tabular-nums">{time}</span><span className="text-xs text-muted-foreground">{recorder.state === "locked" ? "Locked · simulated recording" : recorder.state === "preview" ? "Preview · simulated audio" : "Slide left to cancel · up to lock"}</span></div>
      {recorder.state === "preview" ? <VoiceNotePlayer duration={Math.max(1, recorder.seconds)} /> : <div className="waveform recording-wave" aria-hidden="true">{Array.from({ length: 28 }, (_, i) => <i key={i} style={{ height: `${8 + i * 7 % 20}px`, animationDelay: `${i * .07}s` }} />)}</div>}
      <div className="flex items-center justify-end gap-2"><Button variant="ghost" size="icon" aria-label="Delete recording" onClick={() => { gesture.current.active = false; recorder.cancel() }}><Trash2 /></Button>{recorder.state !== "preview" ? <Button variant="secondary" onClick={recorder.stop}><Square />Stop recording</Button> : <Button variant="gradient" disabled={disabled} onClick={() => { send(Math.max(1, recorder.seconds)); recorder.cancel() }}><ArrowUp />Send voice note</Button>}</div>
    </div>}
    <Button variant={active ? "destructive" : "gradient"} size="icon" className="record-trigger" aria-label={active ? "Stop simulated recording" : "Hold to record voice note"} disabled={disabled} style={{ touchAction: "none" }} onPointerDown={e => {
      if (e.button !== 0 || disabled || active) return
      e.currentTarget.setPointerCapture(e.pointerId)
      gesture.current = { x: e.clientX, y: e.clientY, active: true, locked: false }
      recorder.start()
    }} onPointerMove={e => {
      const g = gesture.current
      if (!g.active || g.locked) return
      if (e.clientX - g.x < -70) { g.active = false; recorder.cancel() }
      else if (e.clientY - g.y < -60) { g.locked = true; recorder.lock() }
    }} onPointerUp={() => { if (gesture.current.active && !gesture.current.locked) recorder.stop(); gesture.current.active = false }} onPointerCancel={() => { if (!gesture.current.locked) recorder.cancel(); gesture.current.active = false }} onClick={e => { if (e.detail === 0) { if (!active) { recorder.start(); recorder.lock() } else recorder.stop() } }}>
      {recorder.state === "locked" ? <LockKeyhole /> : active ? <Square /> : <Mic />}
    </Button>
  </div>
}
