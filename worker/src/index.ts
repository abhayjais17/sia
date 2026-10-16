export interface Env {
  ROOMS: DurableObjectNamespace
  ALLOWED_ORIGIN: string
  TURN_CREDENTIALS_URL?: string
}

const STUN_SERVER = { urls: "stun:stun.l.google.com:19302" }
const SIGNAL_LIMIT_BYTES = 16 * 1024
const RATE_WINDOW_MS = 60_000
const RATE_MAX_CONNECTIONS = 10

type SignalData =
  | { type: "offer" | "answer"; sdp: string }
  | { type: "ice"; candidate: string | null; sdpMid?: string | null; sdpMLineIndex?: number | null; usernameFragment?: string | null }

type SignalEnvelope = { type: "signal"; data: SignalData }
type IceServer = { urls: string | string[]; username?: string; credential?: string }

function jsonResponse(body: unknown, status = 200, headers?: HeadersInit): Response {
  const outputHeaders = new Headers(headers)
  outputHeaders.set("Content-Type", "application/json; charset=utf-8")
  return new Response(JSON.stringify(body), { status, headers: outputHeaders })
}

function parseAllowedOrigins(value: string | undefined): Set<string> {
  return new Set((value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      try { return new URL(item).origin } catch { return "" }
    })
    .filter(Boolean))
}

export function isAllowedOrigin(origin: string | null, configured: string | undefined): origin is string {
  if (!origin) return false
  try {
    const url = new URL(origin)
    return url.origin === origin && parseAllowedOrigins(configured).has(origin)
  } catch {
    return false
  }
}

function corsHeaders(origin: string | null, allowedOrigin: boolean): Headers {
  const headers = new Headers({ Vary: "Origin" })
  if (origin && allowedOrigin) {
    headers.set("Access-Control-Allow-Origin", origin)
    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS")
    headers.set("Access-Control-Allow-Headers", "Content-Type")
  }
  return headers
}

function validRoomId(value: string | null): value is string {
  return value !== null && /^[a-fA-F0-9]{64}$/.test(value)
}

function isSignalEnvelope(value: unknown): value is SignalEnvelope {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false
  const envelope = value as Record<string, unknown>
  if (envelope.type !== "signal" || !envelope.data || typeof envelope.data !== "object" || Array.isArray(envelope.data)) return false
  const data = envelope.data as Record<string, unknown>
  if (Object.keys(envelope).some((key) => key !== "type" && key !== "data")) return false
  if (data.type === "offer" || data.type === "answer") {
    if (Object.keys(data).some((key) => key !== "type" && key !== "sdp")) return false
    return typeof data.sdp === "string" && data.sdp.length > 0 && data.sdp.length <= SIGNAL_LIMIT_BYTES
  }
  if (data.type === "ice") {
    if (Object.keys(data).some((key) => !["type", "candidate", "sdpMid", "sdpMLineIndex", "usernameFragment"].includes(key))) return false
    return (typeof data.candidate === "string" || data.candidate === null)
      && (data.candidate === null || data.candidate.length <= 8192)
      && (data.sdpMid === undefined || data.sdpMid === null || (typeof data.sdpMid === "string" && data.sdpMid.length <= 256))
      && (data.sdpMLineIndex === undefined || data.sdpMLineIndex === null || (typeof data.sdpMLineIndex === "number" && Number.isInteger(data.sdpMLineIndex) && data.sdpMLineIndex >= 0))
      && (data.usernameFragment === undefined || data.usernameFragment === null || (typeof data.usernameFragment === "string" && data.usernameFragment.length <= 256))
  }
  return false
}

function byteLength(message: string | ArrayBuffer | ArrayBufferView): number {
  if (typeof message === "string") return new TextEncoder().encode(message).byteLength
  if (message instanceof ArrayBuffer) return message.byteLength
  return message.byteLength
}

function sanitizeIceServers(value: unknown): IceServer[] {
  if (!Array.isArray(value)) return []
  const accepted: IceServer[] = []
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue
    const record = item as Record<string, unknown>
    const urls = typeof record.urls === "string"
      ? [record.urls]
      : Array.isArray(record.urls) && record.urls.every((url) => typeof url === "string")
        ? record.urls as string[]
        : []
    const safeUrls = urls.filter((url) => /^(stun|stuns|turn|turns):/i.test(url))
    if (safeUrls.length === 0) continue
    const server: IceServer = { urls: safeUrls.length === 1 ? safeUrls[0] : safeUrls }
    if (typeof record.username === "string") server.username = record.username
    if (typeof record.credential === "string") server.credential = record.credential
    accepted.push(server)
  }
  return accepted
}

async function fetchIceServers(env: Env): Promise<IceServer[]> {
  const iceServers: IceServer[] = [STUN_SERVER]
  if (!env.TURN_CREDENTIALS_URL) return iceServers
  try {
    const endpoint = new URL(env.TURN_CREDENTIALS_URL)
    if (endpoint.protocol !== "https:") return iceServers
    const response = await fetch(endpoint, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(4_000) })
    if (!response.ok) return iceServers
    const body: unknown = await response.json()
    if (body && typeof body === "object" && !Array.isArray(body)) {
      iceServers.push(...sanitizeIceServers((body as Record<string, unknown>).iceServers))
    }
  } catch {
    // TURN is optional: an unavailable provider falls back to public STUN.
  }
  return iceServers
}

async function allowConnection(env: Env, address: string): Promise<boolean> {
  const limiterId = env.ROOMS.idFromName("global-ip-rate-limit")
  const response = await env.ROOMS.get(limiterId).fetch("https://internal.invalid/__rate-limit", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: address,
  })
  return response.ok
}

