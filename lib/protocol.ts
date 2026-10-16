import { z } from "zod"

export const MAX_ENVELOPE_BYTES = 256 * 1024
const id = z.string().min(1).max(128)
const timestamp = z.number().int().nonnegative().optional()

export const envelopeSchema = z.union([
  z.object({ type: z.literal("msg"), id, content: z.string().max(32_000), format: z.enum(["text", "emoji", "voice", "image", "file", "video", "system"]).optional(), replyTo: id.optional(), duration: z.number().nonnegative().max(86_400).optional(), createdAt: timestamp }).strict(),
  z.object({ type: z.literal("ack"), id, status: z.enum(["delivered", "seen"]) }).strict(),
  z.object({ type: z.literal("typing"), active: z.boolean() }).strict(),
  z.object({ type: z.literal("ping"), at: timestamp }).strict(),
  z.object({ type: z.literal("pong"), at: timestamp }).strict(),
  z.object({ type: z.literal("react"), id, emoji: z.string().min(1).max(16), active: z.boolean() }).strict(),
  z.object({ type: z.literal("delete"), id, scope: z.enum(["me", "everyone"]) }).strict(),
  z.object({ type: z.literal("timer"), seconds: z.number().int().min(0).max(31_536_000) }).strict(),
  z.object({ type: z.literal("file-offer"), id, name: z.string().min(1).max(255), mime: z.string().max(128), size: z.number().int().nonnegative().max(200 * 1024 * 1024), sha256: z.string().regex(/^[a-f0-9]{64}$/i) }).strict(),
  z.object({ type: z.literal("file-accept"), id }).strict(),
  z.object({ type: z.literal("file-decline"), id, reason: z.string().max(256).optional() }).strict(),
  z.object({ type: z.literal("file-chunk"), id, index: z.number().int().nonnegative(), data: z.string().min(1).max(24 * 1024) }).strict(),
  z.object({ type: z.literal("file-end"), id, chunks: z.number().int().nonnegative() }).strict(),
  z.object({ type: z.literal("file-cancel"), id, reason: z.string().max(256).optional() }).strict(),
  z.object({ type: z.literal("call-offer"), id, sdp: z.string().min(1).max(64 * 1024), media: z.enum(["audio", "video"]) }).strict(),
  z.object({ type: z.literal("call-answer"), id, sdp: z.string().min(1).max(64 * 1024) }).strict(),
  z.object({ type: z.literal("call-ice"), id, candidate: z.string().max(4096), sdpMid: z.string().max(256).nullable().optional(), sdpMLineIndex: z.number().int().nonnegative().nullable().optional() }).strict(),
  z.object({ type: z.literal("call-hangup"), id }).strict(),
  z.object({ type: z.literal("call-reject"), id, reason: z.string().max(256).optional() }).strict(),
  z.object({ type: z.literal("call-mute"), id, muted: z.boolean() }).strict(),
])

export type Envelope = z.infer<typeof envelopeSchema>

export function parse(input: unknown): Envelope | null {
  try {
    let value = input
    if (input instanceof Uint8Array) {
      if (input.byteLength > MAX_ENVELOPE_BYTES) return null
      value = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(input))
    } else if (typeof input === "string") {
      if (new TextEncoder().encode(input).byteLength > MAX_ENVELOPE_BYTES) return null
      value = JSON.parse(input)
    } else {
      const serialized = JSON.stringify(input)
      if (serialized === undefined || new TextEncoder().encode(serialized).byteLength > MAX_ENVELOPE_BYTES) return null
      value = JSON.parse(serialized)
    }
    const result = envelopeSchema.safeParse(value)
    return result.success ? result.data : null
  } catch {
    return null
  }
}
