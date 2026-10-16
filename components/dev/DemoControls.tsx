"use client"

import { useState } from "react"
import { SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ConnectionState, DemoScenario } from "@/lib/types"

export function DemoControls({ scenario, onScenario, state, onArrival, enabled = true }: { scenario: DemoScenario; onScenario: (value: DemoScenario) => void; state: ConnectionState; onArrival: () => void; enabled?: boolean }) {
  const [open, setOpen] = useState(false)
  if (!enabled) return null
  return <aside className="demo-controls" aria-label={"Demo controls"}><Button variant="outline" size="sm" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="demo-panel">{open ? <X data-icon="inline-start" /> : <SlidersHorizontal data-icon="inline-start" />}{"Demo controls"}</Button>{open && <div id="demo-panel" className="demo-panel"><p className="font-display text-sm font-medium">{"Try a different path"}</p><label htmlFor="scenario" className="text-xs text-muted-foreground">{"Next connection"}</label><select id="scenario" value={scenario} onChange={e => onScenario(e.target.value as DemoScenario)} disabled={state === "connecting"}><option value="normal">{"Successful connection"}</option><option value="failure">{"Connection failure"}</option><option value="full">{"Room full"}</option><option value="wait">{"Wait for a friend (60s hint)"}</option><option value="relay">{"Relayed connection"}</option></select>{state === "waiting" && <Button variant="secondary" onClick={onArrival}>{"Simulate friend joining"}</Button>}<p className="text-[11px] leading-relaxed text-muted-foreground">{"Frontend only. All room activity is simulated in memory."}</p></div>}</aside>
}
