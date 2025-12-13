// src/config.js
export const API_BASE = 'http://localhost:3000';

export const WS_BASE = 'ws://localhost:3000';

const config = {
  apiBase: API_BASE,
  wsBase: WS_BASE,
  pusher: {
    key: import.meta.env.VITE_PUSHER_KEY || 'your-pusher-key',
    cluster: import.meta.env.VITE_PUSHER_CLUSTER || 'ap2',
  }
};

export default config;
