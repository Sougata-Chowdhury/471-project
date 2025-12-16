# Notification System - Quick Test Guide

## Prerequisites

Before testing, ensure:
1. Pusher credentials are configured in `.env` files (backend and frontend)
2. Both backend and frontend servers are running
3. You have at least one test user account

---

## Setup Pusher (Required First Step)

### 1. Sign Up for Pusher
- Go to https://pusher.com/
- Click "Sign up" and create a free account
- Verify your email address

### 2. Create a Channels App
- From Pusher Dashboard, click "Channels" → "Create app"
- Name: "BracuNet Notifications" (or any name)
- Cluster: Choose closest to your location (e.g., `ap2` for Asia Pacific)
- Tech stack: Select "React" for frontend, "Node.js" for backend
- Click "Create app"

### 3. Get Your Credentials
- In your app dashboard, click "App Keys"
- You'll see:
  - **app_id**: e.g., `1234567`
  - **key**: e.g., `a1b2c3d4e5f6g7h8i9j0` (PUBLIC - safe for frontend)
  - **secret**: e.g., `x1y2z3a4b5c6d7e8f9g0` (PRIVATE - backend only!)
  - **cluster**: e.g., `ap2`

### 4. Configure Backend
Edit `bracunet/backend/.env`:
```env
PUSHER_APP_ID=1234567
PUSHER_KEY=a1b2c3d4e5f6g7h8i9j0
PUSHER_SECRET=x1y2z3a4b5c6d7e8f9g0
PUSHER_CLUSTER=ap2
```

### 5. Configure Frontend
Create `bracunet/frontend/.env`:
```env
VITE_PUSHER_KEY=a1b2c3d4e5f6g7h8i9j0
VITE_PUSHER_CLUSTER=ap2
```

**⚠️ IMPORTANT:** Only put the PUBLIC key in frontend .env, NEVER the secret!

### 6. Restart Servers
```bash
# Terminal 1 - Backend
cd bracunet/backend
npm run dev

# Terminal 2 - Frontend
cd bracunet/frontend
npm run dev
```

---

## Test Scenarios

### Test 1: Verification Notifications ✅

#### A. Submit Verification
1. Login as a student or alumni user
2. Go to Verification Request page
3. Fill out the form and upload proof
4. Click "Submit Request"
5. **Expected**: You should see a notification bell icon with a badge showing "1"
6. Click the bell → should see "Your verification request has been submitted and is under review."

#### B. Approve Verification (as Admin)
1. Open a new private/incognito window
2. Login as an admin user
3. Go to Admin → Verification Requests
4. Click "Approve" on the pending verification
5. Switch back to the first browser
6. **Expected**: Bell icon updates to "2" notifications
7. Click bell → new notification: "Congratulations! Your verification has been approved."

#### C. Reject Verification (as Admin)
1. Submit another verification request
2. As admin, click "Reject"
3. **Expected**: Real-time notification appears without page refresh
4. Message: "Your verification request has been rejected..."

---

### Test 2: Event Notifications 🎉

#### A. Register for Event
1. Login as any user
2. Go to Events page
3. Click on an upcoming event
4. Click "Register" (or "Going")
5. **Expected**: Notification appears instantly
6. Message: "You have successfully registered for {Event Name}."

#### B. Event Update Notification
1. Login as the event organizer
2. Edit the event details (change time, location, or description)
3. Save changes
4. Switch to another user who registered for this event
5. **Expected**: They receive "The event {Event Name} has been updated..."
6. **Note**: This tests that multiple users get notified

---

### Test 3: News Post Notifications 📰

#### A. Submit News Post
1. Login as a non-admin user
2. Create a news post
3. Submit for approval
4. Login as admin in another window
5. Go to Admin → News Moderation
6. Click "Approve" on the pending post
7. Switch back to the first user
8. **Expected**: Notification appears
9. Message: "Your news post '{Post Title}' has been approved..."

#### B. Reject News Post
1. Submit another news post
2. As admin, click "Reject"
3. **Expected**: Author receives rejection notification

---

## Verification Checklist

### Backend
- [ ] Pusher credentials configured in `.env`
- [ ] Backend server starts without errors
- [ ] Check terminal: "Server running on port 3000" (or your port)
- [ ] No errors related to Pusher initialization

