import mongoose from 'mongoose';

const donationCampaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Campaign title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      enum: ['education', 'medical', 'community', 'emergency', 'research', 'other'],
      required: [true, 'Category is required'],
    },
    goalAmount: {
      type: Number,
      required: [true, 'Goal amount is required'],
      min: [1, 'Goal amount must be at least $1'],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    deadline: {
      type: Date,
      required: false,
    },
    image: {
      type: String, // Cloudinary URL
      default: null,
    },
    donorsCount: {
      type: Number,
      default: 0,
    },
    donations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donation',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Calculate progress percentage
donationCampaignSchema.virtual('progressPercentage').get(function () {
  return Math.min(100, Math.round((this.currentAmount / this.goalAmount) * 100));
});

donationCampaignSchema.set('toJSON', { virtuals: true });
donationCampaignSchema.set('toObject', { virtuals: true });

const donationSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DonationCampaign',
      required: true,
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Donation amount is required'],
      min: [1, 'Donation amount must be at least $1'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    message: {
      type: String,
      maxlength: [500, 'Message cannot exceed 500 characters'],
      default: '',
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    stripePaymentIntentId: {
      type: String,
      required: false,
    },
    stripeSessionId: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const DonationCampaign = mongoose.model('DonationCampaign', donationCampaignSchema);
export const Donation = mongoose.model('Donation', donationSchema);
