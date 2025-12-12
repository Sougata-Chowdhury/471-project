import mongoose from 'mongoose';

const verifiedUserSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['student', 'alumni', 'faculty', 'admin'],
      required: true,
    },
    studentId: String,
    department: String,
    batch: String,
    graduationYear: Number,
    company: String,
    officialEmail: String,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
    },
    verificationRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VerificationRequest',
    },
  },
  { timestamps: true }
);

export const VerifiedUser = mongoose.model('VerifiedUser', verifiedUserSchema);
