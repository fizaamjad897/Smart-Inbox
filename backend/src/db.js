import { MongoClient } from 'mongodb';

const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB || 'smartinbox';

let client;
let db;
export const cols = {};

export async function initDb() {
  client = new MongoClient(URI);
  await client.connect();
  db = client.db(DB_NAME);
  cols.users = db.collection('users');
  cols.settings = db.collection('settings');
  cols.emails = db.collection('emails');
  cols.integrations = db.collection('integrations');

  await cols.users.createIndex({ email: 1 }, { unique: true });
  await cols.settings.createIndex({ userId: 1 }, { unique: true });
  await cols.integrations.createIndex({ userId: 1 }, { unique: true });
  // One row per (user, gmail message) so base + enrichment posts merge.
  await cols.emails.createIndex(
    { userId: 1, message_id: 1 },
    { unique: true, partialFilterExpression: { message_id: { $exists: true } } }
  );
  await cols.emails.createIndex({ userId: 1, received_at: -1 });

  console.log(`Connected to MongoDB (${DB_NAME})`);
}

export async function closeDb() {
  await client?.close();
}

const clean = (v) => {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function normalize(doc) {
  if (!doc) return null;
  return {
    id: doc._id?.toString(),
    message_id: doc.message_id ?? null,
    received_at: doc.received_at instanceof Date ? doc.received_at.toISOString() : (doc.received_at ?? null),
    timestamp: doc.timestamp ?? null,
    category: doc.category ?? null,
    sender: doc.sender ?? null,
    subject: doc.subject ?? null,
    snippet: doc.snippet ?? null,
    company: doc.company ?? null,
    interest_level: doc.interest_level ?? null,
    estimated_value: doc.estimated_value ?? null,
    summary: doc.summary ?? null,
    draft: doc.draft ?? null,
    status: doc.status ?? null
  };
}

// Only set fields that were actually provided, so partial enrichment posts
// never overwrite existing values with nulls.
function buildSet(b) {
  const set = {};
  const put = (key, val) => { const c = clean(val); if (c !== null) set[key] = c; };
  put('timestamp', b.timestamp);
  if (b.category) set.category = String(b.category).toUpperCase().trim();
  put('sender', b.from ?? b.sender);
  put('subject', b.subject);
  put('snippet', b.snippet);
  put('company', b.company_name ?? b.company);
  put('interest_level', b.interest_level);
  put('estimated_value', b.estimated_value);
  put('summary', b.summary);
  put('draft', b.draft);
  put('status', b.status);
  return set;
}

export async function upsertEmail(userId, b = {}) {
  const messageId = clean(b.message_id ?? b.messageId);
  const set = buildSet(b);

  if (messageId) {
    const doc = await cols.emails.findOneAndUpdate(
      { userId, message_id: messageId },
      { $set: set, $setOnInsert: { userId, message_id: messageId, received_at: new Date() } },
      { upsert: true, returnDocument: 'after' }
    );
    return normalize(doc);
  }

  const doc = { userId, ...set, received_at: new Date() };
  const res = await cols.emails.insertOne(doc);
  return normalize({ _id: res.insertedId, ...doc });
}

export async function listEmails(userId, { category, q, limit = 200 } = {}) {
  const filter = { userId };
  if (category && category.toUpperCase() !== 'ALL') filter.category = category.toUpperCase();
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ subject: rx }, { sender: rx }, { summary: rx }, { snippet: rx }, { company: rx }];
  }
  const docs = await cols.emails
    .find(filter)
    .sort({ _id: -1 })
    .limit(Math.min(Number(limit) || 200, 1000))
    .toArray();
  return docs.map(normalize);
}

export async function getStats(userId) {
  const total = await cols.emails.countDocuments({ userId });

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const today = await cols.emails.countDocuments({ userId, received_at: { $gte: startOfToday } });

  const categories = { URGENT: 0, LEAD: 0, SUPPORT: 0, NEWSLETTER: 0, OTHER: 0 };
  const grouped = await cols.emails.aggregate([
    { $match: { userId } },
    { $group: { _id: '$category', c: { $sum: 1 } } }
  ]).toArray();
  for (const g of grouped) {
    const key = (g._id || 'OTHER').toUpperCase();
    categories[key] = (categories[key] || 0) + g.c;
  }

  return { total, today, categories };
}
