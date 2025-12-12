import Forum from '../src/forums/forum.model.js';
import { Post } from '../src/forums/post.model.js';
import Resource from '../src/resources/resource.model.js';
import User from '../src/users/user.model.js';

/**
 * Seed script for Forums and Resource Library
 * 
 * Usage:
 * - Add this as scripts/seed-forums.js in backend
 * - Run: npm run seed-forums
 * - Add to package.json: "seed-forums": "node scripts/seed-forums.js"
 */

async function seedForums(adminUserId) {
  console.log('🌱 Seeding Forums...');

  const forumData = [
    {
      name: 'Career Advice',
      description: 'Discuss career paths, job opportunities, and professional development',
      icon: '💼',
      category: 'career',
      rules: 'Be respectful and constructive in your feedback',
    },
    {
      name: 'Research & Innovation',
      description: 'Share research papers, findings, and innovative ideas',
      icon: '🔬',
      category: 'research',
      rules: 'Cite sources and provide evidence for claims',
    },
    {
      name: 'Entrepreneurship',
      description: 'Discuss startup ideas, business models, and entrepreneurial journey',
      icon: '🚀',
      category: 'entrepreneurship',
      rules: 'Share experiences and help each other grow',
    },
    {
      name: 'Academics',
      description: 'Ask questions and discuss academic subjects',
      icon: '📚',
      category: 'academics',
      rules: 'Help each other learn, no spamming solutions',
    },
    {
      name: 'Events & Meetups',
      description: 'Organize and discuss alumni events and meetups',
      icon: '🎉',
      category: 'events',
      rules: 'Keep posts relevant to events',
    },
    {
      name: 'General Discussion',
      description: 'Off-topic discussions and general chat',
      icon: '💬',
      category: 'general',
      rules: 'Be respectful and keep it friendly',
    },
  ];

  const createdForums = await Forum.insertMany(
    forumData.map(forum => ({
      ...forum,
      createdBy: adminUserId,
      moderators: [adminUserId],
    }))
  );

  console.log(`✅ Created ${createdForums.length} forums`);
  return createdForums;
}

async function seedPosts(forums, users) {
  console.log('🌱 Seeding Posts...');

  const postsData = [
    {
      forum: forums[0]._id, // Career
      title: 'How to transition from student life to professional career?',
      content: `The jump from university to a full-time job can be daunting. Here are some tips:
      
      1. Update your LinkedIn profile with relevant skills
      2. Practice interview questions
      3. Build a portfolio of projects
      4. Network with alumni working in your field
      5. Be confident but humble when learning
      
      What are your experiences with this transition?`,
      author: users[1]._id,
      tags: ['career', 'transition', 'advice'],
    },
    {
      forum: forums[0]._id,
      title: 'Best companies to work for as a fresh graduate?',
      content: 'I am looking for recommendations on companies with good graduate programs. Any suggestions?',
      author: users[2]._id,
      tags: ['companies', 'fresh-grad', 'recommendations'],
    },
    {
      forum: forums[1]._id, // Research
      title: 'Paper: Machine Learning in Healthcare',
      content: 'I just finished reading this interesting paper on ML applications in diagnostics. The results were impressive.',
      author: users[1]._id,
      tags: ['machine-learning', 'healthcare', 'research'],
    },
    {
      forum: forums[2]._id, // Entrepreneurship
      title: 'Starting my first startup - need advice',
      content: 'I have an idea for an EdTech startup. Where should I start? Funding? Team building? MVP?',
      author: users[3]._id,
      tags: ['startup', 'edtech', 'advice'],
    },
  ];

  const createdPosts = await Post.insertMany(postsData);

  console.log(`✅ Created ${createdPosts.length} posts`);
  return createdPosts;
}

