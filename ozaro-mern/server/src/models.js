import mongoose from 'mongoose';

const slugify = s => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const CATEGORIES = ['Allopathy', 'Ayurveda'];
export const FORMS = ['Tablet', 'Capsule', 'Syrup', 'Oil', 'Powder', 'Other'];
export const ENQUIRY_TYPES = ['Product enquiry', 'Pharmacy or bulk supply', 'General question'];

/* ---------- Product ---------- */
const productSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true, maxlength: 140 },
  slug:             { type: String, unique: true, index: true },
  category:         { type: String, enum: CATEGORIES, required: true },
  shortDescription: { type: String, trim: true, default: '', maxlength: 400 },
  description:      { type: String, trim: true, default: '' },
  composition:      { type: String, trim: true, default: '' },
  dosageForm:       { type: String, enum: FORMS, default: 'Tablet' },
  packSize:         { type: String, trim: true, default: '' },
  storage:          { type: String, trim: true, default: '' },
  prescription:     { type: String, enum: ['Required', 'Not required'], default: 'Required' },
  images:           { type: [String], default: [] },
  featured:         { type: Boolean, default: false },
  status:           { type: String, enum: ['published', 'draft'], default: 'published' },
  order:            { type: Number, default: 0 },
}, { timestamps: true });

productSchema.pre('validate', async function () {
  if (!this.isModified('name') && this.slug) return;
  const base = slugify(this.name) || 'product';
  let slug = base, n = 1;
  while (await mongoose.models.Product.exists({ slug, _id: { $ne: this._id } })) slug = `${base}-${++n}`;
  this.slug = slug;
});
export const Product = mongoose.model('Product', productSchema);

/* ---------- Certifications & licences ---------- */
const credentialSchema = new mongoose.Schema({
  kind:       { type: String, enum: ['certificate', 'licence'], required: true },
  title:      { type: String, required: true, trim: true },   // certificate name / licence type
  number:     { type: String, trim: true, default: '' },      // licence number
  issuedBy:   { type: String, trim: true, default: '' },
  validUntil: { type: String, trim: true, default: '' },
  file:       { type: String, default: '' },                  // image or PDF path
  status:     { type: String, enum: ['published', 'draft'], default: 'published' },
  order:      { type: Number, default: 0 },
}, { timestamps: true });
export const Credential = mongoose.model('Credential', credentialSchema);

/* ---------- Enquiries ---------- */
const enquirySchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true, maxlength: 120 },
  phone:    { type: String, required: true, trim: true, maxlength: 30 },
  email:    { type: String, required: true, trim: true, lowercase: true, maxlength: 160, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  business: { type: String, trim: true, default: '', maxlength: 160 },
  type:     { type: String, enum: ENQUIRY_TYPES, required: true },
  product:  { type: String, trim: true, default: '', maxlength: 160 },
  message:  { type: String, required: true, trim: true, maxlength: 4000 },
  status:   { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
  notes:    { type: String, default: '' },
}, { timestamps: true });
export const Enquiry = mongoose.model('Enquiry', enquirySchema);

/* ---------- Editable page content (one document per key) ---------- */
const contentSchema = new mongoose.Schema({
  key:  { type: String, required: true, unique: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true, minimize: false });
export const Content = mongoose.model('Content', contentSchema);

/* ---------- Admin users ---------- */
const adminSchema = new mongoose.Schema({
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  name:         { type: String, default: 'Admin' },
  passwordHash: { type: String, required: true },
}, { timestamps: true });
export const Admin = mongoose.model('Admin', adminSchema);
