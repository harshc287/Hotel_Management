import { api } from './api.js';
export const menuService = {
  async resolveTable(token) { const { data } = await api.get(`/tables/${token}`); return data.data; },
  async publicMenu(restaurantId) { const { data } = await api.get(`/menu/public?restaurantId=${restaurantId}`); return data.data; },
};