async function seedResources(users) {
  console.log('🌱 Seeding Resources...');

  const resourcesData = [
    {
      title: 'Complete Web Development Bootcamp',
      description: 'Learn web development from scratch including HTML, CSS, JavaScript, React, and Node.js',
      resourceType: 'study-material',
      category: 'academics',
      subcategory: 'Web Development',
      fileUrl: 'https://res.cloudinary.com/example/video/upload/v1234567890/example.pdf',
      fileType: 'application/pdf',
      fileSizeKB: 15000,
      uploadedBy: users[1]._id,
      author: { name: users[1].name, email: users[1].email },
      tags: ['web', 'development', 'javascript', 'react'],
      isApproved: true,
      approvedAt: new Date(),
    },
    {
      title: 'Career Transition Guide - From Engineering to Product Management',
      description: 'A comprehensive guide on transitioning from software engineering to product management roles',
      resourceType: 'career-guide',
      category: 'career',
      subcategory: 'Career Transition',
      fileUrl: 'https://res.cloudinary.com/example/document/upload/v1234567890/guide.pdf',
      fileType: 'application/pdf',
      fileSizeKB: 5000,
      uploadedBy: users[0]._id,
      author: { name: users[0].name, email: users[0].email },
      tags: ['career', 'product-management', 'transition'],
      isApproved: true,
      approvedAt: new Date(),
    },
    {
      title: 'Entrepreneurship 101: From Idea to Launch',
      description: 'A recorded talk from a successful startup founder on the journey of building a startup',
      resourceType: 'recorded-talk',
      category: 'entrepreneurship',
      subcategory: 'Startup Fundamentals',
      fileUrl: 'https://res.cloudinary.com/example/video/upload/v1234567890/talk.mp4',
      fileType: 'video/mp4',
      fileSizeKB: 250000,
      duration: 45,
      uploadedBy: users[2]._id,
      author: { name: users[2].name, email: users[2].email },
      tags: ['entrepreneurship', 'startup', 'founder'],
      isApproved: true,
      approvedAt: new Date(),
    },
    {
      title: 'Data Science Interview Preparation',
      description: 'Case studies and questions commonly asked in data science interviews',
      resourceType: 'case-study',
      category: 'career',
      subcategory: 'Interview Prep',
      fileUrl: 'https://res.cloudinary.com/example/document/upload/v1234567890/cases.pdf',
      fileType: 'application/pdf',
      fileSizeKB: 8000,
      uploadedBy: users[3]._id,
      author: { name: users[3].name, email: users[3].email },
      tags: ['data-science', 'interview', 'preparation'],
      isApproved: true,
      approvedAt: new Date(),
    },
    {
      title: 'Project Management Template - Gantt Chart',
      description: 'Ready-to-use Excel template for project management and timeline planning',
      resourceType: 'template',
      category: 'academics',
      subcategory: 'Project Management',
      fileUrl: 'https://res.cloudinary.com/example/document/upload/v1234567890/template.xlsx',
      fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      fileSizeKB: 500,
      uploadedBy: users[1]._id,
      author: { name: users[1].name, email: users[1].email },
      tags: ['template', 'project-management', 'gantt'],
      isApproved: true,
      approvedAt: new Date(),
    },
  ];

  const createdResources = await Resource.insertMany(resourcesData);

  console.log(`✅ Created ${createdResources.length} resources`);
  return createdResources;
}

async function main() {
  try {
    console.log('🌱 Starting Seed Process...\n');

    // Get some users (assuming 4 users exist)
    const users = await User.find().limit(4);

    if (users.length < 2) {
      console.error('❌ Error: Need at least 2 users to seed forums and resources');
      console.log('Please create users first using the registration feature');
      process.exit(1);
    }

    const adminUser = users[0]; // Use first user as admin

    // Seed forums
    const forums = await seedForums(adminUser._id);

    // Seed posts
    const posts = await seedPosts(forums, users);

    // Seed resources
    const resources = await seedResources(users);

    console.log('\n✅ All seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   • Forums: ${forums.length}`);
    console.log(`   • Posts: ${posts.length}`);
    console.log(`   • Resources: ${resources.length}`);
    console.log('\n🚀 You can now test the features!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

main();
