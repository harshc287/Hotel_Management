
import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rms_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Network error';

    return Promise.reject(
      Object.assign(new Error(message), {
        response: error.response,
      })
    );
  }
);
