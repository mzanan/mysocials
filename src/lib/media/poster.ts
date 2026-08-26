export interface PosterResult {
  blob: Blob | null
  width: number
  height: number
}

export async function extractPoster(file: Blob): Promise<PosterResult | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement("video")
    video.muted = true
    video.preload = "auto"
    video.src = url

    let settled = false
    const finish = (result: PosterResult | null) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      URL.revokeObjectURL(url)
      resolve(result)
    }
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
      const sourceWidth = video.videoWidth
      const sourceHeight = video.videoHeight
      const w = 1080
      const ratio = sourceWidth ? sourceHeight / sourceWidth : 0.5625
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
      canvas.toBlob(
        (blob) => finish({ blob, width: sourceWidth, height: sourceHeight }),
        "image/webp",
        0.82,
      )
    }

    video.onerror = () => {
      cleanup()
    }
  })
}
