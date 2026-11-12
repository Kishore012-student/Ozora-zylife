import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { Product, Content, Admin, Credential, Enquiry, CATEGORIES, FORMS, ENQUIRY_TYPES } from './models.js';
import { CONTENT_DEFAULTS } from './defaults.js';

const router = Router();
const JWT_SECRET = () => process.env.JWT_SECRET || 'change-this-secret-in-production';
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const pickFrom = fields => body => Object.fromEntries(fields.filter(k => body?.[k] !== undefined).map(k => [k, body[k]]));
const escapeRe = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* ---------- auth ---------- */
const loginAttempts = new Map(); // tracks failed attempts per IP: { count, lockUntil }

export function requireAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try { req.admin = jwt.verify(token, JWT_SECRET()); next(); }
  catch { res.status(401).json({ error: 'Session expired, please log in again' }); }
}
const isAdmin = req => { try { const h = req.headers.authorization || ''; return !!jwt.verify(h.slice(7), JWT_SECRET()); } catch { return false; } };

router.post('/auth/login', wrap(async (req, res) => {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const now = Date.now();
  const attempt = loginAttempts.get(ip) || { count: 0, lockUntil: 0 };

  // Check if locked
  if (attempt.lockUntil > now) {
    const waitMins = Math.ceil((attempt.lockUntil - now) / 60000);
    return res.status(429).json({ error: `Too many failed login attempts. Please try again after ${waitMins} minute${waitMins > 1 ? 's' : ''}.` });
  }

  const { email = '', password = '' } = req.body || {};
  const admin = await Admin.findOne({ email: String(email).toLowerCase().trim() });
  const isMatch = admin && (await bcrypt.compare(String(password), admin.passwordHash));

  if (!admin || !isMatch) {
    const newCount = (attempt.count || 0) + 1;
    if (newCount >= 5) {
      // Lock for 15 minutes
      loginAttempts.set(ip, { count: 0, lockUntil: now + 15 * 60 * 1000 });
      return res.status(429).json({ error: 'Too many failed login attempts. Account temporarily locked for 15 minutes.' });
    } else {
      loginAttempts.set(ip, { count: newCount, lockUntil: 0 });
      return res.status(401).json({ error: `Invalid email or password. (${5 - newCount} attempt${5 - newCount > 1 ? 's' : ''} remaining)` });
    }
  }

  // Success: reset attempts
  loginAttempts.delete(ip);
  const token = jwt.sign({ id: admin._id, email: admin.email, name: admin.name }, JWT_SECRET(), { expiresIn: '12h' });
  res.json({ token, admin: { email: admin.email, name: admin.name } });
}));
router.get('/auth/me', requireAuth, (req, res) => res.json({ admin: req.admin }));
router.post('/auth/password', requireAuth, wrap(async (req, res) => {
  const { current, next: nextPw } = req.body || {};
  const admin = await Admin.findById(req.admin.id);
  if (!admin || !(await bcrypt.compare(String(current || ''), admin.passwordHash))) return res.status(400).json({ error: 'Current password is incorrect' });
  if (!nextPw || String(nextPw).length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' });
  admin.passwordHash = await bcrypt.hash(String(nextPw), 10); await admin.save();
  res.json({ ok: true });
}));

/* ---------- meta ---------- */
router.get('/meta', (req, res) => res.json({ categories: CATEGORIES, forms: FORMS, enquiryTypes: ENQUIRY_TYPES }));

/* ---------- products ---------- */
const pickProduct = pickFrom(['name', 'category', 'shortDescription', 'description', 'composition', 'dosageForm', 'packSize', 'storage', 'prescription', 'images', 'featured', 'status', 'order']);

router.get('/products', wrap(async (req, res) => {
  const { category, featured, q } = req.query;
  const filter = {};
  if (!(req.query.all === '1' && isAdmin(req))) filter.status = 'published';
  if (category && CATEGORIES.includes(category)) filter.category = category;
  if (featured === '1') filter.featured = true;
  if (q) filter.name = { $regex: escapeRe(q), $options: 'i' };
  res.json(await Product.find(filter).sort({ order: 1, createdAt: -1 }).lean());
}));
router.get('/products/:slug', wrap(async (req, res) => {
  const p = await Product.findOne({ slug: req.params.slug }).lean();
  if (!p || (p.status !== 'published' && !isAdmin(req))) return res.status(404).json({ error: 'Product not found' });
  const related = await Product.find({ category: p.category, _id: { $ne: p._id }, status: 'published' }).sort({ order: 1 }).limit(3).lean();
  res.json({ ...p, related });
}));
router.get('/admin/products/:id', requireAuth, wrap(async (req, res) => {
  const p = await Product.findById(req.params.id).lean();
  if (!p) return res.status(404).json({ error: 'Product not found' });
  res.json(p);
}));
router.post('/products', requireAuth, wrap(async (req, res) => res.status(201).json(await Product.create(pickProduct(req.body)))));
router.put('/products/:id', requireAuth, wrap(async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  Object.assign(p, pickProduct(req.body)); await p.save(); res.json(p);
}));
router.delete('/products/:id', requireAuth, wrap(async (req, res) => {
  const r = await Product.findByIdAndDelete(req.params.id);
  if (!r) return res.status(404).json({ error: 'Product not found' });
  res.json({ ok: true });
}));

