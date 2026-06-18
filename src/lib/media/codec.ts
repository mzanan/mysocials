const CONTAINER_BOXES = new Set(['moov', 'trak', 'mdia', 'minf', 'stbl'])
const VIDEO_SAMPLE_TYPES = new Set([
  'avc1',
  'avc3',
  'hev1',
  'hvc1',
  'hvc2',
  'av01',
  'vp08',
  'vp09',
  'mp4v',
  's263',
  'dvav',
  'dva1',
  'dvhe',
  'dvh1',
])
const H264_SAMPLE_TYPES = new Set(['avc1', 'avc3'])

function readType(bytes: Uint8Array, off: number): string {
  return String.fromCharCode(bytes[off], bytes[off + 1], bytes[off + 2], bytes[off + 3])
}

function readU32(bytes: Uint8Array, off: number): number {
  return (
    ((bytes[off] << 24) | (bytes[off + 1] << 16) | (bytes[off + 2] << 8) | bytes[off + 3]) >>> 0
  )
}

function collectSampleTypes(bytes: Uint8Array, start: number, end: number, out: string[]) {
  let off = start
  while (off + 8 <= end) {
    let size = readU32(bytes, off)
    const type = readType(bytes, off + 4)
    let header = 8
    if (size === 1) {
      size = readU32(bytes, off + 12)
      header = 16
    } else if (size === 0) {
      size = end - off
    }
    if (size < header || off + size > end) break

    if (type === 'stsd') {
      let p = off + header + 8
      const stsdEnd = off + size
      while (p + 8 <= stsdEnd) {
        const entrySize = readU32(bytes, p)
        out.push(readType(bytes, p + 4))
        if (entrySize < 8) break
        p += entrySize
      }
    } else if (CONTAINER_BOXES.has(type)) {
      collectSampleTypes(bytes, off + header, off + size, out)
    }
    off += size
  }
}

export async function isUniversallyPlayableMp4(file: File): Promise<boolean> {
  try {
    const bytes = new Uint8Array(await file.arrayBuffer())
    const types: string[] = []
    collectSampleTypes(bytes, 0, bytes.length, types)
    const videoTypes = types.filter((t) => VIDEO_SAMPLE_TYPES.has(t))
    if (videoTypes.length === 0) return false
    return videoTypes.every((t) => H264_SAMPLE_TYPES.has(t))
  } catch {
    return false
  }
}
