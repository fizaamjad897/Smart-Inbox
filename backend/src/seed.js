// Seeds a ready-to-use demo account + demo emails so the dashboard looks
// alive and recruiters can log straight in.  Run with:  npm run seed
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { initDb, cols, upsertEmail, closeDb } from './db.js';
import { ensureSettings } from './settings.js';

const DEMO_EMAIL = (process.env.DEMO_EMAIL || 'demo@smartinbox.app').toLowerCase();
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'demo1234';

const now = () => new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' });

const demo = [
  { message_id: 'demo-1', category: 'URGENT', from: 'ops@acme.io', subject: 'Production server is down', snippet: 'Our main API has been returning 500s for the last 10 minutes, customers are affected.', status: 'New', timestamp: now() },
  { message_id: 'demo-2', category: 'LEAD', from: 'sara@bigcorp.com', subject: 'Interested in a demo + pricing', snippet: 'We are a 200-person team evaluating tools this quarter.', company_name: 'BigCorp', interest_level: 'hot', estimated_value: 'high', summary: 'Enterprise prospect evaluating this quarter, asked for demo and pricing. Strong buying signals.', status: 'New', timestamp: now() },
  { message_id: 'demo-3', category: 'SUPPORT', from: 'jordan@user.net', subject: 'Cannot reset my password', snippet: 'The reset link keeps saying expired. Please help.', draft: 'Hi Jordan,\n\nThanks for reaching out! Password reset links expire after 30 minutes. I have just triggered a fresh one to your email — please use it within the window. Let us know if it still fails.\n\nBest,\nSupport Team', status: 'New', timestamp: now() },
  { message_id: 'demo-4', category: 'NEWSLETTER', from: 'news@deals.com', subject: '50% off this weekend only', snippet: 'Unsubscribe anytime. Huge discounts on everything.', status: 'New', timestamp: now() },
  { message_id: 'demo-5', category: 'OTHER', from: 'friend@gmail.com', subject: 'Lunch next week?', snippet: 'Was thinking we could grab lunch sometime.', status: 'New', timestamp: now() },
  { message_id: 'demo-6', category: 'LEAD', from: 'mike@startup.dev', subject: 'Partnership opportunity', snippet: 'We would love to explore integrating with you.', company_name: 'Startup.dev', interest_level: 'warm', estimated_value: 'medium', summary: 'Potential integration partner, warm interest, mid-size opportunity.', status: 'New', timestamp: now() }
];

await initDb();

let user = await cols.users.findOne({ email: DEMO_EMAIL });
if (!user) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const res = await cols.users.insertOne({ email: DEMO_EMAIL, passwordHash, createdAt: new Date() });
  user = { _id: res.insertedId };
  console.log(`Created demo account: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}
const userId = user._id.toString();
await ensureSettings(userId);

for (const d of demo) await upsertEmail(userId, d);
console.log(`Seeded ${demo.length} demo emails for ${DEMO_EMAIL}.`);

await closeDb();
