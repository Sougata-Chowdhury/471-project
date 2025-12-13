# Notification System Setup

This project uses **Pusher** for real-time notifications.

## Features

The notification system sends real-time notifications for:

1. **Verification Events**
   - Application submitted
   - Verification approved
   - Verification rejected

2. **Event Management**
   - Successfully registered for an event
   - Event details updated

3. **News/Announcements**
   - News post approved
   - News post rejected

## Setup Instructions

### 1. Create a Pusher Account

1. Go to [https://pusher.com/](https://pusher.com/)
2. Sign up for a free account
3. Create a new Channels app

### 2. Get Your Credentials

From your Pusher dashboard, you'll need:
- **App ID**
- **Key** (public key)
- **Secret** (private key)
- **Cluster** (e.g., `ap2`, `us2`, `eu`)

### 3. Configure Backend

Add these to `bracunet/backend/.env`:

```env
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=ap2
```

### 4. Configure Frontend

Create `bracunet/frontend/.env` (copy from `.env.example`):

```env
VITE_PUSHER_KEY=your_pusher_key
VITE_PUSHER_CLUSTER=ap2
```

**Important:** Only use the PUBLIC key in the frontend, never the secret!

### 5. Restart Servers

After configuring environment variables:

```bash
# Backend
cd bracunet/backend
npm run dev

# Frontend (in a new terminal)
cd bracunet/frontend
npm run dev
```

## How It Works

### Backend

1. **Notification Service** (`bracunet/backend/src/notifications/notification.service.js`)
   - Creates notifications in MongoDB
   - Triggers Pusher events on user-specific channels
   - Provides notification templates

2. **Integration Points**
   - Verification service: sends notifications on submit/approve/reject
   - Event service: sends notifications on registration and updates
   - News service: sends notifications on post approval/rejection

### Frontend

1. **NotificationBell Component** (`bracunet/frontend/src/components/NotificationBell.jsx`)
   - Displays notification icon with unread count
   - Real-time updates via Pusher
   - Dropdown to view and manage notifications

2. **Features**
   - Mark individual notifications as read
   - Mark all as read
   - Delete notifications
   - Time ago formatting (e.g., "2h ago")
   - Auto-updates when new notifications arrive

## Pusher Channel Structure

- Each user has a dedicated channel: `user-{userId}`
- Event name: `notification`
- Payload includes notification details (type, message, metadata)

## Notification Types

- `verification_submitted`
- `verification_approved`
- `verification_rejected`
- `event_registered`
- `event_updated`
- `news_approved`
- `news_rejected`

## Troubleshooting

### Notifications not appearing?

1. Check browser console for errors
2. Verify Pusher credentials are correct
3. Ensure user is logged in
4. Check that backend is running and connected to Pusher

### Pusher connection issues?

1. Verify cluster setting matches your Pusher app
2. Check firewall/network restrictions
3. Test Pusher credentials in [Pusher Console](https://dashboard.pusher.com/)

## Free Tier Limits

Pusher's free tier includes:
- 200,000 messages/day
- 100 max connections
- Unlimited channels

This should be sufficient for development and small deployments.
