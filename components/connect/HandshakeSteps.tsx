"use client"

import { motion } from "framer-motion"
import { Check, Fingerprint, LoaderCircle, LockKeyhole, Radio, RefreshCw, TriangleAlert, UsersRound, Wifi } from "lucide-react"
import { AqurkIcon } from "@/components/brand/AqurkIcon"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { ConnectionState } from "@/lib/types"
import { cn } from "@/lib/utils"

export function HandshakeSteps({ step, state, relay, onCancel, onRetry }: { step: number; state: ConnectionState; relay: boolean; onCancel: () => void; onRetry: () => void }) {
  const failed = state === "failed"
  const full = state === "full"
  const error = failed || full
  const steps = [
    { icon: Radio, title: "Finding room", description: "Following your shared secret" },
    { icon: LockKeyhole, title: "Securing connection", description: "Creating a private path between you" },
    { icon: Fingerprint, title: "Verifying keys", description: "Making sure everything lines up" },
  ]
  return <section className="flow-card" aria-labelledby="connection-heading"><div className={cn("flow-emblem", error && "error-emblem")}>{full ? <UsersRound /> : failed ? <TriangleAlert /> : <AqurkIcon className="size-12" />}</div><h1 id="connection-heading" className="flow-title">{full ? "This room is already full." : failed ? "Couldn’t connect" : "A private connection. Coming up."}</h1><p className="flow-description">{full ? "Aqurk rooms are made for two. Try a different secret code to create a new space." : failed ? "The connection was interrupted. Your secret code is still here, ready when you are." : "A few quiet steps before you can say hello."}</p>
    {!error && <><ol className="handshake-list" aria-live="polite">{steps.map((item, index) => <li key={index} className={cn("handshake-step", index < step && "is-complete", index === step && "is-active")} aria-current={index === step ? "step" : undefined}><div className="step-icon"><item.icon className="size-[18px]" /></div><div className="min-w-0 flex-1"><p className="text-sm font-medium">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.description}</p>{index === step && <Skeleton className="mt-2 h-1 w-24" />}</div><span className="sr-only">{index < step ? "Complete" : index === step ? "In progress" : "Pending"}</span>{index < step ? <motion.span initial={{ scale: .5 }} animate={{ scale: 1 }}><Check className="size-4 text-success" /></motion.span> : index === step ? <LoaderCircle className="size-4 animate-spin text-brand-violet" /> : <span className="size-1.5 rounded-full bg-muted-foreground/30" />}</li>)}</ol><Badge variant="outline" className="connection-badge"><Wifi data-icon="inline-start" />{relay ? "Using relay (may be slower)" : "Direct connection"}</Badge></>}
    <div className="mt-7 flex flex-col gap-2">{failed && <Button variant="gradient" size="lg" onClick={onRetry}><RefreshCw data-icon="inline-start" />{"Retry connection"}</Button>}<Button variant={error ? "outline" : "ghost"} size="lg" onClick={onCancel}>{error ? "Change code" : "Cancel"}</Button></div><p className="demo-note">{"Simulated connection · Nothing is sent or stored"}</p></section>
}
