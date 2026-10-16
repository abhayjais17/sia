"use client"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import type { CallState } from "@/lib/types"
export const formatCallTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`
// TODO: integrate WebRTC, getUserMedia, RTCPeerConnection, TURN
export function useCall(onSystem: (message: string) => void) {
  const [state, setState] = useState<CallState>("idle")
  const [video, setVideo] = useState(false)
  const [muted, setMuted] = useState(false)
  const [speaker, setSpeaker] = useState(true)
  const [camera, setCamera] = useState(true)
  const [facing, setFacing] = useState<"front" | "back">("front")
  const [minimized, setMinimized] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [denied, setDenied] = useState<"microphone" | "camera" | null>(null)
  const [poor, setPoor] = useState(false)
  const startedAt = useRef(0)
  const connect = () => { startedAt.current = Date.now(); setSeconds(0); setState("connected") }
  useEffect(() => {
    if (state !== "outgoing") return
    const id = setTimeout(connect, 2800)
    return () => clearTimeout(id)
  }, [state])
  useEffect(() => {
    if (state !== "connected") return
    const id = setInterval(() => setSeconds(Math.floor((Date.now() - startedAt.current) / 1000)), 250)
    return () => clearInterval(id)
  }, [state])
  const start = (kind: "voice" | "video", incoming = false) => {
    if (state !== "idle") { setMinimized(false); return }
    setVideo(kind === "video"); setCamera(true); setMuted(false); setSpeaker(true); setFacing("front"); setMinimized(false); setSeconds(0); setPoor(false); setDenied(null)
    setState(incoming ? "incoming" : "outgoing")
  }
  const reset = () => { setState("idle"); setMinimized(false); setDenied(null); setPoor(false) }
  const end = () => {
    if (state === "connected") onSystem(`Call ended · ${formatCallTime(Math.floor((Date.now() - startedAt.current) / 1000))}`)
    else if (state === "incoming") onSystem("Incoming call declined")
    else if (state === "outgoing") onSystem("Call cancelled")
    reset()
  }
  const deny = (device: "microphone" | "camera") => { setDenied(device); if (device === "microphone") setMuted(true); else setCamera(false); setMinimized(false) }
  const warn = () => { setPoor(true); toast.warning("Poor connection. Audio or video may be interrupted.") }
  return { state, video, muted, speaker, camera, facing, minimized, seconds, denied, poor, start, accept: connect, end, reset, deny, warn, dismissDenied: () => setDenied(null), setMinimized, toggleMute: () => setMuted(v => !v), toggleSpeaker: () => setSpeaker(v => !v), toggleVideo: () => { setVideo(v => !v); setCamera(true) }, toggleCamera: () => setCamera(v => !v), switchCamera: () => setFacing(v => v === "front" ? "back" : "front") }
}
export type CallController = ReturnType<typeof useCall>
