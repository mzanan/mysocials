export async function preloadAllData() {
  console.log('🚀 Starting preload of all APIs...')
  
  const results = await Promise.allSettled([
    fetch('/api/instagram').then(r => { console.log('✓ Instagram preloaded'); return r; }),
    fetch('/api/twitch').then(r => { console.log('✓ Twitch preloaded'); return r; }),
    fetch('/api/tiktok').then(r => { console.log('✓ TikTok preloaded'); return r; }),
    fetch('/api/dev-screenshots').then(r => { console.log('✓ Dev screenshots preloaded'); return r; }),
    fetch('/api/trading-charts').then(r => { console.log('✓ Trading charts preloaded'); return r; }),
  ])
  
  console.log('✅ Preload complete:', results.map(r => r.status))
  return results
}

