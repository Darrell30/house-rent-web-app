const request = require('supertest');
const app = require('../app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const { generateToken } = require('../utils/jwt');

describe('Booking API Tests', () => {
  let ownerToken;
  let tenant1Token;
  let tenant2Token;
  let ownerId;
  let tenant1Id;
  let tenant2Id;
  let property;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    const hashedPassword = await User.hashPassword('Password123!');

    const owner = await User.create({
      name: 'Owner Budi',
      email: 'budi@test.com',
      passwordHash: hashedPassword,
      role: 'owner',
      ownerApprovalStatus: 'approved',
    });
    ownerId = owner._id;
    ownerToken = generateToken({ id: owner._id, role: 'owner' });

    const tenant1 = await User.create({
      name: 'Tenant 1',
      email: 'tenant1@test.com',
      passwordHash: hashedPassword,
      role: 'tenant',
      ownerApprovalStatus: 'approved',
    });
    tenant1Id = tenant1._id;
    tenant1Token = generateToken({ id: tenant1._id, role: 'tenant' });

    const tenant2 = await User.create({
      name: 'Tenant 2',
      email: 'tenant2@test.com',
      passwordHash: hashedPassword,
      role: 'tenant',
      ownerApprovalStatus: 'approved',
    });
    tenant2Id = tenant2._id;
    tenant2Token = generateToken({ id: tenant2._id, role: 'tenant' });

    property = await Property.create({
      owner: ownerId,
      title: 'Nice House in BSD',
      description: 'Cozy family home.',
      propertyType: 'House',
      address: 'Jl. Boulevard BSD',
      city: 'BSD City',
      province: 'Banten',
      monthlyRent: 12000000,
      bedrooms: 3,
      bathrooms: 2,
      sizeSqm: 140,
      furnishingStatus: 'fully-furnished',
      images: [{ url: 'https://example.com/house.jpg', isPrimary: true }],
      availabilityStatus: 'available',
    });
  });

  it('should allow a tenant to submit a booking request', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${tenant1Token}`)
      .send({
        propertyId: property._id.toString(),
        moveInDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        occupants: 2,
        message: 'Looking to rent for 12 months.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('pending');
    expect(res.body.data.property._id.toString()).toBe(property._id.toString());
  });

  it('should prevent an owner from booking their own property', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        propertyId: property._id.toString(),
        moveInDate: new Date().toISOString(),
        occupants: 1,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('cannot submit a rental booking for your own property');
  });

  it('should prevent duplicate active booking requests from the same tenant', async () => {
    await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${tenant1Token}`)
      .send({
        propertyId: property._id.toString(),
        moveInDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        occupants: 2,
      });

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${tenant1Token}`)
      .send({
        propertyId: property._id.toString(),
        moveInDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        occupants: 2,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('already have an active or pending booking request');
  });

  it('should allow owner to approve a booking and auto-rent property & reject other applicants', async () => {
    // Tenant 1 requests booking
    const book1Res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${tenant1Token}`)
      .send({
        propertyId: property._id.toString(),
        moveInDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        occupants: 2,
      });
    const booking1Id = book1Res.body.data._id;

    // Tenant 2 requests booking
    const book2Res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${tenant2Token}`)
      .send({
        propertyId: property._id.toString(),
        moveInDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        occupants: 1,
      });
    const booking2Id = book2Res.body.data._id;

    // Owner approves Tenant 1
    const approveRes = await request(app)
      .patch(`/api/bookings/${booking1Id}/status`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ status: 'approved' });

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.status).toBe('approved');

    // Verify property availability updated to rented
    const updatedProperty = await Property.findById(property._id);
    expect(updatedProperty.availabilityStatus).toBe('rented');

    // Verify Tenant 2 booking was automatically marked as rejected to prevent double booking
    const booking2 = await Booking.findById(booking2Id);
    expect(booking2.status).toBe('rejected');
  });

  it('should allow tenant to cancel their pending booking', async () => {
    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${tenant1Token}`)
      .send({
        propertyId: property._id.toString(),
        moveInDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        occupants: 1,
      });
    const bookingId = bookRes.body.data._id;

    const cancelRes = await request(app)
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${tenant1Token}`);

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.data.status).toBe('cancelled');
  });
});
