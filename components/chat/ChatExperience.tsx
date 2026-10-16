"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, MessageCircle } from "lucide-react"
import { RoomInfo } from "./RoomInfo"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useSession } from "@/components/SessionProvider"
import { SafetyCodeModal } from "@/components/safety/SafetyCodeModal"
import { ChatDemoControls } from "@/components/dev/ChatDemoControls"
import { InfoDialog } from "@/components/landing/InfoDialog"
import { useChatConnection } from "@/hooks/use-chat-connection"
import { useMockPresence } from "@/hooks/use-mock-presence"
import { useFileTransfer } from "@/hooks/use-file-transfer"
import { ChatHeader, type ChatAction } from "./ChatHeader"
import { MessageList } from "./MessageList"
import { Composer } from "./Composer"
import { PresenceBanner } from "./PresenceBanner"
import type { Message, DisappearingTimer } from "@/lib/types"
import type { DemoEvent } from "@/components/dev/ChatDemoControls"
import { SearchBar, TimerDialog, timers } from "./ConversationTools"
import { jumpToMessage } from "./MessageBubble"
import { useCall } from "@/hooks/use-call"
import { CallOverlay } from "./CallOverlay"
import { usePreferences } from "@/components/AqurkProvider"
import { Lock, Moon, Sun } from "lucide-react"

