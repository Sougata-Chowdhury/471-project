import express from 'express';
import * as authService from './auth.service.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', authService.register);
router.post('/login', authService.login);

// Protected routes
router.post('/logout', verifyToken, authService.logout);
router.get('/me', verifyToken, authService.getCurrentUser);

export default router;
