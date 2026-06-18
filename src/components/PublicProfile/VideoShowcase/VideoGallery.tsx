'use client'

import { useVideoLightbox } from './useVideoLightbox'
import { VideoLightbox } from './VideoLightbox'
import { VideoTile } from './VideoTile'
import type { MediaPublic } from '@/types/profile'

export function VideoGallery({ videos }: { videos: MediaPublic[] }) {
  const lightbox = useVideoLightbox(videos.length)

  return (
    <div className="w-full max-w-2xl">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {videos.map((video, i) => (
          <VideoTile
            key={video.url}
            video={video}
            onOpen={() => lightbox.open(i)}
            className="aspect-[3/4]"
          />
        ))}
      </div>
      <VideoLightbox videos={videos} state={lightbox} />
    </div>
  )
}
