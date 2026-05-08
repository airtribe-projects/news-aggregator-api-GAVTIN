const path = require('path');
const fs = require('fs');

const TEST_DATA_DIR = path.join(__dirname, 'test-data-news');
process.env.DATA_DIR = TEST_DATA_DIR;

jest.mock('axios');
const axios = require('axios');
const request = require('supertest');
const app = require('../src/app');

const mockArticles = [
  {
    title: 'React 19 Released',
    description: 'React 19 brings new hooks and compiler improvements.',
    content: 'Full content here...',
    url: 'https://example.com/react-19',
    urlToImage: 'https://example.com/react-19.jpg',
    author: 'Jane Doe',
    source: { id: 'techcrunch', name: 'TechCrunch' },
    publishedAt: '2024-01-15T10:00:00Z',
  },
  {
    title: 'Node.js v22 Ships',
    description: 'Node.js v22 LTS brings performance improvements.',
    content: 'Full content here...',
    url: 'https://example.com/nodejs-22',
    urlToImage: null,
    author: 'John Smith',
    source: { id: 'wired', name: 'Wired' },
    publishedAt: '2024-01-14T08:00:00Z',
  },
];

function cleanTestData() {
  if (fs.existsSync(TEST_DATA_DIR)) {
    fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
  }
}

const testUser = { name: 'News Tester', email: 'news@test.com', password: 'securePass123' };
let authToken = '';
let articleId = '';

beforeAll(async () => {
  cleanTestData();
  axios.get.mockResolvedValue({ data: { articles: mockArticles } });

  await request(app).post('/api/auth/register').send(testUser);
  const loginRes = await request(app).post('/api/auth/login').send({
    email: testUser.email,
    password: testUser.password,
  });
  authToken = loginRes.body.data.token;
});

afterAll(() => {
  jest.clearAllMocks();
  cleanTestData();
});

describe('News API', () => {
  describe('GET /api/news', () => {
    it('should return personalised top headlines', async () => {
      const res = await request(app)
        .get('/api/news')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.articles)).toBe(true);
      expect(res.body.data.articles.length).toBeGreaterThan(0);

      const article = res.body.data.articles[0];
      expect(article).toHaveProperty('id');
      expect(article).toHaveProperty('title');
      expect(article).toHaveProperty('url');
      articleId = article.id;
    });

    it('should return 401 without a token', async () => {
      const res = await request(app).get('/api/news');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/news/search', () => {
    it('should search and return articles for a valid query', async () => {
      const res = await request(app)
        .get('/api/news/search?q=react')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('articles');
      expect(res.body.data).toHaveProperty('query', 'react');
    });

    it('should return 400 when search query "q" is missing', async () => {
      const res = await request(app)
        .get('/api/news/search')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 without a token', async () => {
      const res = await request(app).get('/api/news/search?q=react');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/news/:id/favorite', () => {
    it('should add an article to favorites', async () => {
      const res = await request(app)
        .post(`/api/news/${articleId}/favorite`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          article: {
            title: 'React 19 Released',
            url: 'https://example.com/react-19',
            source: { id: 'techcrunch', name: 'TechCrunch' },
            publishedAt: '2024-01-15T10:00:00Z',
          },
        });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.favorites)).toBe(true);
      expect(res.body.data.favorites.length).toBeGreaterThan(0);
    });

    it('should return 400 when article body is missing', async () => {
      const res = await request(app)
        .post(`/api/news/${articleId}/favorite`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});
      expect(res.statusCode).toBe(400);
    });

    it('should return 401 without a token', async () => {
      const res = await request(app)
        .post(`/api/news/${articleId}/favorite`)
        .send({ article: { url: 'https://example.com/react-19' } });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/news/favorites', () => {
    it("should return the user's saved favorites", async () => {
      const res = await request(app)
        .get('/api/news/favorites')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.favorites)).toBe(true);
    });

    it('should return 401 without a token', async () => {
      const res = await request(app).get('/api/news/favorites');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('DELETE /api/news/:id/favorite', () => {
    it('should remove an article from favorites', async () => {
      const res = await request(app)
        .delete(`/api/news/${articleId}/favorite`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 without a token', async () => {
      const res = await request(app).delete(`/api/news/${articleId}/favorite`);
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/news/:id/read', () => {
    it('should mark an article as read', async () => {
      const res = await request(app)
        .post(`/api/news/${articleId}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          article: {
            title: 'Node.js v22 Ships',
            url: 'https://example.com/nodejs-22',
            source: { id: 'wired', name: 'Wired' },
          },
        });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.readHistory)).toBe(true);
    });

    it('should return 400 when article body is missing', async () => {
      const res = await request(app)
        .post(`/api/news/${articleId}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/news/read', () => {
    it("should return read history for the user", async () => {
      const res = await request(app)
        .get('/api/news/read')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.readHistory)).toBe(true);
      expect(res.body.data.readHistory.length).toBeGreaterThan(0);
    });

    it('should return 401 without a token', async () => {
      const res = await request(app).get('/api/news/read');
      expect(res.statusCode).toBe(401);
    });
  });
});
