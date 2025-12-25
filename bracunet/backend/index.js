// Vercel serverless entry point
import app, { connectDB } from './src/index.js';

// Ensure DB connection before handling requests
let dbConnected = false;

export default async function handler(req, res) {
  // Connect to DB on first request (cold start)
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
    } catch (error) {
      console.error('DB connection failed:', error);
      // Continue anyway - some routes don't need DB
    }
  }
  
  // Handle the request
  return app(req, res);
}


