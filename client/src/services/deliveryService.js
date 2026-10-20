import { api } from './api.js';
export const deliveryService = {
  async assignments() { const { data } = await api.get('/delivery/assignments'); return data.data; },
  async updateStatus(id, status) { const { data } = await api.patch(`/delivery/assignments/${id}/status`, { status }); return data.data; },
};