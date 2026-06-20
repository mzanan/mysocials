const HEIC_BRANDS = new Set([
  'heic',
  'heix',
  'hevc',
  'heim',
  'heis',
  'hevm',
  'hevs',
  'mif1',
  'msf1',
  'heif',
])

function isHeic(buf: Buffer): boolean {
  if (buf.length < 12) return false
  if (buf.toString('latin1', 4, 8) !== 'ftyp') return false
  return HEIC_BRANDS.has(buf.toString('latin1', 8, 12))
}

export async function toDecodableImage(buf: Buffer): Promise<Buffer> {
  if (!isHeic(buf)) return buf
  const { default: convert } = await import('heic-convert')
  const out = await convert({ buffer: new Uint8Array(buf).buffer, format: 'JPEG', quality: 0.92 })
  return Buffer.from(out)
}
