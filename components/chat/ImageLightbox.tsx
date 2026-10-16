"use client"
import { useState } from "react"
import { Download, ZoomIn, ZoomOut } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
export default function ImageLightbox({ image, close }: { image: { url: string; name: string } | null; close: () => void }) {
  const [zoom, setZoom] = useState(false)
  return <Dialog open={!!image} onOpenChange={open => { if (!open) { close(); setZoom(false) } }}><DialogContent className="image-lightbox"><DialogHeader><DialogTitle>{image?.name}</DialogTitle><DialogDescription>Shared image · local demo preview</DialogDescription></DialogHeader><div className="lightbox-scroll">{image && <img src={image.url} alt={image.name} className={zoom ? "zoomed" : ""} />}</div><div className="flex justify-center gap-3"><Button variant="secondary" onClick={() => setZoom(!zoom)}>{zoom ? <ZoomOut /> : <ZoomIn />}{zoom ? "Fit image" : "Zoom"}</Button><a className="download-link" href={image?.url} download={image?.name}><Download className="size-4" />Download</a></div></DialogContent></Dialog>
}
