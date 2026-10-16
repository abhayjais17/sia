"use client"

import { Check, Copy, QrCode, UserRound } from "lucide-react"
import { AqurkIcon } from "@/components/brand/AqurkIcon"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCopy } from "@/hooks/use-copy"
import { createRoomLink } from "@/lib/passphrase"

export function WaitingRoom({ name, code, stillWaiting, onShare, onLeave, isDemoPaused }: { name: string; code: string; stillWaiting: boolean; onShare: () => void; onLeave: () => void; isDemoPaused: boolean }) {
  const { copied, copy } = useCopy()
  return <section className="flow-card waiting-card" aria-labelledby="waiting-heading"><div className="radar" aria-hidden="true"><span className="radar-ring" /><span className="radar-ring" /><span className="radar-ring" /><div className="radar-center"><AqurkIcon className="size-14" /></div></div><Badge variant="outline" className="connection-badge"><span className="status-dot" />{"Room is ready"}</Badge><h1 className="flow-title mt-5" id="waiting-heading">{"Good things are worth a hello."}</h1><p className="flow-description">{"Waiting for your friend to enter the same code"}</p><Badge variant="secondary" className="nickname-chip"><UserRound data-icon="inline-start" />{name}<span className="text-muted-foreground">{"(you)"}</span></Badge><div className="mt-8 grid grid-cols-2 gap-3"><Button variant="gradient" size="lg" onClick={() => copy(createRoomLink(code))}>{copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}{copied ? "Copied" : "Copy link"}</Button><Button variant="outline" size="lg" onClick={onShare}><QrCode data-icon="inline-start" />{"Show QR"}</Button></div><div className="waiting-hint" role="status">{stillWaiting ? "Still waiting. Make sure your friend uses the exact same code." : "Send your friend a little invitation. We’ll take it from there."}</div><Button variant="ghost" onClick={onLeave}>{"Leave room"}</Button><p className="demo-note">{isDemoPaused ? "Demo · Automatic arrival paused" : "Demo · Your friend will join in a moment"}</p></section>
}
