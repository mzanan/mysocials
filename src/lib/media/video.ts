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
