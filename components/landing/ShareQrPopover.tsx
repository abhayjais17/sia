"use client"

import { QRCodeSVG } from "qrcode.react"
import { Check, Copy, LockKeyhole } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useCopy } from "@/hooks/use-copy"

export function ShareQrPopover({ open, onOpenChange, link }: { open: boolean; onOpenChange: (open: boolean) => void; link: string }) {
  const { copied, copy } = useCopy()
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="aqurk-dialog"><DialogHeader><div className="modal-icon"><LockKeyhole /></div><DialogTitle>{"A little invitation. Just for them."}</DialogTitle><DialogDescription>{"Send this link privately, or let your friend scan the code."}</DialogDescription></DialogHeader><div className="qr-frame"><QRCodeSVG value={link || "aqurk-demo"} size={184} marginSize={2} level="M" title={"Private room invitation QR code"} /></div><label htmlFor="room-link" className="text-xs text-muted-foreground">{"Your invitation link"}</label><input id="room-link" className="link-input" readOnly value={link} onFocus={e => e.target.select()} /><Button variant="gradient" size="lg" onClick={() => copy(link)}>{copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}{copied ? "Copied" : "Copy private link"}</Button><p className="flex items-start justify-center gap-2 text-xs leading-relaxed text-muted-foreground"><LockKeyhole className="mt-0.5 size-3.5 shrink-0" />{"The code stays in the link’s # part and never reaches a server. Anyone with this link can join."}</p></DialogContent></Dialog>
}
