import { describe, expect, it } from "vitest"
import { decryptJson, deriveKeys, encryptJson, safetyCode, SAFETY_EMOJI_TABLE } from "../lib/crypto"

describe("Web Crypto primitives", () => {
  it("derives a stable room id for the same code and a different id for another code", async () => {
    const first = await deriveKeys("correct horse battery staple")
    const same = await deriveKeys("correct horse battery staple")
    const other = await deriveKeys("another private phrase")
    expect(first.roomId).toBe(same.roomId)
    expect(first.roomId).not.toBe(other.roomId)
    expect(first.roomId).toMatch(/^[a-f0-9]{64}$/)
    expect(first.key.extractable).toBe(false)
  })

  it("encrypts and decrypts JSON with optional authenticated data", async () => {
    const { key } = await deriveKeys("test phrase")
    const original = { type: "msg", content: "hello", nested: [1, true] }
    const encrypted = await encryptJson(key, original, "msg:1")
    await expect(decryptJson(key, encrypted, "msg:1")).resolves.toEqual(original)
  })

  it("rejects modified ciphertext and mismatched authenticated data", async () => {
    const { key } = await deriveKeys("tamper test phrase")
    const encrypted = await encryptJson(key, { private: true }, "msg:2")
    const changed = encrypted.slice()
    changed[changed.length - 1] ^= 0x01
    await expect(decryptJson(key, changed, "msg:2")).rejects.toThrow()
    await expect(decryptJson(key, encrypted, "msg:other")).rejects.toThrow()
  })

  it("uses a fresh IV for each encryption", async () => {
    const { key } = await deriveKeys("iv uniqueness phrase")
    const first = await encryptJson(key, { n: 1 })
    const second = await encryptJson(key, { n: 1 })
    expect(Array.from(first.slice(0, 12))).not.toEqual(Array.from(second.slice(0, 12)))
  })

  it("creates the same safety code independent of fingerprint order", async () => {
    const forward = await safetyCode("fingerprint-a", "fingerprint-b")
    const reverse = await safetyCode("fingerprint-b", "fingerprint-a")
    expect(forward).toEqual(reverse)
    expect(forward.emojis).toHaveLength(12)
    expect(forward.emojis.every(({ label }) => label.length > 0)).toBe(true)
    expect(forward.numbers).toHaveLength(5)
    expect(forward.numbers.every((group) => /^\d{5}$/.test(group))).toBe(true)
    expect(SAFETY_EMOJI_TABLE).toHaveLength(256)
    expect(new Set(SAFETY_EMOJI_TABLE.map(({ symbol }) => symbol)).size).toBe(256)
  })
})
