# Vidya Coaching Classes Portal

## Project overview
Vidya Coaching Classes is a full-stack marketing + admin platform for a coaching institute. The backend exposes authenticated REST endpoints (courses, results, leaderboards, gallery, offers, inquiries, subjects, students, admin login/password management) over Express + MongoDB, while the frontend is a responsive React 19 + Vite experience that showcases the institute's highlights, collections, and admission/contact/certificate workflows.

## Key highlights
- **Full admin ecosystem** – Express routes guard every write operation by verifying headers, query params, or request body credentials against `data/adminCredentials.json`, and admins can change their password via the backend helpers in `lib/adminStore.js`.
- **Rich marketing surface** – The React app stitches together hero sections, featured courses, latest results, gallery carousels, leaderboard displays, offers, and admission/contact/certificate forms with reusable components, Tailwind-based styling, `framer-motion` animations, and router navigation.
- **Advanced media and caching** – `lib/imageProcessing.js` converts uploaded PNG/JPEG payloads to WebP/AVIF before persisting results, gallery, and offer records, while `cacheUtils.js` keeps home/leaderboard/gallery data in `localStorage` and clears the cache on unload.
- **Multi-DB separation** – The backend keeps course/result/leaderboard/offer/inquiry data on a primary database, gallery images on a dedicated connection, and user-focused tables (students, subjects) on a third database for operational isolation and scaling.

## What makes it unique
- **Gallery intelligence** – The frontend groups gallery images by category, lazily loads the slider, and relies on normalized metadata (slugify/resolve helpers) so the same visuals appear consistently whether displayed in the home page showcase or the dedicated gallery route.
- **Result normalization pipeline** – `topperUtils.js` derives marks/percentage/out-of values when the source data is partial, prioritizes current-year entries, and powers the topper cards that mix hero-like profile imagery with subject-level scores.
- **Student + inquiry workflows** – Dedicated admin CRUD routes (bulk student deletes, category renames, image batch uploads) keep data clean, while public `/inquiries` captures admissions interest without exposing admin credentials.
- **Seeding + auxiliary scripts** – `backend/seed.js` (with sample subjects, courses, results, leaderboard entries, gallery) plus curated scripts under `backend/scripts/` help rebuild or migrate leaderboard data.

## Methods & patterns
- **RESTful modeling** – Every resource (Course, Result, LeaderboardEntry, GalleryImage, OfferImage, Subject, Student, Inquiry) has a Mongoose model plus create/read/update/delete routes built in `routes/api.js` with shared error handling and normalization helpers.
- **Context-driven admin guard** – `AdminSessionContext` stores credentials in memory, `AdminGuard` wraps the `/admin` path, and `apiClient` attaches headers when asking the backend for protected data.
- **Client-side resilience** – `apiClient` builds URLs from `VITE_API_BASE_URL`, centralizes error handling, and supports optional `options.headers` for admin API keys, while pages debounce data refreshes, persist caches, and fallback to `NotFound` for unknown routes.
- **UX helpers** – `ScrollToTop` resets scroll on navigation, buttons like `Herobtn`/`Morebtn` encapsulate repeated styling, and `lucide-react` + `react-icons` supply consistent iconography.

## Getting started
### Backend
1. `cd backend` and run `npm install` (already installed dependencies live in `node_modules`).
2. Duplicate `.env.example` to `.env` and fill in `MONGO_URL`, `MONGO_GALLERY_URL`, `MONGO_USER_URL`, `CLIENT_URL`, (optionally `PORT`).
3. Start the API with `npm run dev` for hot reloading or `npm start` for production.
4. Seed sample data with `npm run seed` once at least `MONGO_URI` is configured (it seeds courses, results, leaderboard, gallery, subjects).

### Frontend
1. `cd frontend`, install dependencies with `npm install` if needed.
2. Edit `.env`/`.env.example` to point `VITE_API_BASE_URL` at the backend (default `http://localhost:5000/api`).
3. Run `npm run dev` to launch Vite with HMR or `npm run build` to produce a production bundle.

## Environment variables
- **Backend** (`backend/.env`)
  - `MONGO_URL` – primary collection for courses, results, leaderboards, offers, inquiries.
  - `MONGO_GALLERY_URL` – gallery-specific database.
  - `MONGO_USER_URL` – users/students/subjects.
  - `CLIENT_URL` – allowed origin string (passed to CORS).
  - `PORT` – port to host the API (`5000` by default).
- **Frontend** (`frontend/.env`)
  - `VITE_API_BASE_URL` – absolute base URL for all `apiClient` requests (includes `/api`).

## Seeding, scripts, and maintenance
- `backend/seed.js` wipes and repopulates the core collections with curated samples; run `npm run seed` after pointing `MONGO_URI` to your cluster.
- Additional scripts under `backend/scripts/` (e.g., `rebuild_leaderboard.js`, `insert_leaderboard_*`, `normalize_admin_encoding.js`) demonstrate ways to backfill leaderboard data or normalize legacy exports.
- `data/adminCredentials.json` keeps the admin username + SHA-256 password hash; `lib/adminStore.js` lazy-creates it with defaults and exposes `verifyAdminCredentials`/`updateAdminPassword`.

## Structure
- `backend/` – Express server, database connections (`lib/`), models, routes, sample data + maintenance scripts.
- `frontend/` – Vite + React app with `pages/` for each route, `components/` (home, admin, course, result helpers), `lib/` utilities, and `contexts/AdminSession`.

## Next steps
1. Link the frontend `.env` to whichever backend URL is currently running and ensure CORS `CLIENT_URL` matches.
2. Extend the admin UI (`frontend/src/pages/Admin.jsx`) to cover any additional backend resources you expose.
3. Deploy the backend to a managed Mongo environment, run the seeder once, and host the frontend via Vite preview or a static hosting service.
