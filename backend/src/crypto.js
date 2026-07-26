import crypto from 'crypto';

// AES-256-GCM encryption for secrets at rest (client secrets, refresh tokens).
// The key is derived from CRED_SECRET — set a long random value in production.
const KEY = crypto
  .createHash('sha256')
  .update(process.env.CRED_SECRET || 'dev-cred-secret-change-me')
  .digest();

export function encrypt(text) {
  if (text == null || text === '') return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const enc = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

export function decrypt(b64) {
  if (!b64) return null;
  const raw = Buffer.from(b64, 'base64');
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const enc = raw.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
}
