"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, Check, Copy, Eye, EyeOff, KeyRound, LoaderCircle, LockKeyhole, QrCode, ShieldCheck, Sparkles, UserRound, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { StrengthMeter } from "./StrengthMeter"
import { generatePassphrase, getCodeStrength, isValidCode } from "@/lib/passphrase"
import { useCopy } from "@/hooks/use-copy"

interface EntryCardProps { name: string; code: string; onNameChange: (value: string) => void; onCodeChange: (value: string) => void; onEnter: () => void; onShare: () => void; loading: boolean }

export function EntryCard({ name, code, onNameChange, onCodeChange, onEnter, onShare, loading }: EntryCardProps) {
  const [visible, setVisible] = useState(false)
  const [touched, setTouched] = useState({ name: false, code: false })
  const { copied, copy } = useCopy()
  const validName = name.trim().length > 0
  const validCode = isValidCode(code)
  const nameError = touched.name && !validName
  const codeError = touched.code && !validCode

  return <motion.section className="entry-card" aria-labelledby="entry-heading" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12, duration: .45 }}>
    <div className="card-topline" />
    <header className="mb-7 flex items-start justify-between gap-3"><div><h2 id="entry-heading" className="font-display text-[21px] font-medium tracking-tight">{"Your private space starts here."}</h2><p className="mt-1.5 text-[13px] text-muted-foreground">{"One shared code. Just the two of you."}</p></div><span className="card-lock"><LockKeyhole className="size-[19px]" /></span></header>
    <form autoComplete="off" noValidate onSubmit={e => { e.preventDefault(); setTouched({ name: true, code: true }); if (validName && validCode) onEnter() }} onKeyDown={e => { if (e.key === "Enter" && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault() }}>
      <FieldGroup className="gap-6">
        <Field data-invalid={nameError}><div className="flex items-center justify-between"><FieldLabel htmlFor="nickname">{"Your name"}</FieldLabel><span className="text-[11px] tabular-nums text-muted-foreground" aria-label={`${name.length} of 24 characters`}>{name.length}<span className="opacity-60"> / 24</span></span></div><InputGroup><InputGroupInput id="nickname" placeholder={"What should we call you?"} value={name} maxLength={24} onChange={e => onNameChange(e.target.value)} onBlur={() => setTouched(prev => ({ ...prev, name: true }))} aria-invalid={nameError} aria-describedby="nickname-hint" autoComplete="off" spellCheck={false} /><InputGroupAddon><UserRound /></InputGroupAddon></InputGroup><FieldDescription id="nickname-hint">{"Just a nickname. Not saved anywhere."}</FieldDescription>{nameError && <FieldError>{"Give yourself a nickname to continue."}</FieldError>}</Field>
        <Field data-invalid={codeError}><FieldLabel htmlFor="secret-code">{"Secret code"}</FieldLabel><InputGroup><InputGroupInput id="secret-code" type={visible ? "text" : "password"} placeholder={"A secret only you two know"} value={code} maxLength={128} onChange={e => onCodeChange(e.target.value)} onBlur={() => setTouched(prev => ({ ...prev, code: true }))} aria-invalid={codeError} aria-describedby="code-hint" autoComplete="off" autoCapitalize="none" spellCheck={false} /><InputGroupAddon><KeyRound /></InputGroupAddon><InputGroupAddon align="inline-end"><InputGroupButton size="icon-sm" aria-label={visible ? "Hide secret code" : "Show secret code"} onClick={() => setVisible(!visible)}>{visible ? <EyeOff /> : <Eye />}</InputGroupButton></InputGroupAddon></InputGroup><FieldDescription id="code-hint">{"Share this code with your friend. Anyone with the code can join."}</FieldDescription>{codeError && <FieldError>{"Use 8+ characters or 6+ digits. A generated code is safer."}</FieldError>}</Field>
      </FieldGroup>
      <div className="mt-4"><StrengthMeter code={code} /></div>
      <AnimatePresence>{getCodeStrength(code) === 1 && <motion.div className="mt-3" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}><Alert variant="destructive"><TriangleAlert /><AlertDescription>{"Weak codes can be guessed by strangers."}</AlertDescription></Alert></motion.div>}</AnimatePresence>
      <div className="mb-6 mt-3 flex items-center justify-between gap-2"><Button type="button" variant="subtle" size="sm" onClick={() => { onCodeChange(generatePassphrase()); setVisible(true); setTouched(prev => ({ ...prev, code: false })) }}><Sparkles data-icon="inline-start" />{"Generate strong code"}</Button><Button type="button" variant="ghost" size="icon" disabled={!code} aria-label={copied ? "Copied" : "Copy secret code"} onClick={() => copy(code)}><AnimatePresence mode="wait"><motion.span key={String(copied)} initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .8 }}>{copied ? <Check /> : <Copy />}</motion.span></AnimatePresence></Button></div>
      <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={!validName || !validCode || loading}>{loading ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : <LockKeyhole data-icon="inline-start" />}{loading ? "Opening your roomâ€¦" : "Enter Room"}<ArrowRight data-icon="inline-end" /></Button>
      <Button type="button" variant="ghost" className="mt-3 w-full" disabled={!validCode} onClick={onShare}><QrCode data-icon="inline-start" />{"Share via link / QR"}</Button>
    </form>
    <div className="card-footnote"><ShieldCheck className="size-3.5 shrink-0" /><span>{"End-to-end encrypted · No accounts · No stored data"}</span></div>
  </motion.section>
}

