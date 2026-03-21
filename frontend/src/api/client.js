const BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('access_token');
}

function getRefreshToken() {
  return localStorage.getItem('refresh_token');
}

function setTokens(access, refresh) {
  if (access) localStorage.setItem('access_token', access);
  if (refresh) localStorage.setItem('refresh_token', refresh);
}

function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    });

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const data = await res.json();
    setTokens(data.access_token, null);
    return data.access_token;
  } catch {
    clearTokens();
    return null;
  }
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = getToken();

  const headers = { ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    let res = await fetch(url, { ...options, headers });

    if (res.status === 401 && token) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        res = await fetch(url, { ...options, headers });
      } else {
        return { data: null, error: 'Session expired. Please log in again.' };
      }
    }

    if (res.status === 204) {
      return { data: null, error: null };
    }

    const contentType = res.headers.get('content-type');
    let data = null;
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    }

    if (!res.ok) {
      const detail = data?.detail;
    const message =
        (typeof detail === 'string' ? detail : null) ||
        data?.message ||
        (typeof data === 'string' ? data : `Request failed with status ${res.status}`);
      return { data: null, error: message };
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Network error' };
  }
}

export function get(endpoint) {
  return request(endpoint, { method: 'GET' });
}

export function post(endpoint, body) {
  const options = { method: 'POST' };
  if (body instanceof FormData) {
    options.body = body;
  } else {
    options.body = JSON.stringify(body);
  }
  return request(endpoint, options);
}

export function put(endpoint, body) {
  return request(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function del(endpoint) {
  return request(endpoint, { method: 'DELETE' });
}

export { setTokens, clearTokens, getToken, BASE_URL };
