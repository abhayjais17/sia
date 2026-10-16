import type { Metadata } from "next"
import Link from "next/link"
import { AqurkLogo } from "@/components/brand/AqurkLogo"
import { AqurkIcon } from "@/components/brand/AqurkIcon"

export const metadata: Metadata = { title: "Aqurk · Private chat" }
const pages = {
  "how-it-works": { title: "A private chat, in three steps", intro: "Aqurk is designed for a conversation between two people.", items: ["Enter the same name and secret code.", "A secure peer-to-peer link is established. A signaling service helps the two browsers find each other only during the handshake.", "Chat privately. Verify your Safety Code together for added confidence."] },
  privacy: { title: "Privacy, in plain language", intro: "Aqurk is designed without accounts or stored chat history.", items: ["We don't store your name, secret code, messages, files, or room history.", "The network can still see your IP address, that you used the service, and when you connected. Your internet provider or network may also see connection timing.", "For stronger network privacy, consider using Tor or a trusted VPN. No online service can promise that you are 100% untraceable."] },
  safety: { title: "Stay safer while you chat", intro: "A few simple habits help protect a private conversation.", items: ["Use a long, unique secret code. Anyone who guesses it may be able to join.", "Compare your Safety Code with your friend through another trusted channel.", "Never share the secret code publicly. Leave the room if someone unexpected joins, and use Report or Block if available."] },
}
export function InfoPage({ page }: { page: keyof typeof pages }) { const content = pages[page]; return <main className="info-page"><header className="site-header"><Link href="/" aria-label="Aqurk home"><AqurkLogo /></Link><Link href="/" className="info-back">Back to Aqurk</Link></header><article className="info-article"><AqurkIcon className="info-icon"/><p className="info-kicker">AQURK · {page.replaceAll("-", " ").toUpperCase()}</p><h1>{content.title}</h1><p className="info-intro">{content.intro}</p><ol>{content.items.map((item, index) => <li key={item} style={{ animationDelay: `${index * 120}ms` }}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>)}</ol><p className="info-foot">End-to-end encrypted · No accounts · No stored data</p></article></main> }
