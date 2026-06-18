import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"

const CORE_ST_BASE = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm"
const CORE_MT_BASE = "https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.10/dist/esm"
const FFMPEG_BASE = "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.15/dist/esm"

export const MAX_VIDEO_SECONDS = 15
export const MAX_GOOD_BITRATE = 8_000_000

let ffmpegPromise: Promise<FFmpeg> | null = null

async function moduleWorkerURL(): Promise<string> {
  const src = await (await fetch(`${FFMPEG_BASE}/worker.js`)).text()
  const patched = src.replace(/from\s*(["'])\.\/(.+?)\1/g, `from "${FFMPEG_BASE}/$2"`)
  return URL.createObjectURL(new Blob([patched], { type: "text/javascript" }))
}

function loadFFmpeg(): Promise<FFmpeg> {
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      const ffmpeg = new FFmpeg()
      const mt = globalThis.crossOriginIsolated === true
      const base = mt ? CORE_MT_BASE : CORE_ST_BASE
      await ffmpeg.load({
        classWorkerURL: await moduleWorkerURL(),
        coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm"),
        ...(mt
          ? { workerURL: await toBlobURL(`${base}/ffmpeg-core.worker.js`, "text/javascript") }
          : {}),
      })
      return ffmpeg
    })().catch((err) => {
      ffmpegPromise = null
      throw err
    })
  }
  return ffmpegPromise
}

export interface VideoMeta {
  duration: number
  width: number
  height: number
}

export function probeVideo(file: File): Promise<VideoMeta> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement("video")
    video.preload = "metadata"
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      resolve({
        duration: Number.isFinite(video.duration) ? video.duration : 0,
        width: video.videoWidth || 0,
        height: video.videoHeight || 0,
      })
    }
    video.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({ duration: 0, width: 0, height: 0 })
    }
    video.src = url
  })
}

export async function transcodeVideo(file: File, maxSeconds?: number): Promise<Blob> {
  const ffmpeg = await loadFFmpeg()
  const input = "in"
  const output = "out.mp4"
  const logs: string[] = []
  const onLog = ({ message }: { message: string }) => {
    logs.push(message)
    if (logs.length > 80) logs.shift()
  }
  ffmpeg.on("log", onLog)
  try {
    await ffmpeg.writeFile(input, await fetchFile(file))
    const args = [
      ...(maxSeconds ? ["-ss", "0", "-t", String(maxSeconds)] : []),
      "-i",
      input,
      "-vf",
      "scale=-2:min(1080\\,ih)",
      "-c:v",
      "libx264",
      "-profile:v",
      "high",
      "-pix_fmt",
      "yuv420p",
      "-preset",
      "veryfast",
      "-crf",
      "21",
      "-maxrate",
      "8M",
      "-bufsize",
      "16M",
      "-an",
      "-movflags",
      "+faststart",
      output,
    ]
    const code = await ffmpeg.exec(args)
    const data = await ffmpeg.readFile(output)
    const raw = typeof data === "string" ? new TextEncoder().encode(data) : data
    const bytes = new Uint8Array(raw)
    if (bytes.byteLength === 0) throw new Error(`ffmpeg produced no output (exit ${code})`)
    return new Blob([bytes], { type: "video/mp4" })
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err)
    throw new Error(`${reason}\n${logs.slice(-12).join("\n")}`)
  } finally {
    ffmpeg.off("log", onLog)
    await ffmpeg.deleteFile(input).catch(() => {})
    await ffmpeg.deleteFile(output).catch(() => {})
  }
}
