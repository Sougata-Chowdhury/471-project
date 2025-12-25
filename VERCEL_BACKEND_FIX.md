# Vercel Backend Configuration Fix

## The Problem
The error `Cannot find module '/var/task/bracunet/backend/...'` occurs because Vercel's Root Directory setting is creating an incorrect path structure.

## Solution: Fix Vercel Dashboard Settings

### Step 1: Go to Vercel Dashboard
1. Open your backend project in Vercel Dashboard
2. Go to **Settings** → **General**

### Step 2: Update Root Directory
**IMPORTANT:** The Root Directory should be set to:
```
bracunet/backend
```

If it's already set to this, the issue is that Vercel is looking for modules in a nested path. Let's fix it:

### Step 3: Update Build Settings
In Vercel Dashboard → Settings → General:

- **Root Directory**: `bracunet/backend`
- **Build Command**: `npm install` (or leave empty)
- **Output Directory**: Leave empty
- **Install Command**: `npm install` (or leave empty)

### Step 4: Environment Variables
Make sure these are set in Settings → Environment Variables:

```
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/bracunet?retryWrites=true&w=majority
JWT_SECRET=your_secure_random_string_here
CORS_ORIGIN=https://your-frontend.vercel.app
NODE_ENV=production
CLOUDINARY_CLOUD_NAME=bracunet
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### Step 5: Redeploy
After updating settings:
1. Go to Deployments tab
2. Click the three dots on the latest deployment
3. Click "Redeploy"

---

## Alternative: Deploy Without Root Directory

If the above doesn't work, try this:

### Option A: Remove Root Directory Setting
1. In Vercel Dashboard → Settings → General
2. **Clear the Root Directory field** (leave it empty)
3. Update `vercel.json` at project root to handle both frontend and backend

### Option B: Use Separate Vercel Projects
1. Deploy backend as a completely separate Vercel project
2. When importing, select **only** the backend folder
3. This creates a cleaner separation

---

## Testing After Deployment
Once deployed, test these endpoints:
- `https://your-backend.vercel.app/` → Should return JSON
- `https://your-backend.vercel.app/health` → Should show MongoDB connection status
- `https://your-backend.vercel.app/api/auth/test` → Should return API response

---

## If Still Not Working
The issue might be that **Vercel can't properly run this Express app in serverless mode**. 

### Recommended Alternative: Deploy Backend to Railway
Railway is better suited for Express apps with Socket.IO:

1. Go to https://railway.app
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Set Root Directory to `bracunet/backend`
6. Add all environment variables
7. Deploy!

Railway provides:
- ✅ Full Node.js runtime (not serverless)
- ✅ WebSocket support (Socket.IO works perfectly)
- ✅ Free tier with 500 hours/month
- ✅ Automatic HTTPS
- ✅ Better for persistent connections

After deploying to Railway, you'll get a URL like `https://your-app.railway.app` which you can use as your backend URL in the frontend.
