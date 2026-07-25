import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cols } from './db.js';
import { ensureSettings } from './settings.js';

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const TTL = '7d';

const normalizeEmail = (e) => String(e || '').trim().toLowerCase();

function sign(user) {
  return jwt.sign({ sub: user._id.toString(), email: user.email }, SECRET, { expiresIn: TTL });
}

export async function signup({ email, password }) {
  email = normalizeEmail(email);
  if (!email || !email.includes('@')) throw new Error('A valid email is required');
  if (!password || password.length < 6) throw new Error('Password must be at least 6 characters');

  const exists = await cols.users.findOne({ email });
  if (exists) throw new Error('An account with that email already exists');

  const passwordHash = await bcrypt.hash(password, 10);
  const res = await cols.users.insertOne({ email, passwordHash, createdAt: new Date() });
  const user = { _id: res.insertedId, email };
  await ensureSettings(user._id.toString());
  return { token: sign(user), user: { email } };
}

export async function login({ email, password }) {
  email = normalizeEmail(email);
  const user = await cols.users.findOne({ email });
  if (!user) throw new Error('Invalid email or password');
  const ok = await bcrypt.compare(String(password || ''), user.passwordHash);
  if (!ok) throw new Error('Invalid email or password');
  return { token: sign(user), user: { email: user.email } };
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, SECRET);
    req.userId = payload.sub;
    req.userEmail = payload.email;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session' });
  }
}
