# 🚀 Complete Setup - mySocials

## Prerequisites

- **Node.js** 20+ and npm
- **Python 3** (for Instagram scraping)
- **pip3** (Python package manager)

## Installation

### 1️⃣ Clone and install Node.js dependencies

```bash
npm install
```

### 2️⃣ Install Python dependencies

```bash
npm run setup:python
```

Or manually:

```bash
pip3 install -r scripts/requirements.txt
```

### 3️⃣ Start the server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎨 Features

### Dynamic Backgrounds per Category

Each tab has a dynamic background with real content from your social media:

#### 📸 Personal
- **Source**: Instagram
- **Implementation**: Python script using `instaloader`
- **Visual**: Animated grid with real images

#### 🎮 Valorant
- **Sources**: Twitch + TikTok
- **Visual**: Mixed grid of videos and streams

#### 💻 Dev
- **Source**: Automatic screenshots with Puppeteer
- **Projects**: 
  - ecommerce-landing-kappa.vercel.app
  - ecommerce-six-peach-14.vercel.app
- **Visual**: Real screenshots captured in real-time

#### 📈 Trading
- **Source**: TradingView Widgets
- **Charts**: BTC, ETH, SOL, BNB, XRP, ADA, DOGE, MATIC, DOT, AVAX, LINK, UNI
- **Visual**: Grid of 12 real-time charts

## 📂 File Structure

```
/src
  /app
    /api
      /instagram      # Instagram scraping API
      /twitch         # Twitch streams API
      /tiktok         # TikTok videos API
      /dev-screenshots # Screenshots API with Puppeteer
      /trading-charts  # TradingView widgets API
  /components
    /PublicProfile
      /Backgrounds    # Background components per category
  /lib
    cache.ts          # Caching system (30 min)

/scripts
  instagram_scraper.py  # Python script for Instagram
  requirements.txt      # Python dependencies
  setup.sh             # Installation script

/public
  /instagram-cache    # Downloaded images (git ignored)
```

## 🔧 Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run linter
npm run format           # Format code with Prettier
npm run setup:python     # Install Python dependencies
```

## 🐛 Troubleshooting

### Error: "instaloader: command not found"

Run:
```bash
npm run setup:python
```

Or install manually:
```bash
pip3 install instaloader
```

### Error: "Python 3 is not installed"

Install Python 3:
- **macOS**: `brew install python3`
- **Ubuntu/Debian**: `sudo apt install python3 python3-pip`
- **Windows**: Download from [python.org](https://python.org)

### Screenshots not working

Puppeteer may take time on first execution. Screenshots are cached for 30 minutes.

### No Instagram images

The script downloads images to `public/instagram-cache/`. If there are no images:
1. Verify that `instaloader` is installed
2. Check the logs in the terminal
3. Make sure the Instagram profile is public

## 🎯 Cache

The system implements a **30-minute** in-memory cache for:
- ✅ Instagram images
- ✅ Twitch videos
- ✅ TikTok videos
- ✅ Project screenshots
- ✅ Trading charts

This reduces requests and improves performance.

## 🔐 Privacy

- Instagram images are downloaded locally to `public/instagram-cache/`
- This directory is in `.gitignore` and is not uploaded to the repository
- Screenshots are generated in real-time and cached temporarily

## 📝 Notes

- Instagram scraping requires the profile to be public
- Screenshots may take a few seconds to generate
- Cache is reset when restarting the server
- In production, consider using Redis for caching

