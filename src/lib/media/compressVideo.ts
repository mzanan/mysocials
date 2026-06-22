import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  canEncodeVideo,
  Conversion,
  Input,
  Mp4OutputFormat,
  Output,
  QUALITY_MEDIUM,
} from "mediabunny";

const MAX_DIMENSION = 1920; // cap the longest side to the 1080p class (both orientations)
const TRANSCODE_TIMEOUT_MS = 120_000;
const REMUX_TIMEOUT_MS = 30_000;

export async function canCompressVideo(): Promise<boolean> {
  try {
    return await canEncodeVideo("avc");
  } catch {
    return false;
  }
}

export async function compressVideo(
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<Blob> {
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  const output = new Output({ format: new Mp4OutputFormat(), target: new BufferTarget() });

  let willTranscode = false;

  const conversion = await Conversion.init({
    input,
    output,
    video: async (track) => {
      const [codec, w, h, decodable] = await Promise.all([
        track.getCodec(),
        track.getDisplayWidth(),
        track.getDisplayHeight(),
        track.canDecode(),
      ]);
      // Already web-safe (H.264) and within size → copy the stream, no re-encode.
      if (codec === "avc" && Math.max(w, h) <= MAX_DIMENSION && decodable) return {};
      willTranscode = true;
      const dimension =
        Math.max(w, h) > MAX_DIMENSION
          ? w >= h
            ? { width: MAX_DIMENSION }
            : { height: MAX_DIMENSION }
          : {};
      return {
        codec: "avc",
        bitrate: QUALITY_MEDIUM,
        frameRate: 30,
        hardwareAcceleration: "prefer-hardware",
        ...dimension,
      };
    },
    audio: async (track) => {
      const [codec, decodable] = await Promise.all([
        track.getCodec(),
        track.canDecode(),
      ]);
      if (!decodable) return { discard: true };
      if (codec === "aac") return {};
      willTranscode = true;
      return { codec: "aac", bitrate: QUALITY_MEDIUM };
    },
  });

  if (!conversion.isValid) {
    const reason = conversion.discardedTracks[0]?.reason;
    throw new Error(
      reason === "undecodable_source_codec"
        ? "This video uses a format your browser can't read."
        : "This video can't be processed in the browser.",
    );
  }

  if (onProgress) conversion.onProgress = (p) => onProgress(p);

  await runWithTimeout(
    conversion,
    willTranscode ? TRANSCODE_TIMEOUT_MS : REMUX_TIMEOUT_MS,
  );

  const buffer = output.target.buffer;
  if (!buffer) throw new Error("Video conversion produced no output");
  return new Blob([buffer], { type: "video/mp4" });
}

async function runWithTimeout(conversion: Conversion, ms: number): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      void conversion.cancel();
      reject(new Error("Video processing timed out. Try a shorter clip."));
    }, ms);
  });
  try {
    await Promise.race([conversion.execute(), timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
