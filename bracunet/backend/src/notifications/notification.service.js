import Notification from "./notification.model.js";
import pusher from "../config/pusher.js";

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
}) {
  try {
    console.log('📬 Creating notification:', { userId, type, title });
    
    // Save to database
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      relatedId,
      relatedModel,
      link,
    });
    
    console.log('✅ Notification saved to DB:', notification._id);

    // Send real-time notification via Pusher
    await pusher.trigger(`user-${userId}`, "notification", {
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      link: notification.link,
      createdAt: notification.createdAt,
    });
    
    console.log('✅ Pusher event sent to channel: user-' + userId);

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
