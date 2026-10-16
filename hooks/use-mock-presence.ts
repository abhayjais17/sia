"use client"
import { useState } from "react"
export type NetworkState = "connected" | "reconnecting" | "offline"
/** In-memory network state; no connectivity requests or tracking. */
export function useMockPresence() {
  const [network, setNetwork] = useState<NetworkState>("connected")
  return { network, setNetwork }
}
