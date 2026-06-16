export type IgMediaType = 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'

export interface IgMedia {
  id: string
  mediaType: IgMediaType
  mediaUrl: string | null
  thumbnailUrl: string | null
}

export interface IgProfile {
  id: string
  username: string | null
  profilePictureUrl: string | null
  accountType: string | null
}

export interface IgConnectionRef {
  username: string | null
  accessToken: string
}

export interface ImportProvider {
  fetchMedia(conn: IgConnectionRef, limit: number): Promise<IgMedia[]>
}

export function stillUrl(m: IgMedia): string | null {
  return m.mediaType === 'VIDEO' ? m.thumbnailUrl : m.mediaUrl
}
