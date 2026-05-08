/**
 * Global Express error-handling middleware.
 * Must be registered LAST in the middleware stack (after all routes).
 *
 * Handles:
 *  - Axios/NewsAPI errors  → 502 Bad Gateway
 *  - JWT errors            → 401 Unauthorized
 *  - Validation errors     → 400 Bad Request
 *  - All others            → 500 Internal Server Error
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error('[ErrorHandler]', err.message || err);

  // Axios / upstream API errors
  if (err.isAxiosError) {
    const status = err.response?.status || 502;
    const message =
      err.response?.data?.message ||
      'Failed to fetch data from the external news API.';
    return res.status(status).json({ success: false, message });
  }

  // JWT errors (should rarely reach here — handled in middleware)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }

  // SyntaxError from JSON body parser
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({ success: false, message: 'Invalid JSON in request body.' });
  }

  // Default: 500 Internal Server Error
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'An unexpected error occurred.';
  return res.status(statusCode).json({ success: false, message });
}

/**
 * Middleware for unmatched routes (404).
 */
function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
}

module.exports = { errorHandler, notFound };
