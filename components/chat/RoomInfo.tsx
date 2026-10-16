import { ArrowRight, ChevronRight, LockKeyhole, Network, ShieldCheck, Timer } from "lucide-react"
import type { Peer } from "@/lib/types"

export function RoomInfo({ peer, verified, relay, onSafety, onTimer, onPrivacy }: { peer: Peer; verified: boolean; relay: boolean; onSafety: () => void; onTimer: () => void; onPrivacy: () => void }) {
  return <>
    <div className="info-profile"><div className="peer-avatar large" aria-hidden="true">{peer.name.slice(0, 1)}</div><h2>{peer.name}</h2><span className={!peer.online ? "peer-offline" : undefined}><span className="status-dot" />{peer.online ? "Here, with you" : "Offline for now"}</span><p>Just a name. No profile. No conversation history saved by this demo.</p></div>
    <div className="info-section"><h3>A LITTLE PEACE OF MIND</h3><button className="info-link" onClick={onSafety}><ShieldCheck /><span>Safety code<small>{verified ? "Verified · simulated" : "Not verified · simulated"}</small></span><ChevronRight /></button><div className="info-link"><Network /><span>{relay ? "Relayed" : "Direct (peer-to-peer)"}<small>Simulated connection</small></span><span className="status-dot" /></div><button className="info-link" onClick={onTimer}><Timer /><span>Disappearing messages<small>Off · controls arrive in Phase 3</small></span><ChevronRight /></button></div>
    <div className="info-section"><h3>JUST BETWEEN YOU</h3><p className="text-xs leading-6 text-muted-foreground">Share a thought, a photo, a little bit of your day. Leave the rest outside.</p></div>
    <div className="info-bottom"><LockKeyhole /><p>Only here. Only now.<span>Encryption is simulated in this demo.</span></p><button className="download-link mt-4" onClick={onPrivacy}>A note on privacy<ArrowRight className="size-3" /></button></div>
  </>
}
