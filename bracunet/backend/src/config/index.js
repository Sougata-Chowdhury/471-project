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
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
};
