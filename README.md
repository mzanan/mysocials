# 🚀 Complete Setup - mySocials

## Prerequisites

- **Node.js** 20+ and npm

## Installation

### 1️⃣ Clone and install Node.js dependencies

```bash
npm install
```

### 2️⃣ Start the server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎨 Features

### Dynamic Backgrounds per Category

Each tab has a dynamic background with real content from your social media:

#### 📸 Personal
- **Source**: Instagram
- **Implementation**: Direct API calls to Instagram's public web API
- **Visual**: Animated grid with real images

#### 🎮 Valorant
- **Source**: Reddit (r/Valorant subreddit)
- **Visual**: Grid of gameplay and character images

#### 💻 Dev
- **Source**: Automatic screenshots with Puppeteer
- **Projects**: 
  - ecommerce-landing-kappa.vercel.app
  - ecommerce-six-peach-14.vercel.app
- **Visual**: Real screenshots captured in real-time

#### 📈 Trading
- **Source**: TradingView Widgets
- **Charts**: BTC, ETH, SOL, BNB, XRP, ADA, DOGE, MATIC, DOT, AVAX, LINK, UNI
- **Timeframe**: 1 hour (1H)
- **Visual**: Grid of 10 real-time charts in 2 columns

## 📂 File Structure

```
/src
  /app
    /api
      /instagram      # Instagram images API
      /valorant       # Valorant images from Reddit API
      /dev-screenshots # Screenshots API with Puppeteer
      /trading-charts  # TradingView widgets API
  /components
    /PublicProfile
      /Backgrounds    # Background components per category
  /lib
    cache.ts          # Server-side caching system (30 min)
    browser-cache.ts  # Browser-side caching system (24 hours)
    preload.ts        # Preloads all background data
    projects.ts       # Dev projects configuration
```

## 🔧 Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run linter
npm run format           # Format code with Prettier
```

## 🐛 Troubleshooting

### Screenshots not working

Puppeteer may take time on first execution. Screenshots are cached for 30 minutes.

### No Instagram images

If there are no images:
1. Check the logs in the terminal
2. Make sure the Instagram profile is public
3. Instagram's API may have rate limits

## 🎯 Cache

The system implements a dual caching system:

**Server-side cache** (30 minutes):
- ✅ Instagram images
- ✅ Valorant images
- ✅ Project screenshots
- ✅ Trading charts

**Browser-side cache** (24 hours):
- ✅ All background data is cached in localStorage
- ✅ Prevents unnecessary API calls when switching tabs
- ✅ Improves performance and reduces server load

## 🔐 Privacy

- Instagram images are fetched directly from Instagram's public API
- Screenshots are generated in real-time and cached temporarily
- All data is cached in the browser for 24 hours

## 📝 Notes

- Instagram requires the profile to be public
- Screenshots may take a few seconds to generate
- Server-side cache is reset when restarting the server
- Browser cache persists across sessions (24 hours)
- In production, consider using Redis for server-side caching

