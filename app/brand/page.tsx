import Link from "next/link"
import Image from "next/image"
import { AqurkIcon } from "@/components/brand/AqurkIcon"
import { AqurkLogo } from "@/components/brand/AqurkLogo"

export default function BrandPage() {
  return <main className="brand-preview">
    <header><Link href="/" className="download-link">Back to Aqurk</Link><h1>Be heard. Not seen.</h1><p>Two conversations, one orbit. The Aqurk identity.</p></header>
    <section className="brand-sample"><p className="eyebrow">TRANSPARENT LOGO / SCALABLE VECTOR</p><div className="flex flex-wrap items-center gap-8"><Image src="/aqurk-icon-512.png" width={240} height={240} alt="Transparent Aqurk logo with overlapping violet-blue speech bubbles, an orbit and three dots" /><AqurkIcon className="size-60" /><AqurkLogo variant="glow" /></div><p className="text-sm text-muted-foreground">One transparent mark for app icons, social previews and the interface. No tile or background.</p></section>
    {(["dark", "light"] as const).map(theme => <section className={`${theme} brand-sample`} key={theme}><p className="eyebrow">{theme.toUpperCase()} BACKGROUND</p><AqurkLogo /><div className="brand-sizes">{[16, 24, 32, 64, 128, 512].map(size => <figure key={size} className="min-w-0 max-w-full"><span style={{ width: size, maxWidth: "100%", display: "block" }}><AqurkIcon className="size-full" /></span><figcaption>{size}px</figcaption></figure>)}</div><div className="flex flex-wrap items-center gap-8"><AqurkLogo variant={theme === "dark" ? "white" : "dark"} /><AqurkIcon variant={theme === "dark" ? "white" : "dark"} className="size-12" /><span className="text-sm text-muted-foreground">Monochrome {theme === "dark" ? "white" : "dark"}</span></div><AqurkLogo variant="glow" /><span className="text-sm text-muted-foreground">Subtle glow</span></section>)}
  </main>
}