/* ---------- certifications & licences ---------- */
const pickCred = pickFrom(['kind', 'title', 'number', 'issuedBy', 'validUntil', 'file', 'status', 'order']);
router.get('/credentials', wrap(async (req, res) => {
  const filter = req.query.all === '1' && isAdmin(req) ? {} : { status: 'published' };
  res.json(await Credential.find(filter).sort({ kind: 1, order: 1, createdAt: 1 }).lean());
}));
router.post('/credentials', requireAuth, wrap(async (req, res) => res.status(201).json(await Credential.create(pickCred(req.body)))));
router.put('/credentials/:id', requireAuth, wrap(async (req, res) => {
  const c = await Credential.findById(req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  Object.assign(c, pickCred(req.body)); await c.save(); res.json(c);
}));
router.delete('/credentials/:id', requireAuth, wrap(async (req, res) => {
  if (!(await Credential.findByIdAndDelete(req.params.id))) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
}));

/* ---------- enquiries ---------- */
const hits = new Map(); // simple per-IP rate limit for the public form
router.post('/enquiries', wrap(async (req, res) => {
  const ip = req.ip || 'x', now = Date.now();
  const list = (hits.get(ip) || []).filter(t => now - t < 10 * 60 * 1000);
  if (list.length >= 8) return res.status(429).json({ error: 'Too many enquiries. Please try again later or call us directly.' });
  hits.set(ip, [...list, now]);
  const body = pickFrom(['name', 'phone', 'email', 'business', 'type', 'product', 'message'])(req.body);
  if (req.body?.website) return res.status(201).json({ ok: true }); // honeypot
  if (body.phone) {
    const rawDigits = body.phone.replace(/[^\d]/g, '');
    const mobileDigits = rawDigits.startsWith('91') ? rawDigits.slice(2) : rawDigits;
    if (mobileDigits.length !== 10) return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
    body.phone = `+91 ${mobileDigits}`;
  }
  const e = await Enquiry.create(body);
  res.status(201).json({ ok: true, id: e._id });
}));
router.get('/enquiries', requireAuth, wrap(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  res.json(await Enquiry.find(filter).sort({ createdAt: -1 }).limit(500).lean());
}));
router.put('/enquiries/:id', requireAuth, wrap(async (req, res) => {
  const e = await Enquiry.findById(req.params.id);
  if (!e) return res.status(404).json({ error: 'Not found' });
  Object.assign(e, pickFrom(['status', 'notes'])(req.body)); await e.save(); res.json(e);
}));
router.delete('/enquiries/:id', requireAuth, wrap(async (req, res) => {
  if (!(await Enquiry.findByIdAndDelete(req.params.id))) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
}));

