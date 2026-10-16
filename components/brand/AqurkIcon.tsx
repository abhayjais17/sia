"use client"

import { useId } from "react"
import { cn } from "@/lib/utils"

export type BrandVariant = "gradient" | "white" | "dark" | "glow"

export function AqurkIcon({ className, variant = "gradient" }: { className?: string; variant?: BrandVariant }) {
  const id = `aqurk-${useId().replace(/:/g, "")}`
  const mono = variant === "white" || variant === "dark"
  const ink = variant === "white" ? "#F4F5FA" : "#0A0B10"
  const paint = (name: string) => mono ? ink : `url(#${id}-${name})`
  const upperBubble = "M198 70C128 70 70 128 70 200c0 38 16 72 42 96 -6 22 -14 42 -30 62 34 -4 62 -18 84 -36 22 10 46 12 70 8C300 322 326 270 326 200 326 128 268 70 198 70Z"
  const lowerBubble = "M322 186C256 186 196 242 196 312c0 68 56 126 126 126 26 0 50-8 70-20 20 20 44 30 70 34 -14 -18 -22 -36 -26 -56 18-22 28-50 28-84 0-70-60-126-136-126Z"

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none" aria-hidden="true" className={cn("shrink-0", variant === "glow" && "aqurk-icon-glow", className)}>
      <defs>
        <linearGradient id={`${id}-bub`} x1="60" y1="60" x2="460" y2="460" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8B5CF6" /><stop offset="0.55" stopColor="#5B7CFF" /><stop offset="1" stopColor="#22B8F0" />
        </linearGradient>
        <linearGradient id={`${id}-ring`} x1="30" y1="330" x2="490" y2="190" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#A78BFA" /><stop offset="1" stopColor="#67E8F9" />
        </linearGradient>
        <radialGradient id={`${id}-shine`} cx="0.3" cy="0.25" r="0.8">
          <stop offset="0" stopColor="#fff" stopOpacity=".35" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id={`${id}-mA`} maskUnits="userSpaceOnUse" x="0" y="0" width="512" height="512">
          <rect width="512" height="512" fill="#fff" /><circle cx="322" cy="312" r="126" fill="#000" />
        </mask>
        <mask id={`${id}-mB`} maskUnits="userSpaceOnUse" x="0" y="0" width="512" height="512">
          <rect width="512" height="512" fill="#fff" /><circle cx="198" cy="200" r="130" fill="#000" />
        </mask>
        <clipPath id={`${id}-lowerArc`}><rect x="0" y="262" width="512" height="300" /></clipPath>
      </defs>
      <g transform="rotate(-18 256 262)">
        <ellipse cx="256" cy="262" rx="222" ry="66" stroke={paint("ring")} strokeWidth="13" />
      </g>
      <g mask={`url(#${id}-mA)`}>
        <path d={upperBubble} fill={paint("bub")} />
        {!mono && <path d={upperBubble} fill={`url(#${id}-shine)`} />}
      </g>
      <g mask={`url(#${id}-mB)`}>
        <path d={lowerBubble} fill={paint("bub")} transform="translate(-6 -10)" />
        {!mono && <path d={lowerBubble} fill={`url(#${id}-shine)`} transform="translate(-6 -10)" />}
      </g>
      <g transform="rotate(-18 256 262)">
        <g clipPath={`url(#${id}-lowerArc)`}>
          <ellipse cx="256" cy="262" rx="222" ry="66" stroke={paint("ring")} strokeWidth="13" />
        </g>
      </g>
      <circle cx="228" cy="256" r="13" fill={mono ? ink : "#8B5CF6"} />
      <circle cx="262" cy="256" r="13" fill={mono ? ink : "#6C8CFF"} />
      <circle cx="296" cy="256" r="13" fill={mono ? ink : "#22D3EE"} />
    </svg>
  )
}
