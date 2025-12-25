// src/config.js
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export const WS_BASE = import.meta.env.VITE_WS_BASE || 'ws://localhost:3000';

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

const config = {
  apiBase: API_BASE,
  wsBase: WS_BASE,
  socketUrl: SOCKET_URL,
  pusher: {
    key: import.meta.env.VITE_PUSHER_KEY || 'c581a5dcd7d22c9200e0',
    cluster: import.meta.env.VITE_PUSHER_CLUSTER || 'ap2',
  }
};

export default config;
