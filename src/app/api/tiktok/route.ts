import { NextResponse } from 'next/server'
import { getCachedData, setCachedData } from '@/lib/cache'
import axios from 'axios'

interface Video {
  id: string
  thumbnail: string
  title: string
  url: string
  platform: string
}

export async function GET() {
  try {
    const cached = getCachedData<{ videos: Video[] }>('tiktok_videos')
    if (cached) {
      return NextResponse.json(cached)
    }

    const username = 'mzanan0'
    
    try {
      const response = await axios.get(`https://www.tiktok.com/@${username}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 10000,
      })

      console.log('TikTok response status:', response.status)
      const html = response.data
      const thumbnailRegex = /"https:\/\/[^"]*\.tiktokcdn\.com[^"]*"/g
      const matches = html.match(thumbnailRegex)
      
      console.log('TikTok thumbnails found:', matches?.length || 0)
      
      if (matches && matches.length > 0) {
        const videos: Video[] = []
        const uniqueThumbnails = [...new Set(matches)].slice(0, 6) as string[]
        
        uniqueThumbnails.forEach((match, i) => {
          const thumbnail = match.replace(/"/g, '')
          videos.push({
            id: `tiktok-${i}`,
            thumbnail,
            title: `TikTok Video ${i + 1}`,
            url: `https://tiktok.com/@${username}`,
            platform: 'tiktok',
          })
        })

        console.log('TikTok videos created:', videos.length)
        if (videos.length > 0) {
          const result = { videos }
          setCachedData('tiktok_videos', result)
          return NextResponse.json(result)
        }
      }
    } catch (error) {
      console.error('TikTok scraping error:', error)
    }

    console.log('TikTok: Using fallback placeholders')

    const videos: Video[] = []
    for (let i = 1; i <= 6; i++) {
      videos.push({
        id: `tiktok-${i}`,
        thumbnail: `https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/default~c5_100x100.jpeg?x-expires=1640000000&x-signature=placeholder`,
        title: `TikTok Video ${i}`,
        url: `https://tiktok.com/@${username}`,
        platform: 'tiktok',
      })
    }

    const result = { videos }
    setCachedData('tiktok_videos', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('TikTok route error:', error)
    return NextResponse.json({ videos: [], error: String(error) })
  }
}

