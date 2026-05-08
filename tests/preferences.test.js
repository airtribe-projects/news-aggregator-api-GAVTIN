const path = require('path');
const fs = require('fs');

const TEST_DATA_DIR = path.join(__dirname, 'test-data-prefs');
process.env.DATA_DIR = TEST_DATA_DIR;

const request = require('supertest');
const app = require('../src/app');

function cleanTestData() {
  if (fs.existsSync(TEST_DATA_DIR)) {
    fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
  }
}

const testUser = { name: 'Pref Tester', email: 'prefs@test.com', password: 'securePass123' };
let authToken = '';

beforeAll(async () => {
  cleanTestData();
  await request(app).post('/api/auth/register').send(testUser);
  const loginRes = await request(app).post('/api/auth/login').send({
    email: testUser.email,
    password: testUser.password,
  });
  authToken = loginRes.body.data.token;
});

afterAll(() => cleanTestData());

describe('Preferences API', () => {
  describe('GET /api/preferences', () => {
    it('should return default preferences for a new user', async () => {
      const res = await request(app)
        .get('/api/preferences')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('preferences');
      expect(res.body.data.preferences).toHaveProperty('categories');
      expect(res.body.data.preferences).toHaveProperty('sources');
      expect(res.body.data.preferences).toHaveProperty('language');
    });

    it('should return 401 without a token', async () => {
      const res = await request(app).get('/api/preferences');
      expect(res.statusCode).toBe(401);
    });

    it('should return 401 with an invalid token', async () => {
      const res = await request(app)
        .get('/api/preferences')
        .set('Authorization', 'Bearer invalid.token.here');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/preferences', () => {
    it('should update categories successfully', async () => {
      const res = await request(app)
        .put('/api/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ categories: ['technology', 'sports'] });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.preferences.categories).toEqual(['technology', 'sports']);
    });

    it('should update language successfully', async () => {
      const res = await request(app)
        .put('/api/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ language: 'fr' });
      expect(res.statusCode).toBe(200);
      expect(res.body.data.preferences.language).toBe('fr');
    });

    it('should update sources successfully', async () => {
      const res = await request(app)
        .put('/api/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ sources: ['bbc-news', 'reuters'] });
      expect(res.statusCode).toBe(200);
      expect(res.body.data.preferences.sources).toEqual(['bbc-news', 'reuters']);
    });

    it('should do a partial update (only language), leaving other prefs intact', async () => {
      await request(app)
        .put('/api/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ categories: ['health'], language: 'en' });

      const res = await request(app)
        .put('/api/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ language: 'de' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.preferences.categories).toEqual(['health']);
      expect(res.body.data.preferences.language).toBe('de');
    });

    it('should return 400 for an invalid category', async () => {
      const res = await request(app)
        .put('/api/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ categories: ['gossip', 'memes'] });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when categories is not an array', async () => {
      const res = await request(app)
        .put('/api/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ categories: 'technology' });
      expect(res.statusCode).toBe(400);
    });

    it('should return 401 without a token', async () => {
      const res = await request(app)
        .put('/api/preferences')
        .send({ categories: ['sports'] });
      expect(res.statusCode).toBe(401);
    });
  });
});
