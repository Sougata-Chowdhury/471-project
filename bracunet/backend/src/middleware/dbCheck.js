import mongoose from 'mongoose';
import { config } from '../config/index.js';

// Ensure MongoDB connection is established before processing requests
export const ensureDbConnection = async (req, res, next) => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      return next();
    }

    // If connecting, wait a bit
    if (mongoose.connection.readyState === 2) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (mongoose.connection.readyState === 1) {
        return next();
      }
    }

    // If disconnected, try to connect
    if (mongoose.connection.readyState === 0) {
      console.log('🔄 Establishing MongoDB connection...');
      await mongoose.connect(config.mongodb.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ MongoDB connected');
      return next();
    }

    // If we get here, something is wrong
    console.error('❌ MongoDB connection state:', mongoose.connection.readyState);
    return res.status(503).json({ 
      message: 'Database connection unavailable',
      state: mongoose.connection.readyState 
    });
  } catch (error) {
    console.error('❌ Database connection error:', error);
    return res.status(503).json({ 
      message: 'Database connection failed',
      error: error.message 
    });
  }
};
