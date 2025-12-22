import { Badge } from './badge.model.js';
import { UserActivity } from './userActivity.model.js';
import { User } from '../users/user.model.js';

// Create default badges
export const seedBadges = async () => {
  const badges = [
    // Forum Contribution Badges
    { name: 'Forum Starter', description: 'Post 5 discussion threads', icon: '💬', category: 'contribution', tier: 'bronze', requirement: 5, requirementType: 'forum_posts', points: 10 },
    { name: 'Active Discusser', description: 'Post 15 discussion threads', icon: '💬', category: 'contribution', tier: 'silver', requirement: 15, requirementType: 'forum_posts', points: 25 },
    { name: 'Forum Leader', description: 'Post 50 discussion threads', icon: '💬', category: 'contribution', tier: 'gold', requirement: 50, requirementType: 'forum_posts', points: 50 },
    
    // Upvote Badges
    { name: 'Helpful Helper', description: 'Get 10 upvotes on replies', icon: '👍', category: 'quality', tier: 'bronze', requirement: 10, requirementType: 'forum_upvotes', points: 15 },
    { name: 'Community Expert', description: 'Get 50 upvotes on replies', icon: '⭐', category: 'quality', tier: 'silver', requirement: 50, requirementType: 'forum_upvotes', points: 30 },
    { name: 'Master Advisor', description: 'Get 200 upvotes on replies', icon: '🌟', category: 'quality', tier: 'gold', requirement: 200, requirementType: 'forum_upvotes', points: 75 },
    
    // Resource Badges
    { name: 'Resource Contributor', description: 'Upload 5 quality resources', icon: '📚', category: 'contribution', tier: 'bronze', requirement: 5, requirementType: 'resources_uploaded', points: 25 },
    { name: 'Resource Curator', description: 'Upload 20 quality resources', icon: '📖', category: 'contribution', tier: 'silver', requirement: 20, requirementType: 'resources_uploaded', points: 50 },
    { name: 'Knowledge Keeper', description: 'Upload 100 quality resources', icon: '🎓', category: 'contribution', tier: 'gold', requirement: 100, requirementType: 'resources_uploaded', points: 100 },
    
    // Event Badges
    { name: 'Event Attendee', description: 'Attend 3 events', icon: '🎉', category: 'event', tier: 'bronze', requirement: 3, requirementType: 'events_attended', points: 30 },
    { name: 'Active Participant', description: 'Attend 10 events', icon: '🎪', category: 'event', tier: 'silver', requirement: 10, requirementType: 'events_attended', points: 50 },
    { name: 'Event Champion', description: 'Attend 25 events', icon: '🏅', category: 'event', tier: 'gold', requirement: 25, requirementType: 'events_attended', points: 100 },
    
    // Mentor Badges
    { name: 'Guiding Hand', description: 'Complete 5 mentor sessions', icon: '🤝', category: 'mentor', tier: 'bronze', requirement: 5, requirementType: 'mentor_sessions', points: 50 },
    { name: 'Mentor', description: 'Complete 15 mentor sessions', icon: '👨‍🏫', category: 'mentor', tier: 'silver', requirement: 15, requirementType: 'mentor_sessions', points: 100 },
    { name: 'Master Mentor', description: 'Complete 50 mentor sessions', icon: '🎖️', category: 'mentor', tier: 'gold', requirement: 50, requirementType: 'mentor_sessions', points: 200 },
    
    // News/Post Badges
    { name: 'News Contributor', description: 'Post 5 news articles', icon: '📰', category: 'contribution', tier: 'bronze', requirement: 5, requirementType: 'news_posts', points: 10 },
    { name: 'News Reporter', description: 'Post 20 news articles', icon: '📡', category: 'contribution', tier: 'silver', requirement: 20, requirementType: 'news_posts', points: 25 },
    { name: 'News Anchor', description: 'Post 50 news articles', icon: '📺', category: 'contribution', tier: 'gold', requirement: 50, requirementType: 'news_posts', points: 50 },
    
    // Streak Badges
    { name: 'Consistent', description: 'Maintain 7-day login streak', icon: '🔥', category: 'engagement', tier: 'bronze', requirement: 7, requirementType: 'login_streak', points: 20 },
    { name: 'Dedicated', description: 'Maintain 30-day login streak', icon: '🔥', category: 'engagement', tier: 'silver', requirement: 30, requirementType: 'login_streak', points: 50 },
    { name: 'Unstoppable', description: 'Maintain 90-day login streak', icon: '🔥', category: 'engagement', tier: 'gold', requirement: 90, requirementType: 'login_streak', points: 100 },
    
    // Social Badges
    { name: 'Social Butterfly', description: 'Connect with 10 members', icon: '🦋', category: 'engagement', tier: 'bronze', requirement: 10, requirementType: 'connections', points: 15 },
    { name: 'Networker', description: 'Connect with 25 members', icon: '🌐', category: 'engagement', tier: 'silver', requirement: 25, requirementType: 'connections', points: 30 },
    { name: 'Community Builder', description: 'Connect with 50 members', icon: '🏗️', category: 'engagement', tier: 'gold', requirement: 50, requirementType: 'connections', points: 75 },
  ];

  try {
    for (const badge of badges) {
      await Badge.findOneAndUpdate(
        { name: badge.name },
        badge,
        { upsert: true, new: true }
      );
    }
    console.log('✓ Badges seeded successfully');
  } catch (error) {
    console.error('✗ Error seeding badges:', error);
  }
};

