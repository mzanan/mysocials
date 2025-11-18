import { NextResponse } from 'next/server'
import { getCachedData, setCachedData } from '@/lib/cache'
import axios from 'axios'

export async function GET() {
    try {
        const cached = getCachedData<{ images: string[] }>('instagram_images')
        if (cached) {
            return NextResponse.json(cached)
        }

        const username = 'matizanan'

        try {
            const response = await axios.get(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'X-IG-App-ID': '936619743392459',
                },
                timeout: 10000,
            })

            if (response.data?.data?.user?.edge_owner_to_timeline_media?.edges) {
                const posts = response.data.data.user.edge_owner_to_timeline_media.edges
                const images: string[] = []

                for (const post of posts) {
                    const node = post.node

                    if (node.edge_sidecar_to_children?.edges) {
                        for (const child of node.edge_sidecar_to_children.edges) {
                            images.push(child.node.display_url)
                        }
                    } else {
                        images.push(node.display_url)
                    }

                    if (images.length >= 40) break
                }

                if (images.length > 0) {
                    const result = { images: images.slice(0, 40) }
                    setCachedData('instagram_images', result)
                    return NextResponse.json(result)
                }
            }
        } catch (error) {
            console.error('Instagram API error:', error)
        }

        return NextResponse.json({
            images: [],
            error: 'Unable to fetch Instagram images'
        })
    } catch (error) {
        console.error('Instagram route error:', error)
        return NextResponse.json({
            images: [],
            error: String(error)
        })
    }
}

