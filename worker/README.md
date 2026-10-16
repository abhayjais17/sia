# Aqurk signaling Worker

The Worker carries only WebRTC setup messages between two peers. Each room uses a SQLite-backed Durable Object, but room data is never written to Durable Object storage. Live peer state stays in accepted WebSocket connections and their attachments and disappears when the sockets disconnect.

The Worker accepts only origins listed in `ALLOWED_ORIGIN`. It is configured for `http://localhost:3000` during local development. Set the production frontend origin in the Cloudflare dashboard or add it to the Wrangler vars before deploying.

## Requirements

- Node.js 22.13 or newer
- pnpm
- A Cloudflare account for deployment

## Run locally

From the repository root:

```sh
cd worker
pnpm install
pnpm dev
```

Wrangler serves the Worker at `http://localhost:8787`. The browser endpoint is `ws://localhost:8787/ws?room=<64-character-hex-room-id>` and ICE configuration is available at `http://localhost:8787/turn`.

Run the Worker tests and typecheck with:

```sh
pnpm test
pnpm typecheck
```

## STUN-only and optional TURN

By default, `GET /turn` returns the public Google STUN server at `stun:stun.l.google.com:19302`. TURN is optional. If `TURN_CREDENTIALS_URL` is configured as a Worker secret, the Worker fetches that HTTPS URL server-side and merges its `iceServers` array into the response. For example, a Metered credentials endpoint can return short-lived TURN servers. Its API key stays in the secret URL and is never sent to the browser. If the endpoint is absent, invalid, unavailable, or returns an invalid response, the Worker returns STUN only. Responses are marked `Cache-Control: no-store`.

Set the optional TURN endpoint from `worker/`:

```sh
pnpm exec wrangler secret put TURN_CREDENTIALS_URL
```

Paste the complete provider HTTPS endpoint, including its key, into Wrangler's prompt. Do not put provider keys in frontend environment variables.

## Deploy

Authenticate with Cloudflare:

```sh
pnpm exec wrangler login
```

Set `ALLOWED_ORIGIN` to your exact frontend origin (comma-separated for multiple origins) in `wrangler.toml` or the Cloudflare Worker settings. The local default is `http://localhost:3000`.

Deploy from `worker/`:

```sh
pnpm deploy
```

Wrangler prints the deployed Worker URL. With the configured name `aqurk-signaling`, it has this form:

```text
https://aqurk-signaling.<YOUR_CLOUDFLARE_SUBDOMAIN>.workers.dev
```

The production WebSocket URL is `wss://aqurk-signaling.<YOUR_CLOUDFLARE_SUBDOMAIN>.workers.dev/ws?room=<64-character-hex-room-id>`; the ICE endpoint is `https://aqurk-signaling.<YOUR_CLOUDFLARE_SUBDOMAIN>.workers.dev/turn`.

## Rate limiting and privacy

The Worker applies a limit of 10 new WebSocket connections per IP in 60 seconds through a singleton Durable Object. The edge Worker forwards the Cloudflare connection address to that object; it is immediately combined with an in-memory random salt and SHA-256 hashed. Only the salted digest and timestamps are kept in volatile memory for the rate window. The raw address, room ID, and signaling payloads are never logged or persisted.
