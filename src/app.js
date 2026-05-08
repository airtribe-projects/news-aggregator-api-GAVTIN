const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const preferenceRoutes = require('./routes/preferenceRoutes');
const newsRoutes = require('./routes/newsRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// ── Core middleware ──────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Health check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'News Aggregator API is running.',
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/news', newsRoutes);

// ── 404 & Error handling ─────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
