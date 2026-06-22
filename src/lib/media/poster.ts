export async function extractPoster(file: Blob): Promise<Blob | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement("video")
    video.muted = true
    video.preload = "auto"
    video.src = url

    let settled = false
    const finish = (blob: Blob | null) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      URL.revokeObjectURL(url)
      resolve(blob)
    }
    // Defensive: never let a stuck <video> stall the upload pipeline.
    const timer = setTimeout(() => finish(null), 10_000)
    const cleanup = () => finish(null)

    video.onloadeddata = () => {
      try {
        video.currentTime = Math.min(0.1, video.duration || 0.1)
      } catch {
        cleanup()
      }
    }

    video.onseeked = () => {
      const w = 1080
      const ratio = video.videoWidth ? video.videoHeight / video.videoWidth : 0.5625
      const h = Math.round(w * ratio)
      const canvas = document.createElement("canvas")
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        cleanup()
        return
      }
      ctx.drawImage(video, 0, 0, w, h)
      canvas.toBlob((blob) => finish(blob), "image/webp", 0.82)
    }

    video.onerror = () => {
      cleanup()
    }
  })
}
