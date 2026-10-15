const request = require('supertest');
const app = require('../app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const User = require('../models/User');
const Property = require('../models/Property');
const { generateToken } = require('../utils/jwt');

describe('Admin API Tests', () => {
  let adminToken;
  let tenantToken;
  let pendingOwner;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    const hashedPassword = await User.hashPassword('Password123!');

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@test.com',
      passwordHash: hashedPassword,
      role: 'admin',
      ownerApprovalStatus: 'approved',
    });
    adminToken = generateToken({ id: admin._id, role: 'admin' });

    const tenant = await User.create({
      name: 'Tenant User',
      email: 'tenant@test.com',
      passwordHash: hashedPassword,
      role: 'tenant',
      ownerApprovalStatus: 'approved',
    });
    tenantToken = generateToken({ id: tenant._id, role: 'tenant' });

    pendingOwner = await User.create({
      name: 'Pending Owner Account',
      email: 'pendingowner@test.com',
      passwordHash: hashedPassword,
      role: 'owner',
      ownerApprovalStatus: 'pending',
    });
  });

  it('should allow admin to view dashboard statistics', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalUsers).toBe(3);
    expect(res.body.data.pendingOwnerApprovals).toBe(1);
  });

  it('should block non-admin from accessing admin endpoints', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${tenantToken}`);

    expect(res.status).toBe(403);
  });

  it('should allow admin to approve a pending owner', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${pendingOwner._id}/approval`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'approved' });

    expect(res.status).toBe(200);
    expect(res.body.data.ownerApprovalStatus).toBe('approved');

    const updatedUser = await User.findById(pendingOwner._id);
    expect(updatedUser.ownerApprovalStatus).toBe('approved');
  });

  it('should allow admin to deactivate a user account', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${pendingOwner._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false });

    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(false);
  });
});
