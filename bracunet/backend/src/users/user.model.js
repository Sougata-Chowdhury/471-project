import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['student', 'alumni', 'faculty', 'admin'],
      default: 'student',
    },
    skills: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    mentorshipGoals: {
      type: [String],
      default: [],
    },
    profilePicture: {
      type: String,
      default: null,
    },
    studentId: String,
    department: String,
    batch: String,
    graduationYear: Number,
    company: String,
    officialEmail: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: Date,
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    notificationPreferences: {
      account: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      mentions: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      groups: { type: Boolean, default: true },
      events: { type: Boolean, default: true },
      resources: { type: Boolean, default: true },
      donations: { type: Boolean, default: true },
      career: { type: Boolean, default: true },
      gamification: { type: Boolean, default: true },
      news: { type: Boolean, default: true },
      admin: { type: Boolean, default: true },
      mentorship: { type: Boolean, default: true },
      system: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: false },
      pushNotifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

// Remove password from response
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = mongoose.model('User', userSchema);