const ImageLightbox = dynamic(() => import("./ImageLightbox"))
export function ChatExperience() {
  const { session, start, clear: clearSession } = useSession()
  const { theme, setTheme } = usePreferences()
  const [blurred, setBlurred] = useState(false)
  const [blurOnSwitch, setBlurOnSwitch] = useState(false)
  const [autoLock, setAutoLock] = useState(false)
  const [saveLocally, setSaveLocally] = useState(false)
  const [warningEnabled, setWarningEnabled] = useState(true)
  useEffect(() => { let idle: ReturnType<typeof setTimeout>; const lock = () => setBlurred(true); const activity = () => { if (autoLock) { clearTimeout(idle); idle = setTimeout(lock, 5 * 60 * 1000) } }; const visibility = () => { if (blurOnSwitch && document.hidden) lock() }; activity(); document.addEventListener("visibilitychange", visibility); window.addEventListener("pointerdown", activity); window.addEventListener("keydown", activity); return () => { clearTimeout(idle); document.removeEventListener("visibilitychange", visibility); window.removeEventListener("pointerdown", activity); window.removeEventListener("keydown", activity) } }, [autoLock, blurOnSwitch])
  const router = useRouter()
  const presence = useMockPresence()
  const [timer, setTimer] = useState<DisappearingTimer>(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [matchIndex, setMatchIndex] = useState(0)
  const [wiping, setWiping] = useState(false)
  const [edge, setEdge] = useState<DemoEvent | null>(null)
  const wipeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const chat = useChatConnection(presence.network === "connected", timer)
  const matches = query.trim() ? chat.messages.filter(m => !m.deleted && m.type !== "system" && m.content.toLowerCase().includes(query.toLowerCase())) : []
  const activeIndex = matches.length ? matchIndex % matches.length : 0
  useEffect(() => { if (matches[activeIndex]) jumpToMessage(matches[activeIndex].id) }, [query, activeIndex, matches.length])
  useEffect(() => {
    const shortcut = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === "KeyX") { e.preventDefault(); setDialog("panic") } if (e.key === "Escape") { setSearchOpen(false); setQuery("") } }
    window.addEventListener("keydown", shortcut)
    return () => { window.removeEventListener("keydown", shortcut); clearTimeout(wipeTimer.current) }
  }, [])
  const transfer = useFileTransfer(chat.messages, chat.updateAttachment)
  const call = useCall(chat.system)
  const [reply, setReply] = useState<Message | null>(null)
  const [deleting, setDeleting] = useState<Message | null>(null)
  const [dialog, setDialog] = useState<"safety" | "leave" | "privacy" | "panic" | "timer" | "settings" | null>(null)
  const [info, setInfo] = useState(true)
  const [mobileInfo, setMobileInfo] = useState(false)
  const [demoOpen, setDemoOpen] = useState(false)
  const [image, setImage] = useState<{ url: string; name: string } | null>(null)
  const root = useRef<HTMLElement>(null)
  useEffect(() => {
    const viewport = window.visualViewport
    const resize = () => { root.current?.style.setProperty("--visible-height", `${viewport?.height ?? window.innerHeight}px`); root.current?.style.setProperty("--visible-top", `${viewport?.offsetTop ?? 0}px`) }
    resize(); viewport?.addEventListener("resize", resize); viewport?.addEventListener("scroll", resize)
    return () => { viewport?.removeEventListener("resize", resize); viewport?.removeEventListener("scroll", resize) }
  }, [session])
  const leave = (cleared = false) => { call.reset(); chat.clear(); transfer.clear(); setImage(null); setReply(null); clearSession(); router.replace(cleared ? "/?session=cleared" : "/?session=ended") }
  const panic = () => { setDialog(null); setWiping(true); wipeTimer.current = setTimeout(() => leave(true), window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 160 : 480) }
  const changeTimer = (value: DisappearingTimer) => { setTimer(value); chat.system(`Disappearing messages set to ${value ? timers.find(t => t.value === value)?.label : "Off"}`) }
  const demoEvent = (value: DemoEvent) => {
    if (value === "incoming-call") { call.start("voice", true); return }
    if (value === "mic-denied" || value === "camera-denied") { call.deny(value === "mic-denied" ? "microphone" : "camera"); return }
    if (value === "poor-connection") { call.warn(); return }
    setEdge(value); if (value === "connection-failed") presence.setNetwork("reconnecting")
  }
  const action = (value: ChatAction) => {
    if (value === "info") {
      if (window.matchMedia("(max-width: 767px)").matches) setMobileInfo(true)
      else setInfo(!info)
    }
    else if (value === "demo") setDemoOpen(true)
    else if (value === "search") { setSearchOpen(v => !v); setQuery(""); setMatchIndex(0) }
    else if (value === "panic" || value === "timer" || value === "leave" || value === "safety") setDialog(value)
    else if (value === "voice" || value === "video") call.start(value)
    else if (value === "settings") setDialog("settings")
  }
  const send = (text: string, duration?: number) => {
    const emoji = /\p{Extended_Pictographic}/u.test(text) && /^[\p{Extended_Pictographic}\p{Emoji_Component}\s]+$/u.test(text)
    chat.send(text, duration ? "voice" : emoji ? "emoji" : "text", undefined, reply?.id, duration)
    setReply(null)
  }
  const disabled = !chat.peer.online || presence.network !== "connected"
  if (!session) return <main className="chat-entry"><div className="flow-emblem"><MessageCircle /></div><h1>Your conversation starts with a code.</h1><p>Join a room from the home page, or explore a clearly simulated chat. Nothing is sent or saved.</p><Link className="download-link" href="/">Enter a room<ArrowRight className="size-4" /></Link><Button variant="outline" onClick={() => { start({ name: "You", verified: false, relay: false }); chat.loadDemo() }}>Explore demo chat</Button></main>
  return <main className="chat-app" ref={root}>
    <div className="chat-workspace"><section className="conversation-panel" aria-label="Private demo room">
      <ChatHeader peer={chat.peer} verified={session.verified} relay={session.relay} action={action} disabled={disabled} />
      {searchOpen && <SearchBar query={query} setQuery={v => { setQuery(v); setMatchIndex(0) }} count={matches.length} index={activeIndex} move={n => setMatchIndex((activeIndex + n + matches.length) % matches.length)} close={() => { setSearchOpen(false); setQuery("") }} />}
      {!!timer && <button className="timer-banner" onClick={() => setDialog("timer")}>Disappearing messages Â· {timers.find(t => t.value === timer)?.label}</button>}
      <PresenceBanner network={presence.network} online={chat.peer.online} />
      <div className={`conversation-body ${wiping ? "panic-wipe" : ""} ${blurred ? "chat-blurred" : ""}`} onClick={() => blurred && setBlurred(false)}>{blurred && <button className="unlock-chat" onClick={() => setBlurred(false)}>Tap to reveal chat</button>}
        <MessageList query={query} messages={chat.messages} typing={chat.peer.typing && !disabled} onReply={setReply} onDelete={setDeleting} onReact={chat.react} onImage={(url, name) => setImage({ url, name })} onTransfer={transfer.action} />
        {process.env.NEXT_PUBLIC_DEMO === "1" && <ChatDemoControls event={demoEvent} chat={chat} network={presence.network} setNetwork={presence.setNetwork} open={demoOpen} setOpen={setDemoOpen} />}
      </div>
      <Composer disabled={disabled} disabledReason={presence.network === "offline" ? "Youâ€™re offline. Reconnect to send messages." : presence.network === "reconnecting" ? "Reconnectingâ€¦ sending is paused." : "Your friend is offline. Sending is paused until they return."} reply={reply} clearReply={() => setReply(null)} send={send} files={files => {
        const images = files.filter(f => f.type.startsWith("image/"))
        for (let i = 0; i < images.length; i += 4) { const group = images.slice(i, i + 4).map(transfer.create); chat.send("", "image", undefined, reply?.id, undefined, group) }
        files.filter(f => !f.type.startsWith("image/")).forEach(file => chat.send("", file.type.startsWith("video/") ? "video" : "file", transfer.create(file), reply?.id))
        setReply(null)
      }} />
    </section>{info && <aside className="room-info" aria-label="Room information"><RoomInfo peer={chat.peer} verified={session.verified} relay={session.relay} onSafety={() => setDialog("safety")} onTimer={() => action("timer")} onPrivacy={() => setDialog("privacy")} /></aside>}</div>
    <Dialog open={mobileInfo} onOpenChange={setMobileInfo}><DialogContent className="aqurk-dialog mobile-info-dialog"><DialogHeader><DialogTitle>Room information</DialogTitle><DialogDescription>Your peer and connection details.</DialogDescription></DialogHeader><RoomInfo peer={chat.peer} verified={session.verified} relay={session.relay} onSafety={() => { setMobileInfo(false); setDialog("safety") }} onTimer={() => action("timer")} onPrivacy={() => { setMobileInfo(false); setDialog("privacy") }} /></DialogContent></Dialog>

    <Dialog open={dialog === "settings"} onOpenChange={open => !open && setDialog(null)}><DialogContent className="aqurk-dialog settings-sheet"><DialogHeader><DialogTitle>Settings</DialogTitle><DialogDescription>Preferences apply to this tab and stay in memory.</DialogDescription></DialogHeader><section className="settings-section"><h3>Appearance</h3><div className="settings-theme">{([["light", "Light", Sun], ["dark", "Dark", Moon], ["system", "System", Lock]] as const).map(([value, label, Icon]) => <Button key={value} variant={theme === value ? "secondary" : "outline"} onClick={() => setTheme(value)}><Icon />{label}</Button>)}</div></section><label className="settings-row">Notification sound<input type="checkbox" defaultChecked /></label><label className="settings-row">Volume<input type="range" min="0" max="100" defaultValue="60" /></label><label className="settings-row">Blur chat on tab switch<input type="checkbox" checked={blurOnSwitch} onChange={e => setBlurOnSwitch(e.target.checked)} /></label><label className="settings-row">Auto-lock after inactivity<input type="checkbox" checked={autoLock} onChange={e => setAutoLock(e.target.checked)} /></label><div className="settings-row locked-setting"><span>Link previews <small>Locked off to protect your privacy.</small></span><Lock /></div><label className="settings-row">Warn before screenshots or copying<input type="checkbox" checked={warningEnabled} onChange={e => setWarningEnabled(e.target.checked)} /></label><label className="settings-row">Save chat locally<input type="checkbox" checked={saveLocally} onChange={e => { if (e.target.checked && window.confirm("Saving chat stores a copy on this device. This demo does not save chat data.")) setSaveLocally(true); else setSaveLocally(false) }} /></label><div className="settings-row"><span>Default disappearing timer</span><div className="settings-theme"><Button size="sm" variant="outline" onClick={() => changeTimer(0)}>Off</Button><Button size="sm" variant="outline" onClick={() => changeTimer(60)}>1 min</Button><Button size="sm" variant="outline" onClick={() => changeTimer(3600)}>1 hour</Button></div></div><Button variant="destructive" onClick={() => { setDialog("panic") }}>Clear local data</Button><p className="settings-about">About Aqurk · v0.1.0 · <Link href="/privacy">Privacy</Link></p></DialogContent></Dialog>
        {dialog === "safety" && <SafetyCodeModal open onVerify={() => { start({ ...session, verified: true }); setDialog(null) }} onSkip={() => setDialog(null)} onLeave={() => leave()} />}
    <InfoDialog topic={dialog === "privacy" ? "privacy" : null} onClose={() => setDialog(null)} />
    <Dialog open={!!deleting} onOpenChange={open => !open && setDeleting(null)}><DialogContent className="aqurk-dialog"><DialogHeader><DialogTitle>Delete this message?</DialogTitle><DialogDescription>Deletion only affects this in-memory demo. It cannot remove screenshots or copies.</DialogDescription></DialogHeader><Button variant="outline" onClick={() => { if (deleting) chat.remove(deleting.id, false); setDeleting(null) }}>Delete for me</Button>{deleting?.senderId === "me" && <Button variant="destructive" onClick={() => { if (deleting) chat.remove(deleting.id, true); setDeleting(null) }}>Delete for everyone Â· simulated</Button>}</DialogContent></Dialog>
    <Dialog open={dialog === "leave"} onOpenChange={open => !open && setDialog(null)}><DialogContent className="aqurk-dialog"><DialogHeader><DialogTitle>Leave this little space?</DialogTitle><DialogDescription>Your messages and local attachments will be cleared from this tab. There is no saved history to return to.</DialogDescription></DialogHeader><Button variant="destructive" onClick={() => leave()}>Clear and leave</Button><Button variant="outline" onClick={() => setDialog(null)}>Stay here</Button></DialogContent></Dialog>
    <TimerDialog open={dialog === "timer"} close={() => setDialog(null)} value={timer} change={changeTimer} />
    <Dialog open={dialog === "panic"} onOpenChange={v => !v && setDialog(null)}><DialogContent className="aqurk-dialog"><DialogHeader><DialogTitle>Clear everything and leave now?</DialogTitle><DialogDescription>Messages and attachment URLs will be removed from this tab. This cannot erase copies held by someone else.</DialogDescription></DialogHeader><Button variant="destructive" onClick={panic}>Clear everything and leave</Button><Button variant="outline" onClick={() => setDialog(null)}>Keep chatting</Button></DialogContent></Dialog>
    <Dialog open={!!edge} onOpenChange={v => !v && setEdge(null)}><DialogContent className="aqurk-dialog"><DialogHeader><DialogTitle>{edge === "room-full" ? "Room full" : edge === "incoming-call" ? "Alex is callingâ€¦" : "Connection failed"}</DialogTitle><DialogDescription>{edge === "room-full" ? "This room already has two people. Choose a different code." : edge === "incoming-call" ? "Incoming voice call" : "We could not establish the connection. Try again or start a new room."}</DialogDescription></DialogHeader><Button onClick={() => { presence.setNetwork("connected"); setEdge(null) }}>{edge === "incoming-call" ? "Accept" : "Retry"}</Button><Button variant="outline" onClick={() => edge === "incoming-call" ? setEdge(null) : leave()}>{edge === "incoming-call" ? "Decline" : "Start new room"}</Button></DialogContent></Dialog>
    <CallOverlay call={call} peerName={chat.peer.name} relay={session.relay} />
    <ImageLightbox image={image} close={() => setImage(null)} />
  </main>
}






