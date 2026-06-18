export async function extractPoster(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement("video")
    video.muted = true
    video.preload = "auto"
    video.src = url

    const cleanup = () => URL.revokeObjectURL(url)

    video.onloadeddata = () => {
      try {
        video.currentTime = Math.min(0.1, video.duration || 0.1)
      } catch {
        cleanup()
        resolve(null)
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
        resolve(null)
        return
      }
      ctx.drawImage(video, 0, 0, w, h)
      canvas.toBlob(
        (blob) => {
          cleanup()
          resolve(blob)
        },
        "image/webp",
        0.82,
      )
    }

    video.onerror = () => {
      cleanup()
      resolve(null)
    }
  })
}
