const cache = require('../src/services/cacheService');

describe('CacheService', () => {
  beforeEach(() => cache.clear());

  it('should store and retrieve a value', () => {
    cache.set('key1', { data: 'hello' }, 60);
    expect(cache.get('key1')).toEqual({ data: 'hello' });
  });

  it('should return null for a missing key', () => {
    expect(cache.get('nonexistent')).toBeNull();
  });

  it('should return null for an expired entry', async () => {
    cache.set('expiring', 'value', 0.001); // expires in 1ms
    await new Promise((r) => setTimeout(r, 10));
    expect(cache.get('expiring')).toBeNull();
  });

  it('has() should return true for a valid entry', () => {
    cache.set('exists', 42, 60);
    expect(cache.has('exists')).toBe(true);
  });

  it('has() should return false for an expired entry', async () => {
    cache.set('gone', 'soon', 0.001);
    await new Promise((r) => setTimeout(r, 10));
    expect(cache.has('gone')).toBe(false);
  });

  it('should delete a key', () => {
    cache.set('toDelete', 'bye', 60);
    cache.delete('toDelete');
    expect(cache.get('toDelete')).toBeNull();
  });

  it('should clear all entries', () => {
    cache.set('a', 1, 60);
    cache.set('b', 2, 60);
    cache.clear();
    expect(cache.size).toBe(0);
  });

  it('should purge expired entries', async () => {
    cache.set('live', 'yes', 60);
    cache.set('dead', 'no', 0.001);
    await new Promise((r) => setTimeout(r, 10));
    cache.purgeExpired();
    expect(cache.size).toBe(1);
    expect(cache.get('live')).toBe('yes');
  });

  it('should overwrite an existing key with a new value', () => {
    cache.set('dup', 'first', 60);
    cache.set('dup', 'second', 60);
    expect(cache.get('dup')).toBe('second');
  });
});
