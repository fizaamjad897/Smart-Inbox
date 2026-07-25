import { cols } from './db.js';

// The opinionated defaults every new account starts with. Users edit these
// from the Settings page — this small list IS the whole config surface.
export const DEFAULT_CATEGORIES = [
  { key: 'URGENT', label: 'Urgent', color: '#b23b34', description: 'Outages, crashes, anything time-critical.', keywords: ['down', 'crash', 'critical', 'emergency', 'outage', 'urgent', 'immediately', 'asap'] },
  { key: 'LEAD', label: 'Lead', color: '#2f6f5e', description: 'Buying signals — pricing, demos, partnerships.', keywords: ['interested', 'hire', 'pricing', 'price', 'demo', 'budget', 'partnership', 'quote', 'proposal'] },
  { key: 'SUPPORT', label: 'Support', color: '#3b5b8c', description: 'Help requests, logins, bugs.', keywords: ['help', 'password', 'login', 'account', 'bug', 'issue', 'error', 'broken', 'support'] },
  { key: 'NEWSLETTER', label: 'Newsletter', color: '#6d5896', description: 'Promotions and marketing blasts.', keywords: ['unsubscribe', 'newsletter', 'promo', 'discount', 'sale', 'marketing', 'offer', 'deal'] },
  { key: 'OTHER', label: 'Other', color: '#8a8578', description: 'Everything that does not fit the rest.', keywords: [] }
];

export function defaultSettings(userId) {
  return {
    userId,
    enabled: true,
    prompt: '',
    categories: DEFAULT_CATEGORIES,
    routing: { discordWebhook: '', logToSheet: false },
    updatedAt: new Date()
  };
}

function present(s) {
  if (!s) return null;
  return {
    enabled: s.enabled !== false,
    prompt: s.prompt || '',
    categories: s.categories?.length ? s.categories : DEFAULT_CATEGORIES,
    routing: { discordWebhook: s.routing?.discordWebhook || '', logToSheet: !!s.routing?.logToSheet }
  };
}

export async function ensureSettings(userId) {
  const existing = await cols.settings.findOne({ userId });
  if (!existing) await cols.settings.insertOne(defaultSettings(userId));
}

export async function getSettings(userId) {
  let s = await cols.settings.findOne({ userId });
  if (!s) {
    s = defaultSettings(userId);
    await cols.settings.insertOne(s);
  }
  return present(s);
}

function sanitizeCategories(input) {
  if (!Array.isArray(input)) return null;
  const cats = input
    .filter((c) => c && c.key)
    .map((c) => ({
      key: String(c.key).toUpperCase().trim().replace(/\s+/g, '_').slice(0, 24),
      label: String(c.label || c.key).trim().slice(0, 40),
      color: /^#[0-9a-fA-F]{6}$/.test(c.color) ? c.color : '#8a8578',
      description: String(c.description || '').trim().slice(0, 160),
      keywords: Array.isArray(c.keywords)
        ? c.keywords.map((k) => String(k).toLowerCase().trim()).filter(Boolean).slice(0, 30)
        : []
    }));
  return cats.length ? cats : null;
}

export async function updateSettings(userId, patch = {}) {
  const set = { updatedAt: new Date() };
  if (typeof patch.enabled === 'boolean') set.enabled = patch.enabled;
  if (typeof patch.prompt === 'string') set.prompt = patch.prompt.slice(0, 2000);
  const cats = sanitizeCategories(patch.categories);
  if (cats) set.categories = cats;
  if (patch.routing && typeof patch.routing === 'object') {
    set.routing = {
      discordWebhook: String(patch.routing.discordWebhook || '').trim().slice(0, 400),
      logToSheet: !!patch.routing.logToSheet
    };
  }
  await cols.settings.updateOne({ userId }, { $set: set }, { upsert: true });
  return getSettings(userId);
}
