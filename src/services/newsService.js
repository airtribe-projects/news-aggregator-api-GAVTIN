const axios = require('axios');
const crypto = require('crypto');
const config = require('../config');
const cache = require('./cacheService');

/**
 * Generate a stable article ID from its URL.
 * @param {string} url
 * @returns {string} short hex hash
 */
function generateArticleId(url) {
  return crypto.createHash('md5').update(url || String(Date.now())).digest('hex').slice(0, 12);
}

/**
 * Normalise a raw NewsAPI article into our internal shape.
 * Adds a stable `id` field based on the article URL.
 * @param {Object} raw - raw article from NewsAPI
 * @returns {Object}
 */
function normaliseArticle(raw) {
  return {
    id: generateArticleId(raw.url),
    title: raw.title,
    description: raw.description,
    content: raw.content,
    url: raw.url,
    urlToImage: raw.urlToImage,
    author: raw.author,
    source: raw.source,
    publishedAt: raw.publishedAt,
  };
}

/**
 * Build a cache key from query parameters.
 * @param {string} prefix - e.g. 'top_headlines' | 'search'
 * @param {Object} params
 * @returns {string}
 */
function buildCacheKey(prefix, params) {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return `${prefix}:${sorted}`;
}

/**
 * Fetch top headlines from NewsAPI based on user preferences.
 * Results are cached per unique set of parameters.
 *
 * @param {Object} preferences - { categories, sources, language }
 * @returns {Promise<Array>} array of normalised articles
 */
async function fetchTopHeadlines(preferences = {}) {
  const { categories = ['general'], sources = [], language = 'en' } = preferences;

  // NewsAPI: cannot combine 'sources' with 'category'/'country'
  const params = { language, apiKey: config.newsApiKey, pageSize: 20 };

  if (sources.length > 0) {
    params.sources = sources.join(',');
  } else {
    params.category = categories[0] || 'general'; // NewsAPI top-headlines supports one category
  }

  const cacheKey = buildCacheKey('top_headlines', { ...params, apiKey: 'REDACTED' });
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const response = await axios.get(`${config.newsApiBaseUrl}/top-headlines`, { params });
  const articles = (response.data.articles || []).map(normaliseArticle);

  cache.set(cacheKey, articles, config.cacheTTL);
  return articles;
}

/**
 * Search articles by keyword.
 * Results are cached per unique query.
 *
 * @param {string} query - search keyword(s)
 * @param {Object} options - { language, sortBy, pageSize }
 * @returns {Promise<Array>} array of normalised articles
 */
async function searchArticles(query, options = {}) {
  const { language = 'en', sortBy = 'publishedAt', pageSize = 20 } = options;

  const params = {
    q: query,
    language,
    sortBy,
    pageSize,
    apiKey: config.newsApiKey,
  };

  const cacheKey = buildCacheKey('search', { ...params, apiKey: 'REDACTED' });
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const response = await axios.get(`${config.newsApiBaseUrl}/everything`, { params });
  const articles = (response.data.articles || []).map(normaliseArticle);

  cache.set(cacheKey, articles, config.cacheTTL);
  return articles;
}

module.exports = {
  fetchTopHeadlines,
  searchArticles,
  normaliseArticle,
  generateArticleId,
};