async function handleTurn(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get("Origin")
  const allowedOrigin = origin ? isAllowedOrigin(origin, env.ALLOWED_ORIGIN) : false
  const headers = corsHeaders(origin, allowedOrigin)
  headers.set("Cache-Control", "no-store")
  if (origin && !allowedOrigin) return jsonResponse({ error: "Origin not allowed" }, 403, headers)
  if (request.method === "OPTIONS") {
    if (!allowedOrigin) return jsonResponse({ error: "Origin not allowed" }, 403, headers)
    return new Response(null, { status: 204, headers })
  }
  if (request.method !== "GET") return jsonResponse({ error: "Method not allowed" }, 405, headers)
  return jsonResponse({ iceServers: await fetchIceServers(env) }, 200, headers)
}

async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  if (url.pathname === "/turn") return handleTurn(request, env)
  if (url.pathname !== "/ws") return jsonResponse({ error: "Not found" }, 404)

  const origin = request.headers.get("Origin")
  if (!isAllowedOrigin(origin, env.ALLOWED_ORIGIN)) return jsonResponse({ error: "Origin not allowed" }, 403)
  if (request.method !== "GET" || request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
    return jsonResponse({ error: "WebSocket upgrade required" }, 426)
  }
  const roomId = url.searchParams.get("room")
  if (!validRoomId(roomId)) return jsonResponse({ error: "Invalid room id" }, 400)

  const address = request.headers.get("CF-Connecting-IP") ?? "unknown"
  let allowed: boolean
  try {
    allowed = await allowConnection(env, address)
  } catch {
    return jsonResponse({ error: "Rate limiter unavailable" }, 503)
  }
  if (!allowed) return jsonResponse({ error: "Too many connections" }, 429)

  const room = env.ROOMS.get(env.ROOMS.idFromName(roomId))
  return room.fetch(request)
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return handleRequest(request, env)
  },
}

interface RoomAttachment { id: string }

export class AqurkRoom {
  private readonly rateBuckets = new Map<string, number[]>()
  private readonly rateSalt = crypto.getRandomValues(new Uint8Array(32))
  private readonly ctx: DurableObjectState
  private readonly env: Env

  constructor(ctx: DurableObjectState, env: Env) {
    this.ctx = ctx
    this.env = env
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname === "/__rate-limit") return this.rateLimit(request)
    const roomId = url.searchParams.get("room")
    if (url.pathname !== "/ws" || !validRoomId(roomId)) return jsonResponse({ error: "Invalid room id" }, 400)
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") return jsonResponse({ error: "WebSocket upgrade required" }, 426)

    const existing = this.ctx.getWebSockets()
    const pair = new WebSocketPair()
    const client = pair[0]
    const server = pair[1]
    this.ctx.acceptWebSocket(server)

    if (existing.length >= 2) {
      server.send(JSON.stringify({ type: "full" }))
      server.close(1008, "Room full")
      return new Response(null, { status: 101, webSocket: client } as ResponseInit & { webSocket: WebSocket })
    }

    server.serializeAttachment({ id: crypto.randomUUID() } satisfies RoomAttachment)
    if (existing.length === 1) {
      existing[0].send(JSON.stringify({ type: "peer-joined", initiator: true }))
      server.send(JSON.stringify({ type: "peer-joined", initiator: false }))
    }
    return new Response(null, { status: 101, webSocket: client } as ResponseInit & { webSocket: WebSocket })
  }

  webSocketMessage(socket: WebSocket, message: string | ArrayBuffer): void {
    if (typeof message !== "string" || byteLength(message) > SIGNAL_LIMIT_BYTES) return
    let parsed: unknown
    try { parsed = JSON.parse(message) } catch { return }
    if (!isSignalEnvelope(parsed)) return
    const serialized = JSON.stringify(parsed)
    if (new TextEncoder().encode(serialized).byteLength > SIGNAL_LIMIT_BYTES) return
    for (const peer of this.ctx.getWebSockets()) {
      if (peer !== socket && peer.readyState === WebSocket.OPEN) {
        try { peer.send(serialized) } catch { /* A closing peer is ignored. */ }
      }
    }
  }

  webSocketClose(socket: WebSocket): void {
    for (const peer of this.ctx.getWebSockets()) {
      if (peer !== socket && peer.readyState === WebSocket.OPEN) {
        try { peer.send(JSON.stringify({ type: "peer-left" })) } catch { /* A closing peer is ignored. */ }
      }
    }
  }

  webSocketError(): void {
    // Hibernated WebSocket errors carry no application payload; close events notify peers.
  }

  private async rateLimit(request: Request): Promise<Response> {
    if (request.method !== "POST") return jsonResponse({ allowed: false }, 405)
    const address = await request.text()
    if (!address || address.length > 128) return jsonResponse({ allowed: false }, 400)
    const digest = await crypto.subtle.digest("SHA-256", new Uint8Array([...this.rateSalt, ...new TextEncoder().encode(address)]))
    const fingerprint = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")
    const now = Date.now()
    const active = (this.rateBuckets.get(fingerprint) ?? []).filter((time) => now - time < RATE_WINDOW_MS)
    if (active.length >= RATE_MAX_CONNECTIONS) {
      this.rateBuckets.set(fingerprint, active)
      return jsonResponse({ allowed: false }, 429)
    }
    active.push(now)
    this.rateBuckets.set(fingerprint, active)
    if (this.rateBuckets.size > 10_000) {
      for (const [key, times] of this.rateBuckets) {
        if (times.length === 0 || now - times[times.length - 1] >= RATE_WINDOW_MS) this.rateBuckets.delete(key)
        if (this.rateBuckets.size <= 9_000) break
      }
    }
    return jsonResponse({ allowed: true })
  }
}
