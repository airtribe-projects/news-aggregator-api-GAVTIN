const path = require('path');
const fs = require('fs');

// Set DATA_DIR BEFORE app modules load (jest resetModules gives us a fresh registry per file)
const TEST_DATA_DIR = path.join(__dirname, 'test-data-auth');
process.env.DATA_DIR = TEST_DATA_DIR;

const request = require('supertest');
const app = require('../src/app');

function cleanTestData() {
  if (fs.existsSync(TEST_DATA_DIR)) {
    fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
  }
}

const testUser = {
  name: 'Gaurav Sinha',
  email: 'gaurav@test.com',
  password: 'securePass123',
};

beforeAll(() => cleanTestData());
afterAll(() => cleanTestData());

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user and return 201 with token', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('should return 409 when registering with an existing email', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);
      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for missing name', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'new@test.com', password: 'pass123' });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'not-an-email', password: 'pass123' });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for password shorter than 6 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'test2@test.com', password: '123' });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully and return a JWT', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('should return 401 for wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: 'wrongPassword',
      });
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 for non-existent email', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nobody@test.com',
        password: 'somePass123',
      });
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'somePass123' });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
