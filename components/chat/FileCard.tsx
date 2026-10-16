"use client"
import { Download, FileText, RotateCcw } from "lucide-react"
import { Attachment as AttachmentView, AttachmentContent, AttachmentTitle, AttachmentDescription } from "@/components/ui/attachment"
import { Button } from "@/components/ui/button"
import { TransferProgress } from "./TransferProgress"
import type { Attachment, TransferState } from "@/lib/types"
import { toast } from "sonner"
export function FileCard({ file, action }: { file: Attachment; action: (id: string, state: TransferState) => void }) {
  const mb = file.size / 1024 / 1024
  const size = mb >= 1 ? `${mb.toFixed(mb % 1 ? 1 : 0)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`
  const active = file.transferState === "transferring" || file.transferState === "paused"
  return <AttachmentView className={`file-card ${file.transferState === "failed" ? "transfer-failed" : ""}`} state={file.transferState === "failed" ? "error" : active ? "uploading" : "done"}><span className="file-symbol"><FileText className="size-5" /></span><AttachmentContent><AttachmentTitle>{file.name}</AttachmentTitle><AttachmentDescription>{size} · {file.transferState === "completed" ? "Ready to download" : file.transferState}</AttachmentDescription></AttachmentContent>{file.transferState === "completed" && (file.url ? <a href={file.url} download={file.name} aria-label={`Download ${file.name}`} className="file-download"><Download className="size-4" /></a> : <Button variant="ghost" size="icon" aria-label={`Download ${file.name}`} onClick={() => toast.info("Simulated file: no file bytes were transferred.")}><Download /></Button>)}{file.transferState === "pending" && <div className="flex w-full flex-wrap items-center gap-2"><span className="mr-auto text-xs">Incoming file</span><Button size="sm" onClick={() => action(file.id, "transferring")}>Accept</Button><Button variant="outline" size="sm" onClick={() => action(file.id, "cancelled")}>Decline</Button></div>}{active && <TransferProgress file={file} action={action} />}{file.transferState === "failed" && <div className="flex w-full items-center justify-between gap-2"><span className="text-xs text-destructive">Transfer failed</span><Button variant="outline" size="sm" onClick={() => action(file.id, "transferring")}><RotateCcw />Retry</Button></div>}</AttachmentView>
}
