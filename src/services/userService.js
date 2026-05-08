const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

const DATA_FILE = path.join(config.dataDir, 'users.json');

/**
 * Ensure the data directory and users file exist.
 */
function ensureDataFile() {
  const dir = config.dataDir;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

/**
 * Read all users from the JSON file.
 * @returns {Array}
 */
function readUsers() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Persist all users back to the JSON file.
 * @param {Array} users
 */
function writeUsers(users) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

// ──────────────────────────────────────────────────────────────
// CRUD helpers
// ──────────────────────────────────────────────────────────────

/**
 * Find a user by their email address.
 * @param {string} email
 * @returns {Object|null}
 */
function findByEmail(email) {
  const users = readUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Find a user by their ID.
 * @param {string} id
 * @returns {Object|null}
 */
function findById(id) {
  const users = readUsers();
  return users.find((u) => u.id === id) || null;
}

/**
 * Create a new user and persist to file.
 * @param {Object} data - { name, email, password (hashed) }
 * @returns {Object} created user (without password)
 */
function createUser({ name, email, password }) {
  const users = readUsers();

  const newUser = {
    id: uuidv4(),
    name,
    email: email.toLowerCase(),
    password, // already hashed by caller
    preferences: {
      categories: ['general'],
      sources: [],
      language: 'en',
    },
    favorites: [],       // Array of { id, article }
    readHistory: [],     // Array of { id, article, readAt }
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeUsers(users);

  const { password: _pw, ...safeUser } = newUser;
  return safeUser;
}

/**
 * Update a user's fields and persist.
 * @param {string} id
 * @param {Object} updates
 * @returns {Object|null} updated user (without password)
 */
function updateUser(id, updates) {
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;

  users[idx] = { ...users[idx], ...updates, id }; // id cannot be overwritten
  writeUsers(users);

  const { password: _pw, ...safeUser } = users[idx];
  return safeUser;
}

/**
 * Add an article to a user's favorites.
 * @param {string} userId
 * @param {Object} article
 * @returns {Object} updated favorites array
 */
function addFavorite(userId, article) {
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;

  const alreadyFavorited = users[idx].favorites.some((f) => f.id === article.id);
  if (!alreadyFavorited) {
    users[idx].favorites.push({ id: article.id, article, savedAt: new Date().toISOString() });
    writeUsers(users);
  }

  return users[idx].favorites;
}

/**
 * Remove an article from a user's favorites.
 * @param {string} userId
 * @param {string} articleId
 * @returns {Object} updated favorites array
 */
function removeFavorite(userId, articleId) {
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;

  users[idx].favorites = users[idx].favorites.filter((f) => f.id !== articleId);
  writeUsers(users);

  return users[idx].favorites;
}

/**
 * Mark an article as read by a user.
 * @param {string} userId
 * @param {Object} article
 * @returns {Object} updated readHistory array
 */
function markAsRead(userId, article) {
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;

  // Update readAt if already read, else push
  const existingIdx = users[idx].readHistory.findIndex((r) => r.id === article.id);
  if (existingIdx !== -1) {
    users[idx].readHistory[existingIdx].readAt = new Date().toISOString();
  } else {
    users[idx].readHistory.push({
      id: article.id,
      article,
      readAt: new Date().toISOString(),
    });
  }

  writeUsers(users);
  return users[idx].readHistory;
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  updateUser,
  addFavorite,
  removeFavorite,
  markAsRead,
};
