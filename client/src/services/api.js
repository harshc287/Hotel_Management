
// import axios from 'axios';
// const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api', timeout: 15000 });
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('rms_token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });
// export default api;

import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);