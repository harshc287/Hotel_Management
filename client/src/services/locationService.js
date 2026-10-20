import { api } from './api.js';
export const locationService = {
  async startConsent(orderId) { const { data } = await api.post(`/location/sessions/${orderId}/start`); return data.data; },
  async stopConsent(orderId) { const { data } = await api.post(`/location/sessions/${orderId}/stop`); return data.data; },
  async updateLocation(orderId, lat, lng, accuracy) {
    const { data } = await api.post(`/location/sessions/${orderId}/update`, { lat, lng, accuracy, recordedAt: new Date().toISOString() });
    return data.data;
  }
};