const BASE = import.meta.env.VITE_API_BASE || '/api';

let authToken = localStorage.getItem('si_token') || null;

export function setToken(t) {
  authToken = t;
  if (t) localStorage.setItem('si_token', t);
  else localStorage.removeItem('si_token');
}
export function getToken() {
  return authToken;
}

async function req(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `${res.status} ${res.statusText}`);
  return data;
}

export const api = {
  signup: (b) => req('/auth/signup', { method: 'POST', body: b }),
  login: (b) => req('/auth/login', { method: 'POST', body: b }),
  me: () => req('/auth/me'),
  getSettings: () => req('/settings'),
  saveSettings: (b) => req('/settings', { method: 'PUT', body: b }),
  simulate: (b) => req('/simulate', { method: 'POST', body: b }),
  getGoogleStatus: () => req('/google/status'),
  saveGoogleConfig: (b) => req('/google/config', { method: 'PUT', body: b }),
  getGoogleConnectUrl: () => req('/google/connect'),
  getStats: () => req('/stats'),
  getEmails: ({ category = 'ALL', q = '' } = {}) => {
    const p = new URLSearchParams();
    if (category && category !== 'ALL') p.set('category', category);
    if (q) p.set('q', q);
    const qs = p.toString();
    return req(`/emails${qs ? `?${qs}` : ''}`);
  }
};
