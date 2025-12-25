import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import { initializeSocket } from './config/socket.js';
import authRoutes from './auth/auth.routes.js';
import userRoutes from './users/user.routes.js';
import verificationRoutes from './verification/verification.routes.js';
import verifiedUserRoutes from './users/verifiedUser.routes.js';
import newsRoutes from "./newsfeed/news.routes.js";
import eventRoutes from "./events/event.routes.js";
import notificationRoutes from "./notifications/notification.routes.js";

import gamificationRoutes from './gamification/gamification.routes.js';
import settingsRoutes from './settings/settings.routes.js';
import resourceRoutes from './resources/resource.routes.js';
import forumRoutes from './forums/forum.routes.js';
import groupRoutes from './forums/group.routes.js';
import { joinGroup, getGroupDetails } from './forums/group.controller.js';
import { protect } from './middleware/auth.js';
import groupMessageRoutes from './forums/groupMessage.routes.js';
import { seedBadges } from './gamification/gamification.service.js';
import mentorshipRoutes from "./mentorship/mentorship.routes.js";
import donationRoutes from './donations/donation.routes.js';
import careerRoutes from './career/career.routes.js';
import recommendationRoutes from './career/recommendation.routes.js';
import analyticsRoutes from './analytics/analytics.routes.js';
import interestGroupRoutes from './interestGroups/interestGroup.routes.js';

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
app.use("/api/events", eventRoutes);
app.use("/api/notifications", notificationRoutes);
// Serve uploaded files - skip in serverless
if (!process.env.VERCEL) {
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
}
app.use("/api/mentorship", mentorshipRoutes);

// Ignore favicon and static file requests in serverless
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/favicon.png', (req, res) => res.status(204).end());

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    message: 'Server is running',
    env: process.env.NODE_ENV,
    mongooseState: mongoose.connection.readyState,
    isVercel: !!process.env.VERCEL
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: '✅ BracuNet Backend API is running on Vercel!',
    status: 'online',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/verified-users', verifiedUserRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/forums', forumRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/group-messages', groupMessageRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/interest-groups', interestGroupRoutes);

// Ensure join endpoint is also available directly on the app in case router mounting fails
app.post('/api/groups/:id/join', protect, joinGroup);
app.get('/api/groups/:id/details', protect, getGroupDetails);

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

// 404 Not Found handler
app.use((req, res, next) => {
  res.status(404).json({ message: '❌ Route not found', path: req.path });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  res.status(err.status || 500).json({ 
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// For local development only
if (!process.env.VERCEL) {
  mongoose
    .connect(config.mongodb.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('✅ Connected to MongoDB');
      
      // Seed badges after connection
      seedBadges().catch(err => console.error('Badge seeding error:', err));
      
      const server = app.listen(config.server.port, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${config.server.port}`);
        console.log(`✓ Environment: ${config.server.env}`);
        console.log(`✓ CORS Origin: ${config.cors.origin}`);
      });

      // Initialize Socket.IO (only in local mode)
      initializeSocket(server, config);

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
    })
    .catch((error) => {
      console.error('❌ MongoDB connection error:', error);
      process.exit(1);
    });
}

// Export for Vercel
export default app;
