import dotenv from 'dotenv';

dotenv.config();

export const config = {
  mongodb: {
    uri: process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/bracunet',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_key',
    expiresIn: process.env.JWT_EXPIRE || '7d',
  },
  server: {
    port: parseInt(process.env.PORT) || 3000,
    env: process.env.NODE_ENV || 'development',
  },
  cors: {
    // Default to the frontend dev server port (3001) to avoid CORS issues during local development
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'dg0xhxxla',
    apiKey: process.env.CLOUDINARY_API_KEY || '917816188474383',
    apiSecret: process.env.CLOUDINARY_API_SECRET || 'hK3S3BSxqK1d4x6kcLc4jXG89EM',
  },

  daily: {
    apiKey: process.env.DAILY_API_KEY || '',
    apiBase: process.env.DAILY_API_BASE || 'https://api.daily.co/v1',

  pusher: {
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER || 'ap2',

  },
  }}
