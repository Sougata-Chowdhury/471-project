# Cloudinary Setup Instructions

## Why Cloudinary?
Cloudinary provides free cloud storage for images and documents, making them accessible from any device anywhere in the world. This is perfect for storing verification proof documents.

## Setup Steps

### 1. Create a Free Cloudinary Account
1. Go to https://cloudinary.com/users/register_free
2. Sign up with your email
3. Verify your email address

### 2. Get Your Credentials
1. After logging in, go to your Dashboard
2. You'll see your credentials:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 3. Update .env File
Open `bracunet/backend/.env` and replace these values:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### 4. Restart the Server
```powershell
cd "D:\CSE471 Project\471-project"
.\scripts\start-all.ps1
```

## Features
- ✅ Files stored in the cloud (accessible from anywhere)
- ✅ Automatic image optimization
- ✅ Support for images (JPG, PNG) and PDFs
- ✅ 5MB file size limit
- ✅ Free tier includes 25GB storage
- ✅ Secure URLs with CDN delivery

## Testing
1. Submit a verification request with a proof document
2. The file will be uploaded to Cloudinary
3. Admins can view the document from any device
4. The URL will look like: `https://res.cloudinary.com/your-cloud-name/image/upload/v123456789/bracunet/verification-proofs/proof-123456789.jpg`

## Troubleshooting
- If uploads fail, check your API credentials
- Ensure your Cloudinary account is verified
- Check that you haven't exceeded the free tier limits
