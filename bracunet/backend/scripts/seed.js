import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/users/user.model.js';
import { config } from '../src/config/index.js';

dotenv.config();

const seedDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log('📍 URI:', config.mongodb.uri.replace(/:[^:]*@/, ':***@'));
    
    await mongoose.connect(config.mongodb.uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✓ MongoDB connected for seeding');

    // Clear existing users (optional)
    // await User.deleteMany({});

    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@bracunet.edu' });
    if (!adminExists) {
      const admin = new User({
        name: 'Admin User',
        email: 'admin@bracunet.edu',
        password: 'admin123',
        role: 'admin',
        isVerified: true,
        verificationStatus: 'approved',
      });
      await admin.save();
      console.log('✓ Admin user created: admin@bracunet.edu / admin123');
    } else {
      console.log('✓ Admin user already exists');
    }

    // Create sample users
    const sampleUsers = [
      {
        name: 'John Student',
        email: 'student@bracunet.edu',
        password: 'student123',
        role: 'student',
      },
      {
        name: 'Jane Alumni',
        email: 'alumni@bracunet.edu',
        password: 'alumni123',
        role: 'alumni',
      },
      {
        name: 'Dr. Faculty',
        email: 'faculty@bracunet.edu',
        password: 'faculty123',
        role: 'faculty',
      },
    ];

    for (const userData of sampleUsers) {
      const userExists = await User.findOne({ email: userData.email });
      if (!userExists) {
        const user = new User(userData);
        await user.save();
        console.log(`✓ User created: ${userData.email}`);
      }
    }

    console.log('✓ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. MongoDB is not running or not installed');
    console.log('2. Connection URI in .env is incorrect');
    console.log('3. If using MongoDB Atlas, check your network access settings');
    console.log('\n📖 Setup Instructions:');
    console.log('   - For local MongoDB: https://www.mongodb.com/try/download/community');
    console.log('   - For MongoDB Atlas: https://www.mongodb.com/cloud/atlas');
    console.log('   - For Docker: docker run -d -p 27017:27017 --name bracunet-mongodb mongo:latest');
    process.exit(1);
  }
};

seedDB();
