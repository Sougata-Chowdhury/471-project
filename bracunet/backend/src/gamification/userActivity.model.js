import mongoose from 'mongoose';

const userActivitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Activity counters
    forumPosts: {
      type: Number,
      default: 0,
    },
    forumUpvotes: {
      type: Number,
      default: 0,
    },
    resourcesUploaded: {
      type: Number,
      default: 0,
    },
    eventsAttended: {
      type: Number,
      default: 0,
    },
    mentorSessions: {
      type: Number,
      default: 0,
    },
    newsPosts: {
      type: Number,
      default: 0,
    },
    connections: {
      type: Number,
      default: 0,
    },
    // Points and level
    totalPoints: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    // Badges earned
    badges: [{
      badge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge',
      },
      earnedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    // Streak tracking
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Method to add points
userActivitySchema.methods.addPoints = function(points) {
  this.totalPoints += points;
  // Level up every 100 points
  this.level = Math.floor(this.totalPoints / 100) + 1;
};

// Method to update streak
userActivitySchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastActive = new Date(this.lastActiveDate);
  lastActive.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) {
    // Same day, no change
    return;
  } else if (daysDiff === 1) {
    // Consecutive day
    this.currentStreak += 1;
    if (this.currentStreak > this.longestStreak) {
      this.longestStreak = this.currentStreak;
    }
  } else {
    // Streak broken
    this.currentStreak = 1;
  }
  
  this.lastActiveDate = new Date();
};

// Method to add badge
userActivitySchema.methods.addBadge = function(badgeId) {
  const hasBadge = this.badges.some(b => b.badge.toString() === badgeId.toString());
  if (!hasBadge) {
    this.badges.push({ badge: badgeId, earnedAt: new Date() });
    return true;
  }
  return false;
};

export const UserActivity = mongoose.model('UserActivity', userActivitySchema);
