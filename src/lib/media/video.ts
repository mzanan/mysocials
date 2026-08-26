export const MAX_VIDEO_BYTES = 60 * 1024 * 1024
const MAX_SOURCE_BYTES = 600 * 1024 * 1024
const MAX_SOURCE_MB = MAX_SOURCE_BYTES / (1024 * 1024)

export type ClipCheck = { ok: true } | { ok: false; reason: string }

export function validateClip(file: File): ClipCheck {
  if (!file.type.startsWith("video/")) {
    return { ok: false, reason: "That doesn't look like a video file." }
  }
  if (file.size > MAX_SOURCE_BYTES) {
    return { ok: false, reason: `Video is over ${MAX_SOURCE_MB}MB. Trim it first.` }
  }
  return { ok: true }
}

const MIN_VIDEO_DIMENSION = 16
const MAX_VIDEO_DIMENSION = 8000
const MAX_VIDEO_ASPECT_RATIO = 6

export function sanitizeVideoDimensions(
  width: unknown,
  height: unknown,
): { width: number; height: number } | null {
  const w = typeof width === "number" && Number.isFinite(width) ? Math.round(width) : null
  const h = typeof height === "number" && Number.isFinite(height) ? Math.round(height) : null
  if (!w || !h) return null
  if (w < MIN_VIDEO_DIMENSION || h < MIN_VIDEO_DIMENSION) return null
  if (w > MAX_VIDEO_DIMENSION || h > MAX_VIDEO_DIMENSION) return null
  const ratio = w / h
  if (ratio > MAX_VIDEO_ASPECT_RATIO || ratio < 1 / MAX_VIDEO_ASPECT_RATIO) return null
  return { width: w, height: h }
}
