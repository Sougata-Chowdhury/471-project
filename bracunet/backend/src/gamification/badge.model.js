import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: '🏆',
    },
    category: {
      type: String,
      enum: ['contribution', 'engagement', 'quality', 'skill', 'event', 'mentor'],
      required: true,
    },
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze',
    },
    requirement: {
      type: Number,
      required: true,
    },
    requirementType: {
      type: String,
      enum: ['forum_posts', 'forum_upvotes', 'resources_uploaded', 'events_attended', 
             'mentor_sessions', 'news_posts', 'login_streak', 'connections'],
      required: true,
    },
    points: {
      type: Number,
      default: 10,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Badge = mongoose.model('Badge', badgeSchema);
