const app = require('./src/app');
const config = require('./src/config');

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`\n🚀 News Aggregator API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Auth:   http://localhost:${PORT}/api/auth`);
  console.log(`   News:   http://localhost:${PORT}/api/news`);
  console.log(`   Prefs:  http://localhost:${PORT}/api/preferences\n`);
});

module.exports = app;
