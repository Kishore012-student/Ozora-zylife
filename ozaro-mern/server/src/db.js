import mongoose from 'mongoose';
import path from 'node:path';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';
import { Product, Content, Admin, Credential } from './models.js';
import { CONTENT_DEFAULTS, productDefaults, credentialDefaults } from './defaults.js';

let memoryServer = null;

/**
 * Connects to MongoDB.
 *  - Production: set MONGODB_URI (e.g. MongoDB Atlas).
 *  - Local dev without Mongo installed: falls back to an embedded MongoDB
 *    (mongodb-memory-server) that persists to ./data so content survives restarts.
 */
export async function connectDB() {
  let uri = process.env.MONGODB_URI;
  if (!uri) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const dbPath = path.resolve(process.env.EMBEDDED_DB_PATH || './data');
    fs.mkdirSync(dbPath, { recursive: true });
    memoryServer = await MongoMemoryServer.create({ instance: { dbPath, storageEngine: 'wiredTiger', port: Number(process.env.EMBEDDED_DB_PORT) || 27017 } });
    uri = memoryServer.getUri('ozora');
    console.log(`[db] embedded MongoDB at ${uri} (data: ${dbPath})`);
  }
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || 'ozora' });
  console.log('[db] connected');
}

export async function seed({ force = false } = {}) {
  if (force) await Promise.all([Product.deleteMany({}), Content.deleteMany({}), Credential.deleteMany({})]);
  for (const [key, data] of Object.entries(CONTENT_DEFAULTS)) {
    const doc = await Content.findOne({ key });
    if (!doc) await Content.create({ key, data });
    else { // add any new default fields without overwriting edits
      const merged = { ...data, ...doc.data };
      if (Object.keys(merged).length !== Object.keys(doc.data || {}).length) { doc.data = merged; doc.markModified('data'); await doc.save(); }
    }
  }
  if ((await Product.countDocuments()) === 0) for (const p of productDefaults) await Product.create(p);
  if ((await Credential.countDocuments()) === 0) await Credential.insertMany(credentialDefaults);
  const email = (process.env.ADMIN_EMAIL || 'admin@ozorazylife.com').toLowerCase();
  if (!(await Admin.exists({ email }))) {
    await Admin.create({ email, name: 'Ozora Admin', passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Ozora@2026', 10) });
    console.log(`[seed] admin created: ${email}`);
  }
}

export async function closeDB() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop({ doCleanup: false });
}
