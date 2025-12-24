import { User } from '../users/user.model.js';

/**
 * Get user notification preferences
 */
export const getNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notificationPreferences');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ 
      success: true, 
      preferences: user.notificationPreferences || {} 
    });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({ success: false, message: 'Failed to get preferences' });
  }
};

/**
 * Update user notification preferences
 */
export const updateNotificationPreferences = async (req, res) => {
  try {
    const { preferences } = req.body;
    
    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid preferences object' });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Merge new preferences with existing ones
    user.notificationPreferences = {
      ...user.notificationPreferences,
      ...preferences
    };

    await user.save();

    res.status(200).json({ 
      success: true, 
      message: 'Preferences updated successfully',
      preferences: user.notificationPreferences 
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ success: false, message: 'Failed to update preferences' });
  }
};

/**
 * Get all user settings
 */
export const getUserSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notificationPreferences profilePicture email name role');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ 
      success: true, 
      settings: {
        notificationPreferences: user.notificationPreferences || {},
        profile: {
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Get user settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to get settings' });
  }
};
