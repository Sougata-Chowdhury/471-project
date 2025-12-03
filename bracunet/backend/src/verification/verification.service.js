import { VerificationRequest } from './verification.model.js';
import { User } from '../users/user.model.js';

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

    const request = await VerificationRequest.create({
      user: userId,
      ...requestData,
    });

    await request.populate('user', 'name email role');
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
