const config = require('../config');

/**
 * Validate registration request body.
 */
function validateRegister(req, res, next) {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long.');
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('A valid email address is required.');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(' ') });
  }

  next();
}

/**
 * Validate login request body.
 */
function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('A valid email address is required.');
  }

  if (!password) {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(' ') });
  }

  next();
}

/**
 * Validate user preference update body.
 */
function validatePreferences(req, res, next) {
  const { categories, sources, language } = req.body;
  const errors = [];

  if (categories !== undefined) {
    if (!Array.isArray(categories)) {
      errors.push('categories must be an array.');
    } else {
      const invalid = categories.filter((c) => !config.validCategories.includes(c));
      if (invalid.length > 0) {
        errors.push(
          `Invalid categories: ${invalid.join(', ')}. Valid options: ${config.validCategories.join(', ')}.`
        );
      }
    }
  }

  if (sources !== undefined && !Array.isArray(sources)) {
    errors.push('sources must be an array of source IDs.');
  }

  if (language !== undefined && typeof language !== 'string') {
    errors.push('language must be a string.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(' ') });
  }

  next();
}

/**
 * Validate search query parameter.
 */
function validateSearch(req, res, next) {
  const { q } = req.query;

  if (!q || q.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Search query parameter "q" is required.',
    });
  }

  next();
}

/**
 * Validate that an article body is provided for favorite / read operations.
 */
function validateArticle(req, res, next) {
  const { article } = req.body;

  if (!article || typeof article !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'An "article" object is required in the request body.',
    });
  }

  if (!article.url) {
    return res.status(400).json({
      success: false,
      message: 'The article object must contain a "url" field.',
    });
  }

  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validatePreferences,
  validateSearch,
  validateArticle,
};
