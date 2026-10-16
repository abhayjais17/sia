import { AqurkIcon, type BrandVariant } from "./AqurkIcon"
import { cn } from "@/lib/utils"

export function AqurkLogo({ className, variant = "gradient" }: { className?: string; variant?: BrandVariant }) {
  return <span aria-label="Aqurk" className={cn("aqurk-logo inline-flex items-center gap-2.5", className)} data-variant={variant}><AqurkIcon variant={variant} className="size-9" /><span className="font-display text-[27px] font-semibold tracking-[-0.01em]">aqurk</span></span>
}
