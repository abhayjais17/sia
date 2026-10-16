"use client"
import { Fragment, useEffect, useRef, useState } from "react"
import { AnimatePresence } from "framer-motion"
import { ArrowDown, LockKeyhole, MessageCircle } from "lucide-react"
import { MessageScroller, MessageScrollerProvider, MessageScrollerViewport, MessageScrollerContent, MessageScrollerButton } from "@/components/ui/message-scroller"
import { Marker, MarkerContent } from "@/components/ui/marker"
import { MessageBubble } from "./MessageBubble"
import type { Message, TransferState } from "@/lib/types"
export function MessageList({ messages, typing, onReply, onDelete, onReact, onImage, onTransfer, query = "" }: { query?: string; messages: Message[]; typing: boolean; onReply: (message: Message) => void; onDelete: (message: Message) => void; onReact: (id: string, emoji: string) => void; onImage: (url: string, name: string) => void; onTransfer: (id: string, state: TransferState) => void }) {
  const [unread, setUnread] = useState(0)
  const nearBottom = useRef(true)
  const previous = useRef(new Set<string>())
  useEffect(() => {
    const newIncoming = messages.filter(m => !previous.current.has(m.id) && m.senderId === "alex").length
    if (!nearBottom.current) setUnread(n => n + newIncoming)
    previous.current = new Set(messages.map(m => m.id))
    if (!messages.length) setUnread(0)
  }, [messages])
  const lastPeer = messages.findLast(m => m.senderId === "alex" && !m.deleted)?.id
  const day = (timestamp: number) => new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  return <MessageScrollerProvider><MessageScroller className="chat-transcript"><MessageScrollerViewport role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions" onScroll={e => { const el = e.currentTarget; nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100; if (nearBottom.current) setUnread(0) }}><MessageScrollerContent className="transcript-content"><Marker className="chat-safety-note"><MarkerContent><LockKeyhole className="size-3.5" />Messages are end-to-end encrypted</MarkerContent></Marker>{!messages.length && <div className="empty-chat"><span className="empty-chat-icon"><MessageCircle /></span><h2>A little hello goes a long way.</h2><p>Say hi. This chat disappears when you leave.</p></div>}<AnimatePresence initial={false}>{messages.map((m, i) => <Fragment key={m.id}>{(i === 0 || day(messages[i - 1].timestamp) !== day(m.timestamp)) && <Marker variant="separator"><MarkerContent>{day(m.timestamp) === day(Date.now()) ? "Today" : day(m.timestamp)}</MarkerContent></Marker>}{m.type === "system" ? <Marker className="system-message"><MarkerContent>{m.content}</MarkerContent></Marker> : <><MessageBubble query={query} message={m} original={messages.find(o => o.id === m.replyTo)} grouped={messages[i + 1]?.senderId === m.senderId && messages[i + 1]?.timestamp - m.timestamp < 120000} onReply={() => onReply(m)} onDelete={() => onDelete(m)} onReact={emoji => onReact(m.id, emoji)} onImage={onImage} onTransfer={onTransfer} />{m.id === lastPeer && <p className="peer-seen">Seen</p>}</>}</Fragment>)}</AnimatePresence>{typing && <div className="typing-indicator" aria-label="Alex is typing"><span>A</span><div><i /><i /><i /></div></div>}</MessageScrollerContent></MessageScrollerViewport><MessageScrollerButton size="sm" className="latest-button" aria-label={`Scroll to latest${unread ? `, ${unread} unread` : ""}`} onClick={() => { nearBottom.current = true; setUnread(0) }}><ArrowDown />Scroll to latest{unread > 0 && <span className="unread-count">{unread}</span>}</MessageScrollerButton></MessageScroller></MessageScrollerProvider>
}
