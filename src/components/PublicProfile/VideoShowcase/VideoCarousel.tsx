'use client'

import { useHorizontalWheelScroll } from '@/hooks/useHorizontalWheelScroll'
import { useVideoLightbox } from './useVideoLightbox'
import { VideoLightbox } from './VideoLightbox'
import { VideoTile } from './VideoTile'
import type { MediaPublic } from '@/types/profile'

export function VideoCarousel({ videos }: { videos: MediaPublic[] }) {
  const lightbox = useVideoLightbox(videos.length)
  const scrollRef = useHorizontalWheelScroll<HTMLDivElement>()

  return (
    <div className="w-full max-w-4xl">
      <div
        ref={scrollRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2"
      >
        {videos.map((video, i) => (
          <VideoTile
            key={video.url}
            video={video}
            onOpen={() => lightbox.open(i)}
            className="aspect-[3/4] w-[68%] shrink-0 snap-center sm:w-64"
          />
        ))}
      </div>
      <VideoLightbox videos={videos} state={lightbox} />
    </div>
  )
}
