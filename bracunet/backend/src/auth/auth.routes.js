import express from 'express';
import * as authService from './auth.service.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', authService.register);
router.post('/login', authService.login);
router.post('/logout', authService.logout); // Logout should be public - clears cookie regardless of token validity

// Protected routes
router.get('/me', verifyToken, authService.getCurrentUser);

export default router;
