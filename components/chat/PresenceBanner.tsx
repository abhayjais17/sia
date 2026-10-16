import { LoaderCircle, WifiOff } from "lucide-react"
import type { NetworkState } from "@/hooks/use-mock-presence"
export function PresenceBanner({ network, online }: { network: NetworkState; online: boolean }) {
  if (network === "connected" && online) return null
  return <div role="status" className={`presence-banner ${network === "offline" ? "error" : ""}`}><span className="flex items-center gap-2">{network === "reconnecting" ? <LoaderCircle className="size-4 shrink-0 animate-spin" /> : <WifiOff className="size-4 shrink-0" />}{network === "offline" ? "You’re offline" : network === "reconnecting" ? "Reconnecting…" : "Friend went offline. Messages can’t be delivered until they return."}</span></div>
}
