import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aqurk", short_name: "Aqurk",
    description: "Be heard. Not seen. End-to-end encrypted, with no accounts or stored data.",
    start_url: "/", display: "standalone",
    background_color: "#F7F8FC", theme_color: "#F7F8FC",
    icons: [
      { src: "/aqurk-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/aqurk-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/aqurk-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  }
}
