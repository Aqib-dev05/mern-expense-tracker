import api, { tokenStore } from './api.js';

export const register = async (payload) => {
  const { data } = await api.post('/auth/register', payload);
  tokenStore.set(data.token);
  return data.user;
};
export const login = async (payload) => {
  const { data } = await api.post('/auth/login', payload);
  tokenStore.set(data.token);
  return data.user;
};
export const logout = async () => {
  try { await api.post('/auth/logout'); } finally { tokenStore.clear(); }
};
export const getMe = async () => (await api.get('/auth/me')).data.user;
export const updateProfile = async (payload) => (await api.patch('/auth/me', payload)).data.user;
