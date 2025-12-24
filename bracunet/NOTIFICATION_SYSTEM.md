# BracuNet Notification System Documentation

## Overview
Comprehensive notification system with 50+ notification types, user preferences, and multi-channel delivery (in-app, email, push).

---

## Notification Types

### Account & Security
- `verification_submitted` - Verification request submitted
- `verification_approved` - Verification approved
- `verification_rejected` - Verification rejected
- `password_changed` - Password successfully changed
- `suspicious_login` - Suspicious login attempt detected

### Messages
- `direct_message` - New direct message received
- `message_request` - New message request

### Mentions & Tags
- `mentioned_in_post` - Mentioned in a post
- `mentioned_in_comment` - Mentioned in a comment
- `tagged_in_group` - Tagged in a group

### Comments & Reactions
- `comment_on_post` - New comment on your post
- `reply_to_comment` - Reply to your comment
- `post_reaction` - Someone reacted to your post

### Groups & Forums
- `group_join_request` - New join request for group
- `group_request_approved` - Join request approved
- `group_request_rejected` - Join request rejected
- `group_invitation` - Invited to join group
- `new_group_post` - New post in followed group
- `post_reported` - Post reported for moderation
- `post_approved` - Your post was approved

### Events
- `event_registered` - Event RSVP confirmed
- `event_rsvp_cancelled` - RSVP cancelled
- `event_reminder` - Event starting soon
- `event_updated` - Event details updated
- `event_cancelled` - Event cancelled

### Resources
- `resource_uploaded` - New resource uploaded
- `resource_approved` - Resource approved
- `resource_rejected` - Resource rejected
- `resource_comment` - Comment on your resource

### Donations & Campaigns
- `campaign_created` - New campaign created
- `donation_received` - Donation received for your campaign
- `campaign_milestone` - Campaign milestone reached
- `campaign_goal_reached` - Campaign goal reached

### Career
- `job_posted` - New job opportunity posted
- `application_status` - Application status updated
- `recruiter_message` - Message from recruiter

### Gamification
- `badge_earned` - New badge earned
- `points_awarded` - Points awarded
- `leaderboard_update` - Leaderboard position updated

### News
- `news_approved` - News post approved
- `news_rejected` - News post rejected

### Admin & Moderation
- `moderation_request` - New moderation request
- `content_flagged` - Content flagged for review
- `moderation_action` - Moderation action taken

### Mentorship
- `mentorship_request` - New mentorship request
- `mentorship_accepted` - Mentorship request accepted
- `mentorship_rejected` - Mentorship request rejected

### System
- `system_maintenance` - Scheduled maintenance
- `policy_update` - Policy/privacy update
- `feature_launch` - New feature launched

---

## User Preferences

Users can control notifications through `/settings/notifications`:

### Category Controls
- **Account** - Account & security notifications
- **Messages** - Direct messages
- **Mentions** - Mentions and tags
- **Comments** - Comments and reactions
- **Groups** - Group activities
- **Events** - Event updates
- **Resources** - Resource library
- **Donations** - Campaign updates
- **Career** - Job opportunities
- **Gamification** - Points & badges
- **News** - News posts
- **Admin** - Moderation (admins only)
- **Mentorship** - Mentorship requests
- **System** - System updates

### Channel Controls
- **Push Notifications** - Real-time browser notifications
- **Email Notifications** - Email delivery (optional)

---

## API Endpoints

### Get Notification Preferences
```http
GET /api/settings/notification-preferences
Authorization: Cookie (authToken)
```

**Response:**
```json
{
  "success": true,
  "preferences": {
    "account": true,
    "messages": true,
    "mentions": true,
    "comments": true,
    "groups": true,
    "events": true,
    "resources": true,
    "donations": true,
    "career": true,
    "gamification": true,
    "news": true,
    "admin": true,
    "mentorship": true,
    "system": true,
    "emailNotifications": false,
    "pushNotifications": true
  }
}
```

### Update Notification Preferences
```http
PUT /api/settings/notification-preferences
Authorization: Cookie (authToken)
Content-Type: application/json

{
  "preferences": {
    "events": false,
    "emailNotifications": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Preferences updated successfully",
  "preferences": { ... }
}
```

### Get Notifications
```http
GET /api/notifications?page=1&limit=20&unreadOnly=false
Authorization: Cookie (authToken)
```

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "_id": "...",
      "type": "comment_on_post",
      "title": "New Comment on Your Post",
      "message": "John Doe commented on your post",
      "link": "/forums/123",
      "priority": "normal",
      "read": false,
      "createdAt": "2025-12-22T10:30:00Z"
    }
  ],
  "total": 45,
  "unreadCount": 12,
  "page": 1,
  "pages": 3
}
```

### Mark as Read
```http
PUT /api/notifications/:id/read
Authorization: Cookie (authToken)
```

---

## Backend Implementation

### Creating Notifications
```javascript
import { createNotification } from '../notifications/notification.service.js';

