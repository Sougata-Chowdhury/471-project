import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import authRoutes from './auth/auth.routes.js';
import userRoutes from './users/user.routes.js';
import verificationRoutes from './verification/verification.routes.js';
import verifiedUserRoutes from './users/verifiedUser.routes.js';
import newsRoutes from "./newsfeed/news.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
  })
);
app.use("/api/news", newsRoutes);
// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/verification', verificationRoutes);

// Dashboard routes (role-based)
app.get('/api/dashboard/student', (req, res) => {
  res.json({ message: 'Student Dashboard', role: 'student' });
});

app.get('/api/dashboard/alumni', (req, res) => {
  res.json({ message: 'Alumni Dashboard', role: 'alumni' });
});

app.get('/api/dashboard/faculty', (req, res) => {
  res.json({ message: 'Faculty Dashboard', role: 'faculty' });
});

app.get('/api/dashboard/admin', (req, res) => {
  res.json({ message: 'Admin Dashboard', role: 'admin' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

// Connect to MongoDB and start server
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('✓ MongoDB connected');
    
    // Seed badges on startup
    await seedBadges();

    const server = app.listen(config.server.port, () => {
      console.log(`✓ Server running on port ${config.server.port}`);
      console.log(`✓ Environment: ${config.server.env}`);
      console.log(`✓ CORS Origin: ${config.cors.origin}`);
      console.log(`✓ Server is listening and ready to accept connections`);
    });

    server.on('error', (error) => {
      console.error('✗ Server error:', error.message);
      process.exit(1);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, closing server...');
      server.close(() => {
        console.log('Server closed');
        mongoose.connection.close(false, () => {
          console.log('MongoDB connection closed');
          process.exit(0);
        });
      });
    });
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

connectDB();

export default app;
