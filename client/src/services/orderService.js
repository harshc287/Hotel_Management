import api from './api';
export const paymentService = { createOrder: (orderId) => api.post('/payments/create-order', { orderId }), verify: (payload) => api.post('/payments/verify', payload) };
