/**
 * Simple in-memory cache with TTL (Time To Live) support.
 * Uses a Map internally and stores expiry timestamps alongside values.
 */

class CacheService {
  constructor() {
    this.store = new Map();
  }

  /**
   * Set a value in cache with a TTL
   * @param {string} key
   * @param {*} value
   * @param {number} ttlSeconds - time to live in seconds
   */
  set(key, value, ttlSeconds) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
  }

  /**
   * Get a value from cache; returns null if missing or expired
   * @param {string} key
   * @returns {*|null}
   */
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Check if a key exists and is still valid
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Delete a key from cache
   * @param {string} key
   */
  delete(key) {
    this.store.delete(key);
  }

  /**
   * Clear all entries
   */
  clear() {
    this.store.clear();
  }

  /**
   * Remove all expired entries (useful for periodic cleanup)
   */
  purgeExpired() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Return cache size (including expired entries not yet purged)
   */
  get size() {
    return this.store.size;
  }
}

// Export a singleton
const cacheService = new CacheService();
module.exports = cacheService;
