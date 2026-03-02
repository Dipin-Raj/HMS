import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// You can add interceptors here for things like
// attaching authentication tokens, error handling, etc.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Example: redirect to login if 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // You might want to clear local storage and redirect to login page
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
