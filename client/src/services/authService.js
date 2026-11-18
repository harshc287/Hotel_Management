
import { api } from './api.js';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    });

    return response.data.data;
  },

  async register(payload) {
    const response = await api.post('/auth/register', payload);

    return response.data.data;
  },

  async me() {
    const response = await api.get('/auth/me');

    return response.data.data.user;
  },

  async logout() {
    await api.post('/auth/logout');
  },

  async refresh() {
    const response = await api.post('/auth/refresh');

    return response.data.data;
  },
};
