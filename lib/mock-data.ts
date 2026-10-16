import type { Message } from "./types"
export function createDemoMessages(): Message[] {
  const now = Date.now()
  return [
    { id: "joined", senderId: "system", type: "system", content: "Alex joined · simulated room", timestamp: now - 360000, status: "seen" },
    { id: "hello", senderId: "alex", type: "text", content: "Hey, you made it.", timestamp: now - 300000, status: "seen" },
    { id: "quiet", senderId: "alex", type: "text", content: "A little corner of the internet, just for us. I like it here.", timestamp: now - 295000, status: "seen" },
    { id: "answer", senderId: "me", type: "text", content: "No noise. No endless feed. Just a good conversation.", timestamp: now - 240000, status: "seen" },
    { id: "coast", senderId: "alex", type: "image", content: "Found a place that feels like this.", timestamp: now - 180000, status: "seen", attachment: { id: "coast-file", name: "A quiet coast.png", size: 1793653, mimeType: "image/png", url: "/images/quiet-coast.png", transferState: "completed", progress: 100 }, reactions: [{ emoji: "💜", userId: "me" }] },
    { id: "reply", senderId: "me", type: "text", content: "Exactly where I’d rather be right now.", replyTo: "coast", timestamp: now - 120000, status: "seen" },
    { id: "voice", senderId: "alex", type: "voice", content: "", duration: 12, timestamp: now - 60000, status: "seen" },
  ]
}
