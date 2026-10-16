"use client"

import { useCallback, useEffect, useState } from "react"
import type { ConnectionState, DemoScenario } from "@/lib/types"

// TODO: integrate WebRTC
export function useConnection({ paused = false }: { paused?: boolean } = {}) {
  const [state, setState] = useState<ConnectionState>("idle")
  const [step, setStep] = useState(0)
  const [scenario, setScenario] = useState<DemoScenario>("normal")
  const [verified, setVerified] = useState(false)
  const [waitingSince, setWaitingSince] = useState<number | null>(null)
  const [stillWaiting, setStillWaiting] = useState(false)

  const connect = useCallback(() => {
    setVerified(false)
    setStep(0)
    setStillWaiting(false)
    setWaitingSince(null)
    setState("connecting")
  }, [])

  const leave = useCallback(() => {
    setState("idle")
    setStep(0)
    setVerified(false)
    setStillWaiting(false)
    setWaitingSince(null)
  }, [])

  useEffect(() => {
    if (state !== "connecting") return
    const timer = window.setTimeout(() => {
      if (scenario === "full" && step === 0) { setState("full"); return }
      if (scenario === "failure" && step === 1) { setState("failed"); return }
      if (step < 3) setStep(current => current + 1)
      else { setWaitingSince(Date.now()); setState("waiting") }
    }, step === 3 ? 400 : 900)
    return () => window.clearTimeout(timer)
  }, [state, step, scenario])

  useEffect(() => {
    if (state !== "waiting") return
    const hint = window.setTimeout(() => setStillWaiting(true), Math.max(0, 60000 - (Date.now() - (waitingSince ?? Date.now()))))
    const arrival = scenario !== "wait" && !paused ? window.setTimeout(() => setState("verification"), 3000) : undefined
    return () => { window.clearTimeout(hint); window.clearTimeout(arrival) }
  }, [state, scenario, paused, waitingSince])

  const completeVerification = (matches: boolean) => { setVerified(matches); setState("connected") }
  return { state, step, scenario, setScenario, verified, stillWaiting, connect, leave, completeVerification, simulateArrival: () => setState("verification") }
}
