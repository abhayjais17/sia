"use client"
import { useEffect, useState } from "react"
import { ArrowDown, ArrowUp, Check, Search, Timer, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu"
import type { DisappearingTimer } from "@/lib/types"
export const timers: { value: DisappearingTimer; label: string }[] = [{ value: 0, label: "Off" }, { value: 10, label: "10 seconds" }, { value: 60, label: "1 minute" }, { value: 3600, label: "1 hour" }, { value: 86400, label: "24 hours" }]
export function TimerMenu({ value, onChange }: { value: DisappearingTimer; onChange: (value: DisappearingTimer) => void }) {
  return <DropdownMenu><DropdownMenuTrigger render={<Button variant="outline" />}><Timer />{timers.find(t => t.value === value)?.label}</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuRadioGroup value={String(value)} onValueChange={v => onChange(Number(v) as DisappearingTimer)}>{timers.map(t => <DropdownMenuRadioItem key={t.value} value={String(t.value)}>{t.label}</DropdownMenuRadioItem>)}</DropdownMenuRadioGroup></DropdownMenuContent></DropdownMenu>
}
export function TimerDialog({ open, close, value, change }: { open: boolean; close: () => void; value: DisappearingTimer; change: (v: DisappearingTimer) => void }) {
  return <Dialog open={open} onOpenChange={v => !v && close()}><DialogContent className="aqurk-dialog"><DialogHeader><DialogTitle>A little less permanent.</DialogTitle><DialogDescription>New messages disappear after this time. This cannot erase screenshots or copies.</DialogDescription></DialogHeader><div className="flex flex-col gap-2">{timers.map(t => <Button key={t.value} variant={value === t.value ? "secondary" : "outline"} onClick={() => { change(t.value); close() }}><Timer />{t.label}{value === t.value && <Check />}</Button>)}</div></DialogContent></Dialog>
}
export function Countdown({ expiresAt, timestamp }: { expiresAt: number; timestamp: number }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(id) }, [])
  const remaining = Math.max(0, expiresAt - now)
  return <span className="countdown" title={`Disappears in ${Math.ceil(remaining / 1000)} seconds`} aria-label={`Disappears in ${Math.ceil(remaining / 1000)} seconds`}><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" opacity=".25" strokeWidth="2" /><circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" pathLength="100" strokeDasharray={`${remaining / (expiresAt - timestamp) * 100} 100`} transform="rotate(-90 10 10)" /></svg></span>
}
export function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return <>{text.split(new RegExp(`(${escaped})`, "gi")).map((s, i) => s.toLowerCase() === query.toLowerCase() ? <mark key={i}>{s}</mark> : s)}</>
}
export function SearchBar({ query, setQuery, count, index, move, close }: { query: string; setQuery: (v: string) => void; count: number; index: number; move: (n: number) => void; close: () => void }) {
  return <div className="conversation-search" role="search" onKeyDown={e => { if (e.key === "Escape") close() }}><Search className="size-4 shrink-0" /><Input autoFocus aria-label="Search messages" placeholder="Find a message…" value={query} onChange={e => setQuery(e.target.value)} /><span aria-live="polite" className="whitespace-nowrap text-xs text-muted-foreground">{count ? `${index + 1} of ${count}` : "0 matches"}</span><Button variant="ghost" size="icon" disabled={!count} aria-label="Previous match" onClick={() => move(-1)}><ArrowUp /></Button><Button variant="ghost" size="icon" disabled={!count} aria-label="Next match" onClick={() => move(1)}><ArrowDown /></Button><Button variant="ghost" size="icon" aria-label="Close search" onClick={close}><X /></Button></div>
}
