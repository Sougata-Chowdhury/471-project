import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        // Account & Security
        "verification_submitted",
        "verification_approved",
        "verification_rejected",
        "password_changed",
        "suspicious_login",
        // Messages
        "direct_message",
        "message_request",
        // Mentions & Tags
        "mentioned_in_post",
        "mentioned_in_comment",
        "tagged_in_group",
        // Comments & Reactions
        "comment_on_post",
        "reply_to_comment",
        "post_reaction",
        // Groups & Forums
        "group_join_request",
        "group_request_approved",
        "group_request_rejected",
        "group_invitation",
        "new_group_post",
        "post_reported",
        "post_approved",
        // Events
        "event_registered",
        "event_rsvp_cancelled",
        "event_reminder",
        "event_updated",
        "event_cancelled",
        // Resources
        "resource_uploaded",
        "resource_approved",
        "resource_rejected",
        "resource_comment",
        // Donations & Campaigns
        "campaign_created",
        "donation_received",
        "campaign_milestone",
        "campaign_goal_reached",
        // Career
        "job_posted",
        "application_status",
        "recruiter_message",
        // Gamification
        "badge_earned",
        "points_awarded",
        "leaderboard_update",
        // News
        "news_approved",
        "news_rejected",
        // Admin & Moderation
        "moderation_request",
        "content_flagged",
        "moderation_action",
        // Mentorship
        "mentorship_request",
        "mentorship_accepted",
        "mentorship_rejected",
        "mentor_request",
        "mentor_approved",
        "mentor_rejected",
        // System
        "system_maintenance",
        "policy_update",
        "feature_launch",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    relatedModel: {
      type: String,
      enum: ["Verification", "Event", "News", "Mentorship", "MentorRequest", "Group", "Post", "Resource", "Campaign", "Job", "Badge", "RecommendationRequest", null],
      default: null,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    channel: {
      type: String,
      enum: ["in-app", "email", "push", "sms"],
      default: "in-app",
    },
    link: {
      type: String,
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for faster queries
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
