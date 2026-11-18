import path from 'node:path';
import fs from 'node:fs';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config(); // loads server/.env if present
dotenv.config({ path: path.resolve(__dirname, '../../.env') }); // also loads root .env as fallback

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB, seed } from './db.js';
import routes, { UPLOAD_DIR } from './routes.js';
const app = express();
const PORT = Number(process.env.PORT) || 8000;

// Security: trust reverse proxy (Nginx, Cloudflare, AWS ALB) for accurate client IP
app.set('trust proxy', 1);

// Security: HTTPS enforcement & Security Headers in production
app.use((req, res, next) => {
  // Enforce HTTPS when deployed behind a reverse proxy/load balancer
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  // Standard Security Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

/* Gzip text responses (HTML/JS/CSS/JSON/SVG) — 3–4× smaller transfers after hosting.
   Dependency-free: only compressible types are buffered; images, PDFs and range
   responses pass through untouched. */
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  if (!/\bgzip\b/.test(req.headers['accept-encoding'] || '')) return next();
  const origWrite = res.write.bind(res), origEnd = res.end.bind(res);
  const chunks = [];
  let decided = false, passthrough = false;
  const decide = () => {
    decided = true;
    passthrough = res.statusCode === 206 || !!res.getHeader('Content-Range')
      || !/\b(html|css|javascript|json|svg|xml|text)\b/.test(String(res.getHeader('Content-Type') || ''));
  };
  res.write = (chunk, ...args) => {
    if (!decided) {
      decide();
      if (passthrough) for (const c of chunks.splice(0)) origWrite(c);
    }
    if (passthrough) return origWrite(chunk, ...args);
    if (chunk) chunks.push(Buffer.from(chunk));
    return true;
  };
  res.end = (chunk, ...args) => {
    if (!decided) decide();
    if (chunk) chunks.push(Buffer.from(chunk));
    const body = Buffer.concat(chunks.splice(0));
    if (passthrough || body.length < 1024) return origEnd(body.length ? body : undefined, ...args);
    const gz = zlib.gzipSync(body);
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Content-Length', gz.length);
    res.setHeader('Vary', 'Accept-Encoding');
    return origEnd(gz, ...args);
  };
  next();
});

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api', routes);
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d' }));

// Serve the built React app in production (client/dist)
const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist, {
    index: false,
    setHeaders(res, filePath) {
      // Vite emits content-hashed files under /assets — safe to cache forever.
      // HTML must always revalidate so a new deploy is picked up immediately.
      res.setHeader('Cache-Control', filePath.includes(`${path.sep}assets${path.sep}`)
        ? 'public, max-age=31536000, immutable'
        : 'no-cache');
    },
  }));
  app.use((req, res, next) => (req.method === 'GET' && !req.path.startsWith('/api')
    ? (res.setHeader('Cache-Control', 'no-cache'), res.sendFile(path.join(clientDist, 'index.html')))
    : next()));
}

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.name === 'ValidationError' || err.name === 'CastError' || err.name === 'MulterError' || /Only image/.test(err.message) ? 400 : err.code === 11000 ? 409 : 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Something went wrong' : err.message });
});

await connectDB();
await seed();
app.listen(PORT, '0.0.0.0', () => console.log(`[api] Ozora Zylife API on http://localhost:${PORT}`));
