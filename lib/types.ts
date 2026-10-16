export type MessageStatus = "sending" | "sent" | "delivered" | "seen"
export type MessageType = "text" | "emoji" | "image" | "video" | "voice" | "file" | "system"
export type TransferState = "pending" | "transferring" | "paused" | "completed" | "failed" | "cancelled"
export type DisappearingTimer = 0 | 10 | 60 | 3600 | 86400
export interface Attachment { id: string; name: string; size: number; mimeType: string; url?: string; transferState: TransferState; progress: number }
export interface Message { id: string; senderId: string; type: MessageType; content: string; timestamp: number; status: MessageStatus; attachment?: Attachment; images?: Attachment[]; replyTo?: string; reactions?: { emoji: string; userId: string }[]; deleted?: boolean; expiresAt?: number; duration?: number }
export interface Peer { id: string; name: string; online: boolean; typing: boolean }
export type CallState = "idle" | "incoming" | "outgoing" | "connected" | "ended"
export type ConnectionState = "idle" | "connecting" | "waiting" | "verification" | "connected" | "failed" | "full"
export type Theme = "dark" | "light" | "system"
export type DemoScenario = "normal" | "failure" | "full" | "wait" | "relay"
