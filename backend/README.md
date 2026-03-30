# Vidya Coaching Backend

Simple Express + MongoDB API for results, courses, leaderboards, and gallery assets.

## Setup

1. Copy `.env.example` to `.env`, then provide the three MongoDB URIs (`MONGO_URL`, `MONGO_GALLERY_URL`, `MONGO_USER_URL`) along with `CLIENT_URL`, an optional `PORT`, and any admin credentials stored under `data/adminCredentials`.
2. Run `npm install`.
3. Start the server with `npm run dev` (or `npm start` for production).

## Admin Routes (require `x-admin-api-key` header matching `ADMIN_API_KEY`)

- `POST /api/courses` - add a new course document.
- `POST /api/results` - push a topper/result entry.
- `POST /api/leaderboard` - add a leaderboard ranking.
- `POST /api/gallery` - push a gallery image with title/category.

## Public Read Routes

- `GET /api/courses` - optional query params: `section`, `board`, `level`.
- `GET /api/results` - optional `year`, `standard`, `board`.
- `GET /api/leaderboard` - optional `category`, `year`.
- `GET /api/gallery` - optional `category` filter.

## Admission Inquiries

- `POST /api/inquiries` - record an inquiry with name, email, phone, applying class, course preference, and goals.
- `GET /api/inquiries` - admin-only (requires `x-admin-username`/`x-admin-password`) to review submissions.

Remember to set `VITE_API_BASE_URL` in the frontend `.env` (see `frontend/.env.example`) so the site knows where to fetch content.

## Environment variables

- `MONGO_URL` – shared database for courses, results, leaderboard, offers, and inquiries.
- `MONGO_GALLERY_URL` – dedicated MongoDB URI that stores gallery assets; the gallery routes use this connection.
- `MONGO_USER_URL` – dedicated MongoDB URI for students, faculty/subject metadata, and other user-focused data.
- `CLIENT_URL` – allowed origin for CORS.
- `PORT` – backend port, defaults to `5000`.

## Gallery uploads

Catching PNG and JPEG uploads early keeps the gallery fast. The backend now uses `sharp` to convert incoming base64 gallery files to WebP or AVIF before storing them, so the admin UI can continue uploading the same payload and the API will respond with a lighter `imageUrl`. Remote URLs (HTTP/HTTPS) are left untouched.
