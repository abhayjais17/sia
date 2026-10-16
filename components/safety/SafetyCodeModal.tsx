"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, ShieldCheck, ShieldX, TriangleAlert } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useCrypto } from "@/hooks/use-crypto"
import { AqurkIcon } from "@/components/brand/AqurkIcon"

export function SafetyCodeModal({ open, onVerify, onSkip, onLeave }: { open: boolean; onVerify: () => void; onSkip: () => void; onLeave: () => void }) {
  const [mismatch, setMismatch] = useState(false)
  const { fingerprint } = useCrypto()
  return <Dialog open={open} onOpenChange={value => { if (!value && !mismatch) onSkip() }}><DialogContent className="aqurk-dialog safety-dialog" showCloseButton={!mismatch}><DialogHeader><AqurkIcon className="mx-auto size-12" /><p className="eyebrow">{"A shared secret. A little certainty."}</p><DialogTitle>{"Verify your connection"}</DialogTitle><DialogDescription>{"Practice comparing this code with your friend. Verification and encryption are simulated; this demo does not protect real conversations."}</DialogDescription></DialogHeader><div className="fingerprint-grid" aria-label={"12-symbol safety fingerprint"}>{fingerprint.emojis.map((emoji, index) => <motion.div key={emoji.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * .025 }}><span role="img" aria-label={emoji.label}>{emoji.symbol}</span></motion.div>)}</div><div className="fingerprint-numbers" aria-label={"Numeric safety code"}>{fingerprint.numbers.map(number => <span key={number}>{number}</span>)}</div><p className="text-center text-xs text-muted-foreground">{"Compare all 12 symbols or every group of numbers."}</p>{mismatch ? <><Alert variant="destructive"><TriangleAlert /><AlertTitle>{"The codes don’t match."}</AlertTitle><AlertDescription>{"Don’t share anything sensitive. Leave this room and try a new code with your friend over a trusted channel."}</AlertDescription></Alert><Button variant="destructive" size="lg" onClick={onLeave}><ShieldX data-icon="inline-start" />{"Disconnect and leave"}</Button><Button variant="ghost" onClick={() => setMismatch(false)}>{"Compare again"}</Button></> : <><Button variant="gradient" size="lg" onClick={onVerify}><Check data-icon="inline-start" />{"It matches"}</Button><div className="grid grid-cols-2 gap-3"><Button variant="ghost" onClick={onSkip}>{"Skip for now"}</Button><Button variant="destructive" onClick={() => setMismatch(true)}>{"Doesn’t match"}</Button></div></>}<p className="safety-demo-note">{"Preview only: this is a sample fingerprint, not real encryption. Never use this demo for sensitive conversations."}</p></DialogContent></Dialog>
}
