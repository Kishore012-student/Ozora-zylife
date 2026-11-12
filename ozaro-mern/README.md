# Ozora Zylife — MERN website + admin dashboard

MongoDB · Express 5 · React 18 (Vite) · Node.js. Animated public site (GSAP, Lenis, Three.js) with a full admin panel for products, certificates, enquiries and every page's content.

## Structure

```
ozaro-mern/
  server/   Express API, Mongoose models, uploads, serves the built client
  client/   React + Vite frontend (public site + /admin)
```

## Run locally

```bash
# 1. API
cd server
cp .env.example .env        # edit values
npm install
npm run dev                 # http://localhost:8000

# 2. Frontend (new terminal)
cd client
npm install
npm run dev                 # http://localhost:5173  (proxies /api and /uploads to :8000)
```

If `MONGODB_URI` is empty, the server starts an embedded MongoDB (stored in `server/data`) so you can test without installing Mongo. For production always set a real `MONGODB_URI` (for example MongoDB Atlas).

On first start the database is seeded with all page content from the company content guide, 4 sample products and placeholder certificates/licences.

## Admin

- URL: `/admin`
- Default login: `admin@ozorazylife.com` / `Ozora@2026` (set `ADMIN_EMAIL` / `ADMIN_PASSWORD` before first start, or change it from Admin → Password)
- The login token is kept in memory only, so refreshing the page signs you out.

What you can manage:

| Section | What it does |
| --- | --- |
| Dashboard | Counts, latest enquiries, content checklist |
| Products | Add / edit / delete, Allopathy or Ayurveda, image gallery upload and reorder, featured toggle, draft/published, display order |
| Certifications & Licences | Add / edit / delete with image or PDF upload |
| Enquiries | All form submissions, status (new / contacted / closed), notes, CSV export |
| Pages | Edit every text block and image on Home, About, Products, Quality, Certifications, Contact, Legal pages and global contact details (phone, WhatsApp, email, address, hours, map). "Restore defaults" resets a page. |

Any text in `[square brackets]` is a placeholder from the content guide. Replace it with verified details from the admin panel.

## Environment variables (`server/.env`)

| Name | Purpose |
| --- | --- |
| `PORT` | API port (default 8000) |
| `MONGODB_URI` | MongoDB connection string |
| `MONGODB_DB` | Database name (default `ozora`) |
| `JWT_SECRET` | Long random string for admin tokens. Required in production |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | First admin account |
| `CORS_ORIGIN` | Allowed frontend origins, comma separated (only needed if the frontend is on a different domain) |
| `UPLOAD_DIR` | Folder for uploaded files (default `./uploads`) |
| `EMBEDDED_DB_PATH` | Embedded DB folder when no `MONGODB_URI` |

## Production

Single server (simplest):

```bash
cd client && npm install && npm run build      # creates client/dist
cd ../server && npm install && npm start       # serves API + client/dist on PORT
```

Put it behind Nginx or deploy to Render / Railway / a VPS. Keep `server/uploads` on persistent storage (or a mounted volume), since product images are saved there.

Separate hosting: deploy `client/dist` to any static host and set `window.__API_BASE__` in `client/index.html` to your API URL, then set `CORS_ORIGIN` on the server to the frontend domain.

## API summary

Public: `GET /api/content`, `GET /api/products?category=&q=&featured=1`, `GET /api/products/:slug`, `GET /api/credentials`, `POST /api/enquiries` (rate limited, honeypot spam check).

Admin (Bearer token): `POST /api/auth/login`, products / credentials / enquiries CRUD, `PUT /api/content/:key`, `POST /api/content/:key/reset`, `POST /api/upload`, `GET /api/stats`.
