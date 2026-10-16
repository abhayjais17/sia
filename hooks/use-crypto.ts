"use client"

import { demoFingerprint } from "@/lib/fingerprint"

// TODO: integrate crypto
export function useCrypto() {
  return { fingerprint: demoFingerprint, isEncrypted: false, isDemo: true as const }
}