await createNotification({
  userId: targetUserId,
  type: 'comment_on_post',
  title: 'New Comment on Your Post',
  message: `${user.name} commented on your post`,
  link: `/forums/${forumId}`,
  relatedId: postId,
  relatedModel: 'Post',
  priority: 'normal',  // low, normal, high, urgent
  channel: 'in-app',   // in-app, email, push, sms
});
```

### Preference Checking
The notification service automatically checks user preferences before creating notifications. If a category is disabled, the notification won't be created.

---

## Real-Time Delivery

Notifications are delivered via:

1. **Pusher** - Primary real-time delivery
   ```javascript
   pusher.trigger(`user-${userId}`, "notification", {...})
   ```

2. **Socket.io** - Backup real-time delivery
   ```javascript
   global.io.to(`user-${userId}`).emit('notification', {...})
   ```

3. **Database** - Persistent storage for notification history

---

## Frontend Integration

### Notification Bell Component
Located at: `frontend/src/components/NotificationBell.jsx`

Features:
- Real-time notification count
- Dropdown with recent notifications
- Mark as read functionality
- Link to notification settings

### Notification Settings Page
Located at: `frontend/src/pages/NotificationSettings.jsx`

Features:
- Toggle categories on/off
- Enable/disable email notifications
- Enable/disable push notifications
- Save preferences with instant feedback

---

## Priority Levels

- **Urgent** - Security alerts, payment issues, critical moderation
- **High** - Donations, important approvals, event reminders
- **Normal** - Comments, reactions, general updates (default)
- **Low** - Minor reactions, leaderboard updates, badge notifications

---

## Notification Triggers

Notifications are automatically triggered from:

1. **Post Controller** - Comments, reactions
2. **Group Controller** - Join requests, approvals
3. **Event Service** - RSVPs, reminders, updates
4. **Resource Service** - Uploads, approvals
5. **Donation Service** - Campaign creation, donations
6. **Career Service** - Job postings
7. **Gamification Service** - Points, badges
8. **Verification Service** - Approval/rejection
9. **News Service** - Post approval/rejection

---

## Testing Notifications

### Via API
```bash
curl -X POST http://localhost:3000/api/notifications/test \
  -H "Content-Type: application/json" \
  -H "Cookie: authToken=..." \
  -d '{
    "type": "system_maintenance",
    "title": "Test Notification",
    "message": "This is a test notification"
  }'
```

### Via Browser Console
```javascript
// Listen for notifications
const pusher = new Pusher('your-key', { cluster: 'ap2' });
const channel = pusher.subscribe('user-YOUR_USER_ID');
channel.bind('notification', (data) => {
  console.log('Notification received:', data);
});
```

---

## Database Schema

### Notification Model
```javascript
{
  user: ObjectId,              // User receiving notification
  type: String,                // Notification type (enum)
  title: String,               // Notification title
  message: String,             // Notification message
  relatedId: ObjectId,         // Related object ID
  relatedModel: String,        // Model name (Post, Event, etc.)
  link: String,                // Deep link URL
  priority: String,            // low, normal, high, urgent
  channel: String,             // in-app, email, push, sms
  read: Boolean,               // Read status
  readAt: Date,                // When marked as read
  createdAt: Date,             // Timestamp
  updatedAt: Date              // Timestamp
}
```

### User Notification Preferences
```javascript
{
  notificationPreferences: {
    account: Boolean,
    messages: Boolean,
    mentions: Boolean,
    comments: Boolean,
    groups: Boolean,
    events: Boolean,
    resources: Boolean,
    donations: Boolean,
    career: Boolean,
    gamification: Boolean,
    news: Boolean,
    admin: Boolean,
    mentorship: Boolean,
    system: Boolean,
    emailNotifications: Boolean,
    pushNotifications: Boolean
  }
}
```

---

## Migration Notes

All existing users will have notification preferences initialized with default values (all enabled except email).

Run this migration if needed:
```javascript
await User.updateMany(
  { notificationPreferences: { $exists: false } },
  { 
    $set: { 
      notificationPreferences: {
        account: true,
        messages: true,
        mentions: true,
        comments: true,
        groups: true,
        events: true,
        resources: true,
        donations: true,
        career: true,
        gamification: true,
        news: true,
        admin: true,
        mentorship: true,
        system: true,
        emailNotifications: false,
        pushNotifications: true
      }
    } 
  }
);
```

---

## Future Enhancements

1. **Email Templates** - HTML email templates for each notification type
2. **SMS Integration** - Twilio integration for urgent notifications
3. **Digest Mode** - Daily/weekly digest of low-priority notifications
4. **Snooze Feature** - Temporarily mute notifications (1h/8h/24h)
5. **Thread Muting** - Mute specific conversations/groups
6. **Smart Filtering** - ML-based notification importance ranking
7. **Web Push API** - Browser push notifications when tab is closed

---

## Support

For issues or questions about the notification system:
- Check user preferences at `/settings/notifications`
- Verify backend logs for notification creation
- Check Pusher dashboard for delivery status
- Ensure Socket.io connection is active

**Last Updated:** December 22, 2025
