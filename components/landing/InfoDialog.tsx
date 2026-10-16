"use client"

import { Fingerprint, KeyRound, MessageCircle, Network, ShieldCheck } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export type InfoTopic = "how" | "privacy" | "safety" | null
export function InfoDialog({ topic, onClose }: { topic: InfoTopic; onClose: () => void }) {
  const content = topic === "how" ? { title: "A conversation, not a commitment.", subtitle: "No sign-ups. No profiles. Just a shared secret.", items: [
    { icon: KeyRound, title: "01 · Enter the same code", body: "Pick a nickname and share a strong secret code privately with your friend." },
    { icon: Network, title: "02 · Connect directly", body: "The planned app uses a signaling service for the handshake, then a peer-to-peer link, with relay fallback when needed." },
    { icon: MessageCircle, title: "03 · Make it just yours", body: "Compare your safety codes before chatting. This preview simulates the connection only; real messaging comes later." },
  ] } : topic === "privacy" ? { title: "Private by intention.", subtitle: "Less collected. Less to worry about.", items: [
    { icon: ShieldCheck, title: "Nothing personal is stored", body: "This demo keeps names, codes, and room state in React memory only. No accounts, database, analytics, cookies, or local storage." },
    { icon: Network, title: "Privacy isn’t invisibility", body: "Network providers can see IP addresses, connection timing, and that you used this site. Hosting infrastructure may retain request logs. For stronger anonymity, use Tor or a VPN." },
  ] } : { title: "A few good habits.", subtitle: "Small steps that keep a private space private.", items: [
    { icon: KeyRound, title: "Keep the code between you", body: "Use a long, unique passphrase. Never post your code or invitation link publicly; anyone with it can join." },
    { icon: Fingerprint, title: "Compare before you confide", body: "Compare every safety symbol or number over a trusted channel. If they differ, leave and start over. Verification in this demo is simulated, not a security guarantee." },
  ] }
  return <Dialog open={topic !== null} onOpenChange={value => { if (!value) onClose() }}><DialogContent className="aqurk-dialog info-dialog"><DialogHeader><div className="modal-icon"><ShieldCheck /></div><DialogTitle>{content.title}</DialogTitle><DialogDescription>{content.subtitle}</DialogDescription></DialogHeader><div className="flex flex-col gap-6 py-3">{content.items.map(item => <div key={item.title} className="flex items-start gap-3"><span className="info-icon"><item.icon className="size-[18px]" /></span><div><h3 className="text-sm font-medium">{item.title}</h3><p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{item.body}</p></div></div>)}</div></DialogContent></Dialog>
}
