# Deployment Guide - BracuNet on Vercel

## Prerequisites
- Vercel account (free tier works)
- MongoDB Atlas database (free tier available)
- Cloudinary account (for image uploads)
- GitHub repository with your code

## Step 1: Prepare MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with password
4. Whitelist all IPs (0.0.0.0/0) for Vercel access
5. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/bracunet?retryWrites=true&w=majority`

## Step 2: Deploy Backend to Vercel

### Option A: Using Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. **Root Directory**: Set to `bracunet/backend`
5. **Framework Preset**: Other
6. **Build Command**: Leave empty or `npm install`
7. **Output Directory**: Leave empty
8. Click "Environment Variables" and add:
   ```
   DATABASE_URL=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secure_random_string
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend.vercel.app
   FRONTEND_URL=https://your-frontend.vercel.app
   CLOUDINARY_CLOUD_NAME=bracunet
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret
   PUSHER_APP_ID=2090749
   PUSHER_KEY=c581a5dcd7d22c9200e0
   PUSHER_SECRET=your_pusher_secret
   PUSHER_CLUSTER=ap2
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   SUPABASE_BUCKET_NAME=471 Project
   ```
9. Click "Deploy"
10. **Copy your backend URL** (e.g., `https://your-backend.vercel.app`)

### Option B: Using Vercel CLI
```bash
cd bracunet/backend
vercel login
vercel --prod
```

## Step 3: Deploy Frontend to Vercel

### Option A: Using Vercel Dashboard
1. Click "Add New" → "Project" again
2. Import the same GitHub repository
3. **Root Directory**: Set to `bracunet/frontend`
4. **Framework Preset**: Vite
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`
7. Click "Environment Variables" and add:
   ```
   VITE_API_BASE=https://your-backend.vercel.app
   VITE_SOCKET_URL=https://your-backend.vercel.app
   VITE_WS_BASE=wss://your-backend.vercel.app
   VITE_PUSHER_KEY=c581a5dcd7d22c9200e0
   VITE_PUSHER_CLUSTER=ap2
   ```
8. Click "Deploy"

### Option B: Using Vercel CLI
```bash
cd bracunet/frontend
vercel --prod
```

## Step 4: Update Backend CORS 
1. Go to your backend Vercel project settings
2. Update `CORS_ORIGIN` environment variable with your frontend URL
3. Redeploy the backend

## Step 5: Test Your Deployment
1. Visit your frontend URL
2. Try to register/login
3. Test features like:
   - Creating posts
   - Joining groups
   - Real-time chat (note: Socket.IO may have limitations on Vercel serverless)

## Important Notes

### Socket.IO Limitations on Vercel
⚠️ **Warning**: Vercel's serverless functions have a 10-second execution timeout and don't maintain persistent connections. This means:
- Socket.IO real-time features may not work reliably
- The 3-second polling fallback will be the primary mechanism

**Recommended Alternative for Production**:
For better Socket.IO support, consider hosting the backend on:
- **Railway** (https://railway.app) - Easy deployment, supports WebSockets
- **Render** (https://render.com) - Free tier available, full WebSocket support
- **Fly.io** (https://fly.io) - Great for Node.js apps
- **Heroku** (https://heroku.com) - Classic PaaS
- **DigitalOcean App Platform** - Scalable container hosting

### Environment Variables Checklist
Backend must have:
- ✅ DATABASE_URL
- ✅ JWT_SECRET
- ✅ CORS_ORIGIN (your frontend URL)
- ✅ CLOUDINARY credentials
- ✅ Other API keys as needed

Frontend must have:
- ✅ VITE_API_BASE (your backend URL)
- ✅ VITE_SOCKET_URL (your backend URL)

### Troubleshooting

**Backend Error: "Cannot find module"**
- Ensure all dependencies are in `package.json`
- Check `vercel.json` configuration

**CORS Errors**
- Update `CORS_ORIGIN` in backend environment variables
- Include your exact frontend URL (no trailing slash)

**Database Connection Fails**
- Whitelist 0.0.0.0/0 in MongoDB Atlas Network Access
- Verify connection string has correct username/password
- Check database user has read/write permissions

**Build Fails**
- Check build logs in Vercel dashboard
- Ensure `vercel.json` is in the correct directory
- Verify all environment variables are set

**Socket.IO Not Working**
- Expected on Vercel due to serverless limitations
- Polling fallback will work (messages appear within 3 seconds)
- For real-time, deploy backend to Railway/Render

## Deployment Commands Summary

```bash
# Deploy backend
cd bracunet/backend
vercel --prod

# Deploy frontend
cd bracunet/frontend
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs <deployment-url>
```

## Post-Deployment
1. Update your README with live URLs
2. Test all major features
3. Monitor Vercel dashboard for errors
4. Set up custom domain (optional)
5. Enable analytics in Vercel dashboard

## Support
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com
- Railway (Socket.IO alternative): https://docs.railway.app
