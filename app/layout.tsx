import type { Metadata, Viewport } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import { AqurkProvider } from "@/components/AqurkProvider"
import { SessionProvider } from "@/components/SessionProvider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  title: "Aqurk — Be heard. Not seen.",
  description: "A frontend preview of a calmer, more private way to connect. No accounts, no database, no tracking. All connections and encryption are simulated in this demo.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }, { url: "/aqurk-icon-512.png", sizes: "512x512", type: "image/png" }],
    apple: [{ url: "/aqurk-icon-512.png", sizes: "512x512", type: "image/png" }],
  },
  openGraph: {
    title: "Aqurk — Be heard. Not seen.",
    description: "No account. No database. No trace stored. A frontend preview; connections and encryption are simulated.",
    siteName: "Aqurk",
    images: [{ url: "/aqurk-icon-512.png", alt: "Aqurk: two violet-blue speech bubbles encircled by an orbit" }],
  },
  twitter: { card: "summary", title: "Aqurk — Be heard. Not seen.", images: ["/aqurk-icon-512.png"] },
  manifest: "/manifest.webmanifest",
  referrer: "no-referrer",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light",
  themeColor: "#F7F8FC",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="light"><body className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}><AqurkProvider><SessionProvider>{children}</SessionProvider></AqurkProvider></body></html>
}
