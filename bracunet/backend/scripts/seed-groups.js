import mongoose from 'mongoose';
import { config } from '../src/config/index.js';
import Group from '../src/forums/groups.model.js';

async function main() {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('Connected to MongoDB for seeding groups');

    const groups = [
      { name: 'Career Development', topic: 'career', description: 'Jobs, internships, and career advice' },
      { name: 'Research & Projects', topic: 'research', description: 'Collaborate on research and projects' },
      { name: 'Tech Talks', topic: 'events', description: 'Share and organize tech events and talks' },
      { name: 'Alumni Networking', topic: 'networking', description: 'Connect with alumni and mentors' },
    ];

    const created = await Group.insertMany(groups);
    console.log(`Inserted ${created.length} groups`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

main();
