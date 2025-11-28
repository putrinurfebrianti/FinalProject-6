const API_BASE = "http://127.0.0.1:8000/api";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = sessionStorage.getItem('token') ?? localStorage.getItem('token');
  const headers = new Headers(options.headers ?? {});
  headers.set('Accept', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const finalOptions: RequestInit = { ...options, headers };

  console.debug('apiFetch', { url: `${API_BASE}${path}`, options: finalOptions });

  const res = await fetch(`${API_BASE}${path}`, finalOptions);

  if (res.status === 401) {
    // token expired or invalid — log out client-side to force re-login
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.replace('/signin');
    throw new Error('Unauthorized');
  }

  return res;
}

export async function apiGet(path: string) {
  return apiFetch(path, { method: 'GET' });
}

export async function apiPost(path: string, body?: any) {
  return apiFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

export default { apiFetch, apiGet, apiPost, API_BASE };
