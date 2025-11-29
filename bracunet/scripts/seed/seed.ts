import { connect } from 'mongoose';
import { User } from '../../backend/src/modules/users/schemas/user.schema';
import { Alumni } from '../../backend/src/modules/alumni/alumni.schema'; // Assuming you have an alumni schema
import { Event } from '../../backend/src/modules/events/event.schema'; // Assuming you have an event schema
import { Job } from '../../backend/src/modules/jobs/job.schema'; // Assuming you have a job schema

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bracunet');

    // Clear existing data
    await User.deleteMany({});
    await Alumni.deleteMany({});
    await Event.deleteMany({});
    await Job.deleteMany({});

    // Seed users
    const users = [
      { name: 'John Doe', email: 'john@example.com', password: 'password123' },
      { name: 'Jane Smith', email: 'jane@example.com', password: 'password123' },
    ];
    await User.insertMany(users);

    // Seed alumni
    const alumni = [
      { userId: '1', graduationYear: 2020, degree: 'BSc in Computer Science' },
      { userId: '2', graduationYear: 2019, degree: 'BBA' },
    ];
    await Alumni.insertMany(alumni);

    // Seed events
    const events = [
      { title: 'Alumni Meetup', date: new Date(), location: 'University Campus' },
      { title: 'Career Fair', date: new Date(), location: 'Convention Center' },
    ];
    await Event.insertMany(events);

    // Seed jobs
    const jobs = [
      { title: 'Software Engineer', company: 'Tech Company', location: 'Remote' },
      { title: 'Marketing Manager', company: 'Marketing Agency', location: 'On-site' },
    ];
    await Job.insertMany(jobs);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit();
  }
};

seedDatabase();