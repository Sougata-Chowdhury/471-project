# Supabase Storage Setup Guide

This project uses Supabase Storage for storing recommendation letters.

## Setup Instructions

### 1. Get Your Supabase Credentials

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/zkxkzwqqqjywuuxgbxzz
2. Go to **Settings** → **API**
3. Copy the following:
   - **Project URL** (e.g., `https://zkxkzwqqqjywuuxgbxzz.supabase.co`)
   - **anon/public API key** (the public key that's safe to use in client-side code)

### 2. Configure Storage Bucket

1. In your Supabase Dashboard, go to **Storage**
2. Your bucket is already created: `471 Project`
3. Make sure the bucket is set to **Public** if you want direct access to files
4. If not public, you'll need to set up Row Level Security (RLS) policies

### 3. Update Environment Variables

Update the `.env` file in the `backend` folder with your credentials:

```env
SUPABASE_URL=https://zkxkzwqqqjywuuxgbxzz.supabase.co
SUPABASE_KEY=your_actual_anon_key_here
SUPABASE_BUCKET_NAME=471 Project
```

### 4. Folder Structure in Supabase

Recommendation letters will be stored in:
```
471 Project/
  └── recommendation-letters/
      └── {requestId}-{timestamp}-{filename}
```

## Storage Policies (Optional)

If you want to make the bucket public for easy access:

1. Go to **Storage** → **Policies** for the `471 Project` bucket
2. Add a new policy:
   - **Policy Name**: Public Access
   - **Allowed Operations**: SELECT
   - **Policy Definition**: `true`

Or if you want authenticated access only, set up appropriate RLS policies based on user authentication.

## Testing

Once configured, the recommendation letter upload feature will:
1. Accept PDF, DOC, DOCX, and image files
2. Upload them to Supabase Storage
3. Store the public URL in MongoDB
4. Allow students to download/view the letters in real-time

## File Size Limits

- Maximum file size: 10MB
- Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG

## CORS Configuration

If you encounter CORS issues, make sure your Supabase bucket has the correct CORS settings:
1. Go to **Storage** → **Configuration**
2. Add allowed origins if needed
