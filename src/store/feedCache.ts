import type { Signal } from '../types'

export interface FeedCache {
  signals: Signal[]
  cursor: string | null
  hasMore: boolean
  scrollY: number
}

export const feedCache = new Map<string, FeedCache>()

export function updateSignalInAllCaches(updated: Signal): void {
  for (const [key, cache] of feedCache) {
    const idx = cache.signals.findIndex((s) => s.id === updated.id)
    if (idx >= 0) {
      const newSignals = [...cache.signals]
      newSignals[idx] = updated
      feedCache.set(key, { ...cache, signals: newSignals })
    }
  }
}
