import { Reply, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
export function ReactionBar({ react, reply, remove }: { react: (emoji: string) => void; reply: () => void; remove: () => void }) {
  return <div className="reaction-bar" role="group" aria-label="Message actions">{["💜", "👍", "😂", "✨"].map(emoji => <button key={emoji} aria-label={`React ${emoji}`} onClick={() => react(emoji)}>{emoji}</button>)}<Button variant="ghost" size="icon" aria-label="Reply to message" onClick={reply}><Reply /></Button><Button variant="ghost" size="icon" aria-label="Delete message" onClick={remove}><Trash2 /></Button></div>
}
