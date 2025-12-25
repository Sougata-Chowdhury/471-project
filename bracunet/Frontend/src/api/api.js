// src/api/api.js
import axios from "axios";
import { API_BASE } from '../config.js';

const API = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
});

export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

export default API;
