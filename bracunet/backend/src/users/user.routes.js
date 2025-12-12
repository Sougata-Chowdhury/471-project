import express from 'express';
import { User } from './user.model.js';
import { verifyToken, authorize } from '../middleware/auth.js';
import { VerificationRequest } from '../verification/verification.model.js';
import { VerifiedUser } from './verifiedUser.model.js';
import News from '../newsfeed/news.model.js';

const router = express.Router();

// Get all users for admin (admin only)
router.get('/admin/all', verifyToken, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get all users (admin only)
router.get('/', verifyToken, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user by ID (admin or self)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.toJSON());
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user by ID (admin only) - cascades to all related data
router.delete('/:id', verifyToken, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the user first
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete all related data
    await Promise.all([
      // Delete verification requests by this user
      VerificationRequest.deleteMany({ user: id }),
      // Delete verified user record
      VerifiedUser.deleteMany({ user: id }),
      // Delete news posts created by this user
      News.deleteMany({ createdBy: id }),
      // Delete the user
      User.findByIdAndDelete(id)
    ]);

    res.json({ 
      success: true, 
      message: `User ${user.name} and all associated data have been deleted successfully` 
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

export default router;
