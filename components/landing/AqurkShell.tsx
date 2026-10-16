"use client"

import { Check, Menu, Monitor, Moon, Sun } from "lucide-react"
import { AqurkLogo } from "@/components/brand/AqurkLogo"
import { usePreferences } from "@/components/AqurkProvider"
import type { Theme } from "@/lib/types"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

export function AqurkShell({ children, onHome }: { children: React.ReactNode; onInfo?: (topic: never) => void; onHome: () => void }) {
  const { theme, setTheme } = usePreferences()
  const [open, setOpen] = useState(false)
  const menu = useRef<HTMLDivElement>(null)
  useEffect(() => { const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false) }; document.addEventListener("keydown", onKey); return () => document.removeEventListener("keydown", onKey) }, [])
  const themes: { value: Theme; Icon: typeof Sun; label: string }[] = [{ value: "light", Icon: Sun, label: "Light" }, { value: "dark", Icon: Moon, label: "Dark" }, { value: "system", Icon: Monitor, label: "System" }]
  return <div className="aqurk-app"><div className="ambient-background" aria-hidden="true"><div className="ambient-grid" /><div className="orb orb-violet" /><div className="orb orb-cyan" /></div><header className="site-header"><button type="button" className="brand-home" onClick={onHome} aria-label="Aqurk home"><AqurkLogo /></button><div className="landing-menu" ref={menu}><button type="button" aria-label="Open menu" aria-expanded={open} className="landing-menu-trigger" onClick={() => setOpen(!open)}><Menu /></button>{open && <div className="landing-menu-panel" role="menu"><Link role="menuitem" href="/how-it-works" onClick={() => setOpen(false)}>How it works</Link><Link role="menuitem" href="/privacy" onClick={() => setOpen(false)}>Privacy</Link><Link role="menuitem" href="/safety" onClick={() => setOpen(false)}>Safety tips</Link><div className="landing-menu-divider" /><span className="menu-caption">Appearance</span>{themes.map(({ value, Icon, label }) => <button role="menuitemradio" aria-checked={theme === value} key={value} onClick={() => setTheme(value)}><Icon />{label}{theme === value && <Check className="menu-check" />}</button>)}<small>About Aqurk · Say it. Hide it. Aqurk it.</small></div>}</div></header>{children}</div>
}
