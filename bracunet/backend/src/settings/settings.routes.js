import express from 'express';
import { User } from '../users/user.model.js';
import { verifyToken, protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import bcryptjs from 'bcryptjs';
import { 
  getNotificationPreferences, 
  updateNotificationPreferences, 
  getUserSettings 
} from './settings.controller.js';

const router = express.Router();

// Notification preferences
router.get('/notification-preferences', protect, getNotificationPreferences);
router.put('/notification-preferences', protect, updateNotificationPreferences);

// Get current user settings
router.get('/me/settings', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update user profile (name, department, etc.)
router.patch('/me/settings', verifyToken, async (req, res) => {
  try {
    const { name, department, batch, graduationYear, studentId, skills, goals, interests } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Update fields if provided
    if (name) user.name = name;
    if (department) user.department = department;
    if (batch) user.batch = batch;
    if (graduationYear) user.graduationYear = graduationYear;
    if (studentId) user.studentId = studentId;
    if (skills !== undefined) user.skills = skills;
    if (goals !== undefined) user.goals = goals;
    if (interests !== undefined) user.interests = interests;
    
    await user.save();
    
    res.json({ success: true, message: 'Profile updated successfully', user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update password
router.patch('/me/password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All password fields are required' });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    
    // Select password explicitly for verification
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check current password
    const isPasswordValid = await user.matchPassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Upload profile picture
router.post('/me/profile-picture', verifyToken, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Update profile picture URL (Cloudinary URL from multer)
    user.profilePicture = req.file.path;
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'Profile picture updated successfully',
      profilePicture: user.profilePicture,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Delete profile picture
router.delete('/me/profile-picture', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.profilePicture = null;
    await user.save();
    
    res.json({ success: true, message: 'Profile picture removed successfully', user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get BRACU options (skills, goals, interests)
router.get('/options', async (req, res) => {
  try {
    const { BRACU_OPTIONS, getAllSkills } = await import('../config/bracuOptions.js');
    
    res.json({
      success: true,
      options: {
        skills: getAllSkills(),
        goals: BRACU_OPTIONS.goals,
        interests: BRACU_OPTIONS.interests,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

export default router;
