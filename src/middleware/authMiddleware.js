const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Express middleware that verifies a Bearer JWT token.
 * Attaches the decoded payload to `req.user` on success.
 *
 * Responds with 401 if:
 *  - No Authorization header is present
 *  - Token is malformed or expired
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded; // { id, email, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
    });
  }
}

module.exports = { authenticate };
