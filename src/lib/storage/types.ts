export interface Storage {
  put(key: string, body: Buffer | Uint8Array, contentType: string): Promise<void>
  delete(key: string): Promise<void>
  publicUrl(key: string): string
}
