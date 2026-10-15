require('dotenv').config();
const mongoose = require('mongoose');
const { seedDirect } = require('./seed-runner');

const run = async () => {
  if (process.env.NODE_ENV === 'production') {
    console.error('CRITICAL: Seed script cannot be run in production environment!');
    process.exit(1);
  }

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/househunt';
  console.log(`[Seed] Connecting to MongoDB at ${mongoUri}...`);

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log('[Seed] Connected to MongoDB.');
    await seedDirect();
    await mongoose.disconnect();
    console.log('[Seed] Finished successfully.');
  } catch (err) {
    console.warn(`[Seed] Could not connect to external MongoDB: ${err.message}`);
    console.log('[Seed] Note: If running locally without external MongoDB, the server auto-seeds embedded development DB upon startup!');
  }
};

run();
