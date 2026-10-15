const request = require('supertest');
const app = require('../app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const User = require('../models/User');

describe('Authentication API Tests', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  it('should register a new tenant successfully with active status', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Budi Test',
        email: 'budi.tenant@test.com',
        phone: '08123456789',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: 'tenant',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('budi.tenant@test.com');
    expect(res.body.data.user.role).toBe('tenant');
    expect(res.body.data.user.ownerApprovalStatus).toBe('approved');
    expect(res.body.data.token).toBeDefined();
  });

  it('should register a new owner with pending approval status', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Owner Test',
        email: 'owner.test@test.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: 'owner',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('owner');
    expect(res.body.data.user.ownerApprovalStatus).toBe('pending');
  });

  it('should reject registration if email is already taken', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'User 1',
      email: 'duplicate@test.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      role: 'tenant',
    });

    const res = await request(app).post('/api/auth/register').send({
      name: 'User 2',
      email: 'duplicate@test.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      role: 'tenant',
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should login an existing user with correct credentials', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Login Test',
      email: 'login@test.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      role: 'tenant',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'login@test.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('login@test.com');
    expect(res.body.data.token).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should fail login with incorrect password', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Wrong Pass',
      email: 'wrongpass@test.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      role: 'tenant',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'wrongpass@test.com',
      password: 'WrongPassword999',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should get current user profile when authenticated', async () => {
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Current Profile',
      email: 'current@test.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      role: 'tenant',
    });

    const token = regRes.body.data.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.email).toBe('current@test.com');
  });

  it('should return 401 when accessing protected route without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
