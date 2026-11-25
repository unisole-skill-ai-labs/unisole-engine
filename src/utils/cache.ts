/**
 * In-memory TTL Cache (B3)
 * Provides high-speed caching for expensive queries and structures (pathways, curriculum hierarchy, public catalog).
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class MemoryCache {
  private store: Map<string, CacheEntry<any>> = new Map();
  private maxEntries: number;

  constructor(maxEntries = 500) {
    this.maxEntries = maxEntries;
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds = 60): void {
    if (this.store.size >= this.maxEntries) {
      // Evict oldest or expired keys
      const now = Date.now();
      for (const [k, v] of this.store.entries()) {
        if (now > v.expiresAt || this.store.size >= this.maxEntries) {
          this.store.delete(k);
        }
      }
    }
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  del(key: string): void {
    this.store.delete(key);
  }

  invalidatePattern(pattern: RegExp | string): void {
    const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern;
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
  }

  clear(): void {
    this.store.clear();
  }
}

export const appCache = new MemoryCache();
