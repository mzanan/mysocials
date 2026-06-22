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

const MAX_DIMENSION = 1920;

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

  const conversion = await Conversion.init({
    input,
    output,
    video: {
      codec: "avc",
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "contain",
      bitrate: QUALITY_MEDIUM,
    },
  });

  if (!conversion.isValid) {
    throw new Error("This video can't be processed in the browser");
  }
  if (onProgress) conversion.onProgress = (p) => onProgress(p);

  await conversion.execute();

  const buffer = output.target.buffer;
  if (!buffer) throw new Error("Video conversion produced no output");
  return new Blob([buffer], { type: "video/mp4" });
}
