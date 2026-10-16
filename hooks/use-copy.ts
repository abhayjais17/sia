"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

export function useCopy() {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2200)
    } catch {
      toast.error("Clipboard unavailable. Select and copy the text manually.")
    }
  }
  return { copied, copy }
}
