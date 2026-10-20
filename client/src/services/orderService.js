import { api } from './api.js';
export const orderService = {
  async create(payload) { const { data } = await api.post('/orders', payload); return data.data; },
  async get(id) { const { data } = await api.get(`/orders/${id}`); return data.data; },
  async mine() { const { data } = await api.get('/orders/mine'); return data.data; },
  async kitchen() { const { data } = await api.get('/orders/kitchen'); return data.data; },
  async waiter() { const { data } = await api.get('/orders/waiter'); return data.data; },
  async updateStatus(id, status, note = '') { const { data } = await api.patch(`/orders/${id}/status`, { status, note }); return data.data; },
  async cancel(id, reason = '') { const { data } = await api.post(`/orders/${id}/cancel`, { reason }); return data.data; },
};