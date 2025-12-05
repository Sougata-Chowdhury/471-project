import { Router } from 'express';
import { VerifiedUser } from './verifiedUser.model.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/verified-users
 * Get all verified users (admin only or public view with limited info)
 */
router.get('/', async (req, res) => {
  try {
    const { role, department, batch } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (department) filter.department = department;
    if (batch) filter.batch = batch;

    const verifiedUsers = await VerifiedUser.find(filter)
      .populate('user', 'name email')
      .populate('verifiedBy', 'name')
      .sort({ verifiedAt: -1 });

    res.json({
      success: true,
      count: verifiedUsers.length,
      users: verifiedUsers,
    });
  } catch (error) {
    console.error('Get verified users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch verified users',
    });
  }
});

/**
 * GET /api/verified-users/:id
 * Get single verified user details
 */
router.get('/:id', async (req, res) => {
  try {
    const verifiedUser = await VerifiedUser.findById(req.params.id)
      .populate('user', 'name email role')
      .populate('verifiedBy', 'name email')
      .populate('verificationRequestId');

    if (!verifiedUser) {
      return res.status(404).json({
        success: false,
        message: 'Verified user not found',
      });
    }

    res.json({
      success: true,
      user: verifiedUser,
    });
  } catch (error) {
    console.error('Get verified user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch verified user',
    });
  }
});

/**
 * GET /api/verified-users/stats
 * Get statistics about verified users (admin only)
 */
router.get('/admin/stats', verifyToken, authorize('admin'), async (req, res) => {
  try {
    const [total, students, alumni, faculty] = await Promise.all([
      VerifiedUser.countDocuments(),
      VerifiedUser.countDocuments({ role: 'student' }),
      VerifiedUser.countDocuments({ role: 'alumni' }),
      VerifiedUser.countDocuments({ role: 'faculty' }),
    ]);

    res.json({
      success: true,
      stats: {
        total,
        students,
        alumni,
        faculty,
      },
    });
  } catch (error) {
    console.error('Get verified users stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
    });
  }
});

/**
 * DELETE /api/verified-users/:id
 * Remove from verified users (admin only, also updates main User record)
 */
router.delete('/:id', verifyToken, authorize('admin'), async (req, res) => {
  try {
    const verifiedUser = await VerifiedUser.findById(req.params.id);
    
    if (!verifiedUser) {
      return res.status(404).json({
        success: false,
        message: 'Verified user not found',
      });
    }

    // Update main User record
    const { User } = await import('./user.model.js');
    await User.findByIdAndUpdate(verifiedUser.user, {
      isVerified: false,
      verificationStatus: 'pending',
    });

    // Remove from VerifiedUser collection
    await VerifiedUser.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User removed from verified list',
    });
  } catch (error) {
    console.error('Remove verified user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove verified user',
    });
  }
});

export default router;