/* ---------- page content ---------- */
const CONTENT_KEYS = Object.keys(CONTENT_DEFAULTS);
router.get('/content', wrap(async (req, res) => { // all pages in one call (used on boot)
  const docs = await Content.find({ key: { $in: CONTENT_KEYS } }).lean();
  res.json(Object.fromEntries(CONTENT_KEYS.map(k => [k, { ...CONTENT_DEFAULTS[k], ...(docs.find(d => d.key === k)?.data || {}) }])));
}));
router.get('/content/:key', wrap(async (req, res) => {
  if (!CONTENT_KEYS.includes(req.params.key)) return res.status(404).json({ error: 'Unknown page' });
  const doc = await Content.findOne({ key: req.params.key }).lean();
  res.json({ ...CONTENT_DEFAULTS[req.params.key], ...(doc?.data || {}), _updatedAt: doc?.updatedAt });
}));
router.put('/content/:key', requireAuth, wrap(async (req, res) => {
  if (!CONTENT_KEYS.includes(req.params.key)) return res.status(404).json({ error: 'Unknown page' });
  const { _updatedAt, ...data } = req.body || {};
  const doc = await Content.findOneAndUpdate({ key: req.params.key }, { data }, { new: true, upsert: true });
  res.json({ ...doc.data, _updatedAt: doc.updatedAt });
}));
router.post('/content/:key/reset', requireAuth, wrap(async (req, res) => {
  if (!CONTENT_KEYS.includes(req.params.key)) return res.status(404).json({ error: 'Unknown page' });
  const doc = await Content.findOneAndUpdate({ key: req.params.key }, { data: CONTENT_DEFAULTS[req.params.key] }, { new: true, upsert: true });
  res.json({ ...doc.data, _updatedAt: doc.updatedAt });
}));

/* ---------- dashboard stats ---------- */
router.get('/stats', requireAuth, wrap(async (req, res) => {
  const [total, published, featured, byCat, newEnq, totalEnq, creds, recentEnq] = await Promise.all([
    Product.countDocuments(), Product.countDocuments({ status: 'published' }), Product.countDocuments({ featured: true }),
    Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    Enquiry.countDocuments({ status: 'new' }), Enquiry.countDocuments(), Credential.countDocuments(),
    Enquiry.find().sort({ createdAt: -1 }).limit(5).select('name type product status createdAt').lean(),
  ]);
  res.json({ total, published, drafts: total - published, featured, byCategory: byCat, newEnquiries: newEnq, enquiries: totalEnq, credentials: creds, recentEnquiries: recentEnq });
}));

/* ---------- file upload (images compressed to webp + PDF for certificates) ---------- */
export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || './uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // allow up to 15MB input for compression
  fileFilter: (req, file, cb) => cb(/^(image\/(png|jpe?g|webp|gif|avif)|application\/pdf)$/.test(file.mimetype) ? null : new Error('Only image or PDF files are allowed'), true),
});
router.post('/upload', requireAuth, upload.single('file'), wrap(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file received' });

  const isPdf = req.file.mimetype === 'application/pdf';
  const baseName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  if (isPdf) {
    const filename = `${baseName}.pdf`;
    const targetPath = path.join(UPLOAD_DIR, filename);
    await fs.promises.writeFile(targetPath, req.file.buffer);
    return res.status(201).json({ url: `uploads/${filename}`, type: 'application/pdf' });
  }

  // Compress and convert all images to optimized WebP
  const filename = `${baseName}.webp`;
  const targetPath = path.join(UPLOAD_DIR, filename);

  await sharp(req.file.buffer)
    .rotate() // auto-orient based on EXIF metadata
    .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true }) // crisp high-res cap
    .webp({ quality: 82, effort: 4 }) // high quality webp compression
    .toFile(targetPath);

  res.status(201).json({ url: `uploads/${filename}`, type: 'image/webp' });
}));

export default router;
