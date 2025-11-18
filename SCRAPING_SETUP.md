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

### 1. Instagram (instaloader)

**Python Script**: `scripts/instagram_scraper.py`

**Automatic installation**: `npm run setup:python`

**Manual installation**:
```bash
pip3 install -r scripts/requirements.txt
```

**Usage**: Downloads images from your Instagram profile @matizanan

**Location**: `/api/instagram`

### 2. Puppeteer (for screenshots)

Already installed in the project to capture screenshots of your web projects.

**Usage**: Captures screenshots from:
- https://ecommerce-landing-kappa.vercel.app/
- https://ecommerce-six-peach-14.vercel.app/

**Location**: `/api/dev-screenshots`

### 3. TikTok API

Already installed (`@tobyg74/tiktok-api-dl`) to get TikTok profile information.

**Usage**: Gets videos from @mzanan0

**Location**: `/api/tiktok`

### 4. Twitch

Uses static Twitch thumbnails for @mzanan

**Location**: `/api/twitch`

### 5. Trading Charts

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

### Valorant (Twitch + TikTok)
```typescript
{
  videos: Array<{
    id: string
    thumbnail: string
    title: string
    url: string
    platform: 'twitch' | 'tiktok'
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

1. **Instagram**: Requires `instaloader` installed globally. If not installed, the API will return an error but the site will continue to work.

2. **Screenshots**: Puppeteer can be memory-intensive. Screenshots are cached for 30 minutes.

3. **Cache**: Data is stored in memory for 30 minutes. In production, consider using Redis or similar.

4. **Rate Limiting**: Consider implementing rate limiting for the APIs if the site has high traffic.
