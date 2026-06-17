import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"

const CORE_BASE = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm"
const FFMPEG_BASE = "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.15/dist/esm"

export const MAX_VIDEO_SECONDS = 15

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
      await ffmpeg.load({
        classWorkerURL: await moduleWorkerURL(),
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
