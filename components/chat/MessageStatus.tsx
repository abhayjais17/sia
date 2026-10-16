"use client"
import { motion } from "framer-motion"
import { Check, CheckCheck, Clock3 } from "lucide-react"
import type { MessageStatus as Status } from "@/lib/types"
export function MessageStatus({ status, time }: { status: Status; time: string }) {
  const Icon = status === "sending" ? Clock3 : status === "sent" ? Check : CheckCheck
  return <motion.span key={status} initial={{ opacity: 0, scale: .7 }} animate={{ opacity: 1, scale: 1 }} className={`message-status status-${status}`} title={`${status} · ${time} · simulated`} aria-label={`${status}, simulated`}><Icon className="size-3.5" /></motion.span>
}
