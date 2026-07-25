# 📬 Smart Inbox

AI-powered email triage, as a full product. Incoming email is classified by an
LLM into **Urgent / Lead / Support / Newsletter / Other**, routed to Discord +
Google Sheets, and surfaced on a live, multi-user dashboard.

```
Gmail ─▶ n8n workflow ─▶ Groq (classify + enrich)
                         ├─▶ Discord alerts
                         ├─▶ Google Sheets log
                         └─▶ Backend API ─▶ MongoDB ─▶ React dashboard
```

## Repository layout

```
Smart-Inbox/
├── backend/     — the API + database (Node/Express + MongoDB)
├── frontend/    — the dashboard + landing page (React + Vite + Tailwind)
├── n8n/         — the automation workflow (the only part that touches Gmail)
├── docker-compose.yml   — run everything locally in one command
└── render.yaml          — deploy blueprint (Render)
```

Each folder is self-contained and has its own README where useful.

---

## What each part does

### `backend/` — the brain and the storage
A small **Express API backed by MongoDB**. It is the single source of truth for
the dashboard. It handles:

- **Accounts & auth** — signup / login with JWT + bcrypt (`/api/auth/*`). Every
  user's data is isolated.
- **Settings** — each user's own categories, keywords, routing, and on/off
  switch (`/api/settings`).
- **Classification** — `/api/simulate` runs an email through the user's rules
  using **Groq (Llama 3.3)**, with a keyword fallback so it never hard-fails.
- **Ingestion** — `POST /api/emails` is what the n8n workflow calls to hand over
  each classified email; it's upserted per user (so base + enrichment merge).
- **Dashboard data** — `GET /api/emails` and `/api/stats`, scoped to the
  logged-in user.

Key files: `src/index.js` (routes), `src/db.js` (Mongo + queries),
`src/auth.js`, `src/settings.js`, `src/classify.js`, `src/seed.js` (demo data).

### `frontend/` — what people see
A **React** app: a public landing page, a login screen, and the app behind it
(Dashboard · Simulate · Settings · Help). It only ever talks to the backend
over `/api`.

### `n8n/` — the real-Gmail automation
The workflow that polls a real inbox and pushes classified email into the
backend. Optional — the product works without it (via **Simulate**). See
[`n8n/README.md`](n8n/README.md).

---

## Run it locally

**Option A — Docker (everything at once):**
```bash
docker compose up -d --build
```
Dashboard → http://localhost:8080 · n8n → http://localhost:5678 · API → http://localhost:4000

**Option B — dev mode (backend + frontend separately):**
```bash
# backend  (reads backend/.env — MongoDB, Groq, JWT)
cd backend && npm install && npm run seed && npm start      # :4000

# frontend
cd frontend && npm install && npm run dev                   # :5173
```

**Demo login:** `demo@smartinbox.app` / `demo1234` (or the one-click button).

## Configuration

Copy each `.env.example` to `.env` (all git-ignored):

- `backend/.env` — `MONGODB_URI`, `MONGODB_DB`, `JWT_SECRET`, `GROQ_API_KEY`,
  `INGEST_EMAIL` (the account n8n's real emails land in)
- root `.env` — optional overrides for docker-compose

## Deploy

- **Backend** → Render (free; data lives in MongoDB Atlas)
- **Frontend** → Vercel (root dir = `frontend`; set the backend URL in `vercel.json`)
- **n8n** → Render via `render.yaml` (free tier needs Postgres + a keep-alive
  pinger — see the notes in `render.yaml`)

## Security notes
- Secrets live in `.env` files (git-ignored). The Groq key and Discord webhooks
  are currently inside the n8n workflow JSON — keep the repo **private** or
  rotate them before pushing.
- `POST /api/emails` is open (used by n8n). Add a shared key before exposing the
  backend publicly if you want to lock it down.
