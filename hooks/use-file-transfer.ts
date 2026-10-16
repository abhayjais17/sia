"use client"
import { useEffect, useRef } from "react"
import type { Attachment, Message, TransferState } from "@/lib/types"
/** Queue contract: simulated progress only; object URLs remain local and are revoked on unmount/clear. */
export interface FileTransfer { create: (file: File) => Attachment; action: (id: string, state: TransferState) => void; clear: () => void }
// TODO: integrate WebRTC, 16KB chunks, bufferedAmount backpressure, SHA-256 check
export function useFileTransfer(messages: Message[], update: (id: string, patch: Partial<Attachment>) => void): FileTransfer {
  const urls = useRef<Set<string>>(new Set())
  const current = useRef({ messages, update })
  current.current = { messages, update }
  const clear = () => { urls.current.forEach(url => URL.revokeObjectURL(url)); urls.current.clear() }
  useEffect(() => clear, [])
  useEffect(() => {
    const interval = setInterval(() => {
      current.current.messages.flatMap(m => m.images ?? (m.attachment ? [m.attachment] : [])).forEach(f => { if (f.transferState === "transferring") { const progress = Math.min(100, f.progress + Math.max(1, 8 * 1024 * 1024 / Math.max(f.size, 1) * 100 * .4)); current.current.update(f.id, { progress, transferState: progress >= 100 ? "completed" : "transferring" }) } })
    }, 400)
    return () => clearInterval(interval)
  }, [])
  useEffect(() => {
    const live = new Set(messages.flatMap(m => m.images ?? (m.attachment ? [m.attachment] : [])).flatMap(file => file.url ? [file.url] : []))
    urls.current.forEach(url => { if (!live.has(url)) { URL.revokeObjectURL(url); urls.current.delete(url) } })
  }, [messages])
  return { clear, create: file => { if (file.size > 200 * 1024 * 1024) throw new Error("File too large. Max size is 200 MB."); const url = URL.createObjectURL(file); urls.current.add(url); return { id: crypto.randomUUID(), name: file.name, size: file.size, mimeType: file.type, url, transferState: "transferring", progress: 0 } }, action: (id, state) => update(id, { transferState: state, ...(state === "transferring" && messages.flatMap(m => m.images ?? (m.attachment ? [m.attachment] : [])).find(f => f.id === id)?.transferState === "failed" ? { progress: 0 } : {}) }) }
}
