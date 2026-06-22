# Montola School — Shop preview (frontend + demo backend)

This repo bundles two things so you can run the whole thing locally with **no
database, no Java, no Docker**:

- **`frontend/`** — the Next.js app (with the new **Shop** feature: catalog,
  product/bundle pages, checkout, and the admin shop screens).
- **`demo-backend/`** — a lightweight Node/Express server with in-memory seed
  data that **mimics the real backend's API contract**. Use it as the **spec**
  for what the real Java/Spring backend needs to expose.

> The demo backend is for local development only — passwords are plain text and
> data resets on restart. It is **not** the production backend.

## Prerequisites
- Node.js ≥ 18

## Run it (two terminals)

```bash
# 1) Demo backend  → http://localhost:8080
cd demo-backend
npm install
npm start            # or: node --watch server.js  (auto-restart on edits)

# 2) Frontend      → http://localhost:3000
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open **http://localhost:3000**.

## Demo logins (password `password123` for all)

| Email | Role |
|-------|------|
| `admin@montola.test` | ADMIN |
| `manager@montola.test` | MANAGER |
| `teacher@montola.test` | TEACHER |
| `student@montola.test` | STUDENT |
| `multi@montola.test` | TEACHER + STUDENT |

## For the backend developer

The demo backend defines the API the frontend expects. Start here:

- **Shop endpoints + DTO shapes** → `demo-backend/shopRoutes.js`, seed data in
  `demo-backend/shopData.js`.
- **Core (auth, courses, payments) endpoints** → `demo-backend/server.js`,
  seed in `demo-backend/data.js`.
- **What the frontend actually calls** (the authoritative client contract) →
  `frontend/src/lib/*.ts` and the TypeScript types in
  `frontend/src/types/` (`index.ts`, `shop.ts`).

Base URL the frontend uses: `http://localhost:8080/api` (set in
`frontend/.env.example` → copy to `.env.local`).
