const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/househunt';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB] Primary connection to ${mongoUri} failed: ${error.message}`);

    // If development environment, provide seamless in-memory fallback
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[MongoDB] Starting embedded MongoDB server for local development...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoMemoryServer = await MongoMemoryServer.create();
        const fallbackUri = mongoMemoryServer.getUri();

        const conn = await mongoose.connect(fallbackUri);
        console.log(`[MongoDB] Connected to embedded development database at ${fallbackUri}`);

        // Automatically seed demo data if the database is newly created and empty
        const User = require('../models/User');
        const userCount = await User.countDocuments();
        if (userCount === 0) {
          console.log('[MongoDB] Empty database detected. Populating with initial seed dataset...');
          const { seedDirect } = require('../scripts/seed-runner');
          await seedDirect();
        }

        return conn;
      } catch (embeddedErr) {
        console.error('[MongoDB] Embedded fallback failed:', embeddedErr.message);
        throw embeddedErr;
      }
    }

    throw error;
  }
};

module.exports = connectDB;
