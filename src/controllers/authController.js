const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const userService = require('../services/userService');

/**
 * POST /api/auth/register
 * Create a new user account.
 */
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Check for duplicate email
    const existing = userService.findByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, config.bcryptRounds);

    // Persist user
    const user = userService.createUser({ name, email, password: hashedPassword });

    // Sign JWT
    const token = jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, {
      expiresIn: config.jwtExpiry,
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Authenticate user and return a JWT.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Look up user
    const user = userService.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Sign JWT
    const token = jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, {
      expiresIn: config.jwtExpiry,
    });

    // Return safe user (exclude password)
    const { password: _pw, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: { user: safeUser, token },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
