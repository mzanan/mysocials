export interface Storage {
  put(key: string, body: Buffer | Uint8Array, contentType: string): Promise<void>
  get(key: string): Promise<Buffer>
  delete(key: string): Promise<void>
  publicUrl(key: string): string
}
