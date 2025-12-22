import Notification from "./notification.model.js";
import pusher from "../config/pusher.js";
import { User } from "../users/user.model.js";

// Notification category mapping
const NOTIFICATION_CATEGORIES = {
  verification_submitted: "account",
  verification_approved: "account",
  verification_rejected: "account",
  password_changed: "account",
  suspicious_login: "account",
  direct_message: "messages",
  message_request: "messages",
  mentioned_in_post: "mentions",
  mentioned_in_comment: "mentions",
  tagged_in_group: "mentions",
  comment_on_post: "comments",
  reply_to_comment: "comments",
  post_reaction: "comments",
  group_join_request: "groups",
  group_request_approved: "groups",
  group_request_rejected: "groups",
  group_invitation: "groups",
  new_group_post: "groups",
  post_reported: "admin",
  post_approved: "groups",
  event_registered: "events",
  event_rsvp_cancelled: "events",
  event_reminder: "events",
  event_updated: "events",
  event_cancelled: "events",
  resource_uploaded: "resources",
  resource_approved: "resources",
  resource_rejected: "resources",
  resource_comment: "resources",
  campaign_created: "donations",
  donation_received: "donations",
  campaign_milestone: "donations",
  campaign_goal_reached: "donations",
  job_posted: "career",
  application_status: "career",
  recruiter_message: "career",
  badge_earned: "gamification",
  points_awarded: "gamification",
  leaderboard_update: "gamification",
  news_approved: "news",
  news_rejected: "news",
  moderation_request: "admin",
  content_flagged: "admin",
  moderation_action: "admin",
  mentorship_request: "mentorship",
  mentorship_accepted: "mentorship",
  mentorship_rejected: "mentorship",
  system_maintenance: "system",
  policy_update: "system",
  feature_launch: "system",
};

/**
 * Check if user has notification preference enabled
 */
async function checkUserPreference(userId, notificationType) {
  const user = await User.findById(userId);
  if (!user || !user.notificationPreferences) return true; // Default to enabled
  
  const category = NOTIFICATION_CATEGORIES[notificationType] || "system";
  return user.notificationPreferences[category] !== false;
}

/**
 * Create and send notification
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  relatedId = null,
  relatedModel = null,
  link = null,
  priority = "normal",
  channel = "in-app",
}) {
  try {
    console.log('📬 Creating notification:', { userId, type, title });
    
    // Check user preferences
    const hasPreference = await checkUserPreference(userId, type);
    if (!hasPreference) {
      console.log('⏭️ User has disabled notifications for type:', type);
      return null;
    }
    
    // Save to database
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      relatedId,
      relatedModel,
      link,
      priority,
      channel,
    });
    
    console.log('✅ Notification saved to DB:', notification._id);

    // Send real-time notification via Pusher
    await pusher.trigger(`user-${userId}`, "notification", {
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      link: notification.link,
      priority: notification.priority,
      createdAt: notification.createdAt,
    });
    
    console.log('✅ Pusher event sent to channel: user-' + userId);

    // Send via Socket.io as well for redundancy
    if (global.io) {
      global.io.to(`user-${userId}`).emit('notification', {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        link: notification.link,
        priority: notification.priority,
        createdAt: notification.createdAt,
      });
    }

    return notification;
  } catch (error) {
    console.error("❌ Failed to create notification:", error);
    throw error;
  }
}

/**
 * Get user notifications
 */
export async function getUserNotifications(userId, { page = 1, limit = 20, unreadOnly = false }) {
  const skip = (page - 1) * limit;
  
  const query = { user: userId };
  if (unreadOnly) {
    query.read = false;
  }
  
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(query),
    Notification.countDocuments({ user: userId, read: false }),
  ]);
  
  return {
    notifications,
    total,
    unreadCount,
    page,
    pages: Math.ceil(total / limit),
  };
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId, userId) {
  const notification = await Notification.findOne({
    _id: notificationId,
    user: userId,
  });
  
  if (!notification) {
    throw new Error("Notification not found");
  }
  
  if (!notification.read) {
    notification.read = true;
    notification.readAt = new Date();
    await notification.save();
  }
  
  return notification;
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(userId) {
  await Notification.updateMany(
    { user: userId, read: false },
    { read: true, readAt: new Date() }
  );
  
  return { success: true };
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId, userId) {
  const notification = await Notification.findOne({
    _id: notificationId,
    user: userId,
  });
  
  if (!notification) {
    throw new Error("Notification not found");
  }
  
  await Notification.findByIdAndDelete(notificationId);
  
  return { success: true };
}

/**
 * Get unread count
 */
export async function getUnreadCount(userId) {
  const count = await Notification.countDocuments({
    user: userId,
    read: false,
  });
  
  return { count };
}

// Notification templates for different events
export const notificationTemplates = {
  verification_submitted: {
    title: "Verification Submitted",
    message: "Your verification request has been submitted successfully. Please wait for admin approval.",
  },
  verification_approved: {
    title: "Verification Approved! ✓",
    message: "Congratulations! Your verification has been approved. You now have full access to the platform.",
  },
  verification_rejected: {
    title: "Verification Rejected",
    message: "Your verification request has been rejected. Please review the requirements and submit again.",
  },
  event_registered: (eventTitle) => ({
    title: "Event Registration Confirmed",
    message: `You have successfully registered for "${eventTitle}". We'll send you a reminder before the event.`,
  }),
  event_reminder: (eventTitle, eventDate) => ({
    title: "Event Reminder 📅",
    message: `Reminder: "${eventTitle}" is happening on ${eventDate}. Don't forget to attend!`,
  }),
  event_updated: (eventTitle) => ({
    title: "Event Updated",
    message: `The event "${eventTitle}" has been updated. Please check the latest details.`,
  }),
  news_approved: (newsTitle) => ({
    title: "News Post Approved ✓",
    message: `Your news post "${newsTitle}" has been approved and is now live.`,
  }),
  news_rejected: (newsTitle) => ({
    title: "News Post Rejected",
    message: `Your news post "${newsTitle}" was not approved. Please review and resubmit.`,
  }),
};
