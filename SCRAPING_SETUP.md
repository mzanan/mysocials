# Web Scraping Setup

This project uses automatic web scraping to obtain real content from your social media.

## 🚀 Quick Installation

```bash
# 1. Install Node.js dependencies
npm install

# 2. Install Python dependencies (for Instagram scraping)
npm run setup:python

# 3. Start the project
npm run dev
```

## Project Structure

```
/scripts
  ├── instagram_scraper.py    # Python script for Instagram
  ├── requirements.txt         # Python dependencies
  └── setup.sh                # Installation script
```

## Required Tools

### 1. Instagram

**API Route**: `src/app/api/instagram/route.ts`

**Usage**: Fetches images directly from Instagram's public web API for profile @matizanan

**Location**: `/api/instagram`

**Note**: No additional setup required. The profile must be public.

### 2. Valorant Images (Reddit API)

**API Route**: `src/app/api/valorant/route.ts`

**Usage**: Fetches images from Reddit's r/Valorant subreddit (gameplays and character images)

**Location**: `/api/valorant`

**Note**: Uses Reddit's public API. No API key required.

### 3. Puppeteer (for screenshots)

Already installed in the project to capture screenshots of your web projects.

**Usage**: Captures screenshots from:
- https://ecommerce-landing-kappa.vercel.app/
- https://ecommerce-six-peach-14.vercel.app/

**Location**: `/api/dev-screenshots`

### 4. Trading Charts

Uses embedded TradingView widgets to display charts for:
- BTC, ETH, SOL, BNB, XRP, ADA, DOGE, MATIC, DOT, AVAX, LINK, UNI

**Location**: `/api/trading-charts`

## Cache System

All APIs implement a 30-minute cache system to improve performance and avoid scraping on every request.

## Data Structure

### Personal (Instagram)
```typescript
{
  images: string[] // Array of image URLs
}
```

### Valorant (Reddit Images)
```typescript
{
  images: Array<{
    id: string
    url: string
    thumbnail: string
    author: string
    authorUrl: string
  }>
}
```

### Dev (Screenshots)
```typescript
{
  screenshots: Array<{
    url: string
    screenshot: string // Base64 or URL
    title: string
  }>
}
```

### Trading (Charts)
```typescript
{
  charts: Array<{
    id: string
    symbol: string
    fullSymbol: string
    widgetUrl: string
  }>
}
```

## Important Notes

1. **Instagram**: Fetches images directly from Instagram's public web API. The profile must be public. No additional setup required.

2. **Valorant**: Uses Reddit's public API to fetch images from r/Valorant subreddit. Filters for gameplays and character images. No API key required.

3. **Screenshots**: Puppeteer can be memory-intensive. Screenshots are cached for 30 minutes on the server and 24 hours in the browser.

4. **Cache**: 
   - Server-side: Data is stored in memory for 30 minutes
   - Browser-side: Data is stored in localStorage for 24 hours
   - In production, consider using Redis for server-side caching

5. **Rate Limiting**: Consider implementing rate limiting for the APIs if the site has high traffic.
