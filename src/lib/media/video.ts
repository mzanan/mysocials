export const MAX_VIDEO_BYTES = 40 * 1024 * 1024
const MAX_VIDEO_MB = MAX_VIDEO_BYTES / (1024 * 1024)

export type ClipCheck = { ok: true } | { ok: false; reason: string }

export function validateClip(file: File): ClipCheck {
  if (file.size > MAX_VIDEO_BYTES) {
    return {
      ok: false,
      reason: `Video is over ${MAX_VIDEO_MB}MB. Trim it or export at a lower bitrate.`,
    }
  }
  if (file.type === "video/mp4" || file.type === "video/webm") {
    return { ok: true }
  }
  return { ok: false, reason: "Use an mp4 or webm video." }
}
