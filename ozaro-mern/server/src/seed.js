import 'dotenv/config';
import { connectDB, seed, closeDB } from './db.js';

await connectDB();
await seed({ force: process.argv.includes('--force') });
console.log('[seed] done');
await closeDB();
process.exit(0);
