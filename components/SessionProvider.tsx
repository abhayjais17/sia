"use client"

import { createContext, useContext, useState } from "react"
import type { DisappearingTimer } from "@/lib/types"

export interface RoomSession { name: string; verified: boolean; relay: boolean }
export interface ChatPreferences { sound: boolean; volume: number; blur: boolean; copyWarning: boolean; timer: DisappearingTimer }
const defaults: ChatPreferences = { sound: false, volume: 40, blur: true, copyWarning: true, timer: 0 }
const Context = createContext<{ session: RoomSession | null; start: (session: RoomSession) => void; clear: () => void; preferences: ChatPreferences; update: (value: Partial<ChatPreferences>) => void; cleared: boolean } | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<RoomSession | null>(null)
  const [preferences, setPreferences] = useState(defaults)
  const [cleared, setCleared] = useState(false)
  return <Context.Provider value={{ session, preferences, cleared, start: value => { setSession(value); setCleared(false) }, clear: () => { setSession(null); setPreferences(defaults); setCleared(true) }, update: value => setPreferences(p => ({ ...p, ...value })) }}>{children}</Context.Provider>
}
export function useSession() { const value = useContext(Context); if (!value) throw new Error("SessionProvider is required"); return value }
