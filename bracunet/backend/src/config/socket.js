import { Server as IOServer } from 'socket.io';

export const initializeSocket = (server, config) => {
  const io = new IOServer(server, {
    cors: {
      origin: config.cors.origin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Export io for use in controllers globally
  global.io = io;

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // User room for personal notifications (verification status, etc.)
    socket.on('joinUserRoom', ({ userId }) => {
      if (userId) {
        socket.join(`user-${userId}`);
        console.log(`User ${userId} joined personal room`);
      }
    });

    // Event rooms for real-time RSVP updates
    socket.on('joinEventRoom', ({ eventId }) => {
      if (eventId) {
        socket.join(`event_${eventId}`);
        console.log(`User joined event room: ${eventId}`);
      }
    });

    socket.on('leaveEventRoom', ({ eventId }) => {
      if (eventId) socket.leave(`event_${eventId}`);
    });

    // Campaign rooms for real-time donation updates
    socket.on('joinCampaignRoom', ({ campaignId }) => {
      if (campaignId) {
        socket.join(`campaign_${campaignId}`);
        console.log(`User joined campaign room: ${campaignId}`);
      }
    });

    socket.on('leaveCampaignRoom', ({ campaignId }) => {
      if (campaignId) socket.leave(`campaign_${campaignId}`);
    });

    // Group messaging
    socket.on('joinGroupRoom', ({ groupId }) => {
      if (groupId) socket.join(`group_${groupId}`);
    });

    socket.on('leaveGroupRoom', ({ groupId }) => {
      if (groupId) socket.leave(`group_${groupId}`);
    });

    socket.on('groupMessage', (msg) => {
      if (msg && msg.groupId) {
        io.to(`group_${msg.groupId}`).emit('groupMessage', msg);
      }
    });

    // Mentorship chat
    socket.on('joinMentorshipRoom', ({ mentorshipId }) => {
      if (mentorshipId) socket.join(`mentorship_${mentorshipId}`);
    });

    socket.on('leaveMentorshipRoom', ({ mentorshipId }) => {
      if (mentorshipId) socket.leave(`mentorship_${mentorshipId}`);
    });

    socket.on('mentorshipMessage', (msg) => {
      if (msg && msg.mentorshipId) {
        io.to(`mentorship_${msg.mentorshipId}`).emit('mentorshipMessage', msg);
      }
    });

    // Interest group messaging
    socket.on('joinInterestGroupRoom', ({ groupId }) => {
      if (groupId) {
        socket.join(`interestGroup_${groupId}`);
        console.log(`✅ Socket ${socket.id} joined interest group room: interestGroup_${groupId}`);
      }
    });

    socket.on('leaveInterestGroupRoom', ({ groupId }) => {
      if (groupId) {
        socket.leave(`interestGroup_${groupId}`);
        console.log(`👋 Socket ${socket.id} left interest group room: interestGroup_${groupId}`);
      }
    });

    socket.on('interestGroupMessage', (msg) => {
      if (msg && msg.groupId) {
        console.log(`📤 Broadcasting interest group message to room: interestGroup_${msg.groupId}`);
        io.to(`interestGroup_${msg.groupId}`).emit('groupMessage', msg);
      }
    });

    // Forum posts real-time
    socket.on('joinForumRoom', ({ forumId }) => {
      if (forumId) socket.join(`forum_${forumId}`);
    });

    socket.on('leaveForumRoom', ({ forumId }) => {
      if (forumId) socket.leave(`forum_${forumId}`);
    });

    socket.on('newPost', (post) => {
      if (post && post.forumId) {
        io.to(`forum_${post.forumId}`).emit('newPost', post);
      }
    });

    socket.on('newComment', (comment) => {
      if (comment && comment.forumId) {
        io.to(`forum_${comment.forumId}`).emit('newComment', comment);
      }
    });

    socket.on('postReaction', (reaction) => {
      if (reaction && reaction.forumId) {
        io.to(`forum_${reaction.forumId}`).emit('postReaction', reaction);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket ${socket.id} disconnected: ${reason}`);
    });
  });

  return io;
};
