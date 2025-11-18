import { NextResponse } from 'next/server'
import { getCachedData, setCachedData } from '@/lib/cache'
import { getDevProjects } from '@/lib/projects'
import puppeteer from 'puppeteer'

interface Screenshot {
    url: string
    screenshot: string
    title: string
}

export async function GET() {
    try {
        const cached = getCachedData<{ screenshots: Screenshot[] }>('dev_screenshots')
        if (cached) {
            return NextResponse.json(cached)
        }

        const projects = getDevProjects()
        const screenshots: Screenshot[] = []

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        })

        for (const project of projects) {
            try {
                console.log(`Capturing screenshot for ${project.title}...`)
                const page = await browser.newPage()
                await page.setViewport({ width: 1920, height: 1080 })

                await page.goto(project.url, {
                    waitUntil: 'domcontentloaded',
                    timeout: 60000
                })

                await new Promise<void>(resolve => setTimeout(resolve, 3000))

                const screenshotBuffer = await page.screenshot({
                    type: 'jpeg',
                    quality: 70,
                    fullPage: false,
                    encoding: 'base64'
                })
                const base64Screenshot = `data:image/jpeg;base64,${screenshotBuffer}`

                screenshots.push({
                    url: project.url,
                    screenshot: base64Screenshot,
                    title: project.title,
                })

                console.log(`Successfully captured ${project.title}`)
                await page.close()
            } catch (error) {
                console.error(`Error capturing ${project.url}:`, error)
            }
        }

        await browser.close()

        if (screenshots.length === 0) {
            return NextResponse.json({
                screenshots: [],
                error: 'No se pudieron capturar screenshots'
            })
        }

        const result = { screenshots }
        setCachedData('dev_screenshots', result)

        return NextResponse.json(result)
    } catch (error) {
        console.error('Dev screenshots error:', error)
        return NextResponse.json({ screenshots: [], error: String(error) })
    }
}

