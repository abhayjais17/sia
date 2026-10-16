const encoder = new TextEncoder()
const decoder = new TextDecoder("utf-8", { fatal: true })

export type SafetyEmoji = { symbol: string; label: string }
export type SafetyCode = { emojis: SafetyEmoji[]; numbers: string[] }
export type DerivedKeys = { roomId: string; key: CryptoKey }
export type AdditionalData = string | Uint8Array

const emojiBase = [
  ["🐈", "Cat"], ["🐕", "Dog"], ["🦊", "Fox"], ["🐻", "Bear"], ["🐼", "Panda"], ["🐨", "Koala"], ["🐯", "Tiger"], ["🦁", "Lion"],
  ["🐸", "Frog"], ["🐵", "Monkey"], ["🐧", "Penguin"], ["🦉", "Owl"], ["🦋", "Butterfly"], ["🐢", "Turtle"], ["🐬", "Dolphin"], ["🦄", "Unicorn"],
  ["🌙", "Moon"], ["⭐", "Star"], ["☀️", "Sun"], ["🌈", "Rainbow"], ["🌊", "Wave"], ["🌸", "Blossom"], ["🌻", "Sunflower"], ["🍀", "Clover"],
  ["🍎", "Apple"], ["🍋", "Lemon"], ["🍇", "Grapes"], ["🍉", "Watermelon"], ["🍓", "Strawberry"], ["🥑", "Avocado"], ["🍒", "Cherries"], ["🥝", "Kiwi"],
  ["🚀", "Rocket"], ["🛸", "Flying saucer"], ["🚲", "Bicycle"], ["🚂", "Train"], ["⛵", "Sailboat"], ["✈️", "Airplane"], ["🚁", "Helicopter"], ["🚕", "Taxi"],
  ["🎈", "Balloon"], ["🎨", "Palette"], ["🎸", "Guitar"], ["🎺", "Trumpet"], ["🎲", "Dice"], ["🎯", "Target"], ["🎁", "Gift"], ["🏆", "Trophy"],
  ["🔑", "Key"], ["🔒", "Lock"], ["💎", "Gem"], ["🧭", "Compass"], ["🔔", "Bell"], ["📚", "Books"], ["✉️", "Envelope"], ["🪁", "Kite"],
  ["🧸", "Teddy bear"], ["🪴", "Potted plant"], ["🪷", "Lotus"], ["🪐", "Planet"], ["🧩", "Puzzle piece"], ["🪄", "Magic wand"], ["🛟", "Life ring"], ["🪸", "Coral"],
] as const

const emojiMarkers = [
  ["🔴", "red marker"], ["🟠", "orange marker"], ["🟡", "yellow marker"], ["🟢", "green marker"],
] as const

// Each of 64 base emoji has four visibly distinct marker variants: 256 fixed entries.
export const SAFETY_EMOJI_TABLE: readonly SafetyEmoji[] = Object.freeze(
  Array.from({ length: 256 }, (_, index) => {
    const base = emojiBase[index % emojiBase.length]
    const marker = emojiMarkers[Math.floor(index / emojiBase.length)]
    return { symbol: `${base[0]}${marker[0]}`, label: `${base[1]}, ${marker[1]}` }
  }),
)

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

async function hkdfBits(master: CryptoKey, info: string): Promise<ArrayBuffer> {
  return crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt: new Uint8Array(), info: encoder.encode(info) },
    master,
    256,
  )
}

export async function deriveKeys(code: string): Promise<DerivedKeys> {
  if (!code) throw new TypeError("Secret code must not be empty")
  const material = await crypto.subtle.importKey("raw", encoder.encode(code), "PBKDF2", false, ["deriveBits"])
  const masterBits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: encoder.encode("aqurk-v1"), iterations: 250000 },
    material,
    256,
  )
  const master = await crypto.subtle.importKey("raw", masterBits, "HKDF", false, ["deriveBits"])
  const [roomBits, encryptionBits] = await Promise.all([
    hkdfBits(master, "aqurk-room"),
    hkdfBits(master, "aqurk-enc"),
  ])
  const roomId = toHex(new Uint8Array(roomBits))
  const key = await crypto.subtle.importKey(
    "raw",
    encryptionBits,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  )
  return { roomId, key }
}

function aadBytes(aad?: AdditionalData): Uint8Array | undefined {
  if (aad === undefined) return undefined
  return typeof aad === "string" ? encoder.encode(aad) : aad
}

export async function encryptJson(key: CryptoKey, obj: unknown, aad?: AdditionalData): Promise<Uint8Array> {
  const serialized = JSON.stringify(obj)
  if (serialized === undefined) throw new TypeError("Value must be JSON serializable")
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const additionalData = aadBytes(aad)
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, ...(additionalData ? { additionalData } : {}) },
    key,
    encoder.encode(serialized),
  )
  const output = new Uint8Array(iv.length + ciphertext.byteLength)
  output.set(iv)
  output.set(new Uint8Array(ciphertext), iv.length)
  return output
}

export async function decryptJson<T = unknown>(key: CryptoKey, bytes: Uint8Array, aad?: AdditionalData): Promise<T> {
  if (bytes.byteLength < 28) throw new TypeError("Encrypted payload is too short")
  const iv = bytes.subarray(0, 12)
  const additionalData = aadBytes(aad)
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv, ...(additionalData ? { additionalData } : {}) },
    key,
    bytes.subarray(12),
  )
  return JSON.parse(decoder.decode(plaintext)) as T
}

export async function safetyCode(fingerprintA: string, fingerprintB: string): Promise<SafetyCode> {
  const sorted = [fingerprintA, fingerprintB].sort((a, b) => a.localeCompare(b))
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(sorted.join("\n"))))
  const emojis = Array.from(digest.slice(0, 12), (byte) => SAFETY_EMOJI_TABLE[byte])
  const digits = BigInt(`0x${toHex(digest)}`).toString(10).padStart(78, "0").slice(0, 25)
  return { emojis, numbers: Array.from({ length: 5 }, (_, index) => digits.slice(index * 5, index * 5 + 5)) }
}
