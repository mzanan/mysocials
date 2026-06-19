import { detectVideoCodecs, isH264Only } from "./codec"

export const MAX_VIDEO_BYTES = 40 * 1024 * 1024
const MAX_VIDEO_MB = MAX_VIDEO_BYTES / (1024 * 1024)

export type ClipCheck = { ok: true } | { ok: false; reason: string }

export async function validateClip(file: File): Promise<ClipCheck> {
  if (file.size > MAX_VIDEO_BYTES) {
    return { ok: false, reason: `Video is over ${MAX_VIDEO_MB}MB. Trim it or export at a lower bitrate.` }
  }
  if (file.type === "video/webm") return { ok: true }
  if (file.type !== "video/mp4") {
    return { ok: false, reason: "Use an mp4 (H.264) or webm clip." }
  }
  const codecs = await detectVideoCodecs(file)
  if (!isH264Only(codecs)) {
    return {
      ok: false,
      reason:
        "This clip is not H.264. Re-export as H.264 mp4 (iPhone: Settings > Camera > Formats > Most Compatible).",
    }
  }
  return { ok: true }
}
