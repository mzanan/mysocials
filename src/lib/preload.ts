export async function preloadAllData() {
  console.log('🚀 Starting preload of all APIs...')

  const results = await Promise.allSettled([
    fetch('/api/instagram').then(r => { console.log('✓ Instagram preloaded'); return r; }),
    fetch('/api/valorant').then(r => { console.log('✓ Valorant images preloaded'); return r; }),
  ])

  console.log('✅ Preload complete:', results.map(r => r.status))
  return results
}

