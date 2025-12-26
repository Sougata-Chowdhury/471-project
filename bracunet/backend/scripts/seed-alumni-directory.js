import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/users/user.model.js';
import { VerifiedUser } from '../src/users/verifiedUser.model.js';
import { config } from '../src/config/index.js';

dotenv.config();

const seedAlumniDirectory = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(config.mongodb.uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✓ MongoDB connected for seeding');

    // Find the admin user to use as verifiedBy
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('❌ Admin user not found. Please run seed.js first.');
      process.exit(1);
    }

    // Find all verified alumni users
    const alumniUsers = await User.find({ 
      role: 'alumni', 
      isVerified: true 
    });

    console.log(`Found ${alumniUsers.length} verified alumni users`);

    for (const alumniUser of alumniUsers) {
      // Check if already in VerifiedUser collection
      const existingVerifiedUser = await VerifiedUser.findOne({ user: alumniUser._id });
      
      if (!existingVerifiedUser) {
        // Create VerifiedUser entry
        const verifiedUser = new VerifiedUser({
          user: alumniUser._id,
          name: alumniUser.name,
          email: alumniUser.email,
          role: alumniUser.role,
          studentId: alumniUser.studentId || `ALM${Math.floor(Math.random() * 100000)}`,
          department: alumniUser.major || alumniUser.department || 'Computer Science',
          batch: alumniUser.batch || '2023',
          graduationYear: alumniUser.graduationYear || 2023,
          company: alumniUser.currentCompany || alumniUser.company || 'Not specified',
          officialEmail: alumniUser.email,
          verifiedBy: admin._id,
          verifiedAt: new Date(),
          isVisible: true,
        });

        await verifiedUser.save();
        console.log(`✓ Added to directory: ${alumniUser.name} (${alumniUser.email})`);
      } else {
        console.log(`⚠ Already in directory: ${alumniUser.name}`);
      }
    }

    console.log('✓ Alumni directory seeded successfully');
    console.log(`📊 Total alumni in directory: ${alumniUsers.length}`);
    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedAlumniDirectory();
