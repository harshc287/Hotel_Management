import { api } from './api.js';
export const authService = {
  async login(email, password) { const { data } = await api.post('/auth/login', { email, password }); return data.data; },
  async register(payload) { const { data } = await api.post('/auth/register', payload); return data.data; },
  async me() { const { data } = await api.get('/auth/me'); return data.data.user; },
  async logout() { await api.post('/auth/logout'); },
};