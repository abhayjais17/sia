"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const categories = { Faces: [["😀", "happy"], ["😊", "smile"], ["😂", "laugh"], ["🥹", "touched"], ["😎", "cool"], ["🤔", "thinking"]], Gestures: [["👍", "thumbs up"], ["👋", "wave"], ["🙌", "celebrate"], ["🤝", "handshake"], ["🙏", "thanks"], ["✌️", "peace"]], Nature: [["🌿", "leaf"], ["🌊", "ocean"], ["🌙", "moon"], ["✨", "sparkles"], ["🌸", "flower"], ["☀️", "sun"]], Love: [["💜", "purple heart"], ["❤️", "heart"], ["🔥", "fire"], ["🎉", "party"], ["💯", "hundred"], ["☕", "coffee"]] }
export default function EmojiPicker({ onPick, recent, setRecent }: { onPick: (emoji: string) => void; recent: string[]; setRecent: React.Dispatch<React.SetStateAction<string[]>> }) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<keyof typeof categories | "Recent">("Faces")
  const [tone, setTone] = useState("")
  const items = query ? Object.values(categories).flat().filter(([, name]) => name.includes(query.toLowerCase())) : category === "Recent" ? recent.map(e => [e, "recent"]) : categories[category]
  return <section className="emoji-panel" aria-label="Emoji picker"><Input aria-label="Search emoji" placeholder="Search emoji…" value={query} onChange={e => setQuery(e.target.value)} /><div className="flex flex-wrap gap-1">{["Recent", ...Object.keys(categories)].map(c => <Button key={c} size="xs" variant={category === c ? "secondary" : "ghost"} onClick={() => setCategory(c as typeof category)}>{c}</Button>)}</div><div className="emoji-grid">{items.map(([emoji, name]) => <button key={emoji} type="button" aria-label={name} onClick={() => { const selected = categories.Gestures.some(([e]) => e === emoji) ? emoji.replace("️", "") + tone : emoji; setRecent(r => [selected, ...r.filter(e => e !== selected)].slice(0, 12)); onPick(selected) }}>{emoji}</button>)}</div>{!items.length && <p className="text-xs text-muted-foreground">No emoji yet.</p>}<label className="flex items-center justify-between text-xs text-muted-foreground">Skin tone<select value={tone} onChange={e => setTone(e.target.value)} aria-label="Skin tone"><option value="">Default</option>{["🏻", "🏼", "🏽", "🏾", "🏿"].map((t, i) => <option key={t} value={t}>Tone {i + 1}</option>)}</select></label></section>
}
