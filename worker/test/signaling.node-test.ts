import assert from "node:assert/strict"
import test, { after } from "node:test"
import worker, { AqurkRoom, isAllowedOrigin } from "../src/index.ts"

class TestResponse {
  readonly status: number
  readonly headers: Headers
  readonly webSocket?: MockSocket
  private readonly body: string
  readonly ok: boolean

  constructor(body: BodyInit | null = null, init: { status?: number; headers?: HeadersInit; webSocket?: MockSocket | null } = {}) {
    this.status = init.status ?? 200
    this.headers = new Headers(init.headers)
    this.webSocket = init.webSocket ?? undefined
    this.body = typeof body === "string" ? body : ""
    this.ok = this.status >= 200 && this.status < 300
  }

  async json(): Promise<unknown> { return JSON.parse(this.body) }
  async text(): Promise<string> { return this.body }
  static json(value: unknown, init: ResponseInit = {}): TestResponse {
    const headers = new Headers(init.headers)
    headers.set("Content-Type", "application/json")
    return new TestResponse(JSON.stringify(value), { status: init.status, headers })
  }
}

class MockSocket {
  static readonly OPEN = 1
  readyState = MockSocket.OPEN
  readonly sent: string[] = []
  attachment: unknown
  closed = false

  send(data: string): void { this.sent.push(data) }
  close(): void { this.readyState = 3; this.closed = true }
  serializeAttachment(value: unknown): void { this.attachment = value }
  deserializeAttachment(): unknown { return this.attachment }
}

let nextPair: { client: MockSocket; server: MockSocket } | undefined
class MockWebSocketPair {
  0: MockSocket
  1: MockSocket
  constructor() {
    this[0] = new MockSocket()
    this[1] = new MockSocket()
    nextPair = { client: this[0], server: this[1] }
  }
}

const originalResponse = globalThis.Response
const originalWebSocket = globalThis.WebSocket
const originalPair = (globalThis as typeof globalThis & { WebSocketPair?: unknown }).WebSocketPair
Object.defineProperty(globalThis, "Response", { configurable: true, value: TestResponse })
Object.defineProperty(globalThis, "WebSocket", { configurable: true, value: { OPEN: MockSocket.OPEN } })
Object.defineProperty(globalThis, "WebSocketPair", { configurable: true, value: MockWebSocketPair })
after(() => {
  Object.defineProperty(globalThis, "Response", { configurable: true, value: originalResponse })
  Object.defineProperty(globalThis, "WebSocket", { configurable: true, value: originalWebSocket })
  Object.defineProperty(globalThis, "WebSocketPair", { configurable: true, value: originalPair })
})

const roomId = "a".repeat(64)
const allowedOrigin = "http://localhost:3000"
const makeRoom = () => {
  const sockets: MockSocket[] = []
  const ctx = {
    acceptWebSocket: (socket: MockSocket) => sockets.push(socket),
    getWebSockets: () => sockets.filter((socket) => socket.readyState === MockSocket.OPEN),
  }
  return { room: new AqurkRoom(ctx as never, { ALLOWED_ORIGIN: allowedOrigin } as never), sockets }
}
const upgrade = (id = roomId) => new Request(`https://worker.test/ws?room=${id}`, {
  headers: { Upgrade: "websocket", Origin: allowedOrigin },
})
const received = (socket: MockSocket) => socket.sent.map((message) => JSON.parse(message))

test("first and second peers join with complementary initiator roles", async () => {
  const { room, sockets } = makeRoom()
  await room.fetch(upgrade())
  const first = sockets[0]
  await room.fetch(upgrade())
  const second = sockets[1]
  assert.deepEqual(received(first), [{ type: "peer-joined", initiator: true }])
  assert.deepEqual(received(second), [{ type: "peer-joined", initiator: false }])
})

test("a third peer receives full and is closed", async () => {
  const { room } = makeRoom()
  await room.fetch(upgrade())
  await room.fetch(upgrade())
  const response = await room.fetch(upgrade()) as unknown as TestResponse
  assert.deepEqual(received(nextPair!.server), [{ type: "full" }])
  assert.equal(nextPair!.server.closed, true)
  assert.equal(response.status, 101)
})

test("signal envelopes relay in both directions", async () => {
  const { room, sockets } = makeRoom()
  await room.fetch(upgrade())
  const first = sockets[0]
  await room.fetch(upgrade())
  const second = sockets[1]
  const offer = JSON.stringify({ type: "signal", data: { type: "offer", sdp: "v=0 offer" } })
  const ice = JSON.stringify({ type: "signal", data: { type: "ice", candidate: "candidate:1" } })
  room.webSocketMessage(first as never, offer)
  room.webSocketMessage(second as never, ice)
  assert.deepEqual(received(second), [{ type: "peer-joined", initiator: false }, JSON.parse(offer)])
  assert.deepEqual(received(first), [{ type: "peer-joined", initiator: true }, JSON.parse(ice)])
})

