import axios from 'axios';

const TOKEN_KEY = 'et_token';
export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 20000,
});

let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const AUTH_PATHS = ['/auth/login', '/auth/register'];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    // Blob responses (CSV export) carry JSON errors as a Blob
    if (error.response?.data instanceof Blob) {
      try { error.response.data = JSON.parse(await error.response.data.text()); } catch { /* keep as is */ }
    }
    const status = error.response?.status;
    const isAuthCall = AUTH_PATHS.some((p) => error.config?.url?.startsWith(p));
    if (status === 401 && !isAuthCall && tokenStore.get()) {
      tokenStore.clear();
      onUnauthorized?.(); // session expired / invalid: drop to the login screen
    }
    return Promise.reject(normalizeError(error));
  }
);

export function normalizeError(error) {
  let message = error.response?.data?.message;
  if (!message) {
    if (error.code === 'ECONNABORTED') message = 'The request timed out. Please try again.';
    else if (error.request && !error.response) message = 'Cannot reach the server. Check your connection and try again.';
    else message = 'Something went wrong. Please try again.';
  }
  const err = new Error(message);
  err.status = error.response?.status;
  err.details = error.response?.data?.details;
  return err;
}

/** Drops empty values so they are not sent as blank query params. */
export const cleanParams = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined));

export default api;
