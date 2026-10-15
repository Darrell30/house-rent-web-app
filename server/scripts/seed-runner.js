const mongoose = require('mongoose');
const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Favorite = require('../models/Favorite');
const Notification = require('../models/Notification');
const Message = require('../models/Message');

const seedDirect = async () => {
  console.log('[Seed] Purging existing database collections...');
  await Promise.all([
    User.deleteMany({}),
    Property.deleteMany({}),
    Booking.deleteMany({}),
    Favorite.deleteMany({}),
    Notification.deleteMany({}),
    Message.deleteMany({}),
  ]);

  console.log('[Seed] Creating demo users...');
  const commonPassword = 'Password123!';
  const hashedPassword = await User.hashPassword(commonPassword);

  // 1. Administrator
  const admin = await User.create({
    name: 'Suryono Wibowo (Administrator)',
    email: 'admin@househunt.id',
    phone: '+628111222333',
    passwordHash: hashedPassword,
    role: 'admin',
    ownerApprovalStatus: 'approved',
    isActive: true,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  });

  // 2. Approved Owners
  const ownerBudi = await User.create({
    name: 'Budi Santoso',
    email: 'budi.santoso@househunt.id',
    phone: '+6281234567890',
    passwordHash: hashedPassword,
    role: 'owner',
    ownerApprovalStatus: 'approved',
    isActive: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  });

  const ownerSiti = await User.create({
    name: 'Siti Rahmawati',
    email: 'siti.rahma@househunt.id',
    phone: '+6281398765432',
    passwordHash: hashedPassword,
    role: 'owner',
    ownerApprovalStatus: 'approved',
    isActive: true,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
  });

  // 3. Pending Owner
  const ownerDewi = await User.create({
    name: 'Dewi Lestari',
    email: 'dewi.lestari@househunt.id',
    phone: '+6281511223344',
    passwordHash: hashedPassword,
    role: 'owner',
    ownerApprovalStatus: 'pending',
    isActive: true,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
  });

  // 4. Tenants
  const tenantAndi = await User.create({
    name: 'Andi Wijaya',
    email: 'andi.wijaya@househunt.id',
    phone: '+6281801234567',
    passwordHash: hashedPassword,
    role: 'tenant',
    ownerApprovalStatus: 'approved',
    isActive: true,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
  });

  const tenantMaya = await User.create({
    name: 'Maya Putri',
    email: 'maya.putri@househunt.id',
    phone: '+6281987654321',
    passwordHash: hashedPassword,
    role: 'tenant',
    ownerApprovalStatus: 'approved',
    isActive: true,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
  });

  console.log('[Seed] Creating 12 Indonesian rental properties...');

  const sampleProperties = [
    {
      owner: ownerBudi._id,
      title: 'Modern Minimalist Villa with Private Pool in Dago',
      description: 'Stunning contemporary villa nestled in the scenic hills of Dago, Bandung. Enjoy cool mountain breezes, a secluded infinity pool, designer furnishings, and panoramic city views. Perfect for families or professionals seeking tranquility with high-speed fiber internet.',
      propertyType: 'Villa',
      address: 'Jl. Dago Pakar Permai No. 18',
      city: 'Bandung',
      province: 'Jawa Barat',
      postalCode: '40198',
      monthlyRent: 25000000,
      currency: 'IDR',
      bedrooms: 4,
      bathrooms: 3,
      sizeSqm: 280,
      furnishingStatus: 'fully-furnished',
      amenities: ['Private Pool', 'High-Speed WiFi', 'AC', '24/7 Security', 'Water Heater', 'Covered Garage', 'Garden', 'Smart TV'],
      images: [
        { url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80', caption: 'Exterior and Pool', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', caption: 'Living Area', isPrimary: false },
        { url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80', caption: 'Modern Kitchen', isPrimary: false }
      ],
      availabilityStatus: 'available',
      isArchived: false,
    },
    {
      owner: ownerBudi._id,
      title: 'Luxury 2BR Apartment with SCBD Skyline View',
      description: 'Executive 2-bedroom corner suite located in prestigious District 8 Senopati/SCBD. Directly connected to high-end shopping, gourmet dining, and business headquarters. Features marble floors, bathtub, and balcony overlooking Sudirman.',
      propertyType: 'Apartment',
      address: 'District 8 Senopati, SCBD Lot 28',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      postalCode: '12190',
      monthlyRent: 28000000,
      currency: 'IDR',
      bedrooms: 2,
      bathrooms: 2,
      sizeSqm: 105,
      furnishingStatus: 'fully-furnished',
      amenities: ['Gym', 'Swimming Pool', 'Concierge 24h', 'AC', 'High-Speed WiFi', 'Balcony', 'Bathtub', 'Card Access'],
      images: [
        { url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80', caption: 'Living Room Sky View', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80', caption: 'Master Bedroom', isPrimary: false },
        { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', caption: 'Dining Area', isPrimary: false }
      ],
      availabilityStatus: 'available',
      isArchived: false,
    },
    {
      owner: ownerSiti._id,
      title: 'Scandinavian Family Home in NavaPark BSD City',
      description: 'Beautiful 2-story residence in the exclusive NavaPark enclave, BSD City. Surrounded by lush botanical parks and a serene country club. Spacious open-plan living, private backyard, solar water heater, and double carport.',
      propertyType: 'House',
      address: 'Cluster Lancewood, NavaPark Boulevard',
      city: 'BSD City',
      province: 'Banten',
      postalCode: '15345',
      monthlyRent: 18000000,
      currency: 'IDR',
      bedrooms: 3,
      bathrooms: 3,
      sizeSqm: 185,
      furnishingStatus: 'semi-furnished',
      amenities: ['Carport 2 Cars', 'Clubhouse Access', '24/7 Security Gate', 'Garden', 'AC', 'Solar Water Heater', 'Jogging Track'],
      images: [
        { url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80', caption: 'Front Facade', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', caption: 'Patio & Backyard', isPrimary: false }
      ],
      availabilityStatus: 'available',
      isArchived: false,
    },
    {
      owner: ownerSiti._id,
      title: 'Cozy Studio Apartment Near Universitas Indonesia',
      description: 'Ideal compact studio unit for students or young professionals. Fully fitted with study desk, high-speed WiFi, mini fridge, and built-in wardrobe. 5 minutes walk to KRL Pondok Cina train station and Margo City Mall.',
      propertyType: 'Studio',
      address: 'Apartemen Evenciio, Jl. Margonda Raya',
      city: 'Tangerang',
      province: 'Jawa Barat',
      postalCode: '16424',
      monthlyRent: 3800000,
      currency: 'IDR',
      bedrooms: 1,
      bathrooms: 1,
      sizeSqm: 26,
      furnishingStatus: 'fully-furnished',
      amenities: ['High-Speed WiFi', 'AC', 'Study Desk', 'Swimming Pool', 'Gym', '24/7 Security', 'Elevator Access'],
      images: [
        { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', caption: 'Studio Interior', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1200&q=80', caption: 'Kitchenette', isPrimary: false }
      ],
      availabilityStatus: 'available',
      isArchived: false,
    },
    {
      owner: ownerBudi._id,
      title: 'Exclusive Executive Kost in Kuningan Jakarta Selatan',
      description: 'Premium boutique kost room in prime Golden Triangle Kuningan. Walking distance to Mega Kuningan embassies, Lotte Shopping Avenue, and MRT. Includes daily room cleaning, high-speed WiFi, and laundry services.',
      propertyType: 'Boarding House / Kost',
      address: 'Jl. Karet Pedurenan No. 42',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      postalCode: '12940',
      monthlyRent: 4500000,
      currency: 'IDR',
      bedrooms: 1,
      bathrooms: 1,
      sizeSqm: 22,
      furnishingStatus: 'fully-furnished',
      amenities: ['Private Bathroom', 'Water Heater', 'AC', 'WiFi', 'Daily Cleaning', 'Free Laundry', 'Shared Kitchen', 'CCTV 24h'],
      images: [
        { url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80', caption: 'Kost Bedroom', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80', caption: 'Private Bathroom', isPrimary: false }
      ],
      availabilityStatus: 'available',
      isArchived: false,
    },
    {
      owner: ownerSiti._id,
      title: 'Charming Townhouse in Alam Sutera Downtown',
      description: 'Contemporary 3-story townhouse close to Mall @ Alam Sutera, IKEA, and BINUS University. Features smart home locks, high ceiling architecture, private rooftop terrace, and serene neighborhood park.',
      propertyType: 'Townhouse',
      address: 'Sutera Narada, Alam Sutera Boulevard',
      city: 'Alam Sutera',
      province: 'Banten',
      postalCode: '15325',
      monthlyRent: 14500000,
      currency: 'IDR',
      bedrooms: 3,
      bathrooms: 2,
      sizeSqm: 160,
      furnishingStatus: 'semi-furnished',
      amenities: ['Smart Door Lock', 'Rooftop Terrace', 'AC in All Rooms', 'Kitchen Set', 'Carport', 'Security 24h'],
      images: [
        { url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80', caption: 'Townhouse Living Room', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80', caption: 'Facade & Street', isPrimary: false }
      ],
      availabilityStatus: 'available',
      isArchived: false,
    },
    {
      owner: ownerBudi._id,
      title: 'Traditional Javanese Joglo House in Sleman',
      description: 'Authentic teakwood Joglo blended with modern luxury comforts in Sleman, Yogyakarta. Features tranquil fish ponds, tropical garden, spacious veranda, and peaceful paddy field surroundings.',
      propertyType: 'House',
      address: 'Jl. Kaliurang Km 9, Sleman',
      city: 'Yogyakarta',
      province: 'DI Yogyakarta',
      postalCode: '55581',
      monthlyRent: 9500000,
      currency: 'IDR',
      bedrooms: 3,
      bathrooms: 2,
      sizeSqm: 210,
      furnishingStatus: 'fully-furnished',
      amenities: ['Tropical Garden', 'Teakwood Veranda', 'AC', 'Water Heater', 'Covered Parking', 'High-Speed WiFi'],
      images: [
        { url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80', caption: 'Joglo Veranda', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef5?auto=format&fit=crop&w=1200&q=80', caption: 'Bedroom Suite', isPrimary: false }
      ],
      availabilityStatus: 'available',
      isArchived: false,
    },
    {
      owner: ownerSiti._id,
      title: 'High-Floor 3BR Suite at Pakuwon Mall Surabaya',
      description: 'Superb 3-bedroom apartment perched directly above Pakuwon Mall Barat. Direct elevator access into shopping, cinema, and dining. Floor-to-ceiling windows with sunset views over Western Surabaya.',
      propertyType: 'Apartment',
      address: 'La Riz Mansion, Pakuwon Mall West Surabaya',
      city: 'Surabaya',
      province: 'Jawa Timur',
      postalCode: '60216',
      monthlyRent: 16000000,
      currency: 'IDR',
      bedrooms: 3,
      bathrooms: 2,
      sizeSqm: 112,
      furnishingStatus: 'fully-furnished',
      amenities: ['Direct Mall Access', 'Infinity Pool', 'Gym & Sauna', 'AC', 'Balcony', 'Washing Machine', '24/7 Security'],
      images: [
        { url: 'https://images.unsplash.com/photo-1502005229762-ee152d8778f5?auto=format&fit=crop&w=1200&q=80', caption: 'High Rise Living Room', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=1200&q=80', caption: 'Kitchen and Bar', isPrimary: false }
      ],
      availabilityStatus: 'available',
      isArchived: false,
    },
    {
      owner: ownerBudi._id,
      title: 'Colonial Heritage House in Menteng Central Jakarta',
      description: 'Prestigious classical residence on an expansive lot in leafy Menteng. Lofty ceilings, stately foyer, maid quarters, manicured courtyard, and private swimming pool. High security diplomatic neighborhood.',
      propertyType: 'House',
      address: 'Jl. Teuku Umar No. 14, Menteng',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      postalCode: '10350',
      monthlyRent: 48000000,
      currency: 'IDR',
      bedrooms: 5,
      bathrooms: 4,
      sizeSqm: 450,
      furnishingStatus: 'semi-furnished',
      amenities: ['Private Pool', 'Courtyard Garden', 'Security Guard Post', 'Garage 4 Cars', 'Maid Quarters', 'Gourmet Kitchen'],
      images: [
        { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', caption: 'Mansion Facade', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80', caption: 'Grand Living Hall', isPrimary: false }
      ],
      availabilityStatus: 'rented',
      isArchived: false,
    },
    {
      owner: ownerSiti._id,
      title: 'Minimalist 1BR Studio in Gading Serpong',
      description: 'Bright and airy modern studio in Scientia Square, Gading Serpong. Adjacent to green parks, digital hubs, and foodie centers. Ideal for remote workers and tech creatives.',
      propertyType: 'Studio',
      address: 'Scientia Residences Tower B, Gading Serpong',
      city: 'Tangerang',
      province: 'Banten',
      postalCode: '15810',
      monthlyRent: 3500000,
      currency: 'IDR',
      bedrooms: 1,
      bathrooms: 1,
      sizeSqm: 32,
      furnishingStatus: 'fully-furnished',
      amenities: ['AC', 'High-Speed WiFi', 'Workstation', 'Swimming Pool', 'Convenience Store On-Site', '24/7 Security'],
      images: [
        { url: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1200&q=80', caption: 'Modern Studio View', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80', caption: 'Bedroom Nook', isPrimary: false }
      ],
      availabilityStatus: 'available',
      isArchived: false,
    },
    {
      owner: ownerBudi._id,
      title: 'Spacious 2BR Townhouse near Dago Dream Park',
      description: 'Chic mountain retreat townhouse featuring wooden finishes, a wood-burning fireplace, balcony overlooking pine trees, and 2 designated parking slots. Peaceful getaway 15 minutes from Bandung city center.',
      propertyType: 'Townhouse',
      address: 'Pramestha Resort City, Dago Giri',
      city: 'Bandung',
      province: 'Jawa Barat',
      postalCode: '40391',
      monthlyRent: 11000000,
      currency: 'IDR',
      bedrooms: 2,
      bathrooms: 2,
      sizeSqm: 125,
      furnishingStatus: 'fully-furnished',
      amenities: ['Pine Valley View', 'Balcony', 'Fireplace', 'Water Heater', 'Covered Parking', 'High-Speed WiFi', '24/7 Security'],
      images: [
        { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', caption: 'Living Room with View', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80', caption: 'Modern Kitchen', isPrimary: false }
      ],
      availabilityStatus: 'available',
      isArchived: false,
    },
    {
      owner: ownerSiti._id,
      title: 'Modern Compact Kost Room Near UGM Campus',
      description: 'Comfortable private ensuite room tailored for students and visiting lecturers in Pogung, near Universitas Gadjah Mada (UGM). Fast internet, air conditioning, and quiet academic environment.',
      propertyType: 'Boarding House / Kost',
      address: 'Jl. Pogung Baru No. 12, Mlati',
      city: 'Yogyakarta',
      province: 'DI Yogyakarta',
      postalCode: '55284',
      monthlyRent: 2200000,
      currency: 'IDR',
      bedrooms: 1,
      bathrooms: 1,
      sizeSqm: 18,
      furnishingStatus: 'fully-furnished',
      amenities: ['Ensuite Bathroom', 'AC', 'Fiber Internet', 'Desk & Chair', 'Motorcycle Parking', 'Shared Pantry', 'CCTV'],
      images: [
        { url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80', caption: 'Kost Bedroom & Desk', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80', caption: 'Ensuite Bathroom', isPrimary: false }
      ],
      availabilityStatus: 'available',
      isArchived: false,
    },
  ];

  const createdProperties = await Property.create(sampleProperties);
  console.log(`[Seed] Created ${createdProperties.length} property listings.`);

  console.log('[Seed] Creating demo rental bookings and favorites...');
  const booking1 = await Booking.create({
    property: createdProperties[0]._id,
    tenant: tenantAndi._id,
    owner: ownerBudi._id,
    moveInDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    moveOutDate: new Date(Date.now() + 379 * 24 * 60 * 60 * 1000),
    occupants: 3,
    message: 'Halo Pak Budi, saya dan keluarga tertarik menyewa villa ini untuk 1 tahun ke depan. Apakah bisa survei akhir pekan ini?',
    status: 'pending',
  });

  const booking2 = await Booking.create({
    property: createdProperties[8]._id,
    tenant: tenantMaya._id,
    owner: ownerBudi._id,
    moveInDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    moveOutDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
    occupants: 4,
    message: 'Permisi Pak Budi, kami dari keluarga diplomat ingin menyewa rumah Menteng ini. Terima kasih.',
    status: 'approved',
  });

  const booking3 = await Booking.create({
    property: createdProperties[2]._id,
    tenant: tenantAndi._id,
    owner: ownerSiti._id,
    moveInDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    occupants: 2,
    message: 'Halo Bu Siti, apakah harga masih bisa dinegosiasikan untuk kontrak 6 bulan?',
    status: 'rejected',
  });

  await Favorite.create([
    { user: tenantAndi._id, property: createdProperties[0]._id },
    { user: tenantAndi._id, property: createdProperties[1]._id },
    { user: tenantMaya._id, property: createdProperties[2]._id },
    { user: tenantMaya._id, property: createdProperties[6]._id },
  ]);

  await Notification.create([
    {
      recipient: ownerBudi._id,
      type: 'booking_created',
      title: 'New Booking Request',
      message: 'Andi Wijaya requested to rent "Modern Minimalist Villa with Private Pool in Dago".',
      relatedEntityId: booking1._id,
      isRead: false,
    },
    {
      recipient: tenantMaya._id,
      type: 'booking_approved',
      title: 'Booking Approved!',
      message: 'Your rental request for "Colonial Heritage House in Menteng" has been approved by Budi Santoso.',
      relatedEntityId: booking2._id,
      isRead: true,
    },
    {
      recipient: tenantAndi._id,
      type: 'booking_rejected',
      title: 'Booking Declined',
      message: 'Your booking request for "Scandinavian Family Home in NavaPark BSD City" was declined.',
      relatedEntityId: booking3._id,
      isRead: false,
    },
    {
      recipient: admin._id,
      type: 'system',
      title: 'Pending Owner Review',
      message: 'Dewi Lestari has registered as an owner and is awaiting approval.',
      relatedEntityId: ownerDewi._id,
      isRead: false,
    },
  ]);

  await Message.create([
    {
      property: createdProperties[0]._id,
      sender: tenantAndi._id,
      recipient: ownerBudi._id,
      content: 'Selamat siang Pak Budi, apakah unit villa di Dago masih tersedia untuk disewa?',
      isRead: true,
    },
    {
      property: createdProperties[0]._id,
      sender: ownerBudi._id,
      recipient: tenantAndi._id,
      content: 'Selamat siang Mas Andi. Ya betul, unit masih tersedia dan siap huni. Silakan ajukan request sewa lewat aplikasi jika berminat.',
      isRead: true,
    },
  ]);

  console.log('[Seed] Demo database seeding complete.');
};

module.exports = { seedDirect };
