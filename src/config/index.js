require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'news_agg_super_secret_dev_key_2024',
  jwtExpiry: process.env.JWT_EXPIRY || '24h',

  // External News API (NewsAPI.org)
  newsApiKey: process.env.NEWS_API_KEY || '',
  newsApiBaseUrl: 'https://newsapi.org/v2',

  // Cache TTL in seconds (default 5 minutes)
  cacheTTL: parseInt(process.env.CACHE_TTL, 10) || 300,

  // Data directory for JSON file persistence
  dataDir: process.env.DATA_DIR || './data',

  // bcrypt salt rounds
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10,

  // Valid news categories
  validCategories: [
    'business',
    'entertainment',
    'general',
    'health',
    'science',
    'sports',
    'technology',
  ],
};

module.exports = config;
