/**
 * Browser-side cache using localStorage
 * Stores data with a timestamp to check expiration
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const CACHE_DURATION = 1000 * 60 * 60 * 24 // 24 hours

/**
 * Get cached data from localStorage
 */
export function getBrowserCache<T>(key: string): T | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const cached = localStorage.getItem(key)
    if (!cached) return null

    const entry: CacheEntry<T> = JSON.parse(cached)
    const now = Date.now()

    if (now - entry.timestamp > CACHE_DURATION) {
      localStorage.removeItem(key)
      return null
    }

    return entry.data
  } catch (error) {
    console.error(`Error reading cache for key "${key}":`, error)
    return null
  }
}

/**
 * Set data in localStorage cache
 */
export function setBrowserCache<T>(key: string, data: T): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    }
    localStorage.setItem(key, JSON.stringify(entry))
  } catch (error) {
    console.error(`Error setting cache for key "${key}":`, error)
    // If localStorage is full, try to clear old entries
    if (error instanceof DOMException && error.code === 22) {
      clearOldCacheEntries()
      try {
        const entry: CacheEntry<T> = {
          data,
          timestamp: Date.now(),
        }
        localStorage.setItem(key, JSON.stringify(entry))
      } catch (retryError) {
        console.error(`Failed to set cache after clearing old entries:`, retryError)
      }
    }
  }
}

/**
 * Clear a specific cache entry
 */
export function clearBrowserCache(key: string): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error clearing cache for key "${key}":`, error)
  }
}

/**
 * Clear all expired cache entries
 */
function clearOldCacheEntries(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const now = Date.now()
    const keysToRemove: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key) continue

      try {
        const cached = localStorage.getItem(key)
        if (!cached) continue

        const entry: CacheEntry<unknown> = JSON.parse(cached)
        if (now - entry.timestamp > CACHE_DURATION) {
          keysToRemove.push(key)
        }
      } catch {
        // If it's not a cache entry, skip it
        continue
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key))
  } catch (error) {
    console.error('Error clearing old cache entries:', error)
  }
}

