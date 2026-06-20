const MAX_DIMENSION = 1600
const QUALITY = 0.85

export async function compressImage(file: File): Promise<File> {
  if (typeof document === "undefined") return file
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" })
  } catch {
    return file
  }

  const scale = Math.min(
    1,
    MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
  )
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    bitmap.close()
    return file
  }
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", QUALITY),
  )
  if (!blob || blob.size >= file.size) return file

  const name = file.name.replace(/\.[^./\\]+$/, "") + ".webp"
  return new File([blob], name, { type: "image/webp" })
}
