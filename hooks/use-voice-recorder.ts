"use client"
import { useEffect, useState } from "react"
/** Simulated recording. No microphone permission or media is requested. */
export interface VoiceRecorderState { state: "idle" | "recording" | "locked" | "preview"; seconds: number; start: () => void; lock: () => void; stop: () => void; cancel: () => void }
export function useVoiceRecorder(): VoiceRecorderState {
  const [state, setState] = useState<VoiceRecorderState["state"]>("idle")
  const [seconds, setSeconds] = useState(0)
  useEffect(() => { if (state !== "recording" && state !== "locked") return; const id = setInterval(() => setSeconds(s => s + 1), 1000); return () => clearInterval(id) }, [state])
  return { state, seconds, start: () => { setSeconds(0); setState("recording") }, lock: () => setState("locked"), stop: () => setState("preview"), cancel: () => { setState("idle"); setSeconds(0) } }
}
