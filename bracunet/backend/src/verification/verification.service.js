import { VerificationRequest } from './verification.model.js';
import { User } from '../users/user.model.js';
import { VerifiedUser } from '../users/verifiedUser.model.js';
import { createNotification, notificationTemplates } from '../notifications/notification.service.js';

export const verificationService = {
  // Submit a verification request
  async submitRequest(userId, requestData) {
    // Check if user already has a pending request
    const existingRequest = await VerificationRequest.findOne({
      user: userId,
      status: 'pending',
    });

    if (existingRequest) {
      throw new Error('You already have a pending verification request');
    }

    // Check if user is already verified
    const user = await User.findById(userId);
    if (user.isVerified) {
      throw new Error('Your account is already verified');
    }

    // Ensure request type matches user's registered role
    if (requestData.requestType !== user.role) {
      throw new Error(`You can only request verification for your registered role: ${user.role}`);
    }

    const request = await VerificationRequest.create({
      user: userId,
      ...requestData,
    });

    await request.populate('user', 'name email role');
    
    // Emit real-time event for new verification request
    if (global.io) {
      global.io.emit('verification_request_submitted', {
        requestId: request._id,
        userId: userId,
        userName: request.user.name,
        requestType: requestData.requestType,
        status: 'pending'
      });
    }
    
    // Send notification
    await createNotification({
      userId,
      type: 'verification_submitted',
      title: notificationTemplates.verification_submitted.title,
      message: notificationTemplates.verification_submitted.message,
      relatedId: request._id,
      relatedModel: 'Verification',
      link: '/my-verification-requests',
    });
    
    return request;
  },

  // Get all verification requests (admin only)
  async getAllRequests(filters = {}) {
    const query = {};
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    if (filters.requestType) {
      query.requestType = filters.requestType;
    }

    const requests = await VerificationRequest.find(query)
      .populate('user', 'name email role')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    return requests;
  },

  // Get user's own verification requests
  async getUserRequests(userId) {
    const requests = await VerificationRequest.find({ user: userId })
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    return requests;
  },

  // Approve verification request
  async approveRequest(requestId, adminId) {
    const request = await VerificationRequest.findById(requestId);
    
    if (!request) {
      throw new Error('Verification request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('This request has already been reviewed');
    }

    // Update the request
    request.status = 'approved';
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();
    await request.save();

    // Update the user
    const user = await User.findById(request.user);
    user.isVerified = true;
    user.verifiedBy = adminId;
    user.verifiedAt = new Date();
    user.verificationStatus = 'approved';
    
    // Update role if needed
    if (request.requestType !== user.role) {
      user.role = request.requestType;
    }
    
    // Update additional fields
    if (request.studentId) user.studentId = request.studentId;
    if (request.department) user.department = request.department;
    if (request.batch) user.batch = request.batch;
    if (request.graduationYear) user.graduationYear = request.graduationYear;
    if (request.officialEmail) user.officialEmail = request.officialEmail;
    
    await user.save();
    
    // Emit real-time events
    if (global.io) {
      // Notify the verified user
      global.io.to(`user-${request.user}`).emit('verification_status', { 
        verified: true, 
        role: user.role,
        status: 'approved'
      });
      // Broadcast to all admins/dashboards
      global.io.emit('user_verified', { 
        userId: request.user, 
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: true,
          verifiedAt: user.verifiedAt
        }
      });
    }
    
    // Send notification
    await createNotification({
      userId: request.user,
      type: 'verification_approved',
      title: notificationTemplates.verification_approved.title,
      message: notificationTemplates.verification_approved.message,
      relatedId: request._id,
      relatedModel: 'Verification',
      link: '/dashboard',
    });

    // Add to VerifiedUser collection
    const existingVerified = await VerifiedUser.findOne({ user: user._id });
    if (!existingVerified) {
      await VerifiedUser.create({
        user: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        batch: user.batch,
        graduationYear: user.graduationYear,
        officialEmail: user.officialEmail,
        verifiedBy: adminId,
        verifiedAt: new Date(),
        verificationRequestId: requestId,
      });
    }

    await request.populate('user', 'name email role isVerified');
    return request;
  },

  // Reject verification request
  async rejectRequest(requestId, adminId, reason) {
    const request = await VerificationRequest.findById(requestId);
    
    if (!request) {
      throw new Error('Verification request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('This request has already been reviewed');
    }

    request.status = 'rejected';
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();
    request.rejectionReason = reason;
    await request.save();

    // Update user verification status
    const user = await User.findById(request.user);
    user.verificationStatus = 'rejected';
    await user.save();

    // Emit real-time events
    if (global.io) {
      // Notify the user
      global.io.to(`user-${request.user}`).emit('verification_status', { 
        verified: false, 
        status: 'rejected',
        reason: reason || 'Your verification request was rejected'
      });
      // Broadcast to all admins/dashboards
      global.io.emit('verification_rejected', { 
        userId: request.user
      });
    }
    
    // Send notification
    await createNotification({
      userId: request.user,
      type: 'verification_rejected',
      title: notificationTemplates.verification_rejected.title,
      message: notificationTemplates.verification_rejected.message,
      relatedId: request._id,
      relatedModel: 'Verification',
      link: '/my-verification-requests',
    });

    await request.populate('user', 'name email role');
    return request;
  },

  // Get verification statistics
  async getStats() {
    const [pending, approved, rejected, totalUsers, verifiedUsers] = await Promise.all([
      VerificationRequest.countDocuments({ status: 'pending' }),
      VerificationRequest.countDocuments({ status: 'approved' }),
      VerificationRequest.countDocuments({ status: 'rejected' }),
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
    ]);

    return {
      pending,
      approved,
      rejected,
      totalUsers,
      verifiedUsers,
    };
  },
};
