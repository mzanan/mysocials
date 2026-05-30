import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"

const CORE_BASE = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm"

export const MAX_VIDEO_SECONDS = 15

let ffmpegPromise: Promise<FFmpeg> | null = null

function loadFFmpeg(): Promise<FFmpeg> {
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      const ffmpeg = new FFmpeg()
      await ffmpeg.load({
        coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, "application/wasm"),
      })
      return ffmpeg
    })().catch((err) => {
      ffmpegPromise = null
      throw err
    })
  }
  return ffmpegPromise
}

export function probeDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement("video")
    video.preload = "metadata"
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      resolve(Number.isFinite(video.duration) ? video.duration : 0)
    }
    video.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(0)
    }
    video.src = url
  })
}

export async function transcodeVideo(file: File): Promise<Blob> {
  const ffmpeg = await loadFFmpeg()
  const input = "in"
  const output = "out.mp4"
  await ffmpeg.writeFile(input, await fetchFile(file))
  await ffmpeg.exec([
    "-i",
    input,
    "-vf",
    "scale=-2:min(720\\,ih)",
    "-c:v",
    "libx264",
    "-profile:v",
    "high",
    "-pix_fmt",
    "yuv420p",
    "-preset",
    "veryfast",
    "-crf",
    "27",
    "-an",
    "-movflags",
    "+faststart",
    output,
  ])
  const data = await ffmpeg.readFile(output)
  await ffmpeg.deleteFile(input).catch(() => {})
  await ffmpeg.deleteFile(output).catch(() => {})
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data
  return new Blob([bytes], { type: "video/mp4" })
}
