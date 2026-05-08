const userService = require('../services/userService');

/**
 * GET /api/preferences
 * Retrieve the authenticated user's news preferences.
 */
function getPreferences(req, res, next) {
  try {
    const user = userService.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      data: { preferences: user.preferences },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/preferences
 * Update the authenticated user's news preferences.
 * Accepts partial updates — only provided fields are overwritten.
 */
function updatePreferences(req, res, next) {
  try {
    const user = userService.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { categories, sources, language } = req.body;

    // Merge with existing preferences
    const updatedPreferences = {
      ...user.preferences,
      ...(categories !== undefined && { categories }),
      ...(sources !== undefined && { sources }),
      ...(language !== undefined && { language }),
    };

    const updatedUser = userService.updateUser(req.user.id, { preferences: updatedPreferences });

    return res.status(200).json({
      success: true,
      message: 'Preferences updated successfully.',
      data: { preferences: updatedUser.preferences },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getPreferences, updatePreferences };