### Frontend
- [ ] Pusher key configured in `.env`
- [ ] Frontend compiles without errors
- [ ] Bell icon appears in Dashboard navigation
- [ ] No console errors related to Pusher

### Real-time Functionality
- [ ] Bell icon updates without page refresh
- [ ] Unread count displays correctly
- [ ] Notifications appear in dropdown list
- [ ] Click notification marks as read (blue → white background)
- [ ] "Mark all as read" button works
- [ ] Delete (X) button removes notification
- [ ] Time formatting displays (e.g., "just now", "2m ago")

### Notification Types
- [ ] Verification submitted notification
- [ ] Verification approved notification
- [ ] Verification rejected notification
- [ ] Event registered notification
- [ ] Event updated notification (sent to all RSVPs)
- [ ] News approved notification
- [ ] News rejected notification

---

## Debugging Tips

### 🔍 Check Pusher Connection
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for Pusher connection messages:
   - ✅ Good: "Pusher: connection opened"
   - ❌ Bad: "Pusher: connection failed" or "WebSocket error"

### 🔍 Verify Pusher Dashboard
1. Go to https://dashboard.pusher.com/
2. Select your app
3. Go to "Debug Console"
4. Perform an action (e.g., submit verification)
5. You should see events appearing in real-time:
   - Channel: `user-{userId}`
   - Event: `notification`

### 🔍 Check Backend Logs
Look for these in your backend terminal:
```
✅ MongoDB connected
✅ Server running on port 3000
```

### 🔍 Common Issues

#### Issue: Bell icon doesn't appear
- Check: NotificationBell component imported in Dashboard.jsx
- Check: User is logged in (check `user` object in console)

#### Issue: Notifications not real-time
- Check: Pusher credentials match between frontend/backend
- Check: User ID is correct (console.log in NotificationBell component)
- Check: Backend sends Pusher event (add console.log in notification.service.js)

#### Issue: "Failed to fetch notifications"
- Check: Backend running on correct port (default: 3000)
- Check: CORS configured correctly
- Check: User authenticated (JWT token present in cookies)

---

## Testing with Pusher Debug Console

For advanced debugging:

1. Go to https://dashboard.pusher.com/
2. Select your app → "Debug Console"
3. Click "Show" next to "Show Console"
4. Leave this tab open
5. In another tab, perform actions (submit verification, register for event, etc.)
6. Watch the Debug Console - you should see events appear:

```
EVENT: notification
CHANNEL: user-65abc123def456ghi789
DATA: {
  "_id": "65xyz...",
  "user": "65abc...",
  "type": "verification_submitted",
  "message": "Your verification request has been submitted...",
  "read": false,
  ...
}
```

This confirms that:
- ✅ Backend is sending events to Pusher
- ✅ Pusher is receiving and broadcasting events
- If you see events here but not in the app → frontend issue
- If you don't see events here → backend issue

---

## Quick Test Script

Run this in browser console (F12) while on Dashboard:

```javascript
// Check if NotificationBell is mounted
console.log('NotificationBell present:', document.querySelector('[title="Notifications"]') !== null);

// Check Pusher connection
console.log('Pusher loaded:', typeof Pusher !== 'undefined');

// Simulate notification API call
fetch('http://localhost:3000/api/notifications', { 
  credentials: 'include' 
})
  .then(r => r.json())
  .then(data => console.log('Notifications:', data))
  .catch(err => console.error('Error:', err));
```

---

## Success Criteria ✅

Your notification system is working correctly if:

1. ✅ Bell icon appears in Dashboard navigation
2. ✅ Badge shows correct unread count
3. ✅ Notifications appear instantly without refresh
4. ✅ Click notification marks as read
5. ✅ Time formatting displays correctly
6. ✅ All 7 notification types trigger correctly
7. ✅ Multiple users can receive notifications independently
8. ✅ Pusher Debug Console shows events

---

## Need Help?

If notifications aren't working:

1. **Double-check Pusher credentials** - Most common issue!
2. **Verify both servers are running** - Backend AND frontend
3. **Check browser console** - Look for errors
4. **Test in incognito mode** - Rules out cache issues
5. **Use Pusher Debug Console** - Confirms backend is sending events

Pusher Free Tier includes:
- 200,000 messages/day
- 100 simultaneous connections
- Unlimited channels

This is more than enough for development and testing!
