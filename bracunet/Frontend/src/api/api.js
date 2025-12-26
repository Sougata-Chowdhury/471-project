// src/api/api.js
import axios from "axios";
import { API_BASE } from '../config.js';

const API = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
});

// Request interceptor to automatically add token from localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only logout on 401 if it's actually an auth error, not a validation error
    if (error.response?.status === 401 && error.response?.data?.message?.toLowerCase().includes('token')) {
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optionally redirect to login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete API.defaults.headers.common["Authorization"];
  }
};

export default API;
