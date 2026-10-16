"use client"

import { LockKeyhole, Shield, ShieldCheck, UserRound } from "lucide-react"
import { AqurkIcon } from "@/components/brand/AqurkIcon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function RoomReady({ name, verified, onVerify, onLeave }: { name: string; verified: boolean; onVerify: () => void; onLeave: () => void }) {
  return <section className="flow-card ready-card"><header className="ready-header"><div className="flex items-center gap-2 text-sm"><span className="status-dot" />{"Demo room"}</div><Button variant="ghost" size="icon" aria-label={"Open safety code"} onClick={onVerify}><LockKeyhole /></Button></header><div className="flow-emblem mt-8"><AqurkIcon className="size-12" /></div><Badge variant="outline" className={cn("verification-badge", verified ? "is-verified" : "is-unverified")}>{verified ? <ShieldCheck data-icon="inline-start" /> : <Shield data-icon="inline-start" />}{verified ? "Verified · Demo" : "Unverified"}</Badge><h1 className="flow-title mt-5">{"Just you. And your person."}</h1><p className="flow-description">{"You’ve reached the end of the Phase 1 preview. Your private room is ready; the chat experience comes next."}</p><div className="my-7 flex items-center justify-center gap-3"><Badge variant="secondary" className="nickname-chip"><UserRound data-icon="inline-start" />{name}</Badge><span className="text-muted-foreground">&</span><Badge variant="secondary" className="nickname-chip"><UserRound data-icon="inline-start" />Alex</Badge></div><Button variant="outline" size="lg" className="w-full" onClick={onVerify}><ShieldCheck data-icon="inline-start" />{"View safety code"}</Button><Button variant="ghost" className="mt-3" onClick={onLeave}>{"Leave room & start again"}</Button><p className="demo-note">{"No real connection · No messages sent · Nothing stored"}</p></section>
}
