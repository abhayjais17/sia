import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aqurk", short_name: "Aqurk",
    description: "Say it. Hide it. Aqurk it. A frontend preview; connections and encryption are simulated.",
    start_url: "/", display: "standalone",
    background_color: "#F7F8FC", theme_color: "#F7F8FC",
    icons: [
      { src: "/aqurk-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/aqurk-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/aqurk-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  }
}
