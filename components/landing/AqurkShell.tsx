"use client"

import { ChevronDown, Heart, Monitor, Moon, ShieldCheck, Sun } from "lucide-react"
import { AqurkLogo } from "@/components/brand/AqurkLogo"
import { Button } from "@/components/ui/button"
import { usePreferences } from "@/components/AqurkProvider"
import type { Theme } from "@/lib/types"
import type { InfoTopic } from "./InfoDialog"

export function AqurkShell({ children, onInfo, onHome }: { children: React.ReactNode; onInfo: (topic: InfoTopic) => void; onHome: () => void }) {
  const { theme, setTheme } = usePreferences()
  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor
  return <div className="aqurk-app"><div className="ambient-background" aria-hidden="true"><div className="ambient-grid" /><div className="orb orb-violet" /><div className="orb orb-cyan" /></div><header className="site-header"><button type="button" className="brand-home" onClick={onHome} aria-label={"Aqurk home"}><AqurkLogo /></button><nav className="header-actions" aria-label={"Preferences and help"}><Button variant="ghost" onClick={() => onInfo("how")} className="how-link">{"How it works"}</Button><span className="nav-divider" /><label className="theme-select"><ThemeIcon className="size-4" /><select aria-label={"Color theme"} value={theme} onChange={e => setTheme(e.target.value as Theme)}><option value="dark">{"Dark"}</option><option value="light">{"Light"}</option><option value="system">{"System"}</option></select><ChevronDown className="size-3" /></label></nav></header>{children}<footer className="site-footer"><span className="footer-promise"><ShieldCheck className="size-3.5" />{"Privacy isn’t a feature. It’s the whole point."}</span><nav aria-label={"Footer"} className="flex flex-wrap justify-center gap-x-6 gap-y-2"><button onClick={() => onInfo("how")}>{"How it works"}</button><button onClick={() => onInfo("privacy")}>{"Privacy"}</button><button onClick={() => onInfo("safety")}>{"Safety tips"}</button></nav><span className="footer-signoff">{"Less noise. More connection."}<Heart className="size-3" /></span></footer></div>
}
