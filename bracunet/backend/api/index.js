import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from '../src/index.js';
import { config } from '../src/config/index.js';

// Load environment variables
dotenv.config();

// MongoDB connection for serverless
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  try {
    const conn = await mongoose.connect(config.mongodb.uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    cachedDb = conn;
    console.log('MongoDB connected in serverless');
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Serverless function handler
export default async function handler(req, res) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Handle the request with Express app
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
}
