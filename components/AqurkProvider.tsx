"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { MotionConfig } from "framer-motion"
import { Toaster } from "sonner"
import type { Theme } from "@/lib/types"

const PreferencesContext = createContext<{ theme: Theme; setTheme: (theme: Theme) => void } | null>(null)

export function AqurkProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const apply = () => {
      const resolved = theme === "system" ? (media.matches ? "dark" : "light") : theme
      document.documentElement.classList.toggle("dark", resolved === "dark")
      document.documentElement.classList.toggle("light", resolved === "light")
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", resolved === "dark" ? "#0A0B10" : "#F7F8FC")
      setResolvedTheme(resolved)
    }
    apply()
    media.addEventListener("change", apply)
    return () => media.removeEventListener("change", apply)
  }, [theme])

  return <PreferencesContext.Provider value={{ theme, setTheme }}><MotionConfig reducedMotion="user">{children}<Toaster theme={resolvedTheme} position="bottom-center" toastOptions={{ style: { background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--border)" } }} /></MotionConfig></PreferencesContext.Provider>
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (!context) throw new Error("usePreferences requires AqurkProvider")
  return context
}
