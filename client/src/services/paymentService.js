import { api } from './api.js';
export const paymentService = {
  async createOrder(orderId) { const { data } = await api.post('/payments/create-order', { orderId }); return data.data; },
  async verify(payload) { const { data } = await api.post('/payments/verify', payload); return data.data; },
};