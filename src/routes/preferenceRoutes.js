const express = require('express');
const router = express.Router();
const preferenceController = require('../controllers/preferenceController');
const { authenticate } = require('../middleware/authMiddleware');
const { validatePreferences } = require('../middleware/validateRequest');

/**
 * @route  GET /api/preferences
 * @desc   Get authenticated user's news preferences
 * @access Private
 */
router.get('/', authenticate, preferenceController.getPreferences);

/**
 * @route  PUT /api/preferences
 * @desc   Update authenticated user's news preferences
 * @access Private
 */
router.put('/', authenticate, validatePreferences, preferenceController.updatePreferences);

module.exports = router;
