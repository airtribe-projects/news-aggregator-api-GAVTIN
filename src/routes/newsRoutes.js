const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateSearch, validateArticle } = require('../middleware/validateRequest');

// All news routes require authentication
router.use(authenticate);

/**
 * @route  GET /api/news
 * @desc   Get personalised top headlines based on user preferences
 * @access Private
 */
router.get('/', newsController.getNews);

/**
 * @route  GET /api/news/search?q=keyword
 * @desc   Full-text search across news articles
 * @access Private
 */
router.get('/search', validateSearch, newsController.searchNews);

/**
 * @route  GET /api/news/favorites
 * @desc   Get user's saved favorite articles
 * @access Private
 */
router.get('/favorites', newsController.getFavorites);

/**
 * @route  GET /api/news/read
 * @desc   Get user's read history
 * @access Private
 */
router.get('/read', newsController.getReadHistory);

/**
 * @route  POST /api/news/:id/favorite
 * @desc   Add article to favorites
 * @access Private
 */
router.post('/:id/favorite', validateArticle, newsController.addFavorite);

/**
 * @route  DELETE /api/news/:id/favorite
 * @desc   Remove article from favorites
 * @access Private
 */
router.delete('/:id/favorite', newsController.removeFavorite);

/**
 * @route  POST /api/news/:id/read
 * @desc   Mark article as read
 * @access Private
 */
router.post('/:id/read', validateArticle, newsController.markAsRead);

module.exports = router;
