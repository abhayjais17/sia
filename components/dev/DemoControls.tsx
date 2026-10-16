"use client"

import { useState } from "react"
import { SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ConnectionState, DemoScenario } from "@/lib/types"

export function DemoControls({ scenario, onScenario, state, onArrival, enabled = true }: { scenario: DemoScenario; onScenario: (value: DemoScenario) => void; state: ConnectionState; onArrival: () => void; enabled?: boolean }) {
  const [open, setOpen] = useState(false)
  if (!enabled) return null
  return <aside className="demo-controls" aria-label={"Demo controls"}><Button variant="outline" size="sm" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="demo-panel">{open ? <X data-icon="inline-start" /> : <SlidersHorizontal data-icon="inline-start" />}{"Demo controls"}</Button>{open && <div id="demo-panel" className="demo-panel"><p className="font-display text-sm font-medium">{"Try a different path"}</p><label htmlFor="scenario" className="text-xs text-muted-foreground">{"Next connection"}</label><div role="group" aria-label="Next connection">{([["normal", "Successful connection"], ["failure", "Connection failure"], ["full", "Room full"], ["wait", "Wait for a friend"], ["relay", "Relayed connection"]] as const).map(([value, label]) => <Button key={value} variant={scenario === value ? "secondary" : "outline"} disabled={state === "connecting"} onClick={() => onScenario(value as DemoScenario)}>{label}</Button>)}</div>{state === "waiting" && <Button variant="secondary" onClick={onArrival}>{"Simulate friend joining"}</Button>}<p className="text-[11px] leading-relaxed text-muted-foreground">{"Frontend only. All room activity is simulated in memory."}</p></div>}</aside>
}