// Get or create user activity
export const getUserActivity = async (userId) => {
  let activity = await UserActivity.findOne({ user: userId }).populate('badges.badge');
  if (!activity) {
    activity = await UserActivity.create({ user: userId });
  }
  return activity;
};

// Track activity and award points
export const trackActivity = async (userId, activityType, amount = 1, points = 0) => {
  try {
    const activity = await getUserActivity(userId);
    
    // Update activity counter
    if (activity[activityType] !== undefined) {
      activity[activityType] += amount;
    }
    
    // Add points
    activity.addPoints(points);
    
    // Update streak
    activity.updateStreak();
    
    await activity.save();
    
    // Check for badge eligibility
    await checkAndAwardBadges(userId);
    
    // Emit real-time event for leaderboard update
    if (global.io && points > 0) {
      global.io.emit('leaderboard_update', {
        userId,
        activityType,
        points,
        totalPoints: activity.totalPoints
      });
    }
    
    return activity;
  } catch (error) {
    console.error('Error tracking activity:', error);
    throw error;
  }
};

// Check and award badges based on activity
export const checkAndAwardBadges = async (userId) => {
  try {
    const activity = await getUserActivity(userId);
    const allBadges = await Badge.find({ isActive: true });
    
    const newBadges = [];
    
    for (const badge of allBadges) {
      const hasEarned = activity.badges.some(b => b.badge._id.toString() === badge._id.toString());
      if (hasEarned) continue;
      
      let meetsRequirement = false;
      
      switch (badge.requirementType) {
        case 'forum_posts':
          meetsRequirement = activity.forumPosts >= badge.requirement;
          break;
        case 'forum_upvotes':
          meetsRequirement = activity.forumUpvotes >= badge.requirement;
          break;
        case 'resources_uploaded':
          meetsRequirement = activity.resourcesUploaded >= badge.requirement;
          break;
        case 'events_attended':
          meetsRequirement = activity.eventsAttended >= badge.requirement;
          break;
        case 'mentor_sessions':
          meetsRequirement = activity.mentorSessions >= badge.requirement;
          break;
        case 'news_posts':
          meetsRequirement = activity.newsPosts >= badge.requirement;
          break;
        case 'login_streak':
          meetsRequirement = activity.currentStreak >= badge.requirement;
          break;
        case 'connections':
          meetsRequirement = activity.connections >= badge.requirement;
          break;
      }
      
      if (meetsRequirement) {
        const added = activity.addBadge(badge._id);
        if (added) {
          activity.addPoints(badge.points);
          newBadges.push(badge);
        }
      }
    }
    
    if (newBadges.length > 0) {
      await activity.save();
    }
    
    return newBadges;
  } catch (error) {
    console.error('Error checking badges:', error);
    throw error;
  }
};

// Get leaderboard
export const getLeaderboard = async (limit = 50, timeframe = 'all') => {
  try {
    let query = {};
    
    // If timeframe is weekly or monthly, filter by recent activity
    if (timeframe === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query.updatedAt = { $gte: weekAgo };
    } else if (timeframe === 'monthly') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      query.updatedAt = { $gte: monthAgo };
    }
    
    const leaderboard = await UserActivity.find(query)
      .sort({ totalPoints: -1, level: -1 })
      .limit(limit)
      .populate('user', 'name email role profilePicture')
      .populate('badges.badge');
    
    return leaderboard;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
};

// Get user rank
export const getUserRank = async (userId) => {
  try {
    const userActivity = await getUserActivity(userId);
    const rank = await UserActivity.countDocuments({
      totalPoints: { $gt: userActivity.totalPoints }
    });
    
    return rank + 1;
  } catch (error) {
    console.error('Error getting user rank:', error);
    throw error;
  }
};

// Get badges by category
export const getBadgesByCategory = async (category) => {
  try {
    return await Badge.find({ category, isActive: true }).sort({ requirement: 1 });
  } catch (error) {
    console.error('Error getting badges by category:', error);
    throw error;
  }
};

// Get all badges
export const getAllBadges = async () => {
  try {
    return await Badge.find({ isActive: true }).sort({ category: 1, requirement: 1 });
  } catch (error) {
    console.error('Error getting all badges:', error);
    throw error;
  }
};
