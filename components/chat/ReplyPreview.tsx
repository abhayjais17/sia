import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Message } from "@/lib/types"
export function ReplyPreview({ message, onDismiss, onJump }: { message?: Message; onDismiss?: () => void; onJump?: () => void }) {
  const content = message?.deleted ? "This message was deleted" : message?.content || message?.attachment?.name || message?.images?.[0]?.name || (message?.type === "voice" ? "Voice note" : "Original message no longer available")
  if (onDismiss) return <div className="reply-composer"><div><span>Replying to {message?.senderId === "me" ? "yourself" : "Alex"}</span><p>{content}</p></div><Button variant="ghost" size="icon" aria-label="Cancel reply" onClick={onDismiss}><X /></Button></div>
  return <button className="quoted-message" disabled={!message} onClick={onJump}><span>{message?.senderId === "me" ? "You" : "Alex"}</span><p>{content}</p></button>
}
