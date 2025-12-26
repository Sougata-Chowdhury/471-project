import express from 'express';
import { verificationService } from './verification.service.js';
import { protect, authorize } from '../middleware/auth.js';
import cloudinaryUpload from '../middleware/upload.js';
import path from 'path';
import { sanitizeError } from '../utils/errorHandler.js';

const router = express.Router();

// Submit verification request (authenticated users) - with file upload
router.post('/request', protect, (req, res, next) => {
  cloudinaryUpload.single('proofDocument')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed',
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('File uploaded:', req.file);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Proof document is required',
      });
    }

    // Store Cloudinary URL (accessible from anywhere)
    const requestData = {
      ...req.body,
      proofDocument: req.file.path, // Cloudinary URL
    };

    console.log('Creating verification request with data:', requestData);

    const request = await verificationService.submitRequest(
      req.user._id,
      requestData
    );

    res.status(201).json({
      success: true,
      message: 'Verification request submitted successfully',
      data: request,
    });
  } catch (error) {
    console.error('Verification request error:', error);
    const sanitized = sanitizeError(error, process.env.NODE_ENV === 'development');
    res.status(400).json({
      success: false,
      ...sanitized
    });
  }
});

// Get user''s own verification requests
router.get('/my-requests', protect, async (req, res) => {
  try {
    const requests = await verificationService.getUserRequests(req.user._id);

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error('Error fetching user requests:', error);
    const sanitized = sanitizeError(error, process.env.NODE_ENV === 'development');
    res.status(400).json({
      success: false,
      ...sanitized
    });
  }
});

// Get all verification requests (admin only)
router.get('/requests', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, requestType } = req.query;
    const requests = await verificationService.getAllRequests({
      status,
      requestType,
    });

    res.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error('Error fetching all requests:', error);
    const sanitized = sanitizeError(error, process.env.NODE_ENV === 'development');
    res.status(400).json({
      success: false,
      ...sanitized
    });
  }
});

// Approve verification request (admin only)
router.put('/requests/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const request = await verificationService.approveRequest(
      req.params.id,
      req.user._id
    );

    res.json({
      success: true,
      message: 'Verification request approved successfully',
      data: request,
    });
  } catch (error) {
    console.error('Error approving request:', error);
    const sanitized = sanitizeError(error, process.env.NODE_ENV === 'development');
    res.status(400).json({
      success: false,
      ...sanitized
    });
  }
});

// Reject verification request (admin only)
router.put('/requests/:id/reject', protect, authorize('admin'), async (req, res) => {
  try {
    const { reason } = req.body;
    const request = await verificationService.rejectRequest(
      req.params.id,
      req.user._id,
      reason
    );

    res.json({
      success: true,
      message: 'Verification request rejected',
      data: request,
    });
  } catch (error) {
    console.error('Error rejecting request:', error);
    const sanitized = sanitizeError(error, process.env.NODE_ENV === 'development');
    res.status(400).json({
      success: false,
      ...sanitized
    });
  }
});

// Get verification statistics (admin only)
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const stats = await verificationService.getStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    const sanitized = sanitizeError(error, process.env.NODE_ENV === 'development');
    res.status(400).json({
      success: false,
      ...sanitized
    });
  }
});

export default router;
