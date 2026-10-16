import { describe, expect, it } from "vitest"
import { MAX_ENVELOPE_BYTES, parse } from "../lib/protocol"

describe("protocol parser", () => {
  it("accepts a valid envelope and rejects malformed or unknown types", () => {
    expect(parse({ type: "typing", active: true })).toEqual({ type: "typing", active: true })
    expect(parse({ type: "typing", active: "yes" })).toBeNull()
    expect(parse({ type: "unknown", data: 1 })).toBeNull()
    expect(parse("not json")).toBeNull()
  })

  it("rejects oversized JSON strings and byte payloads", () => {
    const oversized = JSON.stringify({ type: "msg", id: "m1", content: "x".repeat(MAX_ENVELOPE_BYTES) })
    expect(parse(oversized)).toBeNull()
    expect(parse(new TextEncoder().encode(oversized))).toBeNull()
  })
})
