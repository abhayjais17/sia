import Link from "next/link"
import { AqurkLogo } from "@/components/brand/AqurkLogo"
export default function NotFound() { return <main className="chat-entry"><AqurkLogo /><span className="eyebrow">404 · A QUIET CORNER</span><h1>This space doesn&apos;t exist.</h1><p>Your next conversation is one shared code away.</p><Link className="download-link" href="/">Back to Aqurk</Link></main> }
