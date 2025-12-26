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
    // Support comma-separated origins or use function for wildcard matching
    origin: function(origin, callback) {
      const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3001,https://bracu-net.vercel.app')
        .split(',')
        .map((o) => o.trim());
      
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      // Check if origin matches any allowed origin or is a Vercel deployment
      if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
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
  },

  pusher: {
    appId: process.env.PUSHER_APP_ID || '',
    key: process.env.PUSHER_KEY || '',
    secret: process.env.PUSHER_SECRET || '',
    cluster: process.env.PUSHER_CLUSTER || 'ap2',
  },
  supabase: {
    url: process.env.SUPABASE_URL || 'https://zkxkzwqqqjywuuxgbxzz.supabase.co',
    key: process.env.SUPABASE_KEY || '',
    bucketName: process.env.SUPABASE_BUCKET_NAME || '471 Project',
  },
};
