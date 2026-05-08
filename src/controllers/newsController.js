const newsService = require('../services/newsService');
const userService = require('../services/userService');

/**
 * GET /api/news
 * Fetch personalised top headlines based on the user's preferences.
 */
async function getNews(req, res, next) {
  try {
    const user = userService.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const articles = await newsService.fetchTopHeadlines(user.preferences);

    return res.status(200).json({
      success: true,
      data: { articles, total: articles.length },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/news/search?q=keyword
 * Full-text search across news articles.
 */
async function searchNews(req, res, next) {
  try {
    const { q, sortBy, pageSize } = req.query;

    const user = userService.findById(req.user.id);
    const language = user?.preferences?.language || 'en';

    const articles = await newsService.searchArticles(q, {
      language,
      sortBy: sortBy || 'publishedAt',
      pageSize: parseInt(pageSize, 10) || 20,
    });

    return res.status(200).json({
      success: true,
      data: { articles, total: articles.length, query: q },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/news/favorites
 * Return the authenticated user's saved favorite articles.
 */
function getFavorites(req, res, next) {
  try {
    const user = userService.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      data: { favorites: user.favorites, total: user.favorites.length },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/news/:id/favorite
 * Save an article to the user's favorites.
 * The client must pass the full article object in the body
 * because NewsAPI articles are ephemeral (no DB on our side).
 */
function addFavorite(req, res, next) {
  try {
    const { id } = req.params;
    const { article } = req.body;

    // Attach our stable ID to the article
    const articleWithId = { ...article, id };

    const favorites = userService.addFavorite(req.user.id, articleWithId);
    if (favorites === null) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Article added to favorites.',
      data: { favorites, total: favorites.length },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/news/:id/favorite
 * Remove an article from the user's favorites.
 */
function removeFavorite(req, res, next) {
  try {
    const { id } = req.params;

    const favorites = userService.removeFavorite(req.user.id, id);
    if (favorites === null) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Article removed from favorites.',
      data: { favorites, total: favorites.length },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/news/read
 * Return the authenticated user's read history.
 */
function getReadHistory(req, res, next) {
  try {
    const user = userService.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      data: { readHistory: user.readHistory, total: user.readHistory.length },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/news/:id/read
 * Mark an article as read.
 * Expects the full article object in the request body.
 */
function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    const { article } = req.body;

    const articleWithId = { ...article, id };

    const readHistory = userService.markAsRead(req.user.id, articleWithId);
    if (readHistory === null) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Article marked as read.',
      data: { readHistory, total: readHistory.length },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getNews,
  searchNews,
  getFavorites,
  addFavorite,
  removeFavorite,
  getReadHistory,
  markAsRead,
};
