// Vercel serverless entry point
import mongoose from 'mongoose';
import app from './src/index.js';
import { config } from './src/config/index.js';

// Connect to MongoDB on cold start
mongoose
  .connect(config.mongodb.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
  });

// Export for Vercel
export default app;