test("peer-left is sent to the remaining peer on disconnect", async () => {
  const { room, sockets } = makeRoom()
  await room.fetch(upgrade())
  const first = sockets[0]
  await room.fetch(upgrade())
  const second = sockets[1]
  first.close()
  room.webSocketClose(first as never)
  assert.deepEqual(received(second).at(-1), { type: "peer-left" })
})

test("oversized and invalid signals are dropped", async () => {
  const { room, sockets } = makeRoom()
  await room.fetch(upgrade())
  const first = sockets[0]
  await room.fetch(upgrade())
  const second = sockets[1]
  const initial = second.sent.length
  room.webSocketMessage(first as never, JSON.stringify({ type: "signal", data: { type: "offer", sdp: "x".repeat(17_000) } }))
  room.webSocketMessage(first as never, JSON.stringify({ type: "chat", message: "no" }))
  room.webSocketMessage(first as never, JSON.stringify({ type: "signal", extra: true, data: { type: "offer", sdp: "v=0" } }))
  room.webSocketMessage(first as never, "not json")
  assert.equal(second.sent.length, initial)
})

test("invalid room ids are rejected before rate limiting", async () => {
  let rateLimitCalls = 0
  const namespace = { idFromName: () => ({}), get: () => ({ fetch: async () => { rateLimitCalls++; return TestResponse.json({ allowed: true }) } }) }
  const env = { ALLOWED_ORIGIN: allowedOrigin, ROOMS: namespace } as never
  const response = await worker.fetch(upgrade("bad-room"), env) as unknown as TestResponse
  assert.equal(response.status, 400)
  assert.equal(rateLimitCalls, 0)
})

test("the in-memory limiter caps a hashed IP bucket without retaining the address", async () => {
  const { room } = makeRoom()
  const limitRequest = (ip: string) => new Request("https://internal.invalid/__rate-limit", { method: "POST", body: ip })
  for (let attempt = 0; attempt < 10; attempt++) {
    assert.equal((await room.fetch(limitRequest("198.51.100.25"))).status, 200)
  }
  assert.equal((await room.fetch(limitRequest("198.51.100.25"))).status, 429)
  assert.equal((await room.fetch(limitRequest("203.0.113.8"))).status, 200)
  const buckets = (room as unknown as { rateBuckets: Map<string, number[]> }).rateBuckets
  assert.equal(buckets.has("198.51.100.25"), false)
})

test("WebSocket origins must exactly match the configured allowlist", async () => {
  assert.equal(isAllowedOrigin(allowedOrigin, `${allowedOrigin},https://app.example`), true)
  assert.equal(isAllowedOrigin("https://evil.example", allowedOrigin), false)
  const env = { ALLOWED_ORIGIN: allowedOrigin } as never
  const response = await worker.fetch(new Request(`https://worker.test/ws?room=${roomId}`, {
    headers: { Upgrade: "websocket", Origin: "https://evil.example" },
  }), env) as unknown as TestResponse
  assert.equal(response.status, 403)
})

test("TURN endpoint returns no-store STUN defaults and merges provider servers server-side", async () => {
  const stunOnly = await worker.fetch(new Request("https://worker.test/turn", {
    headers: { Origin: allowedOrigin },
  }), { ALLOWED_ORIGIN: allowedOrigin } as never) as unknown as TestResponse
  assert.equal(stunOnly.headers.get("Cache-Control"), "no-store")
  assert.deepEqual(await stunOnly.json(), { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] })

  const originalFetch = globalThis.fetch
  Object.defineProperty(globalThis, "fetch", { configurable: true, value: async () => new TestResponse(JSON.stringify({
    iceServers: [{ urls: ["turns:relay.example:5349"], username: "short-lived", credential: "secret-credential" }],
  }), { status: 200 }) })
  try {
    const withTurn = await worker.fetch(new Request("https://worker.test/turn", {
      headers: { Origin: allowedOrigin },
    }), { ALLOWED_ORIGIN: allowedOrigin, TURN_CREDENTIALS_URL: "https://turn.example/creds?apiKey=private" } as never) as unknown as TestResponse
    const body = await withTurn.json() as { iceServers: unknown[] }
    assert.equal(body.iceServers.length, 2)
    assert.equal(JSON.stringify(body).includes("apiKey"), false)
    assert.equal(withTurn.headers.get("Access-Control-Allow-Origin"), allowedOrigin)
  } finally {
    Object.defineProperty(globalThis, "fetch", { configurable: true, value: originalFetch })
  }
})
