// API base: replaced at deploy time in hosted previews; empty (same origin) when served by Express or Vite proxy.
const raw = typeof window !== 'undefined' ? window.__API_BASE__ || '' : '';
export const API_BASE = raw.startsWith('__PORT_') ? '' : raw.replace(/\/$/, '');

let authToken = null; // kept in memory only
export const setToken = t => { authToken = t; };
export const getToken = () => authToken;

export async function api(path, { method = 'GET', body, auth = false, form } = {}) {
  const headers = {};
  if (body && !form) headers['Content-Type'] = 'application/json';
  if (auth && authToken) headers.Authorization = `Bearer ${authToken}`;
  const res = await fetch(`${API_BASE}/api${path}`, { method, headers, body: form || (body ? JSON.stringify(body) : undefined) });
  let data = null;
  try { data = await res.json(); } catch { /* empty */ }
  if (!res.ok) { const err = new Error(data?.error || `Request failed (${res.status})`); err.status = res.status; throw err; }
  return data;
}

/** Resolve stored image paths: uploads come from the API server, assets from the client bundle. */
export function img(p) {
  if (!p) return '';
  if (/^(https?:|data:|blob:)/.test(p)) return p;
  const clean = p.replace(/^\//, '');
  if (clean.startsWith('uploads/')) return `${API_BASE}/${clean}`;
  return `${import.meta.env.BASE_URL}${clean}`;
}
