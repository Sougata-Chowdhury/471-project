import mongoose from 'mongoose';

const verificationRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestType: {
      type: String,
      enum: ['student', 'alumni', 'faculty'],
      required: true,
    },
    studentId: {
      type: String,
      required: function() {
        return this.requestType === 'student' || this.requestType === 'alumni';
      },
    },
    department: {
      type: String,
      required: true,
    },
    batch: {
      type: String,
      required: function() {
        return this.requestType === 'student' || this.requestType === 'alumni';
      },
    },
    graduationYear: {
      type: Number,
      required: function() {
        return this.requestType === 'alumni';
      },
    },
    officialEmail: {
      type: String,
      required: function() {
        return this.requestType === 'faculty';
      },
    },
    additionalInfo: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
    rejectionReason: String,
  },
  { timestamps: true }
);

export const VerificationRequest = mongoose.model('VerificationRequest', verificationRequestSchema);
