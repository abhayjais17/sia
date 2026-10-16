"use client"

import { motion } from "framer-motion"
import { getCodeStrength } from "@/lib/passphrase"

export function StrengthMeter({ code }: { code: string }) {
  const strength = getCodeStrength(code)
  const labels = ["Code strength", "Weak", "OK", "Strong"]
  const tips = ["A little mystery goes a long way", "Add more characters", "Try a passphrase", "A good secret is hard to guess"]
  return <div className="strength-meter" data-strength={strength}><div className="flex gap-1.5" role="meter" aria-label={"Code strength"} aria-valuemin={0} aria-valuemax={3} aria-valuenow={strength} aria-valuetext={labels[strength]}>{[1, 2, 3].map(segment => <div key={segment} className="strength-track"><motion.div initial={false} animate={{ width: segment <= strength ? "100%" : "0%" }} transition={{ duration: .3 }} /></div>)}</div><div className="mt-2 flex items-center justify-between gap-2 text-[11px]"><span className="text-muted-foreground">{tips[strength]}</span><span className="strength-label font-medium">{labels[strength]}</span></div></div>
}
