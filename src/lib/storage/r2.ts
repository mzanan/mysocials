import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

import type { Storage } from './types'

let client: S3Client | null = null

function getClient(): S3Client {
  if (client) return client
  const accountId = process.env.R2_ACCOUNT_ID
  if (!accountId) throw new Error('R2_ACCOUNT_ID is not set')
  client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  })
  return client
}

export const r2Driver: Storage = {
  async put(key, body, contentType) {
    await getClient().send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    )
  },
  async get(key) {
    const res = await getClient().send(
      new GetObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: key }),
    )
    const bytes = await res.Body!.transformToByteArray()
    return Buffer.from(bytes)
  },
  async delete(key) {
    await getClient().send(
      new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: key }),
    )
  },
  publicUrl(key) {
    const base = (process.env.R2_PUBLIC_BASE_URL ?? '').replace(/\/$/, '')
    return `${base}/${key}`
  },
}
