import MentorshipMessage from "./mentorshipMessage.model.js";
import mongoose from "mongoose";
import { createNotification } from "../notifications/notification.service.js";

export const sendMessage = async (req, res) => {
  const { mentorshipId, message, receiverId } = req.body;
  
  console.log('📨 Received message request:', { mentorshipId, message, receiverId, senderId: req.user.id });
  
  if (!mentorshipId || !message || !receiverId) {
    console.error('❌ Missing required fields:', { mentorshipId, message, receiverId });
    return res.status(400).json({ message: "mentorshipId, message, and receiverId are required" });
  }

  try {
    const msg = await MentorshipMessage.create({
      mentorship: mentorshipId,
      sender: req.user.id,
      receiver: receiverId,
      message,
    });

    console.log('✅ Message created:', msg._id);

    const populated = await msg.populate([
      { path: "sender", select: "name email" },
      { path: "receiver", select: "name email" },
      { path: "mentorship" },
    ]);

    console.log('✅ Message populated and sent');
    try {
      await createNotification({
        userId: receiverId,
        type: "message_request",
        title: "New message",
        message: `${populated.sender.name} sent you a message`,
        relatedId: mentorshipId,
        relatedModel: "Mentorship",
        link: "/mentorship/chat",
      });
    } catch (notifyErr) {
      console.error('⚠️ Notification error:', notifyErr?.message || notifyErr);
    }

    // Emit real-time events
    if (global.io) {
      // To participants currently viewing this mentorship thread
      global.io.to(`mentorship_${mentorshipId}`).emit('mentorshipMessage', { ...populated.toObject(), mentorshipId });
      // To receiver's personal inbox so the sidebar updates even if thread isn't open
      try {
        global.io.to(`user-${receiverId}`).emit('mentorshipMessageInbox', {
          mentorshipId,
          messageId: populated._id,
          sender: populated.sender,
          receiver: populated.receiver,
          isCallEvent: populated.isCallEvent || false,
          createdAt: populated.createdAt,
        });
      } catch (e) {
        console.warn('⚠️ Failed to emit inbox event:', e?.message || e);
      }
    }

    res.status(201).json(populated);
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ message: "Error sending message", error: error.message });
  }
};

export const getConversation = async (req, res) => {
  const { mentorshipId } = req.params;

  try {
    const messages = await MentorshipMessage.find({ mentorship: mentorshipId })
      .sort({ createdAt: 1 })
      .populate([
        { path: "sender", select: "name email" },
        { path: "receiver", select: "name email" },
      ]);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching conversation", error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  const { mentorshipId } = req.params;

  try {
    await MentorshipMessage.updateMany(
      { mentorship: mentorshipId, receiver: req.user.id, read: false },
      { read: true }
    );

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Error marking as read", error: error.message });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    // Grab latest messages where the user is either sender or receiver so the chat list shows all conversations.
    const allMessages = await MentorshipMessage.find({
      $or: [
        { sender: userId },
        { receiver: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .populate([
        { path: "sender", select: "name email profilePicture role" },
        { path: "receiver", select: "name email profilePicture role" },
        {
          path: "mentorship",
          populate: [
            { path: "student", select: "name role email" },
            { path: "mentor", select: "name role email" },
          ],
        },
      ]);

    // Build unread counts per mentorship (cast receiver to ObjectId for reliability)
    const receiverObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    const unreadDocs = await MentorshipMessage.find({ receiver: receiverObjectId, read: false }).select('mentorship').lean();
    const unreadMap = new Map();
    for (const doc of unreadDocs) {
      const mid = String(doc.mentorship);
      unreadMap.set(mid, (unreadMap.get(mid) || 0) + 1);
    }

    const seen = new Set();
    const conversations = [];

    for (const msg of allMessages) {
      const mentorshipId = String(msg.mentorship?._id || msg.mentorship);
      if (seen.has(mentorshipId)) continue;
      seen.add(mentorshipId);
      const doc = msg.toObject ? msg.toObject() : msg;
      doc.unreadCount = unreadMap.get(mentorshipId) || 0;
      conversations.push(doc);
    }

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching conversations", error: error.message });
  }
};
