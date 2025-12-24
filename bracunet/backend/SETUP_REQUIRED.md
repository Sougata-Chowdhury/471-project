# 🔑 IMPORTANT: Complete Supabase Setup

## Required Action

You need to add your actual Supabase API key to make the recommendation letter upload/download feature work.

### Step 1: Get Your Supabase Key

1. Visit: https://supabase.com/dashboard/project/zkxkzwqqqjywuuxgbxzz/settings/api
2. Copy your **anon (public)** key - it looks like:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
   ```

### Step 2: Update .env File

Open `backend/.env` and replace:
```env
SUPABASE_KEY=your_supabase_anon_key_here
```

With:
```env
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your_actual_key
```

### Step 3: Verify Bucket Settings

1. Go to: https://supabase.com/dashboard/project/zkxkzwqqqjywuuxgbxzz/storage/buckets/471%20Project
2. Click on the bucket "471 Project"
3. Make sure it's set to **Public** or configure appropriate access policies

### Step 4: Restart Backend Server

After updating the .env file:
```bash
cd backend
npm run dev
```

## What Changed?

✅ Recommendation letters now use **Supabase Storage** instead of Cloudinary
✅ Files are stored in: `471 Project/recommendation-letters/`
✅ Supported formats: PDF, DOC, DOCX, JPG, PNG (max 10MB)
✅ Real-time download/view still works the same way

## Troubleshooting

If uploads fail:
- Check that SUPABASE_KEY is set correctly in .env
- Verify bucket "471 Project" exists and is accessible
- Check browser console for detailed error messages
- Ensure bucket has public access or proper RLS policies
