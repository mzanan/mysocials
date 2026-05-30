import { localDriver } from './local'
import { r2Driver } from './r2'
import type { Storage } from './types'

export const storage: Storage = process.env.STORAGE_DRIVER === 'r2' ? r2Driver : localDriver

export type { Storage }
