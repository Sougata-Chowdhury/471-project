import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import * as gamificationService from './gamification.service.js';

const router = express.Router();

// Get current user's activity and badges
router.get('/my-activity', verifyToken, async (req, res) => {
  try {
    const activity = await gamificationService.getUserActivity(req.user.id);
    const rank = await gamificationService.getUserRank(req.user.id);
    res.json({ success: true, activity, rank });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const timeframe = req.query.timeframe || 'all'; // all, weekly, monthly
    const leaderboard = await gamificationService.getLeaderboard(limit, timeframe);
    res.json({ success: true, leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get all badges
router.get('/badges', async (req, res) => {
  try {
    const badges = await gamificationService.getAllBadges();
    res.json({ success: true, badges });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get badges by category
router.get('/badges/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const badges = await gamificationService.getBadgesByCategory(category);
    res.json({ success: true, badges });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Manually track activity (for testing or admin)
router.post('/track', verifyToken, async (req, res) => {
  try {
    const { activityType, amount, points } = req.body;
    const activity = await gamificationService.trackActivity(req.user.id, activityType, amount, points);
    const newBadges = await gamificationService.checkAndAwardBadges(req.user.id);
    res.json({ success: true, activity, newBadges });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

export default router;
