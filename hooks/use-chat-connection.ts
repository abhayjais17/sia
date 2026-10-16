"use client"

import { useCallback, useEffect, useState } from "react"
import type { Attachment, Message, MessageStatus, MessageType, Peer } from "@/lib/types"
import { createDemoMessages } from "@/lib/mock-data"

/** In-memory transport contract. No messages, acknowledgements, or keys leave this tab. */
export interface ChatConnection {
  messages: Message[]; peer: Peer; setPeer: React.Dispatch<React.SetStateAction<Peer>>;
  send: (content: string, type?: MessageType, attachment?: Attachment, replyTo?: string, duration?: number, images?: Attachment[]) => void;
  receive: (content: string, type?: MessageType, attachment?: Attachment, duration?: number) => void;
  remove: (id: string, everyone: boolean) => void; react: (id: string, emoji: string) => void;
  updateAttachment: (id: string, update: Partial<Attachment>) => void;
  setStatus: (status: MessageStatus) => void; system: (content: string) => void; clear: () => void; loadDemo: () => void;
}

export function useChatConnection(connected = true, disappearingSeconds = 0): ChatConnection {
  const [messages, setMessages] = useState<Message[]>([])
  const [peer, setPeer] = useState<Peer>({ id: "alex", name: "Alex", online: true, typing: false })
  useEffect(() => {
    const interval = setInterval(() => setMessages(all => all.some(m => m.expiresAt && m.expiresAt <= Date.now()) ? all.filter(m => !m.expiresAt || m.expiresAt > Date.now()) : all), 250)
    return () => clearInterval(interval)
  }, [])
  const clear = useCallback(() => { setMessages([]); setPeer(p => ({ ...p, typing: false })) }, [])
  const hasPending = messages.some(m => m.senderId === "me" && !m.deleted && m.status !== "seen")
  useEffect(() => {
    if (!connected || !peer.online || !hasPending) return
    const interval = setInterval(() => setMessages(all => all.map(m => {
      if (m.senderId !== "me" || m.deleted || m.status === "seen") return m
      const age = Date.now() - m.timestamp
      const status: MessageStatus = age >= 2800 ? "seen" : age >= 1400 ? "delivered" : age >= 450 ? "sent" : "sending"
      const rank = ["sending", "sent", "delivered", "seen"]
      return rank.indexOf(status) > rank.indexOf(m.status) ? { ...m, status } : m
    })), 200)
    return () => clearInterval(interval)
  }, [connected, peer.online, hasPending])
  const add = (senderId: string, content: string, type: MessageType = "text", attachment?: Attachment, replyTo?: string, duration?: number, images?: Attachment[]) => {
    if (senderId === "me" && (!peer.online || !connected)) return
    setMessages(all => [...all, { id: crypto.randomUUID(), senderId, content, type, timestamp: Date.now(), status: senderId === "me" ? "sending" : "seen", attachment, replyTo, duration, images, expiresAt: disappearingSeconds && type !== "system" ? Date.now() + disappearingSeconds * 1000 : undefined }])
  }
  return { messages, peer, setPeer, clear,
    loadDemo: () => { setMessages(createDemoMessages()); setPeer(p => ({ ...p, online: true, typing: false })) },
    send: (content, type = "text", attachment, replyTo, duration, images) => add("me", content, type, attachment, replyTo, duration, images),
    receive: (content, type = "text", attachment, duration) => { setPeer(p => ({ ...p, online: true, typing: false })); add("alex", content, type, attachment, undefined, duration) },
    system: content => add("system", content, "system"),
    remove: (id, everyone) => setMessages(all => everyone ? all.map(m => m.id === id ? { ...m, deleted: true, content: "This message was deleted", attachment: undefined, images: undefined, reactions: [], replyTo: undefined } : m) : all.filter(m => m.id !== id)),
    react: (id, emoji) => setMessages(all => all.map(m => m.id === id && !m.deleted ? { ...m, reactions: m.reactions?.some(r => r.emoji === emoji && r.userId === "me") ? m.reactions.filter(r => !(r.emoji === emoji && r.userId === "me")) : [...(m.reactions ?? []), { emoji, userId: "me" }] } : m)),
    updateAttachment: (id, update) => setMessages(all => all.map(m => ({ ...m, attachment: m.attachment?.id === id ? { ...m.attachment, ...update } : m.attachment, images: m.images?.map(f => f.id === id ? { ...f, ...update } : f) }))),
    setStatus: status => setMessages(all => all.map(m => m.senderId === "me" ? { ...m, status } : m)),
  }
}
