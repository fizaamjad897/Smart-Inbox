import jwt from 'jsonwebtoken';
import { cols } from './db.js';
import { encrypt, decrypt } from './crypto.js';

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const BACKEND_URL = (process.env.BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
const REDIRECT_URI = `${BACKEND_URL}/api/google/callback`;

// gmail.modify covers what the n8n Gmail nodes need; userinfo.email tells us
// which account was connected.
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/userinfo.email'
].join(' ');

// The redirect URI each user must add to THEIR OAuth client. Shown in the UI.
export const redirectUri = REDIRECT_URI;

export async function saveConfig(userId, { clientId, clientSecret }) {
  clientId = String(clientId || '').trim();
  clientSecret = String(clientSecret || '').trim();
  if (!clientId || !clientSecret) throw new Error('Client ID and Client Secret are both required');
  await cols.integrations.updateOne(
    { userId },
    {
      $set: {
        userId,
        'google.clientId': clientId,
        'google.clientSecretEnc': encrypt(clientSecret)
      }
    },
    { upsert: true }
  );
}

export async function getStatus(userId) {
  const doc = await cols.integrations.findOne({ userId });
  const g = doc?.google || {};
  return {
    configured: !!g.clientId,
    connected: !!g.refreshTokenEnc,
    email: g.email || null,
    redirectUri: REDIRECT_URI
  };
}

export async function buildAuthUrl(userId) {
  const doc = await cols.integrations.findOne({ userId });
  const g = doc?.google;
  if (!g?.clientId) throw new Error('Add your Client ID and Secret first');
  const state = jwt.sign({ sub: userId }, SECRET, { expiresIn: '15m' });
  const params = new URLSearchParams({
    client_id: g.clientId,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    scope: SCOPES,
    state
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function handleCallback(code, state) {
  if (!code || !state) throw new Error('Missing code or state');
  let userId;
  try {
    userId = jwt.verify(state, SECRET).sub;
  } catch {
    throw new Error('Invalid or expired state');
  }

  const doc = await cols.integrations.findOne({ userId });
  const g = doc?.google;
  if (!g?.clientId || !g?.clientSecretEnc) throw new Error('Client config missing');
  const clientSecret = decrypt(g.clientSecretEnc);

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: g.clientId,
      client_secret: clientSecret,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    })
  });
  const tok = await res.json();
  if (!res.ok) throw new Error(tok.error_description || tok.error || 'Token exchange failed');

  let email = null;
  try {
    const u = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tok.access_token}` }
    }).then((r) => r.json());
    email = u.email || null;
  } catch {
    /* non-fatal */
  }

  const set = { 'google.email': email, 'google.connectedAt': new Date() };
  if (tok.refresh_token) set['google.refreshTokenEnc'] = encrypt(tok.refresh_token);
  await cols.integrations.updateOne({ userId }, { $set: set });

  return { userId, email, hasRefresh: !!tok.refresh_token, frontend: FRONTEND_URL };
}

// Used later by the n8n orchestration / direct polling.
export async function getRefreshToken(userId) {
  const doc = await cols.integrations.findOne({ userId });
  return doc?.google?.refreshTokenEnc ? decrypt(doc.google.refreshTokenEnc) : null;
}
