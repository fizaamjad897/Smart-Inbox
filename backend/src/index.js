import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb, cols, upsertEmail, listEmails, getStats } from './db.js';
import { signup, login, requireAuth } from './auth.js';
import { getSettings, updateSettings } from './settings.js';
import { classifyEmail } from './classify.js';
import { saveConfig, getStatus, buildAuthUrl, handleCallback } from './google.js';
import { provisionForUser } from './n8nprovision.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// The account that the n8n workflow's real emails land in.
const INGEST_EMAIL = (process.env.INGEST_EMAIL || process.env.DEMO_EMAIL || 'demo@smartinbox.app').toLowerCase();

app.get('/health', (_req, res) => res.json({ ok: true, service: 'smart-inbox-api' }));

/* ---------- auth ---------- */
app.post('/api/auth/signup', async (req, res) => {
  try {
    res.status(201).json(await signup(req.body || {}));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    res.json(await login(req.body || {}));
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

app.get('/api/auth/me', requireAuth, (req, res) => res.json({ email: req.userEmail }));

/* ---------- connect your own Gmail (bring-your-own OAuth app) ---------- */
app.get('/api/google/status', requireAuth, async (req, res) => {
  res.json(await getStatus(req.userId));
});

app.put('/api/google/config', requireAuth, async (req, res) => {
  try {
    await saveConfig(req.userId, req.body || {});
    res.json(await getStatus(req.userId));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/google/connect', requireAuth, async (req, res) => {
  try {
    res.json({ url: await buildAuthUrl(req.userId) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Google redirects the browser here (no auth header — identity is in `state`).
app.get('/api/google/callback', async (req, res) => {
  try {
    const { userId, frontend } = await handleCallback(req.query.code, req.query.state);
    // provision their n8n workflow; don't fail the redirect if it errors (retryable)
    try {
      await provisionForUser(userId);
    } catch (e) {
      console.error('provision error:', e.message);
    }
    res.redirect(`${frontend}/app/settings?connected=1`);
  } catch (err) {
    const fe = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    res.redirect(`${fe}/app/settings?error=${encodeURIComponent(err.message)}`);
  }
});

// Retry provisioning (e.g. after fixing a Discord webhook or if n8n was down).
app.post('/api/google/provision', requireAuth, async (req, res) => {
  try {
    res.json(await provisionForUser(req.userId));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ---------- settings ---------- */
app.get('/api/settings', requireAuth, async (req, res) => {
  res.json(await getSettings(req.userId));
});

app.put('/api/settings', requireAuth, async (req, res) => {
  try {
    res.json(await updateSettings(req.userId, req.body || {}));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ---------- the "automate it yourself" endpoint ---------- */
app.post('/api/simulate', requireAuth, async (req, res) => {
  try {
    const { from = '', subject = '', body = '' } = req.body || {};
    if (!subject && !body) return res.status(400).json({ error: 'Provide a subject or body' });

    const settings = await getSettings(req.userId);
    const category = await classifyEmail(settings, { from, subject, body });

    const email = await upsertEmail(req.userId, {
      message_id: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      category,
      from: from || 'you@example.com',
      subject: subject || '(no subject)',
      snippet: body,
      status: 'New',
      timestamp: new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })
    });

    const routed = await routeToDiscord(settings, email);
    res.status(201).json({ category, email, routed });
  } catch (err) {
    console.error('simulate error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

async function routeToDiscord(settings, email) {
  const url = settings.routing?.discordWebhook;
  if (!url) return false;
  try {
    const payload = {
      embeds: [{
        title: `${email.category} · ${email.subject}`.slice(0, 240),
        description: (email.snippet || '').slice(0, 400),
        footer: { text: `Smart Inbox · ${email.timestamp || ''}` }
      }]
    };
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return r.ok;
  } catch {
    return false;
  }
}

/* ---------- scoped data (dashboard) ---------- */
app.get('/api/emails', requireAuth, async (req, res) => {
  try {
    const { category, q, limit } = req.query;
    res.json(await listEmails(req.userId, { category, q, limit }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/stats', requireAuth, async (req, res) => {
  try {
    res.json(await getStats(req.userId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------- open ingestion for the n8n workflow (maps to INGEST_EMAIL's account) ---------- */
let ingestUserIdCache = null;
async function ingestUserId() {
  if (ingestUserIdCache) return ingestUserIdCache;
  const u = await cols.users.findOne({ email: INGEST_EMAIL });
  if (u) ingestUserIdCache = u._id.toString(); // only cache once the account exists
  return ingestUserIdCache;
}

app.post('/api/emails', async (req, res) => {
  try {
    let userId;
    // Per-user workflows include ?ingest=<token>; the shared demo feed doesn't.
    if (req.query.ingest) {
      const doc = await cols.integrations.findOne({ ingestToken: String(req.query.ingest) });
      userId = doc?.userId || null;
      if (!userId) return res.status(403).json({ error: 'Invalid ingest token' });
    } else {
      userId = await ingestUserId();
      if (!userId) {
        return res.status(503).json({ error: `Ingest account ${INGEST_EMAIL} not found — sign up with that email first` });
      }
    }
    res.status(201).json(await upsertEmail(userId, req.body || {}));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
initDb()
  .then(() => app.listen(PORT, () => console.log(`Smart-Inbox API listening on :${PORT}`)))
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
