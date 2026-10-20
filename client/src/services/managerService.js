import { api } from './api.js';
export const managerService = {
  async dashboard() { const { data } = await api.get('/manager/dashboard'); return data.data; },
  async reports(from, to) { const { data } = await api.get(`/manager/reports?from=${from}&to=${to}`); return data.data; },
  async allOrders(page = 1, status = '', search = '') { const { data } = await api.get(`/manager/orders?page=${page}&status=${status}&search=${search}`); return data.data; },
};