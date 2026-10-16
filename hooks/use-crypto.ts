"use client"

import { useCallback, useEffect, useState } from "react"
import { decryptJson, deriveKeys, encryptJson, safetyCode as makeSafetyCode, type SafetyCode } from "@/lib/crypto"
import { demoFingerprint } from "@/lib/fingerprint"

const emptyFingerprint: SafetyCode = { emojis: [], numbers: [] }

export function useCrypto(code?: string, fingerprintA?: string | null, fingerprintB?: string | null) {
  const [derived, setDerived] = useState<Awaited<ReturnType<typeof deriveKeys>> | null>(null)
  const [peerSafetyCode, setPeerSafetyCode] = useState<SafetyCode | null>(null)
  const demoEnabled = process.env.NEXT_PUBLIC_DEMO === "1"

  useEffect(() => {
    let active = true
    setDerived(null)
    if (code) void deriveKeys(code).then((keys) => { if (active) setDerived(keys) }).catch(() => { if (active) setDerived(null) })
    return () => { active = false }
  }, [code])

  useEffect(() => {
    let active = true
    setPeerSafetyCode(null)
    if (fingerprintA && fingerprintB) {
      void makeSafetyCode(fingerprintA, fingerprintB).then((value) => { if (active) setPeerSafetyCode(value) })
    }
    return () => { active = false }
  }, [fingerprintA, fingerprintB])

  const encrypt = useCallback(async (obj: unknown, aad?: string | Uint8Array) => {
    if (!derived) throw new Error("Encryption key is not ready")
    return encryptJson(derived.key, obj, aad)
  }, [derived])
  const decrypt = useCallback(async <T = unknown>(bytes: Uint8Array, aad?: string | Uint8Array): Promise<T> => {
    if (!derived) throw new Error("Encryption key is not ready")
    return decryptJson<T>(derived.key, bytes, aad)
  }, [derived])

  // The bundled sample fingerprint is strictly gated to explicit demo builds.
  const fingerprint = peerSafetyCode ?? (demoEnabled ? demoFingerprint : emptyFingerprint)
  return {
    ready: derived !== null,
    roomId: derived?.roomId ?? null,
    encrypt,
    decrypt,
    safetyCode: peerSafetyCode,
    fingerprint,
    isEncrypted: derived !== null,
    isDemo: demoEnabled,
  }
}
