import { NextResponse } from 'next/server'
import { getCachedData, setCachedData, clearCache } from '@/lib/cache'

interface Image {
  id: string
  url: string
  thumbnail: string
  author: string
  authorUrl: string
}

interface RedditPost {
  data: {
    id: string
    title: string
    url: string
    thumbnail: string
    link_flair_text?: string
    preview?: {
      images?: Array<{
        source?: {
          url: string
        }
        resolutions?: Array<{
          url: string
        }>
      }>
    }
    author: string
    permalink: string
  }
}

interface RedditResponse {
  data: {
    children: RedditPost[]
  }
}


export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const forceRefresh = url.searchParams.get('refresh') === 'true'

    if (forceRefresh) {
      clearCache('valorant_images')
      console.log('Valorant API: Cache cleared, forcing refresh')
    }

    const cached = getCachedData<{ images: Image[] }>('valorant_images')
    if (cached && cached.images && cached.images.length >= 40) {
      console.log('Valorant API: Returning cached data, images count:', cached.images.length)
      return NextResponse.json(cached)
    }

    if (cached && cached.images && cached.images.length < 40) {
      console.log('Valorant API: Cache has insufficient images (', cached.images.length, '), refreshing...')
      clearCache('valorant_images')
    }

    const subreddits = ['Valorant', 'ValorantClips', 'ValorantGameplay']
    const allPosts: RedditPost[] = []
    
    for (const subreddit of subreddits) {
      try {
        const apiUrl = `https://www.reddit.com/r/${subreddit}/hot.json?limit=50`
        const response = await fetch(apiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; ValorantApp/1.0)',
          },
        })
        
        if (response.ok) {
          const data = (await response.json()) as RedditResponse
          if (data.data?.children) {
            allPosts.push(...data.data.children)
          }
        }
      } catch (error) {
        console.warn(`Valorant API: Error fetching from r/${subreddit}:`, error)
      }
    }
    
    if (allPosts.length === 0) {
      console.warn('Valorant API: No results from Reddit')
      return NextResponse.json({ images: [], error: 'No images found' }, { status: 404 })
    }

    const images: Image[] = []
    const gameplayKeywords = ['gameplay', 'clip', 'play', 'kill', 'ace', 'round', 'match', 'agent', 'character', 'skin', 'weapon', 'ability', 'ult', 'agent', 'jett', 'raze', 'phoenix', 'sova', 'brimstone', 'sage', 'cypher', 'reyna', 'killjoy', 'breach', 'omen', 'viper', 'yoru', 'astra', 'kayo', 'chamber', 'neon', 'fade', 'gekko', 'deadlock', 'iso', 'clove']
    
    for (const post of allPosts) {
      if (images.length >= 40) break
      
      const postData = post.data
      const titleLower = postData.title.toLowerCase()
      
      const isRelevant = gameplayKeywords.some(keyword => titleLower.includes(keyword)) ||
                        postData.link_flair_text?.toLowerCase().includes('gameplay') ||
                        postData.link_flair_text?.toLowerCase().includes('clip') ||
                        postData.link_flair_text?.toLowerCase().includes('highlight')
      
      if (!isRelevant) continue
      
      let imageUrl = ''
      
      if (postData.preview?.images?.[0]?.source?.url) {
        imageUrl = postData.preview.images[0].source.url.replace(/&amp;/g, '&')
      } else if (postData.preview?.images?.[0]?.resolutions?.[postData.preview.images[0].resolutions.length - 1]?.url) {
        imageUrl = postData.preview.images[0].resolutions[postData.preview.images[0].resolutions.length - 1].url.replace(/&amp;/g, '&')
      } else if (postData.thumbnail && postData.thumbnail !== 'self' && postData.thumbnail !== 'default' && postData.thumbnail !== 'nsfw') {
        imageUrl = postData.thumbnail
      } else if (postData.url && /\.(jpg|jpeg|png|gif|webp)$/i.test(postData.url)) {
        imageUrl = postData.url
      }
      
      if (imageUrl && imageUrl.startsWith('http')) {
        images.push({
          id: postData.id,
          url: imageUrl,
          thumbnail: imageUrl,
          author: postData.author,
          authorUrl: `https://www.reddit.com${postData.permalink}`,
        })
      }
    }

    console.log('Valorant API: Received', images.length, 'images from Reddit')

    if (images.length === 0) {
      console.warn('Valorant API: No valid images found in Reddit posts')
      return NextResponse.json({ images: [], error: 'No valid images found' }, { status: 404 })
    }

    const result = { images: images.slice(0, 40) }
    console.log('Valorant API: Returning', result.images.length, 'images')
    setCachedData('valorant_images', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Valorant API error:', error)
    return NextResponse.json({ images: [], error: String(error) }, { status: 500 })
  }
}



