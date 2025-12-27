# Socket.IO 404 Error Fix

## Problem
The frontend was trying to connect to Socket.IO on `bracunet.vercel.app/socket.io` but Socket.IO server runs on the **backend**, not the frontend.

## Solution
Added `VITE_SOCKET_URL` environment variable to tell the frontend where the backend Socket.IO server is located.

## What You Need to Do

### 1. Deploy Your Backend to Vercel (if not already done)
Your backend needs to be deployed separately from the frontend.

**Steps:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. **Important Settings:**
   - **Root Directory**: `bracunet/backend`
   - **Framework Preset**: Other
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
5. Add environment variables (see DEPLOYMENT_GUIDE.md for full list)
6. Deploy
7. **Copy the backend URL** (e.g., `https://bracunet-backend-471.vercel.app`)

### 2. Update Frontend Environment Variables in Vercel
1. Go to your frontend Vercel project settings
2. Go to "Environment Variables"
3. Add/Update these variables:
   ```
   VITE_API_BASE=https://your-backend-url.vercel.app
   VITE_SOCKET_URL=https://your-backend-url.vercel.app
   ```
4. **Important**: Redeploy the frontend after updating environment variables

### 3. Update Backend CORS Settings
Make sure your backend allows requests from your frontend domain:
1. In backend Vercel project settings
2. Update `CORS_ORIGIN` environment variable:
   ```
   CORS_ORIGIN=https://bracunet.vercel.app
   ```

## Quick Fix for Local Development
The `.env` file has been updated with:
```
VITE_SOCKET_URL=http://localhost:3000
```

This will work when running the backend locally on port 3000.

## Verify the Fix
After redeploying:
1. Open your app in browser
2. Open Developer Tools (F12)
3. Check Console - the Socket.IO 404 errors should be gone
4. Check Network tab - Socket.IO should connect to your backend URL
