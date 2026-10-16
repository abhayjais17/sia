"use client"
import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { MoreHorizontal } from "lucide-react"
import { Message as MessageRow, MessageContent } from "@/components/ui/message"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import { MessageStatus } from "./MessageStatus"
import { Countdown, Highlight } from "./ConversationTools"
import { VoiceNotePlayer } from "./VoiceNotePlayer"
import { VideoMessage } from "./VideoMessage"
import { FileCard } from "./FileCard"
import { ReactionBar } from "./ReactionBar"
import { ReplyPreview } from "./ReplyPreview"
import type { Message, TransferState } from "@/lib/types"
import { cn } from "@/lib/utils"
export function jumpToMessage(id: string) { const node = document.getElementById(`message-${id}`); node?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "center" }); node?.classList.add("message-highlight"); setTimeout(() => node?.classList.remove("message-highlight"), 1600) }
function RichText({ content, query }: { content: string; query: string }) {
  return <>{content.split(/(https?:\/\/[^\s]+)/g).map((part, i) => /^https?:\/\//.test(part) ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2"><Highlight text={part} query={query} /></a> : <Highlight key={i} text={part} query={query} />)}</>
}
export function MessageBubble({ message, original, grouped, onReply, onDelete, onReact, onImage, onTransfer, query = "" }: { query?: string; message: Message; original?: Message; grouped: boolean; onReply: () => void; onDelete: () => void; onReact: (emoji: string) => void; onImage: (url: string, name: string) => void; onTransfer: (id: string, state: TransferState) => void }) {
  const [actions, setActions] = useState(false)
  const press = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const origin = useRef({ x: 0, y: 0 })
  useEffect(() => () => clearTimeout(press.current), [])
  const mine = message.senderId === "me"
  const time = new Date(message.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  const attachment = message.attachment
  const images = message.images ?? (message.type === "image" && attachment ? [attachment] : [])
  return <motion.div id={`message-${message.id}`} className={cn("message-wrap", mine && "message-mine", grouped && "message-grouped")} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .97 }} transition={{ duration: .25 }} onPointerDown={e => { if (e.pointerType === "touch") { origin.current = { x: e.clientX, y: e.clientY }; press.current = setTimeout(() => setActions(true), 450) } }} onPointerUp={() => clearTimeout(press.current)} onPointerCancel={() => clearTimeout(press.current)} onPointerMove={e => { if (Math.abs(e.clientX - origin.current.x) > 10 || Math.abs(e.clientY - origin.current.y) > 10) clearTimeout(press.current) }} onKeyDown={e => { if (e.key === "Escape") setActions(false) }}>
    <MessageRow align={mine ? "end" : "start"}><MessageContent><Bubble variant={message.type === "emoji" && !message.deleted ? "ghost" : mine ? "default" : "secondary"} align={mine ? "end" : "start"} className={cn("aqurk-bubble", mine ? "sent-bubble" : "received-bubble")}><BubbleContent>
      {message.replyTo && !message.deleted && <ReplyPreview message={original} onJump={() => original && jumpToMessage(original.id)} />}
      {message.deleted ? <p className="deleted-message">This message was deleted</p> : <>{message.type === "voice" ? <VoiceNotePlayer duration={message.duration} /> : images.length ? <div className={images.length > 1 ? "message-image-grid" : "message-image-single"}>{images.slice(0, 4).map(file => file.url && file.transferState === "completed" ? <button key={file.id} className="image-message" onClick={() => onImage(file.url!, file.name)} aria-label={`Open image ${file.name}`}><img src={file.url} alt={file.name} loading="lazy" width="420" height="280" /></button> : <FileCard key={file.id} file={file} action={onTransfer} />)}</div> : message.type === "video" && attachment?.url && attachment.transferState === "completed" ? <VideoMessage url={attachment.url} name={attachment.name} /> : attachment ? <FileCard file={attachment} action={onTransfer} /> : <p className={message.type === "emoji" ? "emoji-message" : "message-text"}><RichText content={message.content} query={query} /></p>}{message.content && ["image", "video"].includes(message.type) && <p className="mt-2 text-sm">{message.content}</p>}</>}
      <div className="message-meta">{message.expiresAt && <Countdown expiresAt={message.expiresAt} timestamp={message.timestamp} />}<time dateTime={new Date(message.timestamp).toISOString()}>{time}</time>{mine && <MessageStatus status={message.status} time={time} />}</div>
    </BubbleContent></Bubble>{!!message.reactions?.length && <div className="reaction-chips">{Array.from(new Set(message.reactions.map(r => r.emoji))).map(emoji => <button key={emoji} aria-label={`React ${emoji}`} aria-pressed={message.reactions!.some(r => r.emoji === emoji && r.userId === "me")} onClick={() => onReact(emoji)}>{emoji} <span>{message.reactions!.filter(r => r.emoji === emoji).length}</span></button>)}</div>}</MessageContent></MessageRow>
    {!message.deleted && <div className={cn("message-actions", actions && "actions-open")}><Button variant="ghost" size="icon" aria-label="Message actions" aria-expanded={actions} onClick={() => setActions(!actions)}><MoreHorizontal /></Button><ReactionBar react={emoji => { onReact(emoji); setActions(false) }} reply={() => { onReply(); setActions(false) }} remove={() => { onDelete(); setActions(false) }} /></div>}
  </motion.div>
}
