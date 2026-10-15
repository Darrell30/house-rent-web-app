const request = require('supertest');
const app = require('../app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const User = require('../models/User');
const Property = require('../models/Property');
const { generateToken } = require('../utils/jwt');

describe('Property API Tests', () => {
  let approvedOwnerToken;
  let pendingOwnerToken;
  let tenantToken;
  let approvedOwnerId;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    const hashedPassword = await User.hashPassword('Password123!');

    const approvedOwner = await User.create({
      name: 'Approved Owner',
      email: 'approved.owner@test.com',
      passwordHash: hashedPassword,
      role: 'owner',
      ownerApprovalStatus: 'approved',
    });
    approvedOwnerId = approvedOwner._id;
    approvedOwnerToken = generateToken({ id: approvedOwner._id, role: 'owner' });

    const pendingOwner = await User.create({
      name: 'Pending Owner',
      email: 'pending.owner@test.com',
      passwordHash: hashedPassword,
      role: 'owner',
      ownerApprovalStatus: 'pending',
    });
    pendingOwnerToken = generateToken({ id: pendingOwner._id, role: 'owner' });

    const tenant = await User.create({
      name: 'Test Tenant',
      email: 'tenant@test.com',
      passwordHash: hashedPassword,
      role: 'tenant',
      ownerApprovalStatus: 'approved',
    });
    tenantToken = generateToken({ id: tenant._id, role: 'tenant' });
  });

  it('should allow an approved owner to create a property listing', async () => {
    const res = await request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${approvedOwnerToken}`)
      .send({
        title: 'Modern 2BR Apartment in Jakarta',
        description: 'Spacious apartment near MRT with swimming pool and gym.',
        propertyType: 'Apartment',
        address: 'Jl. Sudirman No. 10',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        monthlyRent: 15000000,
        currency: 'IDR',
        bedrooms: 2,
        bathrooms: 2,
        sizeSqm: 80,
        furnishingStatus: 'fully-furnished',
        amenities: ['AC', 'WiFi', 'Gym'],
        images: [{ url: 'https://example.com/photo.jpg', caption: 'Living Room', isPrimary: true }],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Modern 2BR Apartment in Jakarta');
    expect(res.body.data.owner.toString()).toBe(approvedOwnerId.toString());
  });

  it('should prevent a pending owner from creating a property listing', async () => {
    const res = await request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${pendingOwnerToken}`)
      .send({
        title: 'Pending Owner Listing',
        description: 'Listing description should fail.',
        propertyType: 'House',
        address: 'Jl. BSD No. 5',
        city: 'BSD City',
        province: 'Banten',
        monthlyRent: 10000000,
        bedrooms: 3,
        bathrooms: 2,
        sizeSqm: 120,
        furnishingStatus: 'unfurnished',
        images: [{ url: 'https://example.com/img.jpg', isPrimary: true }],
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('pending administrator approval');
  });

  it('should prevent a tenant from creating a property listing', async () => {
    const res = await request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({
        title: 'Tenant Listing Attempt',
        description: 'Tenant trying to list.',
        propertyType: 'House',
        address: 'Jl. Test No. 1',
        city: 'Bandung',
        province: 'Jawa Barat',
        monthlyRent: 5000000,
        bedrooms: 1,
        bathrooms: 1,
        sizeSqm: 50,
        furnishingStatus: 'semi-furnished',
        images: [{ url: 'https://example.com/img.jpg', isPrimary: true }],
      });

    expect(res.status).toBe(403);
  });

  it('should retrieve properties with filter and search criteria', async () => {
    await Property.create([
      {
        owner: approvedOwnerId,
        title: 'Luxury Villa in Bandung',
        description: 'Villa with pool in the mountains.',
        propertyType: 'Villa',
        address: 'Jl. Dago No. 1',
        city: 'Bandung',
        province: 'Jawa Barat',
        monthlyRent: 20000000,
        bedrooms: 4,
        bathrooms: 3,
        sizeSqm: 250,
        furnishingStatus: 'fully-furnished',
        images: [{ url: 'https://example.com/villa.jpg', isPrimary: true }],
        availabilityStatus: 'available',
      },
      {
        owner: approvedOwnerId,
        title: 'Studio Apartment in Jakarta',
        description: 'Compact studio near business district.',
        propertyType: 'Studio',
        address: 'Jl. Gatot Subroto No. 5',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        monthlyRent: 4000000,
        bedrooms: 1,
        bathrooms: 1,
        sizeSqm: 25,
        furnishingStatus: 'fully-furnished',
        images: [{ url: 'https://example.com/studio.jpg', isPrimary: true }],
        availabilityStatus: 'available',
      },
    ]);

    // Search by city
    const resBandung = await request(app).get('/api/properties?city=Bandung');
    expect(resBandung.status).toBe(200);
    expect(resBandung.body.data.length).toBe(1);
    expect(resBandung.body.data[0].city).toBe('Bandung');

    // Filter by max rent
    const resCheap = await request(app).get('/api/properties?maxRent=5000000');
    expect(resCheap.status).toBe(200);
    expect(resCheap.body.data.length).toBe(1);
    expect(resCheap.body.data[0].propertyType).toBe('Studio');
  });

  it('should allow owner to archive/delete their property', async () => {
    const prop = await Property.create({
      owner: approvedOwnerId,
      title: 'Listing to Delete',
      description: 'Will be deleted/archived.',
      propertyType: 'House',
      address: 'Jl. Sunset No. 9',
      city: 'Yogyakarta',
      province: 'DI Yogyakarta',
      monthlyRent: 7000000,
      bedrooms: 2,
      bathrooms: 1,
      sizeSqm: 90,
      furnishingStatus: 'semi-furnished',
      images: [{ url: 'https://example.com/house.jpg', isPrimary: true }],
    });

    const res = await request(app)
      .delete(`/api/properties/${prop._id}`)
      .set('Authorization', `Bearer ${approvedOwnerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const updated = await Property.findById(prop._id);
    expect(updated.isArchived).toBe(true);
  });
});
