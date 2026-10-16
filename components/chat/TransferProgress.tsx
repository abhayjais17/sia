import { Pause, Play, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Attachment, TransferState } from "@/lib/types"
export function TransferProgress({ file, action }: { file: Attachment; action: (id: string, state: TransferState) => void }) {
  const paused = file.transferState === "paused"
  return <div className="w-full"><div className="flex items-center gap-2"><progress aria-label={`${file.name} transfer progress`} max="100" value={file.progress} className="transfer-progress" /><span className="text-xs tabular-nums">{Math.floor(file.progress)}%</span><Button variant="ghost" size="icon" aria-label={paused ? "Resume transfer" : "Pause transfer"} onClick={() => action(file.id, paused ? "transferring" : "paused")}>{paused ? <Play /> : <Pause />}</Button><Button variant="ghost" size="icon" aria-label="Cancel transfer" onClick={() => action(file.id, "cancelled")}><X /></Button></div><p className="mt-1 text-xs text-muted-foreground">{paused ? "Paused" : `8 MB/s · ${Math.ceil(file.size / 1024 / 1024 * (1 - file.progress / 100) / 8)}s remaining`}</p></div>
}
