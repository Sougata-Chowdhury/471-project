@echo off
echo.
echo ===============================================
echo BracuNet - MongoDB Setup Helper
echo ===============================================
echo.
echo This script will help you set up MongoDB locally.
echo.
echo Option 1: Install MongoDB Community Edition
echo Download from: https://www.mongodb.com/try/download/community
echo.
echo Option 2: Use MongoDB Atlas (Cloud - Recommended)
echo Go to: https://www.mongodb.com/cloud/atlas
echo 1. Create free account
echo 2. Create a cluster
echo 3. Get connection string
echo 4. Replace MONGODB_URI in .env
echo.
echo Option 3: Use Docker (if installed)
echo Run: docker run -d -p 27017:27017 --name bracunet-mongodb mongo:latest
echo.
echo After setup, run: npm run seed
echo.
pause